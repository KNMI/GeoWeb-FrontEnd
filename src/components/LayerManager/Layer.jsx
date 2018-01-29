import React, { PureComponent } from 'react';
import ConcreteCell from './ConcreteCell';
import EditableCell from './EditableCell';
import LayerModifier from './LayerModifier';
import DragHandle from './DragHandle';
import { Col, Row } from 'reactstrap';
import { SortableElement } from 'react-sortable-hoc';

export default class Layer extends PureComponent {
  render () {
    const { layer, color } = this.props;
    switch(this.props.role) {
      case 'datalayers':
        const refTime = layer.getDimension('reference_time');
        return (<Col>
          <ConcreteCell active={layer.active} color={color}>{layer.WMJSService.title}</ConcreteCell>
          <EditableCell active={layer.active} color={color}>{layer.title}</EditableCell>
          <EditableCell active={layer.active} color={color}>{layer.currentStyle}</EditableCell>
          <EditableCell active={layer.active} color={color}>{parseInt(layer.opacity * 100) + '%'}</EditableCell>
          <ConcreteCell active={layer.active} color={color}>{refTime ? refTime.currentValue : null}</ConcreteCell></Col>);
      case 'overlays':
        return <Col><ConcreteCell color={color}>{layer.title}</ConcreteCell></Col>
      case 'maplayers':
        return <Col><EditableCell color={color}>{layer.title}</EditableCell></Col>
    }
  }
}

export const SortableLayer = SortableElement(({ role, color, layer, layerIndex }) => {
  const backgroundColor = role === 'datalayers' && layer.active ? 'rgba(217, 237, 247, 0.6)' : null;

  return (
    <Row className='Layer' style={{ backgroundColor: backgroundColor }}>
      <Layer role={role} color={color} layer={layer} index={layerIndex} />
      <DragHandle />
      <LayerModifier layer={layer} />
    </Row>);
});

