import React, { Component } from 'react';
import { Button, Col, Popover, InputGroup, InputGroupButton, Input, PopoverContent, ButtonGroup, TabContent, TabPane, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { Icon } from 'react-fa';
import classnames from 'classnames';
import { Typeahead } from 'react-bootstrap-typeahead';
import PropTypes from 'prop-types';

class MapAnimationControlsContainer extends Component {
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
    const { dispatch, panelsActions, mapProperties, activeMapId } = this.props;
    const addItem = e[0];
    if (!this.state.overlay) {
      dispatch(panelsActions.addLayer({ activeMapId: activeMapId, layer: { service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label, opacity: 1 }}));
    } else {
      dispatch(panelsActions.addOverlaysLayer({ activeMapId: activeMapId, layer: { service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }}));
    }
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false,
      action: null,
      panelsProperties: null
    });
  }

  generateMap (panelsProperties) {
    let layerobjs = [];
    for (var i = 0; i < panelsProperties.length; ++i) {
      layerobjs.push({ id: panelsProperties[i].name, label: panelsProperties[i].text });
    }
    this.setState({
      panelsProperties: layerobjs,
      activeTab: '3'
    });
  }
  handleSourceClick (e) {
    const { adagucProperties } = this.props;
    const { sources } = adagucProperties;
    let selectedSource = sources.filter((source) => source.name === e.currentTarget.id)[0];

    this.setState({ overlay: selectedSource.name === 'OVL' || selectedSource.goal === 'OVERLAY' });

    // eslint-disable-next-line no-undef
    var srv = WMJSgetServiceFromStore(selectedSource.service);
    this.setState({ selectedSource: selectedSource });
    srv.getLayerObjectsFlat((panelsProperties) => this.generateMap(panelsProperties), (err) => { throw new Error(err); });
  }
  toggleLayerChooser () {
    this.setState({ layerChooserOpen: !this.state.layerChooserOpen });
  }
  toggleAnimation () {
    const { dispatch, adagucActions } = this.props;
    dispatch(adagucActions.toggleAnimation());
  }
  togglePopside () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  goToNow () {
    const { dispatch, adagucActions } = this.props;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(adagucActions.setTimeDimension(currentDate.toISO8601()));
  }
  setView (e) {
    const { dispatch, mapActions } = this.props;
    dispatch(mapActions.setCut(BOUNDING_BOXES[e.currentTarget.id]));
    this.setState({ popoverOpen: false });
  }
  renderPopOver () {
    return (
      <Popover placement='top' isOpen={this.state.popoverOpen} target='setAreaButton' toggle={this.togglePopside}>
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
        case 'Harmonie36':
          return 'Harmonie36';
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
    return <div>{sources.map((src, i) => <Button id={src.name} key={i} onClick={this.handleSourceClick}>{this.getLayerName(src)}</Button>)}</div>
  }
  renderPresetSelector () {
    return <Typeahead ref={ref => { this._typeahead = ref; }} filterBy={['name', 'keywords']} labelKey='name' options={this.state.presets} onChange={(ph) => this.setPreset(ph)} />;
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
        <Input id='sourceurlinput' ref={ref => { this._urlinput = ref; }} placeholder='Add your own source' disabled={this.state.getCapBusy} />
        <InputGroupButton>
          <Button color='primary' onClick={this.handleAddSource} disabled={this.state.getCapBusy}>Add</Button>
        </InputGroupButton>
      </InputGroup>
    );
  }

  setPreset (preset) {
    const { dispatch, actions } = this.props;
    dispatch(actions.setPreset(preset[0]));
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false,
      action: null,
      panelsProperties: null,
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
              <Button onClick={() => { this.setState({ action: 'selectPreset', activeTab: '2' }); setTimeout(() => this._typeahead.getInstance().focus(), 100); }}>Select Preset</Button>
              <Button onClick={() => { this.setState({ action: 'addCustomData', activeTab: '2' }); setTimeout(() => document.getElementById('sourceurlinput').focus(), 100); }}>Add Custom data</Button>
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
            <Typeahead ref='layerSelectorTypeRef' onChange={this.handleAddLayer} options={this.state.panelsProperties ? this.state.panelsProperties : []} autoFocus />
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggleLayerChooser}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
  render () {
    const { adagucProperties } = this.props;
    return (
      <Col xs='auto' className='MapAnimationControlsContainer'>
        {this.renderLayerChooser()}
        {this.renderPopOver()}
        <Button onClick={this.toggleLayerChooser} color='primary' title='Choose panelsProperties'>
          <Icon name='bars' />
        </Button>
        <Button onClick={this.togglePopside} id='setAreaButton' color='primary' title='Set area'>
          <Icon name='flag' />
        </Button>
        <Button onClick={this.toggleAnimation} color='primary' title='Play animation'>
          <Icon name={adagucProperties.animate ? 'pause' : 'play'} />
        </Button>
        <Button onClick={this.goToNow} color='primary' title='Go to current time'>
          <Icon name='clock-o' />
        </Button>
      </Col>
    );
  }
}

MapAnimationControlsContainer.propTypes = {
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object
};

export default MapAnimationControlsContainer;
