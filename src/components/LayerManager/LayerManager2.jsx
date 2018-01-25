import React, { PureComponent } from 'react';
import Layers from './Layers'
import { Col } from 'reactstrap';
export default class LayerManager extends PureComponent {
  render() {
    const baseLayers = this.props.panel.baselayers.filter((layer) => layer.keepOnTop === false);
    const overLayers = this.props.panel.baselayers.filter((layer) => layer.keepOnTop === true);
    const dataLayers = this.props.panel.layers;
    return (
      <Col xs='auto' style={{ minWidth: '40rem', flexDirection: 'column' }}>
        <Layers data={overLayers} color='danger' />
        <Layers data={dataLayers} color='info' />
        <Layers data={baseLayers} color='success' />
      </Col>);
  }
}
