import React from 'react';
import ResponsiveTafTable from './ResponsiveTafTable';
import { mount } from 'enzyme';

describe('(Container) Taf/ResponsiveTafTable.jsx', () => {
  it('Renders a ResponsiveTafTable', () => {
    const _component = mount(<ResponsiveTafTable />);
    expect(_component.type()).to.eql(ResponsiveTafTable);
  });
});
