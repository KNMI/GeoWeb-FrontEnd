import React, { PureComponent } from 'react';
import Layer from './Layer';
import LayerModifier from './LayerModifier';
import { Col, Row } from 'reactstrap';

export default class Layers extends PureComponent {
  render () {
    const { color, role } = this.props;
    return (<Col style={{ flexDirection: 'column' }}>
      {this.props.data.map((layer) =>
        <Row>
          <Layer role={role} color={color} layer={layer} />
          <LayerModifier />
        </Row> )}
    </Col>);
  }
}
