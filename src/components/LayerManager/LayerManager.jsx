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

  shouldComponentUpdate (nextProps, nextState) {
    if (this.props.activePanelId !== nextProps.activePanelId ||
        this.props.panel.baselayers.length !== nextProps.panel.baselayers.length ||
        this.props.panel.layers.length !== nextProps.panel.layers.length
    ) {
      return true;
    }
    this.props.panel.layers.map((layer, i) => {
      const nextLayer = nextProps.panel.layers[i];
      if (!layer || !nextLayer) {
        return true;
      }
      if (layer.service !== nextLayer.service ||
        layer.name !== nextLayer.name ||
        layer.opacity !== nextLayer.opacity ||
        layer.currentStyle !== nextLayer.currentStyle ||
        layer.active !== nextLayer.active ||
        (layer.dimensions && layer.dimensions.filter((dim) => !dim.name.includes('time')) !== nextLayer.dimensions.filter((dim) => !dim.name.includes('time')))
      ) {
        return true;
      }
    });
    return false;
  }
  render () {
    const { dispatch, panelsActions, activePanelId, panel } = this.props;
    if (!panel) {
      return <Col />;
    }
    const baseLayers = panel.baselayers.filter((layer) => !layer.keepOnTop);
    const overLayers = panel.baselayers.filter((layer) => layer.keepOnTop === true);
    const dataLayers = panel.layers;
    return (
      <Col xs='auto' className={'LayerManager'} style={{ minWidth: '42rem', flexDirection: 'column' }}>
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='overlays' data={overLayers} color='danger' />
        <Layers onLayerClick={(index) => this.makeActiveLayer(index)} activePanelId={activePanelId}
          dispatch={dispatch} panelsActions={panelsActions} role='datalayers' data={dataLayers} color='info' />
        <Layers activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} role='maplayers' data={baseLayers} color='success' />
        <Row className='layerinfo' style={{ marginBottom: '0.1rem', height: '1rem' }} />
      </Col>);
  }
}
