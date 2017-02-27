import React from 'react';
import { ListGroup, ListGroupItem, Badge, Button } from 'reactstrap';
import { Icon } from 'react-fa';
export default class LayerManager extends React.Component {
  constructor () {
    super();
    this.getLayerName = this.getLayerName.bind(this);
  }
  getLayerName (layer) {
    if (layer) {
      const service = layer.service;
      let retStr = '';
      if (service.includes('HARM')) {
        retStr = 'HARMONIE';
      } else if (service.includes('RAD')) {
        retStr = 'Radar';
      } else if (service.includes('OBS')) {
        retStr = 'Observation';
      } else if (service.includes('SAT')) {
        retStr = 'Satellite';
      }

      return retStr;
    }
    return null;
  }
  renderBaselayerSet (layers, isOverlayLayer) {
    const overlayers = layers.filter((layer) => layer.keepOnTop === isOverlayLayer);
    return this.renderLayerSet(overlayers);
  }
  renderLayerSet (layers, type) {
    return layers.map((layer, i) => {
      return <ListGroupItem id='layerinfo' key={i}>
        <LayerName name={this.getLayerName(layer)} />
        <Badge pill>
          {layer.title}
          <Icon style={{ marginLeft: '5px' }} name='pencil' />
        </Badge>
        <LayerStyle style={layer.currentStyle} />
      </ListGroupItem>;
    });
  }

  render () {
    const { layers, baselayers } = this.props;
    if (!layers) {
      return <div />;
    } else {
      return (
        <div>
          {this.renderBaselayerSet(baselayers, true)}
          {this.renderLayerSet(layers)}
          {this.renderBaselayerSet(baselayers, false)}
          <Button color='primary'>+</Button>
        </div>
      );
    }
  }
}

LayerManager.propTypes = {
  layers: React.PropTypes.array,
  baselayers: React.PropTypes.array
};

class LayerName extends React.Component {
  constructor () {
    super();
  }
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
