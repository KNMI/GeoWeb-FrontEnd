import React from 'react';
import PropTypes from 'prop-types';
import AdagucMapDraw from './AdagucMapDraw.js';
import AdagucMeasureDistance from './AdagucMeasureDistance.js';
import axios from 'axios';
import ModelTime from './ModelTime';
import { BACKEND_SERVER_URL, BACKEND_SERVER_XML2JSON } from '../../constants/backend';
import diff from 'deep-diff';
import moment from 'moment';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations } from '../../utils/admin';
import { LoadURLPreset } from '../../utils/URLPresets';
import { debounce } from '../../utils/debounce';
var elementResizeEvent = require('element-resize-event');

export default class Adaguc extends React.Component {
  constructor () {
    super();
    this.initAdaguc = this.initAdaguc.bind(this);
    this.resize = debounce(this.resize.bind(this), 100, false);
    this.updateLayer = this.updateLayer.bind(this);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.timeHandler = this.timeHandler.bind(this);
    this.adagucBeforeDraw = this.adagucBeforeDraw.bind(this);
    this.updateBBOX = debounce(this.updateBBOX.bind(this), 300, false);
    this.isAnimating = false;
    this.state = {
      dropdownOpenView: false,
      modal: false,
      activeTab: '1',
      inSigmetModus: false,
      time: undefined
    };
    this.toggleView = this.toggleView.bind(this);
    this.progtempLocations = DefaultLocations;
    ReadLocations((data) => {
      if (data) {
        this.progtempLocations = data;
      }
    });
  }

