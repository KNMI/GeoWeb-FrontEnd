import React from 'react';
import SidebarredLayout from './SidebarredLayout';
import { shallow } from 'enzyme';
import { Col } from 'reactstrap';

describe('(Layout) SidebarredLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<SidebarredLayout route={{}} />);
    expect(_component.type()).to.eql(Col);
  });
});
