import React from 'react';
import { Badge, ListGroup, ListGroupItem, Collapse,
  CardBlock, Card, ButtonDropdown, DropdownToggle, DropdownMenu, Label,
  DropdownItem, Button } from 'reactstrap';
import TimeComponent from './TimeComponent.js';
import { default as AdagucMapDraw } from './AdagucMapDraw.js';
import LayerManager from './LayerManager.js';
import AdagucMeasureDistance from './AdagucMeasureDistance.js';
import axios from 'axios';
import Icon from 'react-fa';
import { Typeahead } from 'react-bootstrap-typeahead';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import $ from 'jquery';

export default class Adaguc extends React.Component {
  constructor () {
    super();
    this.initAdaguc = this.initAdaguc.bind(this);
    this.animateLayer = this.animateLayer.bind(this);
    this.resize = this.resize.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.isAnimating = false;
    this.createSIGMET = this.createSIGMET.bind(this);
    this.state = {
      dropdownOpenView: false,
      modal: false,
      activeTab: '1',
      inSigmetModus: false
    };

    this.toggleView = this.toggleView.bind(this);
  }

  currentLatestDate = undefined;
  currentBeginDate = undefined;

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  animateLayer (layer) {
    this.webMapJS.setAnimationDelay(200);
    this.updateAnimation(layer);
    layer.onReady = undefined;
  }
  /* istanbul ignore next */
  resize () {
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width() - 400, $(window).height() - 300);
    this.webMapJS.draw();
    if (this.refs.TimeComponent) {
      // eslint-disable-next-line no-undef
      let timeComponentWidth = $(window).width() - 420;
      this.refs.TimeComponent.setState({ 'width':timeComponentWidth });
    }
  }

  /* istanbul ignore next */
  initAdaguc (adagucMapRef) {
    const { adagucProperties, actions, dispatch } = this.props;
    if (adagucProperties.mapCreated) {
      return;
    }
    const rootURL = 'http://birdexp07.knmi.nl:8080';
    const url = 'http://birdexp07.knmi.nl/geoweb/adagucviewer/webmapjs';

    // eslint-disable-next-line no-undef
    this.webMapJS = new WMJSMap(adagucMapRef);
    this.webMapJS.setBaseURL(url);
    // eslint-disable-next-line no-undef
    $(window).resize(this.resize);
    // eslint-disable-next-line no-undef
    this.webMapJS.setSize($(window).width() - 400, $(window).height() - 300);

    // Set the initial projection
    this.webMapJS.setProjection(adagucProperties.projectionName);
    this.webMapJS.setBBOX(adagucProperties.boundingBox.bbox.join());
    // eslint-disable-next-line no-undef
    this.webMapJS.setBaseLayers([new WMJSLayer(adagucProperties.layers.baselayer)]);
    axios.all(['getServices', 'getOverlayServices'].map((req) => axios.get(rootURL + '/' + req))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap(services.data, overlays.data[0])))
    );
  }

  componentDidMount () {
    this.initAdaguc(this.refs.adaguc);
  }
  componentWillReceiveProps (nextProps) {
    // console.log('componentWillReceiveProps', nextProps);
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

  /* istanbul ignore next */
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
    }
    if (layers !== prevProps.adagucProperties.layers) {
      const { baselayer, datalayers, overlays } = layers;
      if (baselayer !== prevProps.adagucProperties.layers.baselayer) {
        // eslint-disable-next-line no-undef
        this.webMapJS.setBaseLayers([new WMJSLayer(baselayer)]);
        this.webMapJS.draw();
      }
      if (overlays !== prevProps.adagucProperties.layers.overlays) {
        console.log('newoverlay!');
        // eslint-disable-next-line no-undef
        const overlayers = overlays.map((overlay) => { const newOverlay = new WMJSLayer(overlay); newOverlay.keepOnTop = true; return newOverlay; });
        // eslint-disable-next-line no-undef
        const newBaselayers = [new WMJSLayer(baselayer)].concat(overlayers);
        this.webMapJS.setBaseLayers(newBaselayers);
        this.webMapJS.draw();
      }
      this.webMapJS.stopAnimating();
      // eslint-disable-next-line no-undef
      const newDatalayers = datalayers.map((datalayer) => { const newDataLayer = new WMJSLayer(datalayer); newDataLayer.onReady = this.animateLayer; return newDataLayer; });
      this.webMapJS.removeAllLayers();
      newDatalayers.reverse().forEach((layer) => this.webMapJS.addLayer(layer));
      const newActiveLayer = (this.webMapJS.getLayers()[0]);
      if (newActiveLayer) {
        this.webMapJS.setActiveLayer(this.webMapJS.getLayers()[0]);
      }
      this.webMapJS.draw();
    }
  }

  createSIGMET () {
    this.setState({
      inSigmetModus: !this.state.inSigmetModus
    });
  }

  /* istanbul ignore next */
  onChangeAnimation (value) {
    this.isAnimating = !value;
    this.updateAnimation(this.webMapJS.getActiveLayer());
  };
  toggleView () {
    this.setState({
      dropdownOpenView: !this.state.dropdownOpenView
    });
  }
  render () {
    const { adagucProperties, dispatch, actions } = this.props;
    const { adagucmapdraw, adagucmeasuredistance } = adagucProperties;
    // eslint-disable-next-line no-undef
    let timeComponentWidth = $(window).width() - 400;
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
        title: 'Create SIGMET',
        notificationCount: 4,
        action: this.createSIGMET
      },
      {
        title: 'Forecasts'
      },
      {
        title: 'Analyses'
      }
    ];
    const { setCut } = actions;
    const { sources, layers } = adagucProperties;
    const { geojson } = adagucmapdraw;
    const coords = geojson;
    const phenomena = ['OBSC TS', 'EMBD TS', 'FRQ TS', 'SQL TS', 'OBSC TSGR', 'EMBD TSGR', 'FRQ TSGR',
      'SQL TSGR', 'SEV TURB', 'SEV ICE', 'SEV ICE (FZRA)', 'SEV MTW', 'HVY DS', 'HVY SS', 'RDOACT CLD'];
    return (
      <div>
        <Menu>
          {
            (!this.state.inSigmetModus)
              ? <div>
                <MenuItem title='Shift tasks' notification='3' subitems={shiftTaskItems} />
                <MenuItem title='Products' subitems={productItems} />
                <MenuItem title='Reports & Logs' subitems={[{ title: 'Basis forecast', notificationCount: 3 }]} />
                <MenuItem title='Monitoring & Triggers' subitems={[{ title: 'Basis forecast', notificationCount: 3 }]} />
              </div> : <div>
                <ListGroup style={{ margin: '2px' }}>
                  <ListGroupItem id='menuitem' onClick={this.toggle} className='justify-content-between' active>Create SIGMET</ListGroupItem>
                  <Label>Select phenomenon</Label>
                  <Typeahead onChange={(p) => dispatch(actions.prepareSIGMET(p[0]))} placeholder='Click or type' options={phenomena} />
                  <Label>Coordinates</Label>
                  {
                    (coords && coords.features && coords.features[0].geometry.coordinates && coords.features[0].geometry.coordinates[0])
                      ? coords.features[0].geometry.coordinates[0].map((latlon) => {
                        return latlon[0].toString().substring(0, 7) + ' Lat, ' + latlon[1].toString().substring(0, 7) + ' Lon';
                      }).map((str, i) => <div key={i}>{str}</div>)
                      : ''
                  }
                </ListGroup>
              </div>
            }
        </Menu>
        <div id='adagucWrapper' style={{ display: 'inline-block' }}>
          <div>
            <div ref='adaguc' />
            <div style={{ margin: '5px 10px 10px 5px ' }}>
              <AdagucMapDraw
                dispatch={this.props.dispatch}
                isInEditMode={adagucmapdraw.isInEditMode}
                isInDeleteMode={adagucmapdraw.isInDeleteMode}
                webmapjs={this.webMapJS}
              />
              <AdagucMeasureDistance
                dispatch={this.props.dispatch}
                webmapjs={this.webMapJS}
                isInEditMode={adagucmeasuredistance
                  .isInEditMode}
              />
              <DropdownButton dispatch={dispatch} dataFunc={setCut} items={BOUNDING_BOXES} title='View' isOpen={this.state.dropdownOpenView} toggle={this.toggleView} />
            </div>
            <Button color='primary' onClick={() => dispatch(actions.adagucmapdrawToggleEdit(adagucmapdraw))}
              disabled={this.disabled}>{adagucmapdraw.isInEditMode === false ? 'Create / Edit' : 'Exit editing mode'}
            </Button>
            <Button color='primary' onClick={() => dispatch(actions.adagucmapdrawToggleDelete(adagucmapdraw))}
              disabled={this.disabled}>{adagucmapdraw.isInDeleteMode === false ? 'Delete' : 'Click to delete'}
            </Button>
            <Button color='primary' onClick={() => dispatch(actions.adagucmeasuredistanceToggleEdit(adagucmeasuredistance))}
              disabled={this.disabled}>{adagucmeasuredistance.isInEditMode === false ? 'Measure distance' : 'Exit measuring mode'}
            </Button>
          </div>
          <div id='infocontainer' style={{ margin: 0, display: 'flex', flex: '0 0 auto' }}>
            <TimeComponent ref='TimeComponent' webmapjs={this.webMapJS} width={timeComponentWidth} onChangeAnimation={this.onChangeAnimation} />
            <LayerManager dispatch={dispatch} actions={actions} sources={sources} layers={layers} />
          </div>
        </div>
      </div>
    );
  }
};

