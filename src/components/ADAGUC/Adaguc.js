import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import AdagucMapDraw from './AdagucMapDraw.js';
import AdagucMeasureDistance from './AdagucMeasureDistance.js';
import ModelTime from './ModelTime';
import diff from 'deep-diff';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations } from '../../utils/admin';
import { LoadURLPreset } from '../../utils/URLPresets';
import { debounce } from '../../utils/debounce';
require('babel-polyfill');
const WMJSTileRendererTileSettings = require('../../../config/basemaps');
var elementResizeEvent = require('element-resize-event');
export default class Adaguc extends PureComponent {
  constructor (props) {
    super(props);
    this.initAdaguc = this.initAdaguc.bind(this);
    this.resize = debounce(this.resize.bind(this), 100, false);
    this.updateLayer = this.updateLayer.bind(this);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.timeHandler = this.timeHandler.bind(this);
    this.adagucBeforeDraw = this.adagucBeforeDraw.bind(this);
    this.defineNewWMJSLayer = this.defineNewWMJSLayer.bind(this);
    this.updateLayersInline = this.updateLayersInline.bind(this);
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
  }

  /* istanbul ignore next */
  updateLayer (layer, datalayer) {
    const { adagucProperties } = this.props;
    const { animationSettings } = adagucProperties;
    if (!layer) {
      return;
    }
    this.webMapJS.stopAnimating();
    this.webMapJS.setAnimationDelay(200);
    layer.onReady = undefined;
    if (layer.getDimension('reference_time')) {
      layer.setDimension('reference_time', layer.getDimension('reference_time').getValueForIndex(layer.getDimension('reference_time').size() - 1), false);
    }
    if (datalayer.modellevel) {
      layer.setDimension('modellevel', datalayer.modellevel.toString());
    }

    this.onChangeAnimation(animationSettings, this.props.active);
    this.props.dispatch(this.props.layerActions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
  }

  timeHandler () {
    const wmjstime = this.webMapJS.getDimension('time').currentValue;
    if (!this.prevTime) {
      this.prevTime = wmjstime;
    }
    if (wmjstime !== this.prevTime) {
      this.prevTime = wmjstime;
      if (this.props.active) {
        this.props.dispatch(this.props.adagucActions.setTimeDimension(wmjstime));
      }
    }
  }
  resize () {
    const element = this.refs.adaguccontainer;
    if (element) {
      this.webMapJS.setSize(element.clientWidth, element.clientHeight);
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
    const { mapProperties, layerActions, layers, adagucActions, dispatch, mapId, urls } = this.props;
    const { baselayer, panels } = layers;
    const { BACKEND_SERVER_XML2JSON } = urls;
    // Map already created, abort
    if (mapProperties.mapCreated) {
      return;
    }
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef, BACKEND_SERVER_XML2JSON);
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

    // Set the baselayer and possible overlays
    this.updateBaselayers(baselayer, {}, panels[mapId].overlays, {});
    const defaultPersonalURLs = JSON.stringify({ personal_urls: [] });
    if (localStorage && !localStorage.getItem('geoweb')) {
      localStorage.setItem('geoweb', defaultPersonalURLs);
    }

    // Set the datalayers
    this.updateLayers(panels[mapId].layers, {});
    this.webMapJS.addListener('ondimchange', this.timeHandler, true);
    // eslint-disable-next-line no-undef
    const currentDate = getCurrentDateIso8601();
    if (this.props.active) {
      dispatch(adagucActions.setTimeDimension(currentDate.toISO8601()));
      dispatch(layerActions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    }
    this.webMapJS.draw('171');
  }

  componentDidMount () {
    this.initAdaguc(this.refs.adaguc);
    elementResizeEvent(this.refs.adaguccontainer, () => this.resize());
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
      this.webMapJS.destroy();
    }
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
          currLayers[i].name !== prevLayers[i].name ||
          currLayers[i].active !== prevLayers[i].active) {
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
            this.webMapJS.setMessage('Press [Esc] to close the polygon.');
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

  // Returns true when the layers are actually different w.r.t. next layers, otherwise false
  /* istanbul ignore next */
  updateBaselayers (baselayer, prevBaselayer, overlays, prevOverlays) {
    if (diff(baselayer, prevBaselayer) || diff(overlays, prevOverlays)) {
      // eslint-disable-next-line no-undef
      const baseLayer = new WMJSLayer(baselayer);
      const overlayers = overlays.map((overlay) => {
        // eslint-disable-next-line no-undef
        const newOverlay = new WMJSLayer(overlay);
        newOverlay.keepOnTop = true;
        return newOverlay;
      });
      const newBaselayers = [baseLayer].concat(overlayers);
      this.webMapJS.setBaseLayers(newBaselayers);

      return true;
    }
    return false;
  }

  defineNewWMJSLayer (layer) {
    const datalayer = cloneDeep(layer);
    datalayer.enabled = 'enabled' in datalayer ? datalayer.enabled : true;
    datalayer.active = 'active' in datalayer ? datalayer.active : true;
    // eslint-disable-next-line no-undef
    const newDataLayer = new WMJSLayer(datalayer);
    if (datalayer.active) {
      this.webMapJS.setActiveLayer(newDataLayer);
    }
    newDataLayer.setAutoUpdate(true, moment.duration(2, 'minutes').asMilliseconds(), (layer) => this.updateLayer(layer, datalayer));
    newDataLayer.onReady = (layer) => this.updateLayer(layer, datalayer);
    return newDataLayer;
  }

  updateLayersInline (currDataLayers) {
    const layers = this.webMapJS.getLayers();
    for (let i = layers.length - 1; i >= 0; i--) {
      layers[i].enabled = 'enabled' in currDataLayers[i] ? currDataLayers[i].enabled : true;
      layers[i].opacity = currDataLayers[i].opacity;
      layers[i].service = currDataLayers[i].service;
      layers[i].name = currDataLayers[i].name;
      layers[i].label = currDataLayers[i].label;
      layers[i].currentStyle = currDataLayers[i].style || layers[i].currentStyle;
      if (currDataLayers[i].modellevel) {
        layers[i].setDimension('modellevel', currDataLayers[i].modellevel.toString());
      }
      this.webMapJS.getListener().triggerEvent('onmapdimupdate');
    }
  }

  updateAnimationActiveLayerChange (currDataLayers, prevDataLayers) {
    const { dispatch, adagucActions } = this.props;
    const ANIMATION_LENGTH_REF_TIME = 48;
    const ANIMATION_LENGTH_NO_REF_TIME = 6;
    let animationLength = null;
    if (Array.isArray(prevDataLayers) && prevDataLayers.length > 0 && Array.isArray(currDataLayers) && currDataLayers.length > 0) {
      const prevActiveLayer = prevDataLayers.filter(layer => layer.active)[0];
      const currActiveLayer = currDataLayers.filter(layer => layer.active)[0];

      // If the active layer hadn't changed we're done
      if (prevActiveLayer === currActiveLayer) {
        return;
      }
      const prevActiveWMJSLayer = this.props.layers.wmjsLayers.layers.filter(layer => layer.service === prevActiveLayer.service && layer.name === prevActiveLayer.name)[0];
      const currActiveWMJSLayer = this.props.layers.wmjsLayers.layers.filter(layer => layer.service === currActiveLayer.service && layer.name === currActiveLayer.name)[0];

      if (!currActiveWMJSLayer) {
        dispatch(adagucActions.setAnimationLength(''));
      }

      if (!prevActiveWMJSLayer || !currActiveWMJSLayer) {
        return;
      }

      const prevHasRefTime = prevActiveWMJSLayer.getDimension('reference_time');
      const currHasRefTime = currActiveWMJSLayer.getDimension('reference_time');

      // If the having of a reference_time didn't change, we're done
      if ((!!prevHasRefTime) === (!!currHasRefTime)) {
        return;
      }

      // set the respective animation length
      if (currHasRefTime) {
        animationLength = ANIMATION_LENGTH_REF_TIME;
      } else {
        animationLength = ANIMATION_LENGTH_NO_REF_TIME;
      }
    } else {
      // No prevLayers, so only layer in the system, set default animation time
      const activeLayer = this.webMapJS.getActiveLayer();
      if (!activeLayer) {
        return;
      }

      const currHasRefTime = activeLayer.getDimension('reference_time');
      if (currHasRefTime) {
        animationLength = ANIMATION_LENGTH_REF_TIME;
      } else {
        animationLength = ANIMATION_LENGTH_NO_REF_TIME;
      }
    }

    if (animationLength !== null && animationLength !== this.props.adagucProperties.animationSettings.duration) {
      dispatch(adagucActions.setAnimationLength(animationLength));
    }
  }

  // Returns true when the layers are actually different w.r.t. prev layers, otherwise false
  /* istanbul ignore next */
  updateLayers (currDataLayers, prevDataLayers, wmjsLayers, prevWmjsLayers) {
    const change = diff(currDataLayers, prevDataLayers);
    if (change) {
      if (this.orderChanged(currDataLayers, prevDataLayers)) {
        this.webMapJS.stopAnimating();
        const newDatalayers = currDataLayers.map((datalayer) => this.defineNewWMJSLayer(datalayer));
        if (newDatalayers && newDatalayers.length > 0) {
          this.webMapJS.removeAllLayers();
          newDatalayers.reverse().forEach(layer => this.webMapJS.addLayer(layer));
        }
      } else {
        this.updateLayersInline(currDataLayers);
      }
    }
    this.updateAnimationActiveLayerChange(currDataLayers, prevDataLayers);
    return change;
  }

  /* istanbul ignore next */
  componentDidUpdate (prevProps) {
    const { mapProperties, adagucProperties, layerActions, layers, active, mapId, dispatch } = this.props;
    const { boundingBox, mapMode, projection } = mapProperties;
    const { timeDimension, animationSettings, cursor } = adagucProperties;
    const { baselayer } = layers;
    const activePanel = this.props.layers.panels[mapId];

    // Updates that need to happen across all panels
    this.updateBoundingBox(boundingBox, prevProps.mapProperties.boundingBox, projection.code, prevProps.mapProperties.projection.code);
    this.updateTime(timeDimension, prevProps.adagucProperties.timeDimension || null);
    this.updateMapMode(mapMode, prevProps.mapProperties.mapMode, active);

    // Track cursor if necessary
    const prevCursor = prevProps.adagucProperties.cursor;
    if (cursor && cursor.location && cursor !== prevCursor) {
      this.webMapJS.positionMapPinByLatLon({ x: cursor.location.x, y: cursor.location.y });
    }

    const prevActivePanel = prevProps.layers.panels[mapId];
    const prevBaseLayer = prevProps.layers.baselayer;
    const overlays = activePanel.overlays;
    const prevOverlays = prevActivePanel.overlays;
    const layersChanged = this.updateLayers(activePanel.layers, prevActivePanel.layers, layers.wmjsLayers, prevProps.layers.wmjsLayers);
    const baseChanged = this.updateBaselayers(baselayer, prevBaseLayer, overlays, prevOverlays);

    // Update animation -- animate iff animate is set and the panel is active.
    if (prevProps.adagucProperties.animationSettings !== animationSettings) {
      this.onChangeAnimation(animationSettings, active);
    }

    // Set the current layers if the panel becomes active (necessary for the layermanager etc.)
    if (active && (!prevProps.active || layersChanged || baseChanged)) {
      this.resize();
      dispatch(layerActions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    }

    this.webMapJS.draw('368');
  }

  /* istanbul ignore next */
  onChangeAnimation (animationSettings, active) {
    this.webMapJS.stopAnimating();
    const shouldAnimate = animationSettings.animate && active;
    if (shouldAnimate) {
      this.webMapJS.drawLastTimes(animationSettings.duration, 'hours');
    }
    this.webMapJS.draw('385');
  }
  toggleView () {
    this.setState({
      dropdownOpenView: !this.state.dropdownOpenView
    });
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
            geojson={drawProperties.geojson}
            dispatch={dispatch}
            isInEditMode={mapProperties.mapMode === 'draw' || mapProperties.mapMode === 'delete'}
            isInDeleteMode={mapProperties.mapMode === 'delete'}
            webmapjs={this.webMapJS}
            actions={drawActions}
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
  layerActions: PropTypes.object,
  adagucProperties: PropTypes.object,
  mapProperties: PropTypes.object,
  adagucActions: PropTypes.object,
  mapActions: PropTypes.object,
  layers: PropTypes.object,
  mapId: PropTypes.number,
  drawProperties: PropTypes.object,
  drawActions: PropTypes.object,
  urls: PropTypes.object
};
