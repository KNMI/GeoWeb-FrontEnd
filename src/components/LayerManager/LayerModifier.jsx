import React, { PureComponent } from 'react';
import { Col } from 'reactstrap';
import { Icon } from 'react-fa';
import cloneDeep from 'lodash.clonedeep';
export default class LayerModifier extends PureComponent {
  constructor () {
    super();
    this.toggleEnabled = this.toggleEnabled.bind(this);
    this.deleteLayer = this.deleteLayer.bind(this);
  }
  toggleEnabled () {
    const { layer, dispatch, panelsActions, index } = this.props;
    const layerCpy = cloneDeep(layer);
    layerCpy.enabled = !layer.enabled;
    dispatch(panelsActions.replaceLayer({ index: index, layer: layerCpy  }));
  }
  deleteLayer () {
    const { layer, dispatch, panelsActions, index, role } = this.props;
    if (role === 'datalayers') {
      dispatch(panelsActions.deleteLayer({ idx: index, type: 'data' }))
    } else {
      dispatch(panelsActions.deleteLayer({ idx: index, type: 'overlay' }))
    }
  }
  render () {
    const { layer } = this.props;
    return (
    <Col xs='auto'>
      <Icon onClick={this.toggleEnabled} className={'modifier'} style={{ marginRight: '0.33rem' }} name={layer.enabled ? 'eye' : 'eye-slash'} />
      <Icon onClick={this.deleteLayer} className={'modifier'} name='trash' />
    </Col>);
  }
}
