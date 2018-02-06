import React, { PureComponent } from 'react';
import Layers from './Layers'
import { Col, Row } from 'reactstrap';
export default class LayerManager extends PureComponent {
	constructor () {
		super();
		this.makeActiveLayer = this.makeActiveLayer.bind(this);
	}
	makeActiveLayer (index) {
		const { dispatch, panelsActions, activePanelId, panel } = this.props;
		dispatch(panelsActions.setActiveLayer({ layerClicked: index, activePanelId }));
	}
  render() {
    const { dispatch, panelsActions, activePanelId, panel } = this.props;
    if (!panel) {
    	return <Col />
    }
    const baseLayers = panel.baselayers.filter((layer) => layer.keepOnTop === false);
    const overLayers = panel.baselayers.filter((layer) => layer.keepOnTop === true);
    const dataLayers = panel.layers;
    return (
      <Col xs='auto' className={'LayerManager'} style={{ minWidth: '42rem', flexDirection: 'column' }}>
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='overlays' data={overLayers} color='danger' />
        <Layers onLayerClick={(index) => this.makeActiveLayer(index)} activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='datalayers' data={dataLayers} color='info' />
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='maplayers' data={baseLayers} color='success' />
        <Row className='layerinfo' style={{ marginBottom: '0.1rem', height: '1rem' }} />
      </Col>);
  }
}
