import React from 'react';
import { default as AdagucMapDraw } from './AdagucMapDraw.js';
import AdagucMeasureDistance from './AdagucMeasureDistance.js';
import axios from 'axios';
import $ from 'jquery';
var moment = require('moment');
var elementResizeEvent = require('element-resize-event');

import { BACKEND_SERVER_URL, BACKEND_SERVER_XML2JSON } from '../constants/backend';
export default class Adaguc extends React.Component {
  constructor () {
    super();
    this.initAdaguc = this.initAdaguc.bind(this);
    this.animateLayer = this.animateLayer.bind(this);
    this.resize = this.resize.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.timeHandler = this.timeHandler.bind(this);
    this.isAnimating = false;
    this.state = {
      dropdownOpenView: false,
      modal: false,
      activeTab: '1',
      inSigmetModus: false,
      time: undefined
    };
    this.toggleView = this.toggleView.bind(this);
  }

  currentLatestDate = undefined;
  currentBeginDate = undefined;

  /* istanbul ignore next */
  updateAnimation (layer) {
    if (!layer) {
      return;
    }
    var timeDim = layer.getDimension('time');
    if (!timeDim) {
      return;
    }
    var numTimeSteps = timeDim.size();

    var numStepsBack = Math.min(timeDim.size(), 25);
    this.currentLatestDate = timeDim.getValueForIndex(numTimeSteps - 1);
    this.currentBeginDate = timeDim.getValueForIndex(numTimeSteps - numStepsBack);

    var dates = [];
    for (var j = numTimeSteps - numStepsBack; j < numTimeSteps; ++j) {
      dates.push({ name:timeDim.name, value:timeDim.getValueForIndex(j) });
    }
    this.webMapJS.stopAnimating();
    if (this.isAnimating) {
      this.webMapJS.draw(dates);
    } else {
      this.webMapJS.setDimension('time', dates[dates.length - 1].value, false);
      this.webMapJS.draw();
    }

    setTimeout(function () { layer.parseLayer(this.updateAnimation, true); }, 10000);
  }
  timeHandler (e) {
    const wmjstime = this.webMapJS.getDimension('time').currentValue;
    if (!this.prevTime) {
      this.prevTime = wmjstime;
    }
    if (wmjstime !== this.prevTime) {
      this.prevTime = wmjstime;
      this.props.dispatch(this.props.actions.setTimeDimension(wmjstime));
    }
  }
  /* istanbul ignore next */
  animateLayer (layer) {
    this.webMapJS.setAnimationDelay(200);
    this.updateAnimation(layer);
    const timeDim = layer.getDimension('time');
    const timeOne = moment(timeDim.get(0));
    const timeTwo = moment(timeDim.get(1));
    // const deltaMS = (moment.duration(timeTwo.diff(timeOne)).subtract(moment.duration('00:00:30'))).asMilliseconds();
    // Difference between two timesteps as refresh difference
    const deltaMS = moment.duration(timeTwo.diff(timeOne)).asMilliseconds() / 2.0;
    layer.setAutoUpdate(true, deltaMS, this.updateAnimation);
    this.props.dispatch(this.props.actions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    this.props.dispatch(this.props.actions.setTimeDimension(this.webMapJS.getDimension('time').currentValue));
    layer.onReady = undefined;
  }
  /* istanbul ignore next */
  resize () {
    var element = document.querySelector('.map .content');
    this.webMapJS.setSize($(element).width(), $(element).height());
    this.webMapJS.draw();
  }

  /* istanbul ignore next */
  initAdaguc (adagucMapRef) {
    const { adagucProperties, actions, dispatch } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef, BACKEND_SERVER_XML2JSON);
    var element = document.querySelector('.map .content');
    const width = $(element).width();
    const height = $(element).height();
    this.webMapJS.setSize(width, height);
    elementResizeEvent(element, this.resize);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.bbox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.layers.baselayer)]);
    axios.all(['getServices', 'getOverlayServices'].map((req) => axios.get(BACKEND_SERVER_URL + '/' + req))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap(services.data, overlays.data[0])))
    );
    this.webMapJS.stopAnimating();
    const newDatalayers = adagucProperties.layers.datalayers.map((datalayer) => {
      // eslint-disable-next-line no-undef
      const newDataLayer = new WMJSLayer(datalayer);
      newDataLayer.onReady = this.animateLayer;
      return newDataLayer;
    });
    this.webMapJS.removeAllLayers();
    newDatalayers.reverse().forEach((layer) => this.webMapJS.addLayer(layer));
    const newActiveLayer = (this.webMapJS.getLayers()[0]);
    this.webMapJS.addListener('ondimchange', this.timeHandler, true);
    if (newActiveLayer) {
      this.webMapJS.setActiveLayer(this.webMapJS.getLayers()[0]);
    }
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(actions.setTimeDimension(currentDate.toISO8601()));
    dispatch(actions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    this.webMapJS.draw();
  }

  componentDidMount () {
    this.initAdaguc(this.refs.adaguc);
  }
  componentWillMount () {
    /* Component will unmount, set flag that map is not created */
    const { adagucProperties } = this.props;
    adagucProperties.mapCreated = false;
  }
  componentWillUnmount () {
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }
  orderChanged (currLayers, prevLayers) {
    if (currLayers.length !== prevLayers.length) {
      return true;
    }
    for (var i = currLayers.length - 1; i >= 0; i--) {
      if (currLayers[i].service !== prevLayers[i].service || currLayers[i].name !== prevLayers[i].name) {
        return true;
      }
    }
    return false;
  }
  /* istanbul ignore next */
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    const { adagucProperties } = this.props;
    const { layers, boundingBox, timedim, animate, mapMode } = adagucProperties;
      // eslint-disable-next-line no-undef
    if (boundingBox !== prevProps.adagucProperties.boundingBox) {
      this.webMapJS.setBBOX(boundingBox.bbox.join());
      this.webMapJS.draw();
    }
    if (layers !== prevProps.adagucProperties.layers) {
      const { baselayer, datalayers, overlays } = layers;
      if (baselayer !== prevProps.adagucProperties.layers.baselayer || overlays !== prevProps.adagucProperties.layers.overlays) {
        // eslint-disable-next-line no-undef
        const overlayers = overlays.map((overlay) => { const newOverlay = new WMJSLayer(overlay); newOverlay.keepOnTop = true; return newOverlay; });
        // eslint-disable-next-line no-undef
        const newBaselayers = [new WMJSLayer(baselayer)].concat(overlayers);
        this.webMapJS.setBaseLayers(newBaselayers);
      }
      if (datalayers !== prevProps.adagucProperties.layers.datalayers) {
        // TODO refactor this so we don't remove all layers and just update them if count and order remain the same
        if (datalayers.length !== prevProps.adagucProperties.layers.datalayers.length || this.orderChanged(datalayers, prevProps.adagucProperties.layers.datalayers)) {
          this.webMapJS.stopAnimating();
          const newDatalayers = datalayers.map((datalayer) => {
            // eslint-disable-next-line no-undef
            const newDataLayer = new WMJSLayer(datalayer);
            newDataLayer.onReady = this.animateLayer;
            return newDataLayer;
          });
          this.webMapJS.removeAllLayers();
          newDatalayers.reverse().forEach((layer) => this.webMapJS.addLayer(layer));
          const newActiveLayer = (this.webMapJS.getLayers()[0]);
          if (newActiveLayer) {
            this.webMapJS.setActiveLayer(this.webMapJS.getLayers()[0]);
          }
        } else {
          let layers = this.webMapJS.getLayers();
          for (var i = layers.length - 1; i >= 0; i--) {
            layers[i].enabled = datalayers[i].enabled;
            layers[i].opacity = datalayers[i].opacity;
            layers[i].service = datalayers[i].service;
            layers[i].name = datalayers[i].name;
            layers[i].label = datalayers[i].label;
            if (datalayers[i].style) {
              layers[i].currentStyle = datalayers[i].style;
            }
            this.webMapJS.getListener().triggerEvent('onmapdimupdate');
          }
        }
      }
      // this.onChangeAnimation(animate);
      this.props.dispatch(this.props.actions.setWMJSLayers({ layers: this.webMapJS.getLayers(), baselayers: this.webMapJS.getBaseLayers() }));
    }
    if (timedim !== prevProps.adagucProperties.timedim) {
      this.webMapJS.setDimension('time', timedim, false);
    }
    if (animate !== prevProps.adagucProperties.animate) {
      this.onChangeAnimation(animate);
    }
    if (mapMode !== prevProps.adagucProperties.mapMode) {
      switch (mapMode) {
        case 'zoom':
          this.webMapJS.setMapModeZoomBoxIn();
          break;
        case 'pan':
          this.webMapJS.setMapModePan();
          break;
        case 'draw':
          this.webMapJS.setMessage('Press [Esc] to close the polygon.');
          break;
        case 'measure':
          this.webMapJS.setMessage('Click to end measuring. Press [Esc] to delete the measurement.');
          break;
        default:
          this.webMapJS.setMapModeNone();
          break;
      }
      if (!(mapMode === 'draw' || mapMode === 'measure')) {
        this.webMapJS.setMessage('');
      }
    }
    this.webMapJS.draw();
  }

  /* istanbul ignore next */
  onChangeAnimation (value) {
    this.isAnimating = value;
    this.updateAnimation(this.webMapJS.getActiveLayer());
  };
  toggleView () {
    this.setState({
      dropdownOpenView: !this.state.dropdownOpenView
    });
  }
  render () {
    const { adagucProperties, dispatch } = this.props;
    return (
      <div id='adagucwrapper'>
        <div ref='adaguc' />
        <div style={{ margin: '5px 10px 10px 5px ' }}>
          <AdagucMapDraw
            dispatch={dispatch}
            isInEditMode={adagucProperties.mapMode === 'draw' || adagucProperties.mapMode === 'delete'}
            isInDeleteMode={adagucProperties.mapMode === 'delete'}
            webmapjs={this.webMapJS} />
          <AdagucMeasureDistance
            dispatch={dispatch}
            webmapjs={this.webMapJS}
            isInEditMode={adagucProperties.mapMode === 'measure'} />
        </div>
      </div>
    );
  }
};

