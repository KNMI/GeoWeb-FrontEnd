import React, { Component } from 'react';
import { Popover,
  PopoverTitle,
  PopoverContent, Badge, Col, Row } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import Slider from 'rc-slider';

require('rc-slider/assets/index.css');
// ----------------------------------------- \\
// Rendering of the layersource with popover \\
// ----------------------------------------- \\
class LayerSource extends Component {
  render () {
    return <Badge pill className={`alert-${this.props.color}`}>{this.props.name}</Badge>;
  }
}
LayerSource.propTypes = {
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};

// --------------------------------------- \\
// Rendering of the layername with popover \\
// --------------------------------------- \\
class LayerName extends Component {
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
  togglePopover () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
    if (!this.state.layers || this.state.layer !== this.props.layer) {
      // eslint-disable-next-line no-undef
      const srv = WMJSgetServiceFromStore(this.props.layer.service);
      srv.getLayerObjectsFlat(layers => this.generateList(layers), (err) => {
        throw new Error(err);
      });
    }
  }
  // istanbul ignore next
  alterLayer (e, wantedLayer) {
    const indexInLayerList = e.currentTarget.id;
    this.props.dispatch(this.props.layerActions.alterLayer({ index: indexInLayerList,
      layerType: this.props.target.includes('data')
        ? 'data'
        : 'base',
      fieldsNewValuesObj: { name: wantedLayer.name, label: wantedLayer.text, style: undefined, styleTitle: undefined },
      activeMapId: this.props.activeMapId }));
    this.setState({ popoverOpen: false });
  }
  render () {
    const { i, target, placement } = this.props;
    return (
      <div>
        <Popover placement={placement} width={'auto'} key={`popover${i}`} isOpen={this.state.popoverOpen} target={target} toggle={this.togglePopover}>
          <PopoverTitle>Select layer</PopoverTitle>
          <PopoverContent>{this.state.layers ? this.state.layers.map((layer, q) => <li id={i} onClick={e => this.alterLayer(e, layer)} key={q}>{layer.text}</li>) : ''}</PopoverContent>
        </Popover>
        <Badge pill color={this.props.color} className={`alert-${this.props.color}${this.props.editable ? ' editable' : ''}`} onClick={this.togglePopover}>
          {this.props.name}
          <Icon id={target} style={{ marginLeft: '0.25rem' }} name='pencil' />
        </Badge>
      </div>);
  }
}
LayerName.propTypes = {
  placement: PropTypes.string,
  target: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  layerActions: PropTypes.object.isRequired,
  activeMapId: PropTypes.number,
  name: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  layer: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
  editable: PropTypes.bool
};

// ---------------------------------------- \\
// Rendering of the layerstyle with popover \\
// ---------------------------------------- \\
class LayerStyle extends Component {
  constructor () {
    super();
    this.state = {
      popoverOpen: false
    };
    this.alterLayer = this.alterLayer.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
  }

  // istanbul ignore next
  togglePopover () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }

  alterLayer (e, wantedStyle) {
    const { dispatch, layerActions, target, activeMapId } = this.props;
    const indexInLayerList = e.currentTarget.id;
    dispatch(layerActions.alterLayer({
      index: indexInLayerList,
      layerType: target.includes('data') ? 'data' : 'base',
      fieldsNewValuesObj: {
        style: wantedStyle.name,
        styleTitle: wantedStyle.title
      },
      activeMapId: activeMapId }));
    this.setState({ popoverOpen: false });
  }

  render () {
    const { i, target, layer } = this.props;
    if (!this.props.layer) {
      return <div />;
    }
    const styleObj = this.props.layer.getStyleObject ? layer.getStyleObject(this.props.style) : null;
    return (
      <div>
        <Popover width={'auto'} key={`stylepopover${i}`} isOpen={this.state.popoverOpen} target={target} toggle={this.togglePopover}>
          <PopoverTitle>Select style</PopoverTitle>
          <PopoverContent>{layer.styles ? layer.styles.map((style, q) => (<li
            id={i}
            onClick={e => this.alterLayer(e, style)}
            key={q}
          >{style.title}</li>)) : <li />}
          </PopoverContent>
        </Popover>

        <Badge
          pill
          color={this.props.color}
          className={`alert-${this.props.color}${this.props.editable ? ' editable' : ''}`}
          onClick={this.togglePopover}
        >
          {styleObj ? styleObj.title : 'default'}
          <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
        </Badge>
      </div>
    );
  }
}
LayerStyle.propTypes = {
  style: PropTypes.string,
  activeMapId: PropTypes.number,
  layer: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  target: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  layerActions: PropTypes.object.isRequired,
  color: PropTypes.string.isRequired,
  editable: PropTypes.bool
};

class LayerModelRun extends Component {
  render () {
    return <Badge pill className={`alert-${this.props.color}`}>{this.props.refTime}</Badge>;
  }
}

LayerModelRun.propTypes = {
  refTime: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired
};

