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
    var timeDim = layer.getDimension('time');
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
    this.webMapJS.setSize($(window).width() - 200, $(window).height() - 150);
    this.webMapJS.draw();
  }

  initAdaguc (elem) {
    const { adagucProperties, createMap } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    const url = 'http://localhost/adagucviewer/webmapjs';
    // var url = 'http://birdexp07.knmi.nl/geoweb/adagucviewer/webmapjs';

    // const username = 'terpstra';
    // const machineName = 'bhw471';
    // const url = ['http://', machineName, '/~', username, '/adagucviewer/webmapjs'].join('');
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(document.getElementById('adaguc'));
    this.webMapJS.setBaseURL(url);
    // eslint-disable-next-line no-undef
    $(window).resize(this.resize);
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width() - 250, $(window).height() - 150);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.mapType)]);
    // axios.get('http://birdexp07.knmi.nl/cgi-bin/geoweb/getServices.cgi').then(res => {
    axios.get('http://localhost/cgi-bin/getServices.cgi').then(res => {
      const sources = res.data;
      createMap(sources);
      this.webMapJS.draw();
    });
  }

  componentWillUnmount () {
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    var { setLayers, setStyles } = this.props;
    var { source, layer, style, mapType, boundingBox } = this.props.adagucProperties;
    // if (!prevProps.adagucProperties.mapCreated || layer !== prevProps.adagucProperties.layer) {
    if (mapType !== prevProps.adagucProperties.mapType) {
      // eslint-disable-next-line no-undef
      this.webMapJS.setBaseLayers([new WMJSLayer(mapType)]);
    } else if (boundingBox !== prevProps.adagucProperties.boundingBox) {
      this.webMapJS.setBBOX(boundingBox.join());
    } else {
      if (source === null) {
        return;
      }
      console.log(prevProps);
      if (!prevProps.adagucProperties.source || (prevProps.adagucProperties.source.service !== source.service)) {
        // eslint-disable-next-line no-undef
        var service = WMJSgetServiceFromStore(source.service);
        service.getLayerNames((layernames) => { setLayers(layernames); }, (error) => { console.log('Error!: ', error); });
      }
      // console.log('Alle layers:', this.allelayers);
      if (layer === null) {
        return;
      }
      const combined = Object.assign({}, source, { name: layer }, { style: style });
      // eslint-disable-next-line no-undef
      var newDataLayer = new WMJSLayer(combined);
      // Stop the old animation
      this.webMapJS.stopAnimating();
      // Start the animation of th new layer
      newDataLayer.onReady = this.animateLayer;
      // Remove all present layers
      this.webMapJS.removeAllLayers();
      // And add the new layer
      this.webMapJS.addLayer(newDataLayer);
      this.webMapJS.setActiveLayer(newDataLayer);
      if (!prevProps.adagucProperties.layer || (prevProps.adagucProperties.layer !== layer)) {
        const styles = this.webMapJS.getActiveLayer().styles;
        setStyles(styles);
      }
      // console.log('switched layers');
    }
  };

  onChangeAnimation (value) {
    console.log('onChangeAnimation');
    this.isAnimating = !value;
    this.updateAnimation(this.webMapJS.getActiveLayer());
  }

  render () {
    return (<div>
      <div id='adaguccontainer'>
        <div id='adaguc' ref={(elem) => { this.initAdaguc(elem); }} />
      </div>
      <Menu {...this.props} webmapjs={this.webMapJS} />
      <div id='infocontainer'>
        <TimeComponent webmapjs={this.webMapJS} onChangeAnimation={this.onChangeAnimation} />
        <MetaInfo webmapjs={this.webMapJS} />
      </div>
    </div>);
  }
};

Adaguc.propTypes = {
  adagucProperties : React.PropTypes.object.isRequired,
  createMap        : React.PropTypes.func.isRequired,
  setSource        : React.PropTypes.func.isRequired,
  setLayer         : React.PropTypes.func.isRequired,
  setLayers        : React.PropTypes.func.isRequired,
  setMapStyle      : React.PropTypes.func.isRequired,
  setCut           : React.PropTypes.func.isRequired,
  setStyle         : React.PropTypes.func.isRequired,
  setStyles        : React.PropTypes.func.isRequired
};
