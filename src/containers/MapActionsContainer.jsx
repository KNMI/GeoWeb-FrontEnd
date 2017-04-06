import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Row, Popover, InputGroup, Input, InputGroupButton, PopoverContent,
  ButtonGroup, TabContent, TabPane, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Panel from '../components/Panel';
import { BOUNDING_BOXES } from '../routes/ADAGUC/constants/bounding_boxes';
import { Icon } from 'react-fa';
import classnames from 'classnames';
import { Typeahead } from 'react-bootstrap-typeahead';
import ProgtempComponent from '../components/ProgtempComponent';
import TimeseriesComponent from '../components/TimeseriesComponent';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';
import axios from 'axios';
var moment = require('moment');
class MapActionContainer extends Component {
  constructor (props) {
    super(props);
    // Toggles
    this.togglePopside = this.togglePopside.bind(this);
    this.toggleProgtempPopover = this.toggleProgtempPopover.bind(this);
    // Button handlers
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.toggleLayerChooser = this.toggleLayerChooser.bind(this);
    this.goToNow = this.goToNow.bind(this);
    this.setView = this.setView.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
    this.handleAddSource = this.handleAddSource.bind(this);

    // Render functions
    this.renderBBOXPopOver = this.renderBBOXPopOver.bind(this);
    this.renderLayerChooser = this.renderLayerChooser.bind(this);
    this.renderTimeseriesPopover = this.renderTimeseriesPopover.bind(this);
    // Helper
    this.generateMap = this.generateMap.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
    this.handleSourceClick = this.handleSourceClick.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.renderSourceSelector = this.renderSourceSelector.bind(this);
    this.renderPresetSelector = this.renderPresetSelector.bind(this);
    this.setPreset = this.setPreset.bind(this);
    this.getServices = this.getServices.bind(this);
    this.renderLayerChooser = this.renderLayerChooser.bind(this);

    // State
    this.state = {
      collapse: false,
      popoverOpen: false,
      layerChooserOpen: false,
      activeTab: '1',
      getCapBusy: false
    };
  }

  getServices () {
    const { dispatch, actions } = this.props;
    const defaultURLs = ['getServices', 'getOverlayServices'].map((url) => BACKEND_SERVER_URL + '/' + url);
    const allURLs = [...defaultURLs];
    axios.all(allURLs.map((req) => axios.get(req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap([...services.data, ...JSON.parse(localStorage.getItem('geoweb')).personal_urls], overlays.data[0])))
    ).catch((e) => console.log('Error!: ', e.response));
  }

  handleAddSource (e) {
    var url = document.querySelector('#sourceurlinput').value;
    let items = JSON.parse(localStorage.getItem('geoweb'));
    // eslint-disable-next-line no-undef
    var getCap = WMJSgetServiceFromStore(url);
    this.setState({ getCapBusy: true });
    getCap.getCapabilities((e) => {
      this.setState({ getCapBusy: false });
      const newServiceObj = {
        name: getCap.name ? getCap.name : getCap.title,
        title: getCap.title,
        service: getCap.service,
        abstract: getCap.abstract
      };
      if (!items['personal_urls']) {
        items['personal_urls'] = [newServiceObj];
      } else {
        items['personal_urls'].push(newServiceObj);
      }
      localStorage.setItem('geoweb', JSON.stringify(items));
      this.getServices();
      getCap.getLayerObjectsFlat((layers) => this.props.dispatch(this.props.actions.addLayer({ ...layers[0], service: getCap.service })));
      this.toggleLayerChooser();
    }, (error) => {
      this.setState({ getCapBusy: false });
      alert(error);
    });
  }

