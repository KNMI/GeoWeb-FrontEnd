import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Popover, PopoverContent, ButtonGroup, TabContent, TabPane, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Panel from '../components/Panel';
import { BOUNDING_BOXES } from '../routes/ADAGUC/constants/bounding_boxes';
import { Icon } from 'react-fa';
import classnames from 'classnames';
import { Typeahead } from 'react-bootstrap-typeahead';

class MapActionContainer extends Component {
  constructor (props) {
    super(props);
    // Toggles
    this.togglePopside = this.togglePopside.bind(this);
    // Button handlers
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.toggleLayerChooser = this.toggleLayerChooser.bind(this);
    this.goToNow = this.goToNow.bind(this);
    this.setView = this.setView.bind(this);
    // Render functions
    this.renderPopOver = this.renderPopOver.bind(this);
    this.renderLayerChooser = this.renderLayerChooser.bind(this);
    // Helper
    this.generateMap = this.generateMap.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
    this.handleSourceClick = this.handleSourceClick.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.renderSourceSelector = this.renderSourceSelector.bind(this);
    this.renderPresetSelector = this.renderPresetSelector.bind(this);
    this.setPreset = this.setPreset.bind(this);
    // State
    this.state = {
      collapse: false,
      popoverOpen: false,
      layerChooserOpen: false,
      activeTab: '1'
    };
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
  renderPopOver () {
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
          return 'Radar';
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
            {this.state.action ? (this.state.action === 'addLayer' ? '(2) - Select Source' : '(2) - Select Preset') : ''}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab3' className={classnames({ active: this.state.activeTab === '3' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            {this.state.action ? (this.state.action === 'selectPreset' ? '' : '(3) - Select ' + this.getLayerName(this.state.selectedSource) + ' Layer') : ''}
          </NavLink>
        </NavItem>
      </Nav>

      <ModalBody>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <Button onClick={() => this.setState({ action: 'addLayer', activeTab: '2' })}>Add Layer</Button>
            <Button onClick={() => this.setState({ action: 'selectPreset', activeTab: '2' })}>Select Preset</Button>
          </TabPane>

          <TabPane tabId='2'>
            {this.state.action === 'addLayer'
              ? this.renderSourceSelector()
              : this.renderPresetSelector()}
          </TabPane>
          <TabPane tabId='3'>
            <Typeahead onChange={this.handleAddLayer} options={this.state.layers ? this.state.layers : []} />
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggleLayerChooser}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
  render () {
    const { title, adagucProperties, dispatch, actions } = this.props;
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
        icon: 'line-chart',
        disabled: true
      },
      {
        title: 'Show progtemp',
        action: 'progtemp',
        icon: 'bolt'
      }
    ];
    return (
      <Col className='MapActionContainer'>
        {this.renderLayerChooser()}
        {this.renderPopOver()}
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={adagucProperties.mapMode === item.action} disabled={item.disabled || null}
              className='row' title={item.title} onClick={() => dispatch(actions.setMapMode(item.action))}>
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
