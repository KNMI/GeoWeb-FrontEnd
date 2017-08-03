import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as HeaderedLayout } from './HeaderedLayout';
import { shallow } from 'enzyme';

describe('(Layout) HeaderedLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<HeaderedLayout route={{}} />);
    expect(_component.type()).to.eql('div');
  });
});
