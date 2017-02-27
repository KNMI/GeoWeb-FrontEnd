import React from 'react';
import { push as Menu } from 'react-burger-menu';

// import { default as Menu } from './Menu';
import { Badge, ListGroup, ListGroupItem, Collapse, CardBlock, Card } from 'reactstrap';
import TimeComponent from './TimeComponent.js';
import AdagucMapDraw from './AdagucMapDraw.js';
import LayerManager from './LayerManager.js';
import axios from 'axios';
import Icon from 'react-fa';
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
    this.webMapJS.setSize($(window).width(), $(window).height() - 300);
    this.webMapJS.draw();
    if (this.refs.TimeComponent) {
      // eslint-disable-next-line no-undef
      let timeComponentWidth = $(window).width() - 20;
      this.refs.TimeComponent.setState({ 'width':timeComponentWidth });
    }
  }

  initAdaguc (adagucMapRef) {
    const { adagucProperties, actions, dispatch } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    const rootURL = 'http://birdexp07.knmi.nl/cgi-bin/geoweb';
    const url = 'http://birdexp07.knmi.nl/geoweb/adagucviewer/webmapjs';

    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef);
    this.webMapJS.setBaseURL(url);
    // eslint-disable-next-line no-undef
    $(window).resize(this.resize);
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width(), $(window).height() - 300);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.bbox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.layers.baselayer)]);
    // eslint-disable-next-line no-undef
    // var newDataLayer2 = new WMJSLayer({
    //   service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
    //   name:'echotops'
    // });
    // this.webMapJS.addLayer(newDataLayer2);
    // eslint-disable-next-line no-undef
    // var Overlay = new WMJSLayer({
    //   service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
    //   name:'FIR areas'
    // });
    // this.webMapJS.addLayer(Overlay);

    // this.webMapJS.setActiveLayer(newDataLayer2);
    axios.get(rootURL + '/getServices.cgi').then(src => {
      const sources = src.data;
      axios.get(rootURL + '/getOverlayServices.cgi').then(res => {
        dispatch(actions.createMap(sources, res.data[0]));
        // const overlaySrc = res.data[0];
        // // eslint-disable-next-line no-undef
        // var service = WMJSgetServiceFromStore(overlaySrc.service);
        // service.getLayerNames(
        //   (layernames) => {
        //     console.log(layernames);
        //     console.log(service);
        //     dispatch(actions.createMap(sources, { ...overlaySrc, layers: layernames }));
        //   },
        //   (error) => {
        //     console.log('Error!: ', error);
        //   }
        // );
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
    /* Component will unmount, set flag that map is not created */
    const { adagucProperties } = this.props;
    adagucProperties.mapCreated = false;
  }
  componentWillUnmount () {
    if (this.webMapJS) {
      this.webMapJS.destroy();
    }
  }
  componentDidUpdate (prevProps, prevState) {
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    const { adagucProperties } = this.props;
    // const { setLayers, setStyles } = actions;
    // const { source, layer, style, mapType, boundingBox, overlay } = adagucProperties;
    const { layers, boundingBox } = adagucProperties;
      // eslint-disable-next-line no-undef
    if (boundingBox !== prevProps.adagucProperties.boundingBox) {
      this.webMapJS.setBBOX(boundingBox.bbox.join());
      this.webMapJS.draw();
    } else if (layers !== prevProps.adagucProperties.layers) {
      console.log('new layers!');
      const { baselayer, datalayers, overlays } = layers;
      if (baselayer !== prevProps.adagucProperties.layers.baselayer) {
        console.log('newbaselayer!');
        // eslint-disable-next-line no-undef
        this.webMapJS.setBaseLayers([new WMJSLayer(baselayer)]);
        this.webMapJS.draw();
      } else if (overlays !== prevProps.adagucProperties.layers.overlays) {
        console.log('newoverlay!');
        // eslint-disable-next-line no-undef
        const overlayers = overlays.map((overlay) => { const newOverlay = new WMJSLayer(overlay); newOverlay.keepOnTop = true; return newOverlay; });
        // eslint-disable-next-line no-undef
        const newBaselayers = [new WMJSLayer(baselayer)].concat(overlayers);
        console.log(newBaselayers);
        this.webMapJS.setBaseLayers(newBaselayers);
        this.webMapJS.draw();
      } else {
        console.log('new regular layers!');
        this.webMapJS.stopAnimating();
        // eslint-disable-next-line no-undef
        const newDatalayers = datalayers.map((datalayer) => { const newDataLayer = new WMJSLayer(datalayer); newDataLayer.onReady = this.animateLayer; return newDataLayer; });
        this.webMapJS.removeAllLayers();
        newDatalayers.forEach((layer) => this.webMapJS.addLayer(layer));
        const newActiveLayer = (this.webMapJS.getLayers()[0]);
        if (newActiveLayer) {
          this.webMapJS.setActiveLayer(this.webMapJS.getLayers()[0]);
        } else {
          this.webMapJS.draw();
        }
      }
    } else {
      console.log('???');
    }
  }

  onChangeAnimation (value) {
    this.isAnimating = !value;
    this.updateAnimation(this.webMapJS.getActiveLayer());
  };

  render () {
    // eslint-disable-next-line no-undef
    let timeComponentWidth = $(window).width();
    const shiftTaskItems = [
      {
        title: 'Basis forecast'
      },
      {
        title: 'Guidance Model interpretation'
      },
      {
        title: 'General Transfer'
      },
      {
        title: 'Safety Shift Transfer'
      },
      {
        title: 'Shift Report'
      }
    ];
    const productItems = [
      {
        title: 'Today\'s all shift products'
      },
      {
        title: 'Shared products'
      },
      {
        title: 'Warnings'
      },
      {
        title: 'SIGMETs',
        notificationCount: 1
      },
      {
        title: 'Forecasts'
      },
      {
        title: 'Analyses'
      }
    ];
    return (
      <div>
        <div>
          <Menu pageWrapId={'adagucWrapper'} outerContainerId={'root'} width={400} noOverlay>
            <MenuItem title='Shift tasks' notification='3' subitems={shiftTaskItems} />
            <MenuItem title='Products' subitems={productItems} />
            <MenuItem title='Reports & Logs' subitems={[{ title: 'Basis forecast', notificationCount: 3 }]} />
            <MenuItem title='Monitoring & Triggers' subitems={[{ title: 'Basis forecast', notificationCount: 3 }]} />
          </Menu>
        </div>
        <div id='adagucWrapper'>
          <div>
            <div ref='adaguc' />
            <AdagucMapDraw webmapjs={this.webMapJS} />
          </div>
          <div id='infocontainer' style={{ margin: 0 }}>
            <TimeComponent ref='TimeComponent' webmapjs={this.webMapJS} width={timeComponentWidth} onChangeAnimation={this.onChangeAnimation} />
            <LayerManager dispatch={this.props.dispatch} actions={this.props.actions} sources={this.props.adagucProperties.sources} layers={this.props.adagucProperties.layers} />
          </div>
        </div>
      </div>
    );
  }
};

class MenuItem extends React.Component {
  constructor () {
    super();
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  render () {
    const { title, notification, subitems } = this.props;
    const numNotifications = parseInt(notification);
    return (
      <ListGroup>
        <ListGroupItem id='menuitem' onClick={this.toggle} className='justify-content-between' active>{title}
          {numNotifications > 0 ? <Badge color='danger' pill>{numNotifications}</Badge> : null}</ListGroupItem>
        <Collapse isOpen={this.state.collapse}>
          <Card>
            <CardBlock>
              <ListGroup>
                {subitems.map((subitemobj, i) =>
                  <ListGroupItem id='submenuitem' className='justify-content-between' tag='button' key={i}>{subitemobj.title}
                    <span>{subitemobj.notificationCount > 0 ? <Badge color='danger' pill>{subitemobj.notificationCount}</Badge> : null}
                      {<Icon name='caret-right' />}</span>
                  </ListGroupItem>)}
              </ListGroup>
            </CardBlock>
          </Card>
        </Collapse>
      </ListGroup>
    );
  }
}

MenuItem.propTypes = {
  title         : React.PropTypes.string.isRequired,
  notification  : React.PropTypes.string,
  subitems      : React.PropTypes.array.isRequired
};

Adaguc.propTypes = {
  adagucProperties : React.PropTypes.object.isRequired,
  actions          : React.PropTypes.object.isRequired,
  dispatch         : React.PropTypes.func.isRequired
};
