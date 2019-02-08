import React from 'react';
import ActionSection from './ActionSection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/ActionSection', () => {
  it('renders a ActionSection', () => {
    const _component = mount(<ActionSection><div /></ActionSection>);
    expect(_component.type()).to.eql(ActionSection);
  });
});
