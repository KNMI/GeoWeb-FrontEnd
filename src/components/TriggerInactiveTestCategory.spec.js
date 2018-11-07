import React from 'react';
import TriggerInactiveTestCategory from './TriggerInactiveTestCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerInactiveTestCategory', () => {
  it('Renders a TriggerInactiveTestCategory', () => {
    const _component = mount(<TriggerInactiveTestCategory icon='star' />);
    expect(_component.type()).to.eql(TriggerInactiveTestCategory);
  });
});
