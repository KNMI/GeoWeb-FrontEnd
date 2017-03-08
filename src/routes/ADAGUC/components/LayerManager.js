import React from 'react';
import { Popover,
PopoverTitle,
PopoverContent, ListGroupItem, Badge } from 'reactstrap';
import { Icon } from 'react-fa';

export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.deleteLayer = this.deleteLayer.bind(this);
    this.toggleLayer = this.toggleLayer.bind(this);
    this.layerSelectList = this.layerSelectList.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
    this.state = {
      popoverOpen: [false, false, false, false, false, false]
    };
  }

  togglePopover (layer, i) {
    let popOver = this.state.popoverOpen;
    popOver[i] = !popOver[i];
    this.setState({ popoverOpen: popOver });
    this.layerSelectList(layer, i);
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
        dispatch(actions.alterLayer(i, type, 'enabled', !overlays[i].enabled));
        break;
      case 'data':
        dispatch(actions.alterLayer(i, type, 'enabled', !datalayers[i].enabled));
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

  layerSelectList (layer, i) {
    // eslint-disable-next-line no-undef
    var srv = WMJSgetServiceFromStore(layer.service);

    srv.getLayerObjectsFlat((layers) => this.generateList(layers), (err) => console.log(err));
  }

  renderLayerSet (layers, type) {
    if (!layers || layers.length === 0) {
      return <div />;
    } else {
      return layers.map((layer, i) => {
        console.log(layer);
        return (
          <div key={'layerdiv' + i}>
            <Popover key={'popover' + i} placement='bottom' isOpen={this.state.popoverOpen[i]} target={'editLayer' + i} toggle={() => this.togglePopover(layer, i)}>
              <PopoverTitle>Select layer</PopoverTitle>
              <PopoverContent>{this.state.layers}</PopoverContent>
            </Popover>
            <ListGroupItem id='layerinfo' key={'lgi' + i}>
              <Icon id='enableButton' name={layer.enabled ? 'check-square-o' : 'square-o'} onClick={() => this.toggleLayer(type, i)} />
              <Icon id='deleteButton' name='times' onClick={() => this.deleteLayer(type, i)} />
              <LayerSource name={type === 'data' ? this.getLayerName(layer) : ''} />
              <LayerName name={layer.label ? layer.label : layer.title} />
              <LayerStyle style={layer.currentStyle} />
            </ListGroupItem>
          </div>);
      });
    }
  }

  render () {
    const { layers } = this.props;
    if (!layers || Object.keys(layers).length === 0) {
      return <div />;
    }
    const { datalayers, overlays } = layers;
    return (
      <div style={{ marginLeft: '5px' }} >
        {this.renderLayerSet(overlays, 'overlay')}
        {this.renderLayerSet(datalayers, 'data')}
        {/* this.renderLayerSet([baselayer], 'base') */}
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
  render () {
    return <Badge pill>
      {this.props.name}
      <Icon style={{ marginLeft: '5px' }} name='pencil' />
    </Badge>;
  }
}
LayerName.propTypes = {
  name: React.PropTypes.string.isRequired
};

// ---------------------------------------- \\
// Rendering of the layerstyle with popover \\
// ---------------------------------------- \\
class LayerStyle extends React.Component {
  render () {
    return (
      <Badge pill>
        {this.props.style ? this.props.style : 'default'}
        <Icon style={{ marginLeft: '5px' }} name='pencil' />
      </Badge>
    );
  }
}
LayerStyle.propTypes = {
  style: React.PropTypes.string
};
