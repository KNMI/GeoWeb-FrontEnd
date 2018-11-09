import React from 'react';
import Inspector from './Inspector';
import { shallow } from 'enzyme';

describe('(Component) Inspector', () => {
  it('Renders a div', () => {
    const _component = shallow(<Inspector title='title' />);
    expect(_component.type()).to.eql('div');
  });
});
