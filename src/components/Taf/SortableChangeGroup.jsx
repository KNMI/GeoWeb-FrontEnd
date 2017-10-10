import React from 'react';
import PropTypes from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import ChangeGroup from './ChangeGroup';

class SortableChangeGroup extends SortableElement(() => {}) { // { value, onChange, onKeyUp, rowIndex, onDeleteRow, onFocusOut, focusRefId }) => {
  render () {
    let { value, onChange, onKeyUp, rowIndex, onDeleteRow, onFocusOut, focusRefId } = this.props;
    return (<ChangeGroup
      ref='sortablechangegroup'
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      rowIndex={rowIndex}
      onDeleteRow={onDeleteRow}
      editable
      onFocusOut={onFocusOut}
      focusRefId={focusRefId} />);
  }
};

SortableChangeGroup.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  rowIndex: PropTypes.number,
  onDeleteRow: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func,
  focusRefId: PropTypes.string
};

export default SortableChangeGroup;
