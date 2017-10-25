import React from 'react';
import TafTable from './TafTable';
import { mount } from 'enzyme';

describe('(Container) Taf/TafTable.jsx', () => {
  it('Renders a TafTable', () => {
    const _component = mount(<TafTable />);
    expect(_component.type()).to.eql(TafTable);
  });
});
