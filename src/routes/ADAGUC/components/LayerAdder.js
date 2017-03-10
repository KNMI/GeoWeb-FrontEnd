import React from 'react';
import classnames from 'classnames';
import { Typeahead } from 'react-bootstrap-typeahead';

import { TabContent, TabPane, Nav, NavItem, NavLink, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
export default class LayerAdder extends React.Component {
  constructor () {
    super();
    this.state = {
      modal: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false
    };
    this.getLayerName = this.getLayerName.bind(this);
    this.handleCardClick = this.handleCardClick.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.generateMap = this.generateMap.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
  }
  toggleTab () {
    this.setState({ activeTab: this.state.activeTab === '1' ? '2' : '1' });
  }
  handleAddLayer (e) {
    const addItem = e[0];
    if (!this.state.overlay) {
      this.props.dispatch(this.props.actions.addLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }));
    } else {
      this.props.dispatch(this.props.actions.addOverlayLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }));
    }
    this.setState({
      modal: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false
    });
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
    return null;
  }
  toggleModal () {
    this.setState({
      modal: !this.state.modal
    });
  }
  generateMap (layers) {
    let layerobjs = [];
    for (var i = 0; i < layers.length; ++i) {
      layerobjs.push({ id: layers[i].name, label: layers[i].text });
    }
    console.log(layerobjs);
    this.setState({
      layers: layerobjs,
      activeTab: '2'
    });
  }
  handleCardClick (e) {
    let selectedSource = this.props.sources.data.filter((source) => source.name === e.currentTarget.id);
    if (!selectedSource || selectedSource.length === 0) {
      selectedSource = this.props.sources.overlay.filter((source) => source.name === e.currentTarget.id);
      this.setState({ overlay: true });
    } else {
      this.setState({ overlay: false });
    }
    const selectedService = selectedSource[0];

    // eslint-disable-next-line no-undef
    var srv = WMJSgetServiceFromStore(selectedService.service);
    this.setState({ selectedSource: selectedService });
    srv.getLayerObjectsFlat((layers) => this.generateMap(layers), (err) => console.log(err));
  }

  render () {
    const { sources } = this.props;
    return <div>
      <Button id='addLayerButton' color='primary' onClick={this.toggleModal}>Add layer</Button>
      <Modal id='addLayerModal' isOpen={this.state.modal} toggle={this.toggleModal}>
        <ModalHeader toggle={this.toggleModal}>Add layer</ModalHeader>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggleTab('1'); }}
            >
              (1) - Select Source
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggleTab('2'); }} disabled={this.state.selectedSource === null}
            >
              (2) - Select { this.state.selectedSource ? this.getLayerName(this.state.selectedSource) : '' } Layer
            </NavLink>
          </NavItem>
        </Nav>

        <ModalBody>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId='1'>
              { (sources && sources.data) ? sources.data.map((src, i) => <Button id={src.name} key={i} onClick={this.handleCardClick}>{this.getLayerName(src)}</Button>) : <div /> }
              { (sources && sources.overlay) ? sources.overlay.map((src, i) => <Button id={src.name} key={i} onClick={this.handleCardClick}>{this.getLayerName(src)}</Button>) : <div /> }
            </TabPane>
            <TabPane tabId='2'>
              <Typeahead onChange={this.handleAddLayer} options={this.state.layers ? this.state.layers : []} />
            </TabPane>
          </TabContent>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' onClick={this.toggleModal}>Cancel</Button>
        </ModalFooter>
      </Modal>
    </div>;
  }
}

LayerAdder.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  sources: React.PropTypes.object
};
