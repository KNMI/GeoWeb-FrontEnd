import React from 'react';
import { default as Menu } from './Menu';
import TimeComponent from './TimeComponent.js';
import MetaInfo from './MetaInfo.js';
import axios from 'axios';
export default class Adaguc extends React.Component {
  constructor () {
    super();
    this.initAdaguc = this.initAdaguc.bind(this);
    this.animateLayer = this.animateLayer.bind(this);
    this.resize = this.resize.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.isAnimating = false;
  }
  currentLatestDate = undefined;
  currentBeginDate = undefined;

  updateAnimation (layer) {
    if (!layer) {
      console.log('Layer not found');
      return;
    }
    var timeDim = layer.getDimension('time');
    if (!timeDim) {
      console.log('Time dim not found');
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
      this.webMapJS.setDimension('time', dates[dates.length - 1].value);
      this.webMapJS.draw();
    }

    setTimeout(function () { layer.parseLayer(this.updateAnimation, true); }, 10000);
  }

  animateLayer (layer) {
    this.webMapJS.setAnimationDelay(200);
    this.updateAnimation(layer);
    layer.onReady = undefined;
  }

  resize () {
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width(), $(window).height() - 260);
    this.webMapJS.draw();
    this.render();
  }

  initAdaguc (adagucMapRef) {
    const { adagucProperties, actions, dispatch } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    // const url = 'http://localhost/adagucviewer/webmapjs';
    const url = 'http://birdexp07.knmi.nl/geoweb/adagucviewer/webmapjs';

    // const username = 'terpstra';
    // const machineName = 'birdexp07';
    // const url = ['http://', machineName, '/~', username, '/adagucviewer/webmapjs'].join('');
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef);
    this.webMapJS.setBaseURL(url);
    // eslint-disable-next-line no-undef
    $(window).resize(this.resize);
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width(), $(window).height() - 260);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.bbox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.mapType)]);
    axios.get('http://birdexp07.knmi.nl/cgi-bin/geoweb/getServices.cgi').then(src => {
      const sources = src.data;
      axios.get('http://birdexp07.knmi.nl/cgi-bin/geoweb/getOverlayServices.cgi').then(res => {
        const overlaySrc = res.data[0];
        // eslint-disable-next-line no-undef
        var service = WMJSgetServiceFromStore(overlaySrc.service);
        service.getLayerNames(
          (layernames) => {
            dispatch(actions.createMap(sources, { ...overlaySrc, layers: layernames }));
          },
          (error) => {
            console.log('Error!: ', error);
          }
        );
        this.webMapJS.draw();
      }).catch((error) => {
        console.log(error);
      });
    }).catch((error) => {
      console.log(error);
    });
  }
  componentDidMount () {
    this.initAdaguc(this.refs.adaguc);
  }
  componentWillReceiveProps (nextProps) {
  }
  componentWillMount () {
  }
  componentWillUnmount () {
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    const { actions, adagucProperties, dispatch } = this.props;
    const { setLayers, setStyles } = actions;
    const { source, layer, style, mapType, boundingBox, overlay } = adagucProperties;
      // eslint-disable-next-line no-undef
    const baselayer = new WMJSLayer(mapType);
    if (overlay) {
      // eslint-disable-next-line no-undef
      const overLayer = new WMJSLayer(overlay);
      overLayer.keepOnTop = true;
      const newBaselayers = [baselayer, overLayer];
      this.webMapJS.setBaseLayers(newBaselayers);
    } else {
      // eslint-disable-next-line no-undef
      this.webMapJS.setBaseLayers([baselayer]);
    }
    this.webMapJS.draw();

    // if (!prevProps.adagucProperties.mapCreated || layer !== prevProps.adagucProperties.layer) {
    if (mapType !== prevProps.adagucProperties.mapType) {
      // eslint-disable-next-line no-undef
    } else if (boundingBox !== prevProps.adagucProperties.boundingBox) {
      this.webMapJS.setBBOX(boundingBox.join());
    } else {
      if (source === null) {
        return;
      }
      if (!prevProps.adagucProperties.source || (prevProps.adagucProperties.source.service !== source.service)) {
        // eslint-disable-next-line no-undef
        var service = WMJSgetServiceFromStore(source.service);
        service.getLayerNames((layernames) => { dispatch(setLayers(layernames)); }, (error) => { console.log('Error!: ', error); });
      }
      if (layer === null) {
        return;
      }
      const combined = Object.assign({}, source, { name: layer }, { style: style }, { opacity: 0.75 });
      // eslint-disable-next-line no-undef
      var newDataLayer = new WMJSLayer(combined);
      // Stop the old animation
      this.webMapJS.stopAnimating();
      // Start the animation of th new layer
      newDataLayer.onReady = this.animateLayer;
      // Remove all present layers
      this.webMapJS.removeAllLayers();
      // And add the new layer
      if (newDataLayer.name) {
        this.webMapJS.addLayer(newDataLayer);
      }
      // eslint-disable-next-line
      var newDataLayer2 = new WMJSLayer({
        service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
        name:'precipitation'
      });
      this.webMapJS.addLayer(newDataLayer2);
      this.webMapJS.setActiveLayer(newDataLayer);
      if (!prevProps.adagucProperties.layer || (prevProps.adagucProperties.layer !== layer)) {
        const styles = this.webMapJS.getActiveLayer().styles;
        dispatch(setStyles(styles));
      }
    }
  };

  onChangeAnimation (value) {
    this.isAnimating = !value;
    this.updateAnimation(this.webMapJS.getActiveLayer());
  }

  render () {
    // eslint-disable-next-line no-undef
    let timeComponentWidth = $(window).width() - 20;
    // let timeComponentWidth = this.webMapJS ? this.webMapJS.getSize().width : $(window).width();
    return (<div>
      <Menu {...this.props} webmapjs={this.webMapJS} />
      <div style={{ display:'inline-block', position:'relative' }}>
        <div ref='adaguc' />
      </div>
      <div id='infocontainer' style={{ margin: 0 }}>
        <TimeComponent webmapjs={this.webMapJS} width={timeComponentWidth} onChangeAnimation={this.onChangeAnimation} />
        <hr />
        <MetaInfo webmapjs={this.webMapJS} />
      </div>
    </div>);
  }
};

Adaguc.propTypes = {
  adagucProperties : React.PropTypes.object.isRequired,
  actions          : React.PropTypes.object.isRequired,
  dispatch         : React.PropTypes.func.isRequired
};
