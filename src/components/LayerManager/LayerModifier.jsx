import React, { PureComponent } from 'react';
import { Col } from 'reactstrap';
import { Icon } from 'react-fa';
export default class LayerModifier extends PureComponent {
  render () {
    return <Col xs='auto'><Icon name='bars' /></Col>
  }
}
