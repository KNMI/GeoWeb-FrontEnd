import React from 'react';
import TriggerTestCategory from './TriggerTestCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerTestCategory', () => {
  it('Renders a TriggerTestCategory', () => {
    const _component = mount(<TriggerTestCategory icon='star' notify={() => {}} />);
    expect(_component.type()).to.eql(TriggerTestCategory);
  });
});
