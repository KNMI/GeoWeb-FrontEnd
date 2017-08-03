import React from 'react';
import { default as FooteredLayout } from './FooteredLayout';
import { shallow } from 'enzyme';

describe('(Layout) FooteredLayout', () => {
  it('Renders a Reactstrap Container', () => {
    const _component = shallow(<FooteredLayout route={{}} />);
    expect(_component.type()).to.eql('div');
  });
});