class MenuItem extends React.Component {
  /* istanbul ignore next */
  constructor () {
    super();
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  /* istanbul ignore next */
  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  /* istanbul ignore next */
  render () {
    const { title, notification, subitems } = this.props;
    const numNotifications = parseInt(notification);
    return (
      <ListGroup style={{ margin: '2px' }}>
        <ListGroupItem id='menuitem' onClick={this.toggle} className='justify-content-between' active>{title}
          {numNotifications > 0 ? <Badge color='danger' pill>{numNotifications}</Badge> : null}</ListGroupItem>
        <Collapse isOpen={this.state.collapse}>
          <Card>
            <CardBlock>
              <ListGroup>
                {subitems.map((subitemobj, i) =>
                  <ListGroupItem id='submenuitem' className='justify-content-between' tag='button' key={i} onClick={subitemobj.action} >{subitemobj.title}
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

class Menu extends React.Component {
  /* istanbul ignore next */
  render () {
    return (
      <div style={{ display: 'inline-block', height: '100%', maxHeight: '100%', minWidth: '400px', float: 'left' }}>
        <div style={{ display: 'inline-block', height: '100%', maxHeight: '100%', width: '100%' }}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
Menu.propTypes = {
  children: React.PropTypes.element.isRequired
};

class DropdownButton extends React.Component {
  /* istanbul ignore next */
  render () {
    const { items, title, isOpen, toggle } = this.props;
    if (items) {
      return (
        <ButtonDropdown style={{ float: 'right', marginRight: '333px' }} isOpen={isOpen} toggle={toggle} dropup>
          <DropdownToggle color='primary' caret>
            {title}
          </DropdownToggle>
          <DropdownMenu>
            {items.map((item, i) => (<DropDownMenuItem {...this.props} item={item} id={i} key={i} />))}
          </DropdownMenu>
        </ButtonDropdown>
      );
    } else {
      return (
        <ButtonDropdown isOpen={false} toggle={(e) => { return e; }}>
          <DropdownToggle color='primary' caret disabled>
            {title}
          </DropdownToggle>
        </ButtonDropdown>);
    }
  }
}

DropdownButton.propTypes = {
  items         : React.PropTypes.array,
  title         : React.PropTypes.string.isRequired,
  isOpen        : React.PropTypes.bool.isRequired,
  toggle        : React.PropTypes.func.isRequired
};

class DropDownMenuItem extends React.Component {
  /* istanbul ignore next */
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  /* istanbul ignore next */
  handleClick (e) {
    const { dataFunc, dispatch, id } = this.props;
    // Execute the appropriate data function passed as prop
    dispatch(dataFunc(BOUNDING_BOXES[id]));
  }
  /* istanbul ignore next */
  render () {
    const { item } = this.props;
    return <DropdownItem onClick={this.handleClick}>{item.title}</DropdownItem>;
  }
}

DropDownMenuItem.propTypes = {
  dataFunc        : React.PropTypes.func.isRequired,
  dispatch        : React.PropTypes.func.isRequired,
  id              : React.PropTypes.number.isRequired,
  item            : React.PropTypes.object.isRequired
};