// ---------------------------------------- \\
// Rendering of the layerstyle with popover \\
// ---------------------------------------- \\
class LayerOpacity extends Component {
  constructor () {
    super();
    this.state = {
      popoverOpen: false
    };
    this.alterLayer = this.alterLayer.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
  }
  togglePopover () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  alterLayer (value) {
    const wantedOpacity = value / 100.0;
    this.props.dispatch(this.props.layerActions.alterLayer({ index: this.props.i, layerType: 'data', fieldsNewValuesObj: { opacity: wantedOpacity }, activeMapId: this.props.activeMapId }));
  }

  floatToIntPercentage (v) {
    // By default a layer is fully opaque
    if (v === undefined || v === null) {
      return 100;
    }
    return parseInt(Math.floor(v * 100));
  }

  render () {
    const marks = {
      0: '0%',
      10: '10%',
      20: '20%',
      30: '30%',
      40: '40%',
      50: '50%',
      60: '60%',
      70: '70%',
      80: '80%',
      90: '90%',
      100: '100%'
    };

    const { i, target, layer } = this.props;

    return (
      <div>
        <Popover width={'auto'} key={`opacitypopover${i}`} isOpen={this.state.popoverOpen} target={target} toggle={this.togglePopover}>
          <PopoverTitle>Opacity</PopoverTitle>
          <PopoverContent style={{ height: '15rem', marginBottom: '1rem' }}>
            <Slider style={{ margin: '1rem' }} vertical min={0} max={100} marks={marks} step={1} onChange={v => this.alterLayer(v)} defaultValue={this.floatToIntPercentage(layer.opacity)} />
          </PopoverContent>
        </Popover>

        <Badge pill className={`alert-${this.props.color}${this.props.editable ? ' editable' : ''}`} onClick={this.togglePopover}>
          {`${this.floatToIntPercentage(layer.opacity)} %`}
          <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
        </Badge>
      </div>
    );
  }
}
LayerOpacity.propTypes = {
  activeMapId: PropTypes.number,
  layer: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  target: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  editable: PropTypes.bool,
  layerActions: PropTypes.object
};

export class LayerModelLevel extends Component {
  constructor () {
    super();
    this.state = {
      popoverOpen: false
    };
    this.togglePopover = this.togglePopover.bind(this);
    this.alterLayer = this.alterLayer.bind(this);
  }

  togglePopover () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }

  alterLayer (value) {
    this.props.dispatch(this.props.layerActions.alterLayer({ index: this.props.i, layerType: 'data', fieldsNewValuesObj: { modellevel: value }, activeMapId: this.props.activeMapId }));
  }

  render () {
    const { i, target, modellevel } = this.props;
    const marks = {};
    for (var q = 0; q < modellevel.size(); q += 8) {
      marks[q] = modellevel.getValueForIndex(q);
    }
    return <div>
      <Popover width={'auto'} key={`modellevelpopover${i}`} isOpen={this.state.popoverOpen} target={target} toggle={this.togglePopover}>
        <PopoverTitle>Model Level</PopoverTitle>
        <PopoverContent style={{ height: '15rem', marginBottom: '1rem' }}>
          <Slider style={{ margin: '1rem' }} onChange={v => this.alterLayer(v)}
            min={parseInt(modellevel.getValueForIndex(0))} max={parseInt(modellevel.getValueForIndex(modellevel.size() - 1))}
            step={1} marks={marks} vertical defaultValue={modellevel.currentValue} />
        </PopoverContent>
      </Popover>

      <Badge pill className={`alert-${this.props.color}${this.props.editable ? ' editable' : ''}`} onClick={this.togglePopover}>
        {modellevel.currentValue}
        <Icon style={{ marginLeft: '0.25rem' }} id={target} name='pencil' />
      </Badge>
    </div>;
  }
}
LayerModelLevel.propTypes = {
  dispatch: PropTypes.func,
  layerActions: PropTypes.object,
  i: PropTypes.number,
  color: PropTypes.string,
  editable: PropTypes.bool,
  target: PropTypes.string,
  modellevel: PropTypes.object,
  activeMapId: PropTypes.number
};

