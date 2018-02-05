import React, { PureComponent } from 'react';
import Layers from './Layers'
import { Col, Row } from 'reactstrap';
export default class LayerManager extends PureComponent {
  render() {
    const { dispatch, panelsActions, activePanelId } = this.props;
    const baseLayers = this.props.panel.baselayers.filter((layer) => layer.keepOnTop === false);
    const overLayers = this.props.panel.baselayers.filter((layer) => layer.keepOnTop === true);
    const dataLayers = this.props.panel.layers;
    return (
      <Col xs='auto' className={'LayerManager'} style={{ minWidth: '42rem', flexDirection: 'column' }}>
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='overlays' data={overLayers} color='danger' />
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='datalayers' data={dataLayers} color='info' />
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='maplayers' data={baseLayers} color='success' />
        <Row className='layerinfo' style={{ marginBottom: '0.1rem', height: '1rem' }} />
      </Col>);
  }
}
