import React from 'react';
import { Popover,
PopoverTitle, Button,
ButtonGroup,
PopoverContent, ListGroupItem, Badge } from 'reactstrap';
import { Icon } from 'react-fa';

export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.deleteLayer = this.deleteLayer.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
    this.updateState = this.updateState.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
    this.state = {
      layers: [],
      baselayers: [],
      overlays: []
    };
  }
  getLayerName (layer) {
    if (layer) {
      switch (layer.service) {
        case 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.SAT.cgi?':
          return 'Satellite';
        case 'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?':
          return 'HARMONIE (Ext)';
        case 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?':
          return 'Radar (Ext)';
        case 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?':
          return 'Radar';
        case 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.HARM_N25.cgi?':
          return 'HARMONIE';
        case 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OBS.cgi?':
          return 'Observations';
        case 'http://bvmlab-218-41.knmi.nl/cgi-bin/WWWRADAR3.cgi?':
          return 'Lightning';
        default:
          return layer.serviceTitle;
      }
    }
    return null;
  }

  toggleLayer (type, i) {
    const { dispatch, actions } = this.props;
    switch (type) {
      case 'overlay':
        dispatch(actions.alterLayer(i, type, { enabled: !this.state.overlays[i].enabled }));
        break;
      case 'data':
        dispatch(actions.alterLayer(i, type, { enabled: !this.state.layers[i].enabled }));
        break;
      default:
        console.log('Reducer saw an unknown value');
        break;
    }
  }

  deleteLayer (type, i) {
    const { dispatch, actions } = this.props;
    dispatch(actions.deleteLayer(i, type));
    // switch (type) {
    //   case 'overlay':
    //     break;
    //   case 'data':
    //     dispatch(actions.deleteLayer(i, type));
    //     break;
    //   default:
    //     console.log('Reducer saw an unknown value');
    //     break;
    // }
  }
  getBaseLayerName (layer) {
    switch (layer.name) {
      case 'streetmap':
        return 'OpenStreetMap';
      case 'naturalearth2':
        return 'Natural Earth';
      default:
        return layer.name;
    }
  }
  getOverLayerName (layer) {
    switch (layer.name) {
      case 'countries':
        return 'Countries';
      case 'neddis':
        return 'Dutch districts';
      case 'FIR_DEC_2013_EU':
        return 'FIR areas';
      case 'gemeenten':
        return 'Gemeenten';
      case 'northseadistricts':
        return 'North Sea districts';
      case 'nwblightP':
        return 'Prov. wegen';
      case 'provincies':
        return 'Provincies';
      case 'nwblightR':
        return 'Rijkswegen';
      case 'waterschappen':
        return 'Waterschappen';
      default:
        return layer.name;
    }
  }
  renderBaseLayerSet (layers) {
    if (!layers || layers.length === 0) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        return (
          <ListGroupItem id='layerinfo' key={'base' + i} style={{ marginLeft: '32px' }}>
            <Icon style={{ marginRight: '13px' }} id='enableButton' name={layer && layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('base', i)} />
            <LayerName name={this.getBaseLayerName(layer)}
              i={i} target={'baselayer' + i} layer={layer} dispatch={this.props.dispatch} actions={this.props.actions} />
          </ListGroupItem>
        );
      });
    }
  }
  renderOverLayerSet (layers) {
    if (!layers || layers.length === 0) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        return (
          <ListGroupItem id='layerinfo' key={'over' + i} style={{ marginLeft: '32px' }}>
            <Icon id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('overlay', i)} />
            <Icon id='deleteButton' name='times' onClick={() => this.deleteLayer('overlay', i)} />
            <LayerSource name={this.getOverLayerName(layer)} />
          </ListGroupItem>
        );
      });
    }
  }

  renderLayerSet (layers) {
    if (!layers) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        return (
          <ListGroupItem id='layerinfo' key={'lgi' + i} style={{ margin: 0 }}>
            <Icon name='chevron-up' onClick={() => this.props.dispatch(this.props.actions.reorderLayer('up', i))} />
            <Icon name='chevron-down' onClick={() => this.props.dispatch(this.props.actions.reorderLayer('down', i))} />
            <Icon id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('data', i)} />
            <Icon id='deleteButton' name='times' onClick={() => this.deleteLayer('data', i)} />
            <LayerSource name={this.getLayerName(layer)} />
            <LayerName name={layer.title} i={i} target={'datalayer' + i} layer={layer} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerStyle style={layer.currentStyle} layer={layer} target={'datalayerstyle' + i} i={i} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerOpacity layer={layer} target={'datalayeropacity' + i} i={i} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerModelRun layer={layer} />
          </ListGroupItem>);
      });
    }
  }
  componentWillUnmount () {
    this.setState({
      layers: [],
      baselayers: [],
      overlays: []
    });
  }
  updateState () {
    this.setState({
      layers: this.props.webmapjs.getLayers(),
      baselayers: this.props.webmapjs.getBaseLayers().filter((layer) => !layer.keepOnTop),
      overlays: this.props.webmapjs.getBaseLayers().filter((layer) => layer.keepOnTop)
    });
  }
  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        webmapjs.addListener('onlayeradd', this.updateState, true);
        webmapjs.addListener('onmapdimupdate', this.updateState, true);
        webmapjs.addListener('ondimchange', this.updateState, true);
        webmapjs.addListener('onlayerchange', this.updateState, true);
        this.updateState();
      }
      return (
        <div style={{ marginLeft: '5px' }} >
          {this.renderOverLayerSet(this.state.overlays)}
          {this.renderLayerSet(this.state.layers)}
          {this.renderBaseLayerSet(this.state.baselayers)}
        </div>
      );
    } else {
      return <div />;
    }
  }
}

