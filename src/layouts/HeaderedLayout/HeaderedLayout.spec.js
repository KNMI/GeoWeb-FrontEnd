import React from 'react';
import HeaderedLayout from './HeaderedLayout';
import { shallow, mount } from 'enzyme';
import { Col } from 'reactstrap';

describe('(Layout) HeaderedLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<HeaderedLayout route={{}} />);
    expect(_component.type()).to.eql(Col);
  });

  it('Renders a HeaderedLayout', () => {
    const _component = mount(<HeaderedLayout route={{}} />);
    expect(_component.type()).to.eql(HeaderedLayout);
  });

  it('Renders a HeaderedLayout', () => {
    const _component = mount(<HeaderedLayout route={{ header: <span /> }} />);
    expect(_component.type()).to.eql(HeaderedLayout);
  });
});
