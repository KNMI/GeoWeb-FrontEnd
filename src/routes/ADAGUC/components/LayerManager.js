import React from 'react';
import { Popover,
PopoverTitle, Button,
ButtonGroup,
PopoverContent, Badge, Col, Row } from 'reactstrap';
import { Icon } from 'react-fa';
// ----------------------------------------- \\
// Rendering of the layersource with popover \\
// ----------------------------------------- \\
class LayerSource extends React.Component {
  render () {
    return <Badge pill className={'alert-' + this.props.color}>{this.props.name}</Badge>;
  }
}
LayerSource.propTypes = {
  name: React.PropTypes.string.isRequired,
  color: React.PropTypes.string.isRequired
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
  // istanbul ignore next
  generateList (inLayers) {
    this.setState({ layers: inLayers, layer: this.props.layer });
  }
  // istanbul ignore next
  togglePopover (e, layer, i) {
    this.setState({ popoverOpen: !this.state.popoverOpen });
    if (!this.state.layers || this.state.layer !== this.props.layer) {
      // eslint-disable-next-line no-undef
      var srv = WMJSgetServiceFromStore(this.props.layer.service);
      srv.getLayerObjectsFlat((layers) => this.generateList(layers), (err) => { throw new Error(err); });
    }
  }
  // istanbul ignore next
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
    const { i, layer, target, placement } = this.props;
    if (this.state.popoverOpen) {
      return (
        <div>
          <Popover placement={placement} width={'auto'} key={'popover' + i} isOpen={this.state.popoverOpen} target={target} toggle={() => this.togglePopover(layer, i)}>
            <PopoverTitle>Select layer</PopoverTitle>
            <PopoverContent>{this.state.layers ? this.state.layers.map((layer, q) => <li id={i} onClick={this.alterLayer} key={q}>{layer.text}</li>) : ''}</PopoverContent>
          </Popover>
          <Badge pill color={this.props.color} className={'alert-' + this.props.color + (this.props.editable ? ' editable' : '')} onClick={() => this.togglePopover(layer, i)}>
            {this.props.name}
            <Icon id={target} style={{ marginLeft: '0.25rem' }} name='pencil' />
          </Badge>
        </div>);
    } else {
      return (
        <Badge pill color={this.props.color} className={'alert-' + this.props.color + (this.props.editable ? ' editable' : '')} onClick={this.togglePopover}>
          {this.props.name}
          <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
        </Badge>);
    }
  }
}
LayerName.propTypes = {
  placement: React.PropTypes.string,
  target: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  name: React.PropTypes.string.isRequired,
  i: React.PropTypes.number.isRequired,
  layer: React.PropTypes.object.isRequired,
  color: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool
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
      const styleObj = this.props.layer.getStyleObject ? this.props.layer.getStyleObject(this.props.style) : null;
      if (this.state.popoverOpen) {
        return (
          <div>
            <Popover width={'auto'} key={'stylepopover' + i} isOpen={this.state.popoverOpen} target={target} toggle={() => this.togglePopover(layer, i)}>
              <PopoverTitle>Select style</PopoverTitle>
              <PopoverContent>{this.props.layer.styles ? this.props.layer.styles.map((style, q) => <li id={i} onClick={this.alterLayer} key={q}>{style.title}</li>) : <li />}</PopoverContent>
            </Popover>

            <Badge pill color={this.props.color} className={'alert-' + this.props.color + (this.props.editable ? ' editable' : '')} onClick={() => this.togglePopover(layer, i)}>
              {styleObj ? styleObj.title : 'default'}
              <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
            </Badge>
          </div>
        );
      } else {
        return (<Badge pill color={this.props.color} className={'alert-' + this.props.color + (this.props.editable ? ' editable' : '')} onClick={this.togglePopover}>
          {styleObj ? styleObj.title : 'default'}
          <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
        </Badge>);
      }
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
  actions: React.PropTypes.object.isRequired,
  color: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool
};

class LayerModelRun extends React.Component {
  render () {
    return <Badge pill className={'alert-' + this.props.color}>{this.props.refTime}</Badge>;
  }
}

LayerModelRun.propTypes = {
  refTime: React.PropTypes.string.isRequired,
  color: React.PropTypes.string.isRequired
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
    if (this.state.popoverOpen) {
      return (
        <div>
          <Popover width={'auto'} key={'opacitypopover' + i} isOpen={this.state.popoverOpen} target={target} toggle={() => this.togglePopover(layer, i)}>
            <PopoverTitle>Opacity</PopoverTitle>
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

          <Badge pill className={'alert-' + this.props.color + (this.props.editable ? ' editable' : '')} onClick={() => this.togglePopover(layer, i)}>
            {layer.opacity
              ? layer.opacity * 100 + ' %'
              : '100 %'}
            <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
          </Badge>
        </div>
      );
    } else {
      return (<Badge pill className={'alert-' + this.props.color + (this.props.editable ? ' editable' : '')} onClick={() => this.togglePopover(layer, i)}>
        {layer.opacity
          ? layer.opacity * 100 + ' %'
          : '100 %'}
        <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
      </Badge>);
    }
  }
}
LayerOpacity.propTypes = {
  layer: React.PropTypes.object.isRequired,
  i: React.PropTypes.number.isRequired,
  target: React.PropTypes.string.isRequired,
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  color: React.PropTypes.string.isRequired,
  editable: React.PropTypes.bool
};

