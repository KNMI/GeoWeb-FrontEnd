import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as HeaderedLayout } from './HeaderedLayout';
import { shallow, mount } from 'enzyme';

describe('(Layout) HeaderedLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<HeaderedLayout route={{}} />);
    expect(_component.type()).to.eql('div');
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
