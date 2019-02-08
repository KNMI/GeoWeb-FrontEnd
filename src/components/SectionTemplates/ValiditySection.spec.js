import React from 'react';
import ValiditySection from './ValiditySection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/ValiditySection', () => {
  it('renders a ValiditySection', () => {
    const _component = mount(<ValiditySection><div /><div /></ValiditySection>);
    expect(_component.type()).to.eql(ValiditySection);
  });
});
