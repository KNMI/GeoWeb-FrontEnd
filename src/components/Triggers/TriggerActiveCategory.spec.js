import React from 'react';
import TriggerActiveCategory from './TriggerActiveCategory';
import { mount } from 'enzyme';

describe('(Container) TriggerActiveCategory', () => {
  it('Renders a TriggerActiveCategory', () => {
    const _component = mount(<TriggerActiveCategory icon='star' activeTriggersList={[]} title='test' urls={{}} />);
    expect(_component.type()).to.eql(TriggerActiveCategory);
  });
});
