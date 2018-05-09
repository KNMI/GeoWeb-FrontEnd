import React, { PureComponent } from 'react';
import Layers from './Layers';
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

    for (let i = 0; i < this.props.panel.layers.length; ++i) {
      if (this.props.panel.layers[i].service !== nextProps.panel.layers[i].service ||
        this.props.panel.layers[i].name !== nextProps.panel.layers[i].name ||
        this.props.panel.layers[i].currentStyle !== nextProps.panel.layers[i].currentStyle ||
        this.props.panel.layers[i].opacity !== nextProps.panel.layers[i].opacity ||
        this.props.panel.layers[i].active !== nextProps.panel.layers[i].active ||
        this.props.panel.layers[i].dimensions.filter((dim) => !dim.name.includes('time')) !== nextProps.panel.layers[i].dimensions.filter((dim) => !dim.name.includes('time')) ||
        this.props.panel.layers[i].enabled !== nextProps.panel.layers[i].enabled) {
        return true;
      }
    }
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
