import React from 'react';
import PropTypes from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import ChangeGroup from './ChangeGroup';

/*
  SortableChangeGroup makes ChangeGroups sortable via Drag and Drop, using SortableElement and SortableContainer.
*/
class SortableChangeGroup extends SortableElement(() => {}) {
  render () {
    let { value, onChange, onKeyUp, rowIndex, onDeleteRow, onFocusOut } = this.props;
    return (<ChangeGroup
      ref='sortablechangegroup'
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      rowIndex={rowIndex}
      onDeleteRow={onDeleteRow}
      editable
      onFocusOut={onFocusOut} />);
  }
};

SortableChangeGroup.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  rowIndex: PropTypes.number,
  onDeleteRow: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func
};

export default SortableChangeGroup;
