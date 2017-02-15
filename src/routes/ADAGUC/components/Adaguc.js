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
    console.log('updateAnimation');
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
    this.webMapJS.setSize($(window).width() - 250, $(window).height() - 250);
    this.webMapJS.draw();
    this.render();
  }

  initAdaguc (adagucMapRef) {
    const { adagucProperties, actions, dispatch } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    // const url = 'http://localhost/adagucviewer/webmapjs';
    // var url = 'http://birdexp07.knmi.nl/geoweb/adagucviewer/webmapjs';

    const username = 'terpstra';
    const machineName = 'bhw471';
    const url = ['http://', machineName, '/~', username, '/adagucviewer/webmapjs'].join('');
    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef);
    this.webMapJS.setBaseURL(url);
    // eslint-disable-next-line no-undef
    $(window).resize(this.resize);
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width() - 250, $(window).height() - 250);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.mapType)]);
    axios.get('http://birdexp07.knmi.nl/cgi-bin/geoweb/getServices.cgi').then(res => {
      const sources = res.data;
      dispatch(actions.createMap(sources));
      this.webMapJS.draw();
    });
  }
  componentDidMount () {
    console.log('componentDidMount', this.refs.maindiv);
    this.initAdaguc(this.refs.adaguc);
  }
  componentWillReceiveProps (nextProps) {
    console.log('componentWillReceiveProps', nextProps);
  }
  componentWillMount () {
    console.log('componentWillMount');
  }
  componentWillUnmount () {
    console.log('componentWillUnmount');
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    const { actions, adagucProperties, dispatch } = this.props;
    const { setLayers, setStyles } = actions;
    const { source, layer, style, mapType, boundingBox } = adagucProperties;
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
        service.getLayerNames((layernames) => { dispatch(setLayers(layernames)); }, (error) => { console.log('Error!: ', error); });
      }
      // console.log('Alle layers:', this.allelayers);
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
      // console.log('switched layers');
    }
  };

  onChangeAnimation (value) {
    console.log('onChangeAnimation');
    this.isAnimating = !value;
    this.updateAnimation(this.webMapJS.getActiveLayer());
  }

  render () {
    // eslint-disable-next-line no-undef
    let timeComponentWidth = $(window).width();
    return (<div>
      <div style={{ display:'inline-block', position:'relative' }}>
        <div ref='adaguc' />
      </div>
      <Menu {...this.props} webmapjs={this.webMapJS} />
      <div id='infocontainer'>
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
