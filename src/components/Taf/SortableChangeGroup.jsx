import React from 'react';
import PropTypes from 'prop-types';
import { SortableElement } from 'react-sortable-hoc';
import ChangeGroup from './ChangeGroup';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';

/*
  SortableChangeGroup makes ChangeGroups sortable via Drag and Drop, using SortableElement and SortableContainer.
*/
const SortableChangeGroup = SortableElement(({ tafChangeGroup, focusedFieldName, inputRef, changeGroupIndex }) =>
  <ChangeGroup tafChangeGroup={tafChangeGroup} focusedFieldName={focusedFieldName} inputRef={inputRef} index={changeGroupIndex} editable />
);

SortableChangeGroup.defaultProps = {
  tafChangeGroup: cloneDeep(TAF_TEMPLATES.CHANGE_GROUP),
  focusedFieldName: null,
  inputRef: () => {},
  index: -1
};

SortableChangeGroup.propTypes = {
  tafChangeGroup: TAF_TYPES.CHANGE_GROUP.isRequired,
  focusedFieldName: PropTypes.string,
  inputRef: PropTypes.func,
  index: PropTypes.number
};

export default SortableChangeGroup;
