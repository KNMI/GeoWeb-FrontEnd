import React from 'react';
import AdagucMapDraw from './AdagucMapDraw';
import { shallow } from 'enzyme';

const dispatch = () => { /* intentionally left blank */ };

describe('(Component) AdagucMapDraw', () => {
  it('Renders a div', () => {
    const _component = shallow(<AdagucMapDraw dispatch={dispatch} />);
    expect(_component.type()).to.eql('div');
  });
});
