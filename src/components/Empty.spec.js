import React from 'react';
import Empty from './Empty';
import { shallow } from 'enzyme';

describe('(Component) Empty', () => {
  it('Renders a div', () => {
    const _component = shallow(<Empty />);
    expect(_component.type()).to.eql('div');
  });
});