class ModelTime extends React.Component {
  constructor () {
    super();
    this.updateState = this.updateState.bind(this);
    this.resetState = this.resetState.bind(this);
    this.state = {
      display: null
    };
  }
  updateState () {
    const adagucTime = moment.utc(this.props.webmapjs.getDimension('time').currentValue);
    const now = moment(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
    const hourDifference = Math.floor(moment.duration(adagucTime.diff(now)).asHours());
    if (hourDifference > 1) {
      this.setState({ display: adagucTime.format('ddd D HH:mm').toString() + ' (+' + (hourDifference - 1) + ')' });
    } else if (hourDifference < -1) {
      this.setState({ display: adagucTime.format('ddd D HH:mm').toString() + ' (' + (hourDifference) + ')' });
    } else {
      this.setState({ display: '' });
    }
  }
  resetState () {
    this.setState({ display: '' });
  }
  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        webmapjs.addListener('ondimchange', this.updateState, true);
        webmapjs.addListener('onmapdimupdate', this.updateState, true);
        webmapjs.addListener('onmapdimchange', this.updateState, true);
      }
      return <span>{this.state.display}</span>;
    } else {
      return <div />;
    }
  }
}
ModelTime.propTypes = {
  webmapjs: React.PropTypes.object
};

Adaguc.propTypes = {
  adagucProperties : React.PropTypes.object.isRequired,
  actions          : React.PropTypes.object.isRequired,
  dispatch         : React.PropTypes.func.isRequired
};
