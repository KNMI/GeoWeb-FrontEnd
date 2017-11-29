import React from 'react';
import PropTypes from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import ChangeGroup from './ChangeGroup';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';

/*
  SortableChangeGroup makes ChangeGroups sortable via Drag and Drop, using SortableElement and SortableContainer.
*/
class SortableChangeGroup extends SortableElement(() => {}) {
  render () {
    let { tafChangeGroup, focusedFieldName, inputRef, index, validationReport } = this.props;
    return (<ChangeGroup
      ref='sortablechangegroup'
      tafChangeGroup={tafChangeGroup}
      focusedFieldName={focusedFieldName}
      inputRef={inputRef}
      index={index}
      editable
      validationReport={validationReport}
    />);
  }
};

SortableChangeGroup.defaultProps = {
  tafChangeGroup: cloneDeep(TAF_TEMPLATES.CHANGE_GROUP),
  focusedFieldName: null,
  inputRef: () => {},
  index: -1,
  validationReport: null
};

SortableChangeGroup.propTypes = {
  tafChangeGroup: TAF_TYPES.CHANGE_GROUP.isRequired,
  focusedFieldName: PropTypes.string,
  inputRef: PropTypes.func,
  index: PropTypes.number,
  validationReport: PropTypes.object
};

export default SortableChangeGroup;