LayerManager.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  layers: React.PropTypes.object,
  webmapjs: React.PropTypes.object,
  baselayers: React.PropTypes.array
};

// ----------------------------------------- \\
// Rendering of the layersource with popover \\
// ----------------------------------------- \\
class LayerSource extends React.Component {
  render () {
    return <Badge pill>{this.props.name}</Badge>;
  }
}
LayerSource.propTypes = {
  name: React.PropTypes.string.isRequired
};

// --------------------------------------- \\
// Rendering of the layername with popover \\
// --------------------------------------- \\
class LayerName extends React.Component {
  constructor () {
    super();
    this.togglePopover = this.togglePopover.bind(this);
    this.generateList = this.generateList.bind(this);
    this.alterLayer = this.alterLayer.bind(this);
    this.state = {
      popoverOpen: false,
      layers: undefined,
      layer: undefined
    };
  }
  generateList (inLayers) {
    this.setState({ layers: inLayers, layer: this.props.layer });
  }
  togglePopover (e, layer, i) {
    this.setState({ popoverOpen: !this.state.popoverOpen });
    if (!this.state.layers || this.state.layer !== this.props.layer) {
      // eslint-disable-next-line no-undef
      var srv = WMJSgetServiceFromStore(this.props.layer.service);
      srv.getLayerObjectsFlat((layers) => this.generateList(layers), (err) => console.log(err));
    }
  }
  alterLayer (e) {
    // TODO .... this
    const indexInLayerList = e.currentTarget.id;
    var indexOfPossibleLayers;
    for (indexOfPossibleLayers = 0; indexOfPossibleLayers < this.state.layers.length; ++indexOfPossibleLayers) {
      if (this.state.layers[indexOfPossibleLayers].text === e.currentTarget.innerHTML) {
        break;
      }
    }
    const wantedLayer = this.state.layers[indexOfPossibleLayers];
    this.props.dispatch(this.props.actions.alterLayer(indexInLayerList,
      this.props.target.includes('data')
      ? 'data'
      : 'base', { name: wantedLayer.name, label: wantedLayer.text, style: undefined, styleTitle: undefined }));
    this.setState({ popoverOpen: false });
  }
  render () {
    const { i, layer, target } = this.props;
    if (this.state.popoverOpen) {
      return (
        <div style={{ marginBottom: '-6px' }}>
          <Popover width={'auto'} key={'popover' + i} placement='bottom' isOpen={this.state.popoverOpen} target={target} toggle={() => this.togglePopover(layer, i)}>
            <PopoverTitle>Select layer</PopoverTitle>
            <PopoverContent>{this.state.layers ? this.state.layers.map((layer, q) => <li id={i} onClick={this.alterLayer} key={q}>{layer.text}</li>) : ''}</PopoverContent>
          </Popover>
          <Badge pill>
            {this.props.name}
            <Icon style={{ marginLeft: '5px' }} id={target} name='pencil' onClick={() => this.togglePopover(layer, i)} />
          </Badge>
        </div>);
    } else {
      return (
        <Badge pill>
          {this.props.name}
          <Icon style={{ marginLeft: '5px' }} id={target} name='pencil' onClick={this.togglePopover} />
        </Badge>);
    }
  }
}
LayerName.propTypes = {
  target: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  name: React.PropTypes.string.isRequired,
  i: React.PropTypes.number.isRequired,
  layer: React.PropTypes.object.isRequired
};

// ---------------------------------------- \\
// Rendering of the layerstyle with popover \\
// ---------------------------------------- \\
class LayerStyle extends React.Component {
  constructor () {
    super();
    this.state = {
      popoverOpen: false
    };
    this.alterLayer = this.alterLayer.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
  }

