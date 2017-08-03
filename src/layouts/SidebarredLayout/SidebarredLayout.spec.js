import React from 'react';
import { default as SidebarredLayout } from './SidebarredLayout';
import { shallow } from 'enzyme';
describe('(Layout) SidebarredLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<SidebarredLayout route={{}} />);
    expect(_component.type()).to.eql('div');
  });
});
