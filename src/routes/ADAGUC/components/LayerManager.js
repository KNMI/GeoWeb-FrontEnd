import React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, ListGroupItem, Badge, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Icon } from 'react-fa';
import { Typeahead } from 'react-bootstrap-typeahead';
import classnames from 'classnames';

export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.getLayerName = this.getLayerName.bind(this);
    this.deleteLayer = this.deleteLayer.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.generateMap = this.generateMap.bind(this);
    this.state = {
      modal: false,
      activeTab: '1',
      layers: null,

      selectedSource: null
    };
    this.handleCardClick = this.handleCardClick.bind(this);
  }
  toggleModal () {
    this.setState({
      modal: !this.state.modal
    });
  }
  toggleTab (tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  deleteLayer (type, i) {
    const { layers, dispatch, actions } = this.props;
    const { datalayers, overlays } = layers;
    switch (type) {
      case 'overlay':
        dispatch(actions.deleteLayer(overlays[i], type));
        break;
      case 'data':
        dispatch(actions.deleteLayer(datalayers[i], type));
        break;
      default:
        console.log('Reducer saw an unknown value');
        break;
    }
  }

  handleAddLayer (e) {
    const addItem = e[0];
    console.log('selectedsource', this.state.selectedSource);
    if (!this.state.overlay) {
      this.props.dispatch(this.props.actions.addLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }));
    } else {
      this.props.dispatch(this.props.actions.addOverlayLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }));
    }
    this.setState({
      modal: false,
      activeTab: '1',
      layers: null,
      selectedSource: null,
      overlay: false
    });
  }

  generateMap (layers) {
    let layerobjs = [];
    for (var i = 0; i < layers.length; ++i) {
      layerobjs.push({ id: layers[i].name, label: layers[i].text });
    }
    this.setState({
      layers: layerobjs,
      activeTab: '2'
    });
    console.log(layerobjs);
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
  renderLayerSet (layers, type) {
    if (!layers || layers.length === 0) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        return <ListGroupItem id='layerinfo' key={i}><Icon name='times' onClick={() => this.deleteLayer(type, i)} />
          <LayerName name={type === 'data' ? this.getLayerName(layer) : ''} />
          <Badge pill>
            {layer.label ? layer.label : layer.title}
            <Icon style={{ marginLeft: '5px' }} name='pencil' />
          </Badge>
          <LayerStyle style={layer.currentStyle} />
        </ListGroupItem>;
      });
    }
  }

  componentDidUpdate (prevProps, prevState) {
    console.log('Didupdate!', this.props.layers);
  }

  render () {
    const { layers, sources } = this.props;
    console.log('layers', layers);
    const { datalayers, baselayer, overlays } = layers;
    console.log('layerset', datalayers);
    return (
      <div style={{ marginLeft: '5px' }} >
        {this.renderLayerSet(overlays, 'overlay')}
        {this.renderLayerSet(datalayers, 'data')}
        {this.renderLayerSet([baselayer], 'base')}
        <Button color='primary' onClick={this.toggleModal}>Add layer</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggleModal}>
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
                onClick={() => { this.toggleTab('2'); }} disabled={this.state.layers === null}
              >
                (2) - Select { this.state.selectedSource ? this.getLayerName(this.state.selectedSource) : '' } Layer
              </NavLink>
            </NavItem>
          </Nav>

          <ModalBody>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId='1'>
                { (sources.data) ? sources.data.map((src, i) => <Button id={src.name} key={i} onClick={this.handleCardClick}>{this.getLayerName(src)}</Button>) : <div /> }
                { (sources.data) ? sources.overlay.map((src, i) => <Button id={src.name} key={i} onClick={this.handleCardClick}>{this.getLayerName(src)}</Button>) : <div /> }
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
      </div>
    );
  }
}

LayerManager.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  sources: React.PropTypes.object,
  layers: React.PropTypes.object,
  baselayers: React.PropTypes.array
};

class LayerName extends React.Component {
  render () {
    if (this.props.name) {
      return <Badge pill>
        {this.props.name}
        <Icon style={{ marginLeft: '5px' }} name='pencil' />
      </Badge>;
    } else {
      return <Badge />;
    }
  }
}

LayerName.propTypes = {
  name: React.PropTypes.string.isRequired
};
class LayerStyle extends React.Component {
  render () {
    if (this.props.style) {
      return (
        <Badge pill>
          {this.props.style}
          <Icon style={{ marginLeft: '5px' }} name='pencil' />
        </Badge>
      );
    } else {
      return <Badge />;
    }
  }
}
LayerStyle.propTypes = {
  style: React.PropTypes.string.isRequired
};
