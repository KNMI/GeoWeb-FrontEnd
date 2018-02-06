import React, { PureComponent } from 'react';
import { SortableLayer } from './Layer';
import { Row } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';

const SortableLayers = SortableContainer(({ role, color, data, dispatch, panelsActions, activePanelId, onLayerClick }) => {
  return (
    <Row style={{ flexDirection: 'column' }}>
      {data.map((layer, i) => <SortableLayer onLayerClick={onLayerClick} activePanelId={activePanelId} key={i} index={i} layerIndex={i} role={role} color={color} layer={layer} dispatch={dispatch} panelsActions={panelsActions}/>)}
    </Row>
  );
});

export default class Layers extends PureComponent {
  constructor () {
    super();
    this.onSortEnd = this.onSortEnd.bind(this);
  }
  onSortEnd ({ oldIndex, newIndex }) {
    const { panelsActions, dispatch, role } = this.props;
    const type = role === 'datalayers' ? 'data' : 'overlay';
    dispatch(panelsActions.moveLayer({ oldIndex, newIndex, type }));
  };

  render () {
    const { color, role, data, dispatch, panelsActions, activePanelId, onLayerClick } = this.props;
    return (<SortableLayers onLayerClick={onLayerClick} activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} useDragHandle={true} onSortEnd={this.onSortEnd} role={role} color={color} data={data} />);
  }
}
