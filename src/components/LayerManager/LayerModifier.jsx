import React, { PureComponent } from 'react';
import { Col } from 'reactstrap';
import { Icon } from 'react-fa';

export default class LayerModifier extends PureComponent {
  render () {
    const { layer } = this.props;
    return (
    <Col xs='auto'>
      <Icon className={'modifier'} style={{ marginRight: '0.33rem' }} name={layer.enabled ? 'eye' : 'eye-slash'} />
      <Icon className={'modifier'} name='trash' />
    </Col>);
  }
}
