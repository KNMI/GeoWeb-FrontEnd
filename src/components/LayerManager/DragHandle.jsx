import React, { PureComponent } from 'react';
import { SortableHandle } from 'react-sortable-hoc';
import { Col } from 'reactstrap';
import { Icon } from 'react-fa';
const Handle = SortableHandle(() => (
  <Col xs='auto' style={{ margin: '0 0.33rem' }}>
    <Icon className={'modifier'} name='bars' />
  </Col>))

export default class DragHandle extends PureComponent {
  render () {
    return <Handle />;
  }
}
