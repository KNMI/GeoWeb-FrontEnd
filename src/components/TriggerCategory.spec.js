import React from 'react';
import TriggerCategory from './TriggerCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerCategory', () => {
  it('Renders a TriggerCategory', () => {
    const _component = mount(<TriggerCategory icon='star' />);
    expect(_component.type()).to.eql(TriggerCategory);
  });
});
