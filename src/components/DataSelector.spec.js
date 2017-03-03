import React from 'react';
// eslint-disable-next-line no-unused-vars
import { default as DataSelector } from './DataSelector';
import { shallow } from 'enzyme';
import { push as Menu } from 'react-burger-menu';

describe('(Component) DataSelector', () => {
  it('Renders a React Burger Menu', () => {
    const _component = shallow(<DataSelector adagucProperties={{}} menuItems={{}} dispatch={() => {}} />);
    expect(_component.type()).to.eql(Menu);
  });
});
