import React from 'react';
import TriggerCreateTestCategory from './TriggerCreateTestCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerCreateTestCategory', () => {
  it('Renders a TriggerCreateTestCategory', () => {
    const _component = mount(<TriggerCreateTestCategory icon='star' notify={() => {}} />);
    expect(_component.type()).to.eql(TriggerCreateTestCategory);
  });
});
