import React from 'react';
import TafTable from './TafTable';
import { mount } from 'enzyme';
import { TestTafJSON } from './TestTafJSON.js';
describe('(Container) Taf/TafTable.jsx', () => {
  it('Renders a TafTable', () => {
    const _component = mount(<TafTable />);
    expect(_component.type()).to.eql(TafTable);
  });

  it('Renders a TafTable with SortableChangeGroups', () => {
    const _component = mount(<TafTable
      ref={'taftable'}
      validationReport={{}}
      tafJSON={TestTafJSON}
      onSortEnd={() => {}}
      onChange={() => {}}
      onKeyUp={() => {}}
      onAddRow={() => {}}
      onDeleteRow={() => {}}
      editable
      onFocusOut={() => {}} />
    );
    expect(_component.type()).to.eql(TafTable);
  });
});
