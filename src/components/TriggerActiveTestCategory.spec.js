import React from 'react';
import TriggerActiveTestCategory from './TriggerActiveTestCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerActiveTestCategory', () => {
  it('Renders a TriggerActiveTestCategory', () => {
    const _component = mount(<TriggerActiveTestCategory icon='star' notify={() => {}} />);
    expect(_component.type()).to.eql(TriggerActiveTestCategory);
  });
});
