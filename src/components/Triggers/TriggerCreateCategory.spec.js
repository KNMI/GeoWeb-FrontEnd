import React from 'react';
import TriggerCreateCategory from './TriggerCreateCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerCreateCategory', () => {
  it('Renders a TriggerCreateCategory', () => {
    const _component = mount(<TriggerCreateCategory icon='star' />);
    expect(_component.type()).to.eql(TriggerCreateCategory);
  });
});
