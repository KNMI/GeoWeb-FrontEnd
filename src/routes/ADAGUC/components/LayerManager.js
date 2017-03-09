import React from 'react';
import { Popover,
PopoverTitle, Button, ButtonToolbar,
ButtonGroup,
PopoverContent, ListGroupItem, Badge } from 'reactstrap';
import { Icon } from 'react-fa';

export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.deleteLayer = this.deleteLayer.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
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

  toggleLayer (type, i) {
    const { layers, dispatch, actions } = this.props;
    const { datalayers, overlays } = layers;
    switch (type) {
      case 'overlay':
        dispatch(actions.alterLayer(i, type, { enabled: !overlays[i].enabled }));
        break;
      case 'data':
        dispatch(actions.alterLayer(i, type, { enabled: !datalayers[i].enabled }));
        break;
      default:
        console.log('Reducer saw an unknown value');
        break;
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
  renderBaseLayerSet (layers) {
    if (!layers || layers.length === 0) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        return (
          <ListGroupItem id='layerinfo' key={'base' + i} style={{ marginLeft: '32px' }}>
            <Icon style={{ marginRight: '13px' }} id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer('base', i)} />
            <LayerName name={layer.label ? layer.label : layer.title} i={i} target={'baselayer' + i} layer={layer} dispatch={this.props.dispatch} actions={this.props.actions} />
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
            <LayerSource name={layer.label ? layer.label : layer.title} />
          </ListGroupItem>
        );
      });
    }
  }

  renderLayerSet (layers) {
    if (!layers || layers.length === 0) {
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
            <LayerName name={layer.label ? layer.label : layer.title} i={i} target={'datalayer' + i} layer={layer} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerStyle style={layer.styleTitle} layer={layer} target={'datalayerstyle' + i} i={i} dispatch={this.props.dispatch} actions={this.props.actions} />
            <LayerOpacity layer={layer} target={'datalayeropacity' + i} i={i} dispatch={this.props.dispatch} actions={this.props.actions} />
            {layer.service.includes('HARM') ? <LayerModelRun layer={layer} /> : <div />}
          </ListGroupItem>);
      });
    }
  }

  render () {
    const { layers } = this.props;
    if (!layers || Object.keys(layers).length === 0) {
      return <div />;
    }
    const { datalayers, overlays, baselayer } = layers;
    return (
      <div style={{ marginLeft: '5px' }} >
        {this.renderOverLayerSet(overlays)}
        {this.renderLayerSet(datalayers)}
        {this.renderBaseLayerSet([baselayer], 'base')}
      </div>
    );
  }
}

LayerManager.propTypes = {
  dispatch: React.PropTypes.func.isRequired,
  actions: React.PropTypes.object.isRequired,
  layers: React.PropTypes.object,
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
    this.props.dispatch(this.props.actions.alterLayer(indexInLayerList, this.props.target.includes('data') ? 'data' : 'base', { name: wantedLayer.name, label: wantedLayer.text, style: undefined, styleTitle: undefined }));
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
      activeLayer: null,
      styles: [],
      popoverOpen: false
    };
    this.alterLayer = this.alterLayer.bind(this);
    this.togglePopover = this.togglePopover.bind(this);
  }
  componentWillMount () {
    this.setState({ activeLayer: new WMJSLayer({ ...this.props.layer, onReady: (t) => this.setState({ styles: t.styles }) }) });
  }
  togglePopover (e, layer, i) {
    this.setState({ popoverOpen: !this.state.popoverOpen });
    if (!this.state.layers || this.state.layer !== this.props.layer) {
      // eslint-disable-next-line no-undef
      this.setState({ activeLayer: new WMJSLayer({ ...this.props.layer, onReady: (t) => { console.log(this.state.activeLayer); this.setState({ styles: t.styles }); } }) });
    }

  }
  alterLayer (e) {
    // TODO .... this
    const indexInLayerList = e.currentTarget.id;
    var indexOfPossibleLayers;
    for (indexOfPossibleLayers = 0; indexOfPossibleLayers < this.state.styles.length; ++indexOfPossibleLayers) {
      if (this.state.styles[indexOfPossibleLayers].title === e.currentTarget.innerHTML) {
        break;
      }
    }
    const wantedStyle = this.state.styles[indexOfPossibleLayers];
    this.props.dispatch(this.props.actions.alterLayer(indexInLayerList, this.props.target.includes('data') ? 'data' : 'base', { style: wantedStyle.name, styleTitle: wantedStyle.title }));
    this.setState({ popoverOpen: false });
  }

  render () {
    const { i, target, layer } = this.props;

    return (
      <div style={{ marginBottom: '-6px' }}>
        <Popover width={'auto'} key={'stylepopover' + i} placement='bottom' isOpen={this.state.popoverOpen} target={target}>
          <PopoverTitle>Select style</PopoverTitle>
          <PopoverContent>{this.state.styles ? this.state.styles.map((style, q) => <li id={i} onClick={this.alterLayer} key={q}>{style.title}</li>) : ''}</PopoverContent>
        </Popover>

        <Badge pill>
          {this.props.style ? this.props.style : (this.state.activeLayer && this.state.activeLayer.currentStyle
            ? this.state.activeLayer.getStyleObject(this.state.activeLayer.currentStyle).title
            : 'default')}
          <Icon style={{ marginLeft: '5px' }} id={target} name='pencil' onClick={() => this.togglePopover(layer, i)} />
        </Badge>
      </div>
    );
  }
}
LayerStyle.propTypes = {
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
      activeLayer: null,
      refTime: null
    };
  }

  componentWillMount () {
    this.layer = new WMJSLayer({
      ...this.props.layer,
      onReady: (t) => {
        const refTime = t.getDimension('reference_time');
        if (refTime) {
          this.setState({ refTime: refTime.currentValue });
        }
      }
    });
  }
  render () {
    return this.state.refTime ? <Badge pill>{this.state.refTime}</Badge> : <div />;
  }
}

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
        <Popover width={'auto'} key={'stylepopover' + i} placement='bottom' isOpen={this.state.popoverOpen} target={target}>
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
