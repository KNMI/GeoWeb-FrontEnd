import React from 'react';
import OldTriggerCategory from './OldTriggerCategory';
import { mount } from 'enzyme';

describe('(Container) OldTriggerCategory', () => {
  it('Renders a OldTriggerCategory', () => {
    const _component = mount(<OldTriggerCategory icon='star' />);
    expect(_component.type()).to.eql(OldTriggerCategory);
  });
});
