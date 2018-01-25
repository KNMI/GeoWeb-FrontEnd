import React, { PureComponent } from 'react';
import Layer, { SortableLayer } from './Layer';
import LayerModifier from './LayerModifier';
import { Col, Row } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
const SortableLayers = SortableContainer(({ role, color, data }) => {
  return (
    <Col style={{ flexDirection: 'column' }}>
      {data.map((layer, i) => <SortableLayer key={i} index={i} layerIndex={i} role={role} color={color} layer={layer} />)}
    </Col>
  )}
);

export default class Layers extends PureComponent {
  constructor() {
    super();
    this.onSortEnd = this.onSortEnd.bind(this);
  }
  onSortEnd ({ oldIndex, newIndex }) {
    console.log(oldIndex, newIndex);
    // const newTafState = cloneDeep(this.state.tafAsObject);
    // newTafState.changegroups = arrayMove(newTafState.changegroups, oldIndex, newIndex);
    // this.validateTaf(newTafState);
    // this.setState({
    //   tafAsObject: newTafState,
    //   hasEdits: true
    // });
  };

  render () {
    const { color, role, data } = this.props;
    return (<Col style={{ flexDirection: 'column' }}>
      <SortableLayers onSortEnd={this.onSortEnd} role={role} color={color} data={data} />
    </Col>);
  }
}
