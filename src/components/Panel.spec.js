import React from 'react';
import { default as Panel } from './Panel';
import { shallow } from 'enzyme';

describe('(Container) Panel', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = shallow(<Panel />);
    expect(_component.type()).to.eql('div');
  });
});
