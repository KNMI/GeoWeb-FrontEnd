import React, { PureComponent } from 'react';
import ConcreteCell from './ConcreteCell';
import EditableCell from './EditableCell';
import { Col } from 'reactstrap';
import { SortableElement } from 'react-sortable-hoc';

export default class Layer extends PureComponent {
  render () {
    const { layer, color } = this.props;
    switch(this.props.role) {
      case 'datalayers':
        const refTime = layer.getDimension('reference_time');
        return (<Col>
          <ConcreteCell color={color}>{layer.WMJSService.title}</ConcreteCell>
          <EditableCell color={color}>{layer.title}</EditableCell>
          <EditableCell color={color}>{layer.currentStyle}</EditableCell>
          <EditableCell color={color}>{layer.opacity}</EditableCell>
          <ConcreteCell color={color}>{refTime ? refTime.currentValue : null}</ConcreteCell></Col>);
      case 'overlays':
        return <Col><ConcreteCell color={color}>{layer.title}</ConcreteCell></Col>
      case 'maplayers':
        return <Col><EditableCell color={color}>{layer.title}</EditableCell></Col>
    }
  }
}

export const SortableLayer = SortableElement(({ role, color, layer, layerIndex }) => {
  return <Layer role={role} color={color} layer={layer} index={layerIndex} />
});