  // istanbul ignore next
  togglePopover (e, layer, i) {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }

  alterLayer (e) {
    // TODO .... this
    const indexInLayerList = e.currentTarget.id;
    const wantedStyle = this.props.layer.styles.filter((style) => style.title === e.currentTarget.innerHTML)[0];
    this.props.dispatch(this.props.actions.alterLayer(indexInLayerList, this.props.target.includes('data') ? 'data' : 'base', { style: wantedStyle.name, styleTitle: wantedStyle.title }));
    this.setState({ popoverOpen: false });
  }

  render () {
    const { i, target, layer } = this.props;
    if (this.props.layer) {
      const styleObj = this.props.layer.getStyleObject(this.props.style);
      return (
        <div style={{ marginBottom: '-6px' }}>
          <Popover width={'auto'} key={'stylepopover' + i} placement='bottom' isOpen={this.state.popoverOpen} target={target} toggle={() => this.togglePopover(layer, i)}>
            <PopoverTitle>Select style</PopoverTitle>
            <PopoverContent>{this.props.layer.styles ? this.props.layer.styles.map((style, q) => <li id={i} onClick={this.alterLayer} key={q}>{style.title}</li>) : <li />}</PopoverContent>
          </Popover>

          <Badge pill>
            {styleObj ? styleObj.title : 'default'}
            <Icon style={{ marginLeft: '5px' }} id={target} name='pencil' onClick={() => this.togglePopover(layer, i)} />
          </Badge>
        </div>
      );
    } else {
      return <div />;
    }
  }
}
LayerStyle.propTypes = {
  style: React.PropTypes.string,
  layer: React.PropTypes.object.isRequired,
  i: React.PropTypes.number.isRequired,
  target: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired
};

class LayerModelRun extends React.Component {
  constructor () {
    super();
    this.state = {
      refTime: null
    };
  }

  render () {
    const refTime = this.props.layer.getDimension('reference_time');
    return refTime ? <Badge pill>{refTime.currentValue}</Badge> : <div />;
  }
}

LayerModelRun.propTypes = {
  layer: React.PropTypes.object
};

// ---------------------------------------- \\
// Rendering of the layerstyle with popover \\
// ---------------------------------------- \\
class LayerOpacity extends React.Component {
  constructor () {
    super();
    this.state = {
      popoverOpen: false
    };
    this.alterLayer = this.alterLayer.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
  }
  togglePopover (e, layer, i) {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  alterLayer (e) {
    // TODO .... this
    const wantedOpacity = e.currentTarget.id / 100.0;
    this.props.dispatch(this.props.actions.alterLayer(this.props.i, 'data', { opacity: wantedOpacity }));
    this.setState({ popoverOpen: false });
  }

  render () {
    const { i, target, layer } = this.props;

    return (
      <div style={{ marginBottom: '-6px' }}>
        <Popover width={'auto'} key={'stylepopover' + i} placement='bottom' isOpen={this.state.popoverOpen} target={target} toggle={() => this.togglePopover(layer, i)}>
          <PopoverTitle style={{ paddingLeft: '9px', paddingRight: '8px' }}>Opacity</PopoverTitle>
          <PopoverContent>
            <ButtonGroup vertical>
              <Button onClick={this.alterLayer} id='0'>0%</Button>
              <Button onClick={this.alterLayer} id='10'>10%</Button>
              <Button onClick={this.alterLayer} id='20'>20%</Button>
              <Button onClick={this.alterLayer} id='30'>30%</Button>
              <Button onClick={this.alterLayer} id='40'>40%</Button>
              <Button onClick={this.alterLayer} id='50'>50%</Button>
              <Button onClick={this.alterLayer} id='60'>60%</Button>
              <Button onClick={this.alterLayer} id='70'>70%</Button>
              <Button onClick={this.alterLayer} id='80'>80%</Button>
              <Button onClick={this.alterLayer} id='90'>90%</Button>
              <Button onClick={this.alterLayer} id='100'>100%</Button>
            </ButtonGroup>
          </PopoverContent>
        </Popover>

        <Badge pill>
          {layer.opacity
            ? layer.opacity * 100 + ' %'
            : '100 %'}
          <Icon style={{ marginLeft: '5px' }} id={target} name='pencil' onClick={() => this.togglePopover(layer, i)} />
        </Badge>
      </div>
    );
  }
}
LayerOpacity.propTypes = {
  layer: React.PropTypes.object.isRequired,
  i: React.PropTypes.number.isRequired,
  target: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired
};
