import React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, ListGroupItem, Badge, Button, Modal, ModalHeader, ModalBody, ModalFooter,
Card,
CardTitle,
CardImg,
CardImgOverlay } from 'reactstrap';
import { Icon } from 'react-fa';
import classnames from 'classnames';

export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.getLayerName = this.getLayerName.bind(this);
    this.deleteLayer = this.deleteLayer.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
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
    const overlaysRev = overlays.reverse();
    const datalayerRev = datalayers.reverse();
    switch (type) {
      case 'overlay':
        dispatch(actions.deleteLayer(overlaysRev[i]));
        break;
      case 'data':
        dispatch(actions.deleteLayer(datalayerRev[i]));
        break;
      default:
        console.log('Reducer saw an unknown value');
        break;
    }
  }

  handleAddLayer (e) {
    if (!this.state.overlay) {
      this.props.dispatch(this.props.actions.addLayer({ service: this.state.selectedSource.service, name: e.currentTarget.id, title: e.currentTarget.innerHTML }));
    } else {
      this.props.dispatch(this.props.actions.addOverlayLayer({ service: this.state.selectedSource.service, name: e.currentTarget.id, title: e.currentTarget.innerHTML }));
    }
    this.setState({
      modal: false,
      activeTab: '1',
      layers: null,
      selectedSource: null,
      overlay: false
    });
  }
  handleCardClick (e) {
    let selectedSource = this.props.sources.data.filter((source) => source.name === e.currentTarget.id);
    if (!selectedSource || selectedSource.length === 0) {
      console.log('here');
      console.log(e.currentTarget.id);
      selectedSource = this.props.sources.overlay.filter((source) => source.name === e.currentTarget.id);
      this.setState({ overlay: true });
    } else {
      this.setState({ overlay: false });
    }
    console.log(selectedSource);
    const selectedService = selectedSource[0];

    // eslint-disable-next-line no-undef
    var srv = WMJSgetServiceFromStore(selectedService.service);
    this.setState({ selectedSource: selectedService });
    // srv.getLayerObjectsFlat((node) => console.log(node));
    srv.getLayerObjectsFlat((layernames) => { console.log(layernames); this.setState({ layers: (layernames), activeTab: '2' }); }, (err) => console.log(err));
  }
  getLayerName (layer) {
    if (layer) {
      const service = layer.service;
      let retStr = '';
      if (service.includes('adaguc')) {
        if (service.includes('HARM')) {
          retStr = 'HARMONIE';
        } else if (service.includes('RAD')) {
          retStr = 'Radar';
        } else if (service.includes('OBS')) {
          retStr = 'Observation';
        } else if (service.includes('SAT')) {
          retStr = 'Satellite';
        } else if (service.includes('OVL')) {
          retStr = 'Overlay';
        }
      } else {
        retStr = 'Lightning';
      }

      return retStr;
    }
    return null;
  }
  renderLayerSet (layers, type) {
    return layers.map((layer, i) => {
      return <ListGroupItem id='layerinfo' key={i}><Icon name='times' onClick={() => this.deleteLayer(type, i)} />
        <LayerName name={type === 'data' ? this.getLayerName(layer) : ''} />
        <Badge pill>
          {layer.title}
          <Icon style={{ marginLeft: '5px' }} name='pencil' />
        </Badge>
        <LayerStyle style={layer.currentStyle} />
      </ListGroupItem>;
    });
  }

  render () {
    const { layers, sources } = this.props;
    const { datalayers, baselayer, overlays } = layers;
    const datalayerclone = datalayers.slice(0);
    const overlayclone = overlays.slice(0);
    console.log('sources: ', this.props.sources);
    return (
      <div style={{ marginLeft: '5px' }} >
        {this.renderLayerSet(overlayclone.reverse(), 'overlay')}
        {this.renderLayerSet(datalayerclone.reverse(), 'data')}
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
                { (sources.data) ? sources.data.map((src, i) => <Button id={src.name} key={i} onClick={this.handleCardClick}>{src.title}</Button>) : <div /> }
                { (sources.data) ? sources.overlay.map((src, i) => <Button id={src.name} key={i} onClick={this.handleCardClick}>{src.title}</Button>) : <div /> }
              </TabPane>
              <TabPane tabId='2'>
                {this.state.layers ? this.state.layers.map((layer, i) => <Button onClick={this.handleAddLayer} id={layer.name} key={i}>{layer.text}</Button>) : ''}
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

class MyCard extends React.Component {
  render () {
    return (<Card>
      <CardImg top width='100%' src='https://placeholdit.imgix.net/~text?txtsize=33&txt=400%C3%97200&w=400&h=200' alt='Card image cap' />
      <CardImgOverlay>
        <CardTitle>{this.props.title}</CardTitle>
      </CardImgOverlay>
    </Card>);
  }
}

MyCard.propTypes = {
  title: React.PropTypes.string.isRequired
};

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
