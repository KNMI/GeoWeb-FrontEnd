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
    return <Button onClick={() => this.setState({ presetUnit: 'sigmet', activeTab: '3' })}>SIGMET</Button>;
  }

  setPreset (e) {
    const thing = e[0];
    const { dispatch, actions } = this.props;
    dispatch(actions.prepareSIGMET(thing));
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
    const phenomena = ['OBSC TS', 'EMBD TS', 'FRQ TS', 'SQL TS', 'OBSC TSGR', 'EMBD TSGR', 'FRQ TSGR',
      'SQL TSGR', 'SEV TURB', 'SEV ICE', 'SEV ICE (FZRA)', 'SEV MTW', 'HVY DS', 'HVY SS', 'RDOACT CLD'];
      console.log(this.state);
    return (<Modal id='addLayerModal' isOpen={this.state.layerChooserOpen}>
      <ModalHeader>Choose Layer</ModalHeader>
      <Nav tabs>
        <NavItem>
          <NavLink id='tab1' className={classnames({ active: this.state.activeTab === '1' })} onClick={(e) => { this.toggleTab(e); }}>
            (1) - Select Action
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab2' className={classnames({ active: this.state.activeTab === '2' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            (2) - Select Source
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab3' className={classnames({ active: this.state.activeTab === '3' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            {this.state.action ? (this.state.action === 'selectPreset' ? '(3) - Select Phenomenon' : '(3) - Select ' + this.getLayerName(this.state.selectedSource) + ' Layer') : '(3)'}
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
            {this.state.action === 'addLayer'
            ? <Typeahead onChange={this.handleAddLayer} options={this.state.layers ? this.state.layers : []} />
            : <Typeahead onChange={this.setPreset} options={phenomena} />}
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggleLayerChooser}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
  render () {
    const { title } = this.props;
    const items = [
      {
        title: 'Pan / zoom',
        icon: '✋',
        active: true
      },
      {
        title: 'Zoom to rectangle',
        icon: '🔍'
      },
      {
        title: 'Draw polygon',
        icon: '☈'
      },
      {
        title: 'Measure distance',
        icon: '↦'
      },
      {
        title: 'Show time series',
        icon: '📈',
        disabled: true
      }
    ];
    return (
      <Col className='MapActionContainer'>
        {this.renderLayerChooser()}
        {this.renderPopOver()}
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={item.active || null} disabled={item.disabled || null}
              className='row' title={item.title}>{item.icon}</Button>)}
          <Row style={{ flex: 1 }} />
          <Button onClick={this.togglePopside} id='setAreaButton' color='primary' className='row' title='Set area'>⚑</Button>
          <Button onClick={this.toggleLayerChooser} color='primary' className='row' title='Choose layers'>☰</Button>
          <Button onClick={this.toggleAnimation} color='primary' className='row' title='Play animation'>{this.props.adagucProperties.animate ? <Icon name='pause' /> : <Icon name='play' />}</Button>
          <Button onClick={this.goToNow} color='primary' className='row' title='Go to current time'>🕜</Button>
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