  /* istanbul ignore next */
  updateLayer (layer, datalayer) {
    this.webMapJS.setAnimationDelay(200);
    if (!layer) {
      return;
    }
    this.webMapJS.stopAnimating();
    if (this.props.active) {
      this.props.dispatch(this.props.layerActions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    }
    layer.onReady = undefined;
    if (layer.getDimension('reference_time')) {
      layer.setDimension('reference_time', layer.getDimension('reference_time').getValueForIndex(layer.getDimension('reference_time').size() - 1), false);
    }
    if (datalayer.modellevel) {
      layer.setDimension('modellevel', datalayer.modellevel.toString());
    }

    if (this.isAnimating) {
      this.webMapJS.drawAutomatic(moment().utc().subtract(4, 'hours'), moment().utc().add(48, 'hours'));
    } else {
      const { adagucProperties } = this.props;
      if (adagucProperties.timeDimension) {
        this.webMapJS.setDimension('time', adagucProperties.timeDimension, true);
      }
      this.webMapJS.draw('66');
    }
    setTimeout(() => {
      layer.parseLayer((layer) => this.updateLayer(layer, datalayer), true);
    }, 10000);
  }
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  resize () {
    console.log('resize');
    const element = this.refs.adaguccontainer;
    if (element) {
      this.webMapJS.setSize(element.clientWidth, element.clientHeight);
    }
  }
  /* istanbul ignore next */
  updateBBOX (wmjsmap) {
    if (!wmjsmap) return;
    let bbox = wmjsmap.getBBOX();
    if (bbox === undefined) return;
    const { dispatch, mapActions } = this.props;
    dispatch(mapActions.setCut({ title: 'Custom', bbox: [bbox.left, bbox.bottom, bbox.right, bbox.top] }));
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

  /* istanbul ignore next */
  initAdaguc (adagucMapRef) {
    const { mapProperties, layerActions, layers, mapActions, adagucActions, dispatch, mapId } = this.props;
    const { baselayer, panels } = layers;
    // Map already created, abort
    if (mapProperties.mapCreated) {
      return;
    }
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef, BACKEND_SERVER_XML2JSON);

    this.resize();
    // Set listener for triggerPoints
    this.webMapJS.addListener('beforecanvasdisplay', this.adagucBeforeDraw, true);

    // Set the initial projection
    this.webMapJS.setProjection(mapProperties.projectionName);
    this.webMapJS.setBBOX(mapProperties.boundingBox.bbox.join());

    this.webMapJS.addListener('aftersetbbox', this.updateBBOX, true);

    // Set the baselayer and possible overlays
    this.updateBaselayers(baselayer, {}, panels[mapId].overlays, {});
    const defaultPersonalURLs = JSON.stringify({ personal_urls: [] });
    if (!localStorage.getItem('geoweb')) {
      localStorage.setItem('geoweb', defaultPersonalURLs);
    }
    // Fetch data sources and custom urls
    const defaultURLs = ['getServices', 'getOverlayServices'].map(url => `${BACKEND_SERVER_URL}/${url}`);
    const allURLs = [...defaultURLs];
    axios.all(allURLs.map(req => axios.get(req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => {
        dispatch(mapActions.createMap());
        dispatch(adagucActions.setSources([...services.data, ...JSON.parse(localStorage.getItem('geoweb')).personal_urls, overlays.data[0]]));
      })
    );

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

  /* istanbul ignore next */
  componentWillUnmount () {
    this.webMapJS.removeListener('beforecanvasdisplay', this.adagucBeforeDraw);
    // Let webmapjs destory itself
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }

  /* istanbul ignore next */
  orderChanged (currLayers, prevLayers) {
    if (currLayers.length !== prevLayers.length) {
      return true;
    }
    for (let i = currLayers.length - 1; i >= 0; i--) {
      if (currLayers[i].service !== prevLayers[i].service || currLayers[i].name !== prevLayers[i].name) {
        return true;
      }
    }
    return false;
  }
  /* istanbul ignore next */
  findClosestCursorLoc (event) {
    // Find the latlong from the pixel coordinate
    const latlong = this.webMapJS.getLatLongFromPixelCoord({ x: event.x, y: event.y });
    this.props.dispatch(this.props.adagucActions.setCursorLocation(latlong));
  }

  /* istanbul ignore next */
  updateBoundingBox (boundingBox, prevBoundingBox) {
    if (boundingBox !== prevBoundingBox) {
      // eslint-disable-next-line no-undef
      if (this.webMapJS.setBBOX(boundingBox.bbox.join()) === true) {
        this.webMapJS.draw();
      }
    }
  }

  /* istanbul ignore next */
  updateTime (timedim, prevTime) {
    if (timedim !== prevTime) {
      // eslint-disable-next-line no-undef
      this.webMapJS.setDimension('time', timedim, true);
      this.webMapJS.draw();
    }
  }

  /* istanbul ignore next */
  updateMapMode (mapMode, prevMapMode, active) {
    // Update mapmode
    if (mapMode !== prevMapMode) {
      const listenerModi = ['progtemp', 'timeseries'];

      const removeListeners = listenerModi.some(mode => prevMapMode === mode && mapMode !== mode);

      const registerListeners = listenerModi.some(mode => prevMapMode !== mode && mapMode === mode);
      // Remove listeners if switching away from progtemp or timeseries
      if (removeListeners) {
        this.webMapJS.removeListener('mouseclicked');
        this.webMapJS.enableInlineGetFeatureInfo(true);
      }

      // Register listeners if switching to progtemp or timeseries
      if (registerListeners) {
        this.webMapJS.enableInlineGetFeatureInfo(false);
        this.webMapJS.addListener('mouseclicked', e => this.findClosestCursorLoc(e), true);
      }
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

  // Returns true when the layers are actually different w.r.t. prev layers, otherwise false
  /* istanbul ignore next */
  updateLayers (currDataLayers, prevDataLayers) {
    if (currDataLayers !== prevDataLayers) {
      if (this.orderChanged(currDataLayers, prevDataLayers)) {
        this.webMapJS.stopAnimating();
        const newDatalayers = currDataLayers.map((datalayer) => {
          datalayer.enabled = 'enabled' in datalayer ? datalayer.enabled : true;
          // eslint-disable-next-line no-undef
          const newDataLayer = new WMJSLayer(datalayer);
          newDataLayer.setAutoUpdate(true, moment.duration(2, 'minutes').asMilliseconds(), (layer) => this.updateLayer(layer, datalayer));
          newDataLayer.onReady = (layer) => this.updateLayer(layer, datalayer);
          return newDataLayer;
        });
        this.webMapJS.removeAllLayers();
        newDatalayers.reverse().forEach(layer => this.webMapJS.addLayer(layer));
      } else {
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
      return true;
    }
    return false;
  }

  /* istanbul ignore next */
  componentDidUpdate (prevProps) {
    const { mapProperties, adagucProperties, layerActions, layers, active, mapId, dispatch } = this.props;
    const { boundingBox, mapMode } = mapProperties;
    const { timeDimension, animate, cursor } = adagucProperties;
    const { baselayer } = layers;
    const activePanel = this.props.layers.panels[mapId];

    // Updates that need to happen across all panels
    this.updateBoundingBox(boundingBox, prevProps.mapProperties.boundingBox);
    this.updateTime(timeDimension, prevProps.adagucProperties.timeDimension || null);
    this.updateMapMode(mapMode, prevProps.mapProperties.mapMode, active);

    // Update animation -- animate iff animate is set and the panel is active.
    this.onChangeAnimation(active && animate);

    // Track cursor if necessary
    const prevCursor = prevProps.adagucProperties.cursor;
    if (cursor && cursor.location && cursor !== prevCursor) {
      this.webMapJS.positionMapPinByLatLon({ x: cursor.location.x, y: cursor.location.y });
    }

    const prevActivePanel = prevProps.layers.panels[mapId];
    const prevBaseLayer = prevProps.layers.baselayer;
    const overlays = activePanel.overlays;
    const prevOverlays = prevActivePanel.overlays;
    const layersChanged = this.updateLayers(activePanel.layers, prevActivePanel.layers);
    const baseChanged = this.updateBaselayers(baselayer, prevBaseLayer, overlays, prevOverlays);
    // Set the current layers if the panel becomes active (necessary for the layermanager etc.)
    if (active && (!prevProps.active || layersChanged || baseChanged)) {
      this.resize();
      dispatch(layerActions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    }
    // this.webMapJS.draw('368');
  }

  /* istanbul ignore next */
  onChangeAnimation (value) {
    this.isAnimating = value;
    if (this.isAnimating) {
      this.webMapJS.drawAutomatic(moment().utc().subtract(4, 'hours'), moment().utc().add(48, 'hours'));
    } else {
      this.webMapJS.stopAnimating();
    }
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
  drawActions: PropTypes.object
};