export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.deleteLayer = this.deleteLayer.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
    this.updateState = this.updateState.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
    this.jumpToLatestTime = this.jumpToLatestTime.bind(this);
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
        break;
    }
  }

  deleteLayer (type, i) {
    const { dispatch, actions } = this.props;
    dispatch(actions.deleteLayer(i, type));
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
  jumpToLatestTime (i) {
    const layer = this.state.layers[i];
    if (!layer.getDimension('time')) {
      return;
    }
    const timedim = layer.getDimension('time');
    this.props.dispatch(this.props.actions.setTimeDimension(timedim.get(timedim.size() - 1)));
  }
  renderBaseLayerSet (layers) {
    if (!layers || layers.length === 0) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        return (
          <Row className='layerinfo' key={'base' + i}>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
            <Col xs='auto'><Icon style={{ minWidth: '1rem' }} id='enableButton' name={layer && layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('base', i)} /></Col>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='times' /></Col>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='times' /></Col>
            <LayerName i={i} color='success' editable name={this.getBaseLayerName(layer)}
              target={'baselayer' + i} layer={layer} dispatch={this.props.dispatch} actions={this.props.actions} placement='top' />
            <Col />
            <Col />
            <Col />
          </Row>
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
          <Row className='layerinfo' key={'over' + i} style={{ marginBottom: '0.1rem' }}>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
            <Col xs='auto'><Icon style={{ minWidth: '1rem' }} id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('overlay', i)} /></Col>
            <Col xs='auto'><Icon id='deleteButton' name='times' onClick={() => this.deleteLayer('overlay', i)} /></Col>
            <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
            <LayerSource color='danger' name={this.getOverLayerName(layer)} />
            <Col />
            <Col />
            <Col />
            <Col />
          </Row>
        );
      });
    }
  }

  renderLayerSet (layers) {
    if (!layers) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        const refTime = layer.getDimension ? layer.getDimension('reference_time') : null;
        return (
          <Row className='layerinfo' key={'lgi' + i} style={{ marginBottom: '0.1rem' }}>
            <Col xs='auto'><Icon name='chevron-up' onClick={() => this.props.dispatch(this.props.actions.reorderLayer('up', i))} /></Col>
            <Col xs='auto'><Icon name='chevron-down' onClick={() => this.props.dispatch(this.props.actions.reorderLayer('down', i))} /></Col>
            <Col xs='auto'><Icon style={{ minWidth: '1rem' }} id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('data', i)} /></Col>
            <Col xs='auto'><Icon id='deleteButton' name='times' onClick={() => this.deleteLayer('data', i)} /></Col>
            <Col xs='auto'><Icon title='Jump to latest time in layer' name='clock-o' onClick={() => this.jumpToLatestTime(i)} /></Col>
            <LayerSource color='info' name={this.getLayerName(layer)} />
            <LayerName color='info' editable name={layer.title} i={i} target={'datalayer' + i} layer={layer} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerStyle color='info' editable style={layer.currentStyle} layer={layer} target={'datalayerstyle' + i} i={i} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerOpacity color='info' editable layer={layer} target={'datalayeropacity' + i} i={i} dispatch={this.props.dispatch} actions={this.props.actions} />
            {refTime ? <LayerModelRun color='info' refTime={refTime.currentValue} /> : <div />}
          </Row>);
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
  componentWillMount () {
    this.updateState(this.props.wmjslayers);
  }
  // istanbul ignore next
  componentWillUpdate (nextProps, nextState) {
    if (this.props.wmjslayers !== nextProps.wmjslayers) {
      this.updateState(nextProps.wmjslayers);
    }
  }
  updateState (newlayers) {
    if (newlayers) {
      this.setState({
        layers: newlayers.layers,
        baselayers: newlayers.baselayers.filter((layer) => !layer.keepOnTop),
        overlays: newlayers.baselayers.filter((layer) => layer.keepOnTop)
      });
    }
  }

  render () {
    return (
      <Col xs='auto' style={{ minWidth: '40rem', flexDirection: 'column' }}>
        {this.renderOverLayerSet(this.state.overlays)}
        {this.renderLayerSet(this.state.layers)}
        {this.renderBaseLayerSet(this.state.baselayers)}
      </Col>
    );
  }
}

LayerManager.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  wmjslayers: React.PropTypes.object
};
