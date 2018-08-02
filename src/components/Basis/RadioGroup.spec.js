import React from 'react';
import RadioGroup from './RadioGroup';
import { mount } from 'enzyme';

describe('(Component) Basis/RadioGroup', () => {
  it('renders a RadioGroup', () => {
    const _component = mount(<RadioGroup options={[{ optionId: 0, label: 'checked' }, { optionId: 1, label: 'unChecked' }]} />);
    expect(_component.type()).to.eql(RadioGroup);
  });
});
