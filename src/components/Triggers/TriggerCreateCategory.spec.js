import React from 'react';
import TriggerCreateCategory from './TriggerCreateCategory';
import { mount } from 'enzyme';

describe('(Component) TriggerCreateCategory', () => {
  it('Renders a TriggerCreateCategory', () => {
    const _component = mount(<TriggerCreateCategory icon='star' title='test' urls={{}} />);
    expect(_component.type()).to.eql(TriggerCreateCategory);
  });
});
