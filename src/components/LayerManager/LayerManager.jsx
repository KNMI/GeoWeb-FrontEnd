import React, { PureComponent } from 'react';
import Layers from './Layers'
import { Col, Row } from 'reactstrap';
export default class LayerManager extends PureComponent {
  render() {
    const baseLayers = this.props.panel.baselayers.filter((layer) => layer.keepOnTop === false);
    const overLayers = this.props.panel.baselayers.filter((layer) => layer.keepOnTop === true);
    const dataLayers = this.props.panel.layers;
    return (
      <Col xs='auto' className={'LayerManager'} style={{ minWidth: '42rem', flexDirection: 'column' }}>
        <Layers role='overlays' data={overLayers} color='danger' />
        <Layers role='datalayers' data={dataLayers} color='info' />
        <Layers role='maplayers' data={baseLayers} color='success' />
        <Row className='layerinfo' style={{ marginBottom: '0.1rem', height: '1rem' }} />
      </Col>);
  }
}
