import React from 'react';
import Switch from './Switch';
import { mount } from 'enzyme';

describe('(Component) Basis/Switch', () => {
  it('renders a Switch', () => {
    const _component = mount(<Switch data-field='test' checkedOption={{ optionId: '0', label: 'checked' }} unCheckedOption={{ optionId: '1', label: 'unChecked' }} />);
    expect(_component.type()).to.eql(Switch);
  });
});
