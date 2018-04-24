import React, { PureComponent } from 'react';
import { UnsortableLayer, SortableLayer } from './Layer';
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
    if (oldIndex !== newIndex) {
      dispatch(panelsActions.moveLayer({ oldIndex, newIndex, type }));
    }
  };

  shouldComponentUpdate (nextProps, nextState) {
    let result = false;
    if (this.props.data.length !== nextProps.data.length ||
        this.props.activePanelId !== nextProps.activePanelId) {
      result = true;
    }
    this.props.data.map((layer, i) => {
      const nextLayer = nextProps.data[i];
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
        result = true;
      }
    });
    return result;
  }

  render () {
    const { color, role, data, dispatch, panelsActions, activePanelId, onLayerClick } = this.props;
    if (data.length > 1) {
      return (<SortableLayers onLayerClick={onLayerClick} activePanelId={activePanelId} dispatch={dispatch} panelsActions={panelsActions} useDragHandle={true} onSortEnd={this.onSortEnd} role={role} color={color} data={data} />);
    } else {
      return <Row style={{ flexDirection: 'column' }}>
        {data.map((layer, i) => <UnsortableLayer onLayerClick={onLayerClick} activePanelId={activePanelId} key={i} index={i} layerIndex={i} role={role} color={color} layer={layer} dispatch={dispatch} panelsActions={panelsActions} />)}
      </Row>;
    }
  }
}
