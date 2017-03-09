import React from 'react';
import { default as AdagucMapDraw } from './AdagucMapDraw';
import { shallow } from 'enzyme';

describe('(Component) AdagucMapDraw', () => {
  it('Renders a div', () => {
    const _component = shallow(<AdagucMapDraw />);
    expect(_component.type()).to.eql('div');
  });
});
