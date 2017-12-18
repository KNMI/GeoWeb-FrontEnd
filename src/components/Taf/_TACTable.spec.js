import React from 'react';
import TACTable from './_TACTable';
import { mount } from 'enzyme';

describe('(Container) Taf/TACTable.jsx', () => {
  it('Renders a TACTable', () => {
    const _component = mount(<TACTable />);
    expect(_component.type()).to.eql(TACTable);
  });
});
