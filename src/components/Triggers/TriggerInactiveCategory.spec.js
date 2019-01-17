import React from 'react';
import TriggerInactiveCategory from './TriggerInactiveCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerInactiveCategory', () => {
  it('Renders a TriggerInactiveCategory', () => {
    const _component = mount(<TriggerInactiveCategory icon='star' title='test' />);
    expect(_component.type()).to.eql(TriggerInactiveCategory);
  });
});