export default class LayerManager extends Component {
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
    return layer ? layer.WMJSService.title : null;
  }

  toggleLayer (type, i) {
    // index, layerType, fieldsNewValuesObj, activeMapId
    const { dispatch, layerActions, activeMapId } = this.props;
    const alterObj = { index: i, layerType: type, fieldsNewValuesObj: {}, activeMapId };
    let alternations;
    switch (type) {
      case 'overlay':
        alternations = { enabled: !this.state.overlays[i].enabled };
        // dispatch(layerActions.alterLayer(i, type, { enabled: !this.state.overlays[i].enabled }));
        break;
      case 'data':
        alternations = { enabled: !this.state.layers[i].enabled };
        // dispatch(layerActions.alterLayer(i, type, { enabled: !this.state.layers[i].enabled }));
        break;
      default:
        break;
    }
    dispatch(layerActions.alterLayer({ ...alterObj, fieldsNewValuesObj: alternations }));
  }

  deleteLayer (type, i) {
    const { dispatch, layerActions, activeMapId } = this.props;
    dispatch(layerActions.deleteLayer({ idx: i, type, activeMapId }));
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
    this.props.dispatch(this.props.adagucActions.setTimeDimension(timedim.get(timedim.size() - 1)));
  }
  renderBaseLayerSet (layers) {
    if (!layers || layers.length === 0) {
      return <div />;
    }
    return layers.map((layer, i) => (
      <Row className='layerinfo' key={`base${i}`}>
        <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
        <Col xs='auto'><Icon style={{ color: 'transparent' }} name='chevron-up' /></Col>
        <Col xs='auto'><Icon style={{ minWidth: '1rem' }} id='enableButton' name={layer && layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('base', i)} /></Col>
        <Col xs='auto'><Icon style={{ color: 'transparent' }} name='times' /></Col>
        <Col xs='auto'><Icon style={{ color: 'transparent' }} name='times' /></Col>
        <LayerName
          i={i}
          color='success'
          editable
          name={this.getBaseLayerName(layer)}
          target={`baselayer${i}`}
          layer={layer}
          dispatch={this.props.dispatch}
          layerActions={this.props.layerActions}
          placement='top'
        />
        <Col />
        <Col />
        <Col />
      </Row>
    ));
  }
  renderOverLayerSet (layers) {
    if (!layers || layers.length === 0) {
      return <div />;
    }
    return layers.map((layer, i) => (
      <Row className='layerinfo' key={`over${i}`} style={{ marginBottom: '0.1rem' }}>
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
    ));
  }

  renderLayerSet (layers) {
    const { dispatch, layerActions, activeMapId } = this.props;
    if (!layers) {
      return <div />;
    }
    return layers.map((layer, i) => {
      const refTime = layer.getDimension ? layer.getDimension('reference_time') : null;
      const modelLevel = layer.getDimension ? layer.getDimension('modellevel') : null;
      return (
        <Row className='layerinfo' key={`lgi${i}`} style={{ marginBottom: '0.1rem' }}>
          <Col xs='auto'><Icon name='chevron-up' onClick={() => dispatch(layerActions.reorderLayers({ direction: 'up', index: i, activeMapId }))} /></Col>
          <Col xs='auto'><Icon name='chevron-down' onClick={() => dispatch(layerActions.reorderLayers({ direction: 'down', index: i, activeMapId }))} /></Col>
          <Col xs='auto'><Icon style={{ minWidth: '1rem' }} id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('data', i)} /></Col>
          <Col xs='auto'><Icon id='deleteButton' name='times' onClick={() => this.deleteLayer('data', i)} /></Col>
          <Col xs='auto'><Icon title='Jump to latest time in layer' name='clock-o' onClick={() => this.jumpToLatestTime(i)} /></Col>
          <LayerSource color='info' name={this.getLayerName(layer)} />
          <LayerName color='info' editable activeMapId={activeMapId} name={layer.title} i={i} target={`datalayer${i}`} layer={layer} dispatch={dispatch} layerActions={this.props.layerActions} />
          <LayerStyle color='info' editable activeMapId={activeMapId} style={layer.currentStyle} layer={layer}
            target={`datalayerstyle${i}`} i={i} dispatch={dispatch} layerActions={this.props.layerActions} />
          <LayerOpacity color='info' editable activeMapId={activeMapId} layer={layer} target={`datalayeropacity${i}`} i={i} dispatch={dispatch} layerActions={this.props.layerActions} />
          {refTime ? <LayerModelRun color='info' refTime={refTime.currentValue} /> : <div />}
          {modelLevel ? <LayerModelLevel color='info' editable activeMapId={activeMapId} layer={layer}
            target={`datalayermodellevel${i}`} i={i} dispatch={dispatch} layerActions={this.props.layerActions} modellevel={modelLevel} /> : <div />}

        </Row>);
    });
  }
  componentWillUnmount () {
    this.setState({
      layers: [],
      baselayers: [],
      overlays: []
    });
  }
  componentWillMount () {
    this.updateState(this.props.wmjslayers || null);
  }
  // istanbul ignore next
  componentWillUpdate (nextProps) {
    if (this.props.wmjslayers !== nextProps.wmjslayers) {
      this.updateState(nextProps.wmjslayers);
    }
  }
  updateState (newlayers) {
    if (newlayers && newlayers.layers && newlayers.baselayers) {
      this.setState({
        layers: newlayers.layers,
        baselayers: newlayers.baselayers.filter(layer => !layer.keepOnTop),
        overlays: newlayers.baselayers.filter(layer => layer.keepOnTop)
      });
    }
  }

  render () {
    console.log(this.props.wmjslayers)
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
  dispatch: PropTypes.func.isRequired,
  layerActions: PropTypes.object.isRequired,
  wmjslayers: PropTypes.object,
  activeMapId: PropTypes.number,
  adagucActions: PropTypes.object
};