  handleActionClick (action) {
    let toggleProgtemp = false;
    let toggleTimeseries = false;
    if (action === 'progtemp' && this.state.progTempPopOverOpen) {
      this.setState({ progTempPopOverOpen: false });
      toggleProgtemp = true;
    }
    if (action === 'timeseries' && this.state.timeSeriesPopOverOpen) {
      this.setState({ timeSeriesPopOverOpen: false });
      toggleTimeseries = true;
    }
    if (toggleProgtemp || toggleTimeseries) {
      this.props.dispatch(this.props.actions.setMapMode('pan'));
      return;
    }
    if (action === 'progtemp') {
      this.setState({ progTempPopOverOpen: true });
    } else {
      this.setState({ progTempPopOverOpen: false });
    }
    if (action === 'timeseries') {
      this.setState({ timeSeriesPopOverOpen: true });
    } else {
      this.setState({ timeSeriesPopOverOpen: false });
    }
    this.props.dispatch(this.props.actions.setMapMode(action));
  }
  handleAddLayer (e) {
    const addItem = e[0];
    if (!this.state.overlay) {
      this.props.dispatch(this.props.actions.addLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label, opacity: 1 }));
    } else {
      this.props.dispatch(this.props.actions.addOverlayLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }));
    }
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false,
      action: null,
      layers: null
    });
  }

  generateMap (layers) {
    let layerobjs = [];
    for (var i = 0; i < layers.length; ++i) {
      layerobjs.push({ id: layers[i].name, label: layers[i].text });
    }
    this.setState({
      layers: layerobjs,
      activeTab: '3'
    });
  }
  handleSourceClick (e) {
    const { adagucProperties } = this.props;
    const { sources } = adagucProperties;
    let selectedSource = sources.data.filter((source) => source.name === e.currentTarget.id);
    if (!selectedSource || selectedSource.length === 0) {
      selectedSource = sources.overlay.filter((source) => source.name === e.currentTarget.id);
      this.setState({ overlay: true });
    } else {
      this.setState({ overlay: false });
    }
    const selectedService = selectedSource[0];

    // eslint-disable-next-line no-undef
    var srv = WMJSgetServiceFromStore(selectedService.service);
    this.setState({ selectedSource: selectedService });
    srv.getLayerObjectsFlat((layers) => this.generateMap(layers), (err) => { throw new Error(err); });
  }

  toggleLayerChooser () {
    this.setState({ layerChooserOpen: !this.state.layerChooserOpen });
  }
  toggleAnimation () {
    const { dispatch, actions } = this.props;
    dispatch(actions.toggleAnimation());
  }
  togglePopside () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  toggleProgtempPopover () {
    this.setState({ progTempPopOverOpen: !this.state.progTempPopOverOpen });
  }
  goToNow () {
    const { dispatch, actions } = this.props;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(actions.setTimeDimension(currentDate.toISO8601()));
  }
  setView (e) {
    const { dispatch, actions } = this.props;
    dispatch(actions.setCut(BOUNDING_BOXES[e.currentTarget.id]));
    this.setState({ popoverOpen: false });
  }
  renderBBOXPopOver () {
    return (
      <Popover placement='left' isOpen={this.state.popoverOpen} target='setAreaButton' toggle={this.togglePopside}>
        <PopoverContent style={{ height: '15rem', overflow: 'hidden', overflowY: 'scroll' }}>
          <ButtonGroup vertical>
            {BOUNDING_BOXES.map((bbox, i) => <Button key={i} id={i} onClick={this.setView}>{bbox.title}</Button>)}
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    );
  }
  getLayerName (layer) {
    if (layer) {
      switch (layer.title) {
        case 'OBS':
          return 'Observations';
        case 'SAT':
          return 'Satellite';
        case 'LGT':
          return 'Lightning';
        case 'HARM_N25_EXT':
          return 'HARMONIE (EXT)';
        case 'HARM_N25':
          return 'HARMONIE';
        case 'OVL':
          return 'Overlay';
        case 'RADAR_EXT':
          return 'Radar (EXT)';
        default:
          return layer.title;
      }
    }
    return '';
  }
  toggleTab (e) {
    const id = (e.currentTarget.id);
    if (id.includes('tab')) {
      this.setState({ activeTab:  id.slice(3) });
    }
  }

  renderSourceSelector () {
    const { adagucProperties } = this.props;
    const { sources } = adagucProperties;
    return <div>{sources.data.map((src, i) => <Button id={src.name} key={i} onClick={this.handleSourceClick}>{this.getLayerName(src)}</Button>)}
      {sources.overlay.map((src, i) => <Button id={src.name} key={i} onClick={this.handleSourceClick}>{this.getLayerName(src)}</Button>)}</div>;
  }
  renderPresetSelector () {
    return <Button onClick={this.setPreset}>SIGMET Thunderstorm</Button>;
  }

  renderURLInput () {
    var unit = document.getElementById('sourceurlinput');
    if (unit && !this.urlinputhandlerinit) {
      this.urlinputhandlerinit = true;
      unit.addEventListener('keyup', function (event) {
        event.preventDefault();
        if (event.keyCode === 13) {
          this.handleAddSource();
        }
      }.bind(this));
    }

    return (
      <InputGroup>
        <Input id='sourceurlinput' placeholder='Add your own source' disabled={this.state.getCapBusy} />
        <InputGroupButton>
          <Button color='primary' onClick={this.handleAddSource} disabled={this.state.getCapBusy}>Add</Button>
        </InputGroupButton>
      </InputGroup>
    );
  }

  setPreset () {
    const { dispatch, actions } = this.props;
    dispatch(actions.prepareSIGMET());
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false,
      action: null,
      layers: null,
      presetUnit: null
    });
  }

  renderProgtempPopover (adagucTime) {
    if (this.state.progTempPopOverOpen) {
      const { dispatch, actions } = this.props;
      return <ProgtempComponent adagucProperties={this.props.adagucProperties} isOpen={this.state.progTempPopOverOpen} dispatch={dispatch} actions={actions} />;
    }
  }

  renderTimeseriesPopover (adagucTime) {
    if (this.state.timeSeriesPopOverOpen) {
      const { dispatch, actions } = this.props;
      return <TimeseriesComponent adagucProperties={this.props.adagucProperties} isOpen={this.state.timeSeriesPopOverOpen} dispatch={dispatch} actions={actions} />;
    }
  }
  renderLayerChooser () {
    return (<Modal id='addLayerModal' isOpen={this.state.layerChooserOpen} toggle={this.toggleLayerChooser}>
      <ModalHeader>Choose Layer</ModalHeader>
      <Nav tabs>
        <NavItem>
          <NavLink id='tab1' className={classnames({ active: this.state.activeTab === '1' })} onClick={(e) => { this.toggleTab(e); }}>
            (1) - Select Action
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab2' className={classnames({ active: this.state.activeTab === '2' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            {this.state.action ? (this.state.action === 'addLayer' ? '(2) - Select Source' : (this.state.action === 'selectPreset' ? '(2) - Select Preset' : '(2) - Enter URL')) : ''}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab3' className={classnames({ active: this.state.activeTab === '3' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            {this.state.action ? (this.state.action === 'addLayer' ? '(3) - Select ' + this.getLayerName(this.state.selectedSource) + ' Layer' : '') : ''}
          </NavLink>
        </NavItem>
      </Nav>

      <ModalBody>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <ButtonGroup>
              <Button onClick={() => this.setState({ action: 'addLayer', activeTab: '2' })}>Add Layer</Button>
              <Button onClick={() => this.setState({ action: 'selectPreset', activeTab: '2' })}>Select Preset</Button>
              <Button onClick={() => this.setState({ action: 'addCustomData', activeTab: '2' })}>Add Custom data</Button>
            </ButtonGroup>
          </TabPane>

          <TabPane tabId='2'>
            {this.state.action === 'addLayer'
              ? this.renderSourceSelector()
              : this.state.action === 'selectPreset'
              ? this.renderPresetSelector()
              : this.renderURLInput()}
          </TabPane>
          <TabPane tabId='3'>
            <Typeahead ref='layerSelectorTypeRef' onChange={this.handleAddLayer} options={this.state.layers ? this.state.layers : []} autoFocus />
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggleLayerChooser}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }

  render () {
    const { title, adagucProperties } = this.props;
    const items = [
      {
        title: 'Pan / zoom',
        action: 'pan',
        icon: 'hand-stop-o'
      },
      {
        title: 'Zoom to rectangle',
        action: 'zoom',
        icon: 'search-plus'
      },
      {
        title: 'Draw polygon',
        action: 'draw',
        icon: 'pencil'
      },
      {
        title: 'Delete drawing point',
        action: 'delete',
        icon: 'trash'
      },
      {
        title: 'Measure distance',
        action: 'measure',
        icon: 'arrows-h'
      },
      {
        title: 'Show time series',
        action: 'timeseries',
        icon: 'line-chart',
        onClick: 'timeseries'
      },
      {
        title: 'Show progtemp',
        action: 'progtemp',
        icon: 'bullseye',
        onClick: 'progtemp'
      }
    ];
    return (
      <Col className='MapActionContainer'>
        {this.renderLayerChooser()}
        {this.renderBBOXPopOver()}
        {this.renderProgtempPopover(moment.utc(adagucProperties.timedim))}
        {this.renderTimeseriesPopover()}
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={adagucProperties.mapMode === item.action} disabled={item.disabled || null}
              className='row' id={item.action + '_button'} title={item.title} onClick={() => this.handleActionClick(item.action)}>
              <Icon name={item.icon} />
            </Button>)}
          <Row style={{ flex: 1 }} />
          <Button onClick={this.toggleLayerChooser} color='primary' className='row' title='Choose layers'>
            <Icon name='bars' />
          </Button>
          <Button onClick={this.toggleAnimation} color='primary' className='row' title='Play animation'>
            <Icon name={this.props.adagucProperties.animate ? 'pause' : 'play'} />
          </Button>
          <Button onClick={this.goToNow} color='primary' className='row' title='Go to current time'>
            <Icon name='clock-o' />
          </Button>
          <Button onClick={this.togglePopside} id='setAreaButton' color='primary' className='row' title='Set area'>
            <Icon name='flag' />
          </Button>
        </Panel>
      </Col>
    );
  }
}

MapActionContainer.propTypes = {
  title: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object
};

export default MapActionContainer;
