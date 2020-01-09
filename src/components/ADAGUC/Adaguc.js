import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AdagucMapDraw from '../../utils/AdagucMapDraw.js';
import AdagucMeasureDistance from './AdagucMeasureDistance.js';
import ModelTime from './ModelTime';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations } from '../../utils/admin';
import { LoadURLPreset } from '../../utils/URLPresets';
import { debounce } from '../../utils/debounce';
import { WMJSMap, WMJSLayer } from 'adaguc-webmapjs';
import { registerWMJSMap, generateLayerId, registerWMJSLayer, getWMJSLayerById } from '../../utils/ReactWMJSTools';
import { cloneWMJSLayerProps } from '../../utils/CloneWMJSLayerProps';
// FIXME: is this polyfill really a necessity, since we're using @runtime and transform-runtime? This pollutes the global namespace...
import '@babel/polyfill/noConflict';
const WMJSTileRendererTileSettings = require('../../../config/basemaps');
var elementResizeEvent = require('element-resize-event');
export default class Adaguc extends PureComponent {
  constructor (props) {
    super(props);
    this.updateLayers = this.updateLayers.bind(this);
    this.initAdaguc = this.initAdaguc.bind(this);
    this.resize = debounce(this.resize.bind(this), 100, false);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.adagucBeforeDraw = this.adagucBeforeDraw.bind(this);
    this.reparseLayers = this.reparseLayers.bind(this);
    this.updateAnimationActiveLayerChange = this.updateAnimationActiveLayerChange.bind(this);
    this.updateBBOX = debounce(this.updateBBOX.bind(this), 300, false);
    this.state = {
      dropdownOpenView: false,
      modal: false,
      activeTab: '1',
      inSigmetModus: false
    };
    this.toggleView = this.toggleView.bind(this);
    this.progtempLocations = DefaultLocations;
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
      if (data) {
        this.progtempLocations = data;
      }
    });
    this.layersChangedListenerInitialized = false;
  }

  resize () {
    const element = this.refs.adaguccontainer;
    if (element) {
      this.webMapJS.setSize(element.clientWidth, element.clientHeight);
      this.webMapJS.draw();
    }
  }
  updateBBOX (wmjsmap) {
    if (!wmjsmap) {
      return;
    }
    const bbox = wmjsmap.getBBOX();
    if (bbox === undefined) {
      return;
    }
    const { dispatch, mapActions } = this.props;
    const currBbox = this.props.mapProperties.boundingBox.bbox;
    const currProj = this.props.mapProperties.projection;

    // Only top and bottom matter, adagucviewer determines the width as long as top and bottom are in view
    // So compare to those and set it if they are different
    if (bbox.bottom !== currBbox[1] || bbox.top !== currBbox[3]) {
      dispatch(mapActions.setCut({ title: 'Custom', bbox: [bbox.left, bbox.bottom, bbox.right, bbox.top], projection: currProj }));
    }
  }

  /* istanbul ignore next */
  adagucBeforeDraw (ctx) {
    const { adagucProperties } = this.props;
    const { triggerLocations } = adagucProperties;
    if (!triggerLocations || triggerLocations.length === 0) {
      return;
    }

    triggerLocations.forEach((location) => {
      const { lat, lon, value, code } = location;
      const coord = this.webMapJS.getPixelCoordFromLatLong({ x: lon, y: lat });

      ctx.globalAlpha = 1.0;
      const w = 7;
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#FF0000';
      ctx.font = 'bold 12px Helvetica';

      ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
      ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
      ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
      ctx.fillStyle = 'black';
      ctx.fillText(value.toFixed(2), coord.x + 5, coord.y - 5);
      ctx.fillText(code, coord.x + 5, coord.y + 12);
    });
  }

  initAdaguc (adagucMapRef) {
    const { mapProperties, panelsProperties, adagucActions, dispatch, mapId, urls } = this.props;
    const { panels } = panelsProperties;
    const { BACKEND_SERVER_XML2JSON } = urls;
    // Map already created, abort
    if (mapProperties.mapCreated) {
      return;
    }
    this.webMapJS = new WMJSMap(adagucMapRef, BACKEND_SERVER_XML2JSON);
    registerWMJSMap(this.webMapJS, mapId);

    this.webMapJS.setBaseURL('./adagucwebmapjs/');
    this.webMapJS.setWMJSTileRendererTileSettings(WMJSTileRendererTileSettings);
    this.webMapJS.showDialogs(false);
    this.resize();
    // Set listener for triggerPoints
    this.webMapJS.addListener('beforecanvasdisplay', this.adagucBeforeDraw, true);

    // Set the initial projection
    this.webMapJS.setProjection(mapProperties.projection.code);
    this.webMapJS.setBBOX(mapProperties.boundingBox.bbox.join());

    this.webMapJS.addListener('aftersetbbox', this.updateBBOX, true);
    this.webMapJS.addListener('mouseclicked', e => this.findClosestCursorLoc(e), true);

    this.webMapJS.setBaseLayers(panels[mapId].baselayers.map((layer) => new WMJSLayer(layer)));
    // Set the baselayer and possible overlays
    const defaultPersonalURLs = JSON.stringify({ personal_urls: [] });
    if (localStorage && !localStorage.getItem('geoweb')) {
      localStorage.setItem('geoweb', defaultPersonalURLs);
    }

    // Set the datalayers
    this.updateLayers([], panels[mapId].layers);
    this.reparseLayers();
    if (this.props.active) {
      dispatch(adagucActions.setTimeDimension(moment.utc().format('YYYY-MM-DDTHH:mm:ss[Z]')));
    }

    this.webMapJS.draw('initAdaguc');
  }

  reparseLayers () {
    const { mapId, panelsProperties, active, dispatch, panelsActions, adagucProperties } = this.props;
    const panel = panelsProperties.panels[mapId];
    const { animationSettings } = adagucProperties;
    const origPanel = cloneDeep(panel);
    const promises = [];
    panel.layers.forEach((layer, i) => {
      promises.push(new Promise((resolve, reject) => {
        const wmjsLayer = getWMJSLayerById(layer.id);
        wmjsLayer.parseLayer((newLayer) => {
          return resolve(cloneWMJSLayerProps(newLayer));
        }, true);
      }));
    });
    Promise.all(promises).then((newLayers) => {
      newLayers.forEach((layer, i) => {
        dispatch(panelsActions.replaceLayer({ index: i, layer: layer, mapId: mapId }));
        if (layer.active) {
          dispatch(panelsActions.setActiveLayer({ activePanelId: mapId, layerClicked: i }));
        }
      });
      this.updateLayers(origPanel.layers, newLayers, active);
      this.onChangeAnimation(animationSettings, active);
    });
  }

  componentDidMount () {
    this.initAdaguc(this.refs.adaguc);
    if (this.refs.adaguccontainer) {
      elementResizeEvent(this.refs.adaguccontainer, this.resize);
    }
    this.interval = setInterval(this.reparseLayers, moment.duration(1, 'minute').asMilliseconds());
    if (this.webMapJS) {
      this.webMapJS.draw();
    }
  }

  componentWillMount () {
    /* Component will unmount, set flag that map is not created */
    const { mapProperties } = this.props;
    mapProperties.mapCreated = false;
    LoadURLPreset(this.props, (error) => {
      console.error(error);
    });
  }

  componentWillUnmount () {
    this.webMapJS.removeListener('beforecanvasdisplay', this.adagucBeforeDraw);
    // Let webmapjs destory itself
    if (this.webMapJS) {
      this.webMapJS.stopAnimating();
      this.webMapJS.removeAllLayers();
      this.webMapJS.destroy();
    }
    clearInterval(this.interval);
    this.layersChangedListenerInitialized = false;
  }

  orderChanged (currLayers, prevLayers) {
    if (!currLayers || !prevLayers) {
      return true;
    }
    if (currLayers.length !== prevLayers.length) {
      return true;
    }
    for (let i = currLayers.length - 1; i >= 0; i--) {
      if (currLayers[i].service !== prevLayers[i].service ||
          currLayers[i].name !== prevLayers[i].name) {
        return true;
      }
    }
    return false;
  }
  findClosestCursorLoc (event) {
    // Find the latlong from the pixel coordinate
    const latlong = this.webMapJS.getLatLongFromPixelCoord({ x: event.x, y: event.y });
    this.props.dispatch(this.props.adagucActions.setCursorLocation(latlong));
  }

  updateBoundingBox (boundingBox, prevBoundingBox, projectionCode, prevProjectionCode) {
    if (boundingBox !== prevBoundingBox && this.webMapJS.setBBOX(boundingBox.bbox.join()) === true) {
      this.webMapJS.draw('updateBoundingBox');
    }

    if (projectionCode !== prevProjectionCode) {
      this.webMapJS.setProjection(projectionCode, boundingBox.bbox.join());
      this.webMapJS.draw('updateProjection');
    }
  }

  updateTime (timedim, prevTime) {
    if (timedim !== prevTime) {
      this.webMapJS.setDimension('time', timedim, true);
      this.webMapJS.draw('updateTime');
      return;
    }

    // Fix for jumping around when adding layer and
    // last frame jump when pausing
    if (this.webMapJS && this.webMapJS.getDimension('time')) {
      const currentAdagucTime = this.webMapJS.getDimension('time').currentValue;
      if (!moment.utc(currentAdagucTime).isSame(moment.utc(timedim))) {
        this.webMapJS.setDimension('time', timedim, true);
        this.webMapJS.draw('updateTime');
      }
    }
  }

  updateMapMode (mapMode, prevMapMode, active) {
    // Update mapmode
    if (mapMode !== prevMapMode) {
      // Reset the message, it will be re-set if necessary
      this.webMapJS.setMessage('');
      switch (mapMode) {
        case 'zoom':
          this.webMapJS.setMapModeZoomBoxIn();
          break;
        case 'progtemp':
        case 'timeseries':
        case 'pan':
          this.webMapJS.setMapModePan();
          break;
        case 'draw':
          if (active) {
            this.webMapJS.setMessage(`Press [Esc] to exit drawing mode.`);
          }
          break;
        case 'measure':
          if (active) {
            this.webMapJS.setMessage('Click to end measuring. Press [Esc] to delete the measurement.');
          }
          break;
        default:
          this.webMapJS.setMapModeNone();
          break;
      }
    }
  }

  // Returns true when the panelsProperties are actually different w.r.t. next panelsProperties, otherwise false
  /* istanbul ignore next */
  updateBaseLayers (baselayers, nextBaseLayers) {
    let change = false;
    if (baselayers.length !== nextBaseLayers.length) {
      change = true;
    } else {
      for (let i = 0; i < baselayers.length; ++i) {
        if (baselayers[i].service !== nextBaseLayers[i].service ||
          baselayers[i].name !== nextBaseLayers[i].name || baselayers[i].enabled !== nextBaseLayers[i].enabled) {
          change = true;
          break;
        }
      }
    }

    if (change) {
      this.webMapJS.setBaseLayers(nextBaseLayers.map((layer) => new WMJSLayer(layer)));
    }
    return change;
  }

  updateAnimationActiveLayerChange (currDataLayers, nextDataLayers, active) {
    const { dispatch, adagucActions } = this.props;
    const ANIMATION_LENGTH_REF_TIME = 48;
    const ANIMATION_LENGTH_NO_REF_TIME = 6;
    let animationLength = null;

    if (Array.isArray(nextDataLayers) && Array.isArray(currDataLayers) &&
        nextDataLayers.length > 0) {
      const nextActiveLayers = nextDataLayers.filter(layer => layer.active);
      const currActiveLayers = currDataLayers.filter(layer => layer.active);

      let nextActiveLayer, nextActiveWMJSLayer, nextHasRefTime;
      // Encode length of arrays as state as to switch on it.
      const layerState = [nextActiveLayers.length, currActiveLayers.length].join('');
      switch (layerState) {
        // 11 means active layer has possibly switched within this panel, so find the new one
        case '11':
          nextActiveLayer = nextActiveLayers[0];

          nextHasRefTime = getWMJSLayerById(nextActiveLayer.id).getDimension('reference_time');

          // set the respective animation length
          if (nextHasRefTime) {
            animationLength = ANIMATION_LENGTH_REF_TIME;
          } else {
            animationLength = ANIMATION_LENGTH_NO_REF_TIME;
          }
          break;

        // First layer got added, or active layer got deleted so set a new one
        case '12': // TODO: y tho???
        case '10':
          nextActiveWMJSLayer = this.webMapJS.getActiveLayer();
          if (!nextActiveWMJSLayer) {
            break;
          }
          nextHasRefTime = nextActiveWMJSLayer.getDimension('reference_time');
          if (nextHasRefTime) {
            animationLength = ANIMATION_LENGTH_REF_TIME;
          } else {
            animationLength = ANIMATION_LENGTH_NO_REF_TIME;
          }
          break;
        case '01':
        case '00':
          break;
      }
    }
    if (active && animationLength !== this.props.adagucProperties.animationSettings.duration &&
        (this.props.adagucProperties.animationSettings.duration !== ANIMATION_LENGTH_REF_TIME ||
         this.props.adagucProperties.animationSettings.duration !== ANIMATION_LENGTH_NO_REF_TIME)) {
      dispatch(adagucActions.setAnimationLength(animationLength));
    }
  }

  // Returns true when the panelsProperties are actually different w.r.t. next panelsProperties, otherwise false
  /* istanbul ignore next */
  updateLayers (currDataLayers, nextDataLayers, active) {
    let change = false;
    if (currDataLayers.length !== nextDataLayers.length) {
      change = true;
    } else {
      for (let i = 0; i < currDataLayers.length; ++i) {
        if (currDataLayers[i].service !== nextDataLayers[i].service ||
            currDataLayers[i].name !== nextDataLayers[i].name ||
            currDataLayers[i].currentStyle !== nextDataLayers[i].currentStyle ||
            currDataLayers[i].opacity !== nextDataLayers[i].opacity ||
            currDataLayers[i].active !== nextDataLayers[i].active ||
            currDataLayers[i].enabled !== nextDataLayers[i].enabled) {
          change = true;
          break;
        }
        /* Check if dimensions have updated */
        if (currDataLayers[i].dimensions.length !== nextDataLayers[i].dimensions.length) {
          change = true;
        } else {
          for (let j = 0; j < currDataLayers[i].dimensions.length; j++) {
            const curDim = currDataLayers[i].dimensions[j];
            const nextDimIndex = nextDataLayers[i].dimensions.findIndex(d => d.name === curDim.name);
            if (nextDimIndex === -1) {
              change = true;
              break;
            } else {
              const nextDim = nextDataLayers[i].dimensions[nextDimIndex];
              if (nextDim.name !== curDim.name ||
                nextDim.currentValue !== curDim.currentValue ||
                nextDim.defaultValue !== curDim.defaultValue) { change = true; break; }
            }
          }
        }
      }
    }
    if (change && nextDataLayers && Array.isArray(nextDataLayers)) {
      this.webMapJS.removeAllLayers();
      const layersCpy = cloneDeep(nextDataLayers);
      if (layersCpy && layersCpy.length > 0) {
        layersCpy.reverse().forEach((layer) => {
          let wmjsLayer = new WMJSLayer({ ...layer, id: layer.id || generateLayerId() });
          registerWMJSLayer(wmjsLayer, wmjsLayer.id);
          wmjsLayer.parseLayer();
          this.webMapJS.addLayer(wmjsLayer);
          if (layer.active) {
            this.webMapJS.setActiveLayer(wmjsLayer);
          }
        });
      }
      const nextActiveLayers = nextDataLayers.filter(layer => layer.active);
      const currActiveLayers = currDataLayers.filter(layer => layer.active);

      if (nextActiveLayers.length > 0 && (currActiveLayers.length === 0 || (currActiveLayers[0].service !== nextActiveLayers[0].service &&
            currActiveLayers[0].name !== nextActiveLayers[0].name))) {
        this.updateAnimationActiveLayerChange(currDataLayers, nextDataLayers, active);
      }
    }
    return change;
  }

  componentWillUpdate (nextProps) {
    const { adagucProperties, panelsProperties, active, mapId } = this.props;
    const { animationSettings } = adagucProperties;
    const { panels, activePanelId } = panelsProperties;
    const activePanel = panels[mapId];

    const nextActivePanel = nextProps.panelsProperties.panels[mapId];
    const nextBaseLayers = nextProps.panelsProperties.panels[mapId].baselayers;
    const baseLayers = activePanel.baselayers;

    const currActiveLayers = activePanel.layers.filter((layer) => layer.active);
    const nextActiveLayers = nextActivePanel.layers.filter((layer) => layer.active);
    if (nextActivePanel.layers.length === 0 && nextProps.adagucProperties.animationSettings.animate) {
      this.props.dispatch(this.props.adagucActions.toggleAnimation());
    }
    if (activePanelId !== nextProps.panelsProperties.activePanelId) {
      this.updateAnimationActiveLayerChange(activePanel.layers, nextActivePanel.layers, nextProps.active);
    }
    const layersChanged = this.updateLayers(activePanel.layers, nextActivePanel.layers, nextProps.active);
    const baseChanged = this.updateBaseLayers(baseLayers, nextBaseLayers);

    // Update animation -- animate iff animate is set and the panel is active.
    if (nextProps.adagucProperties.animationSettings !== animationSettings ||
      activePanelId !== nextProps.panelsProperties.activePanelId ||
      (currActiveLayers.length === 1 && nextActiveLayers.length === 1 && currActiveLayers[0] !== nextActiveLayers[0])) {
      this.onChangeAnimation(nextProps.adagucProperties.animationSettings, nextProps.active);
    }

    // Set the current panelsProperties if the panel becomes active (necessary for the layermanager etc.)
    if (active && (!nextProps.active || layersChanged || baseChanged)) {
      this.resize();
    }
  }

  /* istanbul ignore next */
  componentDidUpdate (prevProps) {
    const { mapProperties, adagucProperties, active, mapId, panelsProperties } = this.props;
    const { boundingBox, mapMode, projection } = mapProperties;
    const { timeDimension, cursor } = adagucProperties;
    const { code } = projection;

    const { mapProperties: prevMapProperties, adagucProperties: prevAdagucProperties } = prevProps;
    const { boundingBox: prevBoundingBox, mapMode: prevMapMode, projection: prevProjection } = prevMapProperties;
    const { timeDimension: prevTimeDimension, cursor: prevCursor } = prevAdagucProperties;
    const { code: prevCode } = prevProjection;

    // Updates that need to happen across all panels
    this.updateBoundingBox(boundingBox, prevBoundingBox, code, prevCode);
    this.updateTime(timeDimension, prevTimeDimension || null);
    this.updateMapMode(mapMode, prevMapMode, active);

    // Enable or disable the mappin
    const currentPanelProps = panelsProperties.panels[mapId];
    if (currentPanelProps) {
      if (currentPanelProps.enableMapPin !== false) {
        this.webMapJS.showMapPin();
      } else {
        this.webMapJS.hideMapPin();
      }
    }

    // Track cursor if necessary
    if (cursor && cursor.location && cursor !== prevCursor) {
      this.webMapJS.positionMapPinByLatLon({ x: cursor.location.x, y: cursor.location.y });
    }
  }

  /* istanbul ignore next */
  onChangeAnimation (animationSettings, active) {
    const { dispatch, adagucActions } = this.props;
    const shouldAnimate = animationSettings.animate && active;
    const dispatchTime = (map) => {
      if (map.isAnimating) {
        dispatch(adagucActions.setTimeDimension(map.getDimension('time').currentValue));
      }
    };
    if (active) {
      if (shouldAnimate) {
        if (!this.layersChangedListenerInitialized) {
          this.layersChangedListenerInitialized = true;
          this.webMapJS.addListener('onnextanimationstep', dispatchTime, true);
        }
        this.webMapJS.setAnimationDelay(150);
        this.webMapJS.drawLastTimes(animationSettings.duration, 'hours');
      } else {
        this.webMapJS.stopAnimating();
      }
    }
  }
  toggleView () {
    this.setState({
      dropdownOpenView: !this.state.dropdownOpenView
    });
  }
  updateIfFirst (geojson, drawActions, dispatch) {
    if (geojson && geojson.features && geojson.features.length > 0 && geojson.features[0].geometry &&
      geojson.features[0].geometry.coordinates && (geojson.features[0].geometry.type === 'Point' ||
      (geojson.features[0].geometry.coordinates.length === 1 && geojson.features[0].geometry.type === 'Polygon'))) {
      // update feature only if it is first polygon
      dispatch(drawActions.updateFeature(geojson));
    }
  }
  render () {
    const { mapProperties, drawProperties, drawActions, dispatch } = this.props;
    return (
      <div ref='adaguccontainer' style={{ border: 'none', width: 'inherit', height: 'inherit', overflow: 'hidden' }}>
        <div style={{ overflow: 'visible', width:0, height:0 }} >
          <div ref='adaguc' />
        </div>
        <div style={{ display: 'none' }}>
          <AdagucMapDraw
            geojson={drawProperties && drawProperties.adagucMapDraw && drawProperties.adagucMapDraw.geojson}
            isInEditMode={mapProperties.mapMode === 'draw' || mapProperties.mapMode === 'delete'}
            isInDeleteMode={mapProperties.mapMode === 'delete'}
            drawMode={drawProperties && drawProperties.adagucMapDraw && drawProperties.adagucMapDraw.drawMode}
            featureNrToEdit={drawProperties && drawProperties.adagucMapDraw && drawProperties.adagucMapDraw.featureNrToEdit}
            webmapjs={this.webMapJS}
            updateGeojson={(geojson) => {
              this.updateIfFirst(geojson, drawActions, dispatch);
            }}
            deletePolygonCallback={() => dispatch(this.props.mapActions.setMapMode('draw'))}
            exitDrawModeCallback={() => dispatch(this.props.mapActions.setMapMode('pan'))}
          />
          <AdagucMeasureDistance
            dispatch={dispatch}
            webmapjs={this.webMapJS}
            isInEditMode={mapProperties.mapMode === 'measure'}
          />
        </div>
        <ModelTime webmapjs={this.webMapJS} active={this.props.active} />
      </div>
    );
  }
}

Adaguc.propTypes = {
  active: PropTypes.bool,
  dispatch: PropTypes.func.isRequired,
  panelsActions: PropTypes.object,
  adagucProperties: PropTypes.object,
  mapProperties: PropTypes.object,
  adagucActions: PropTypes.object,
  mapActions: PropTypes.object,
  panelsProperties: PropTypes.object,
  mapId: PropTypes.number,
  drawProperties: PropTypes.object,
  drawActions: PropTypes.object,
  urls: PropTypes.object
};
