import React from 'react';
import Checkbox from './Checkbox';
import { mount } from 'enzyme';

describe('(Component) Basis/Checkbox', () => {
  it('renders a Checkbox', () => {
    const _component = mount(<Checkbox data-field='test' option={{ optionId: '0', label: 'checked' }} />);
    expect(_component.type()).to.eql(Checkbox);
  });
});
