import React from 'react';
import CompactedHeightsSection from './CompactedHeightsSection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/CompactedHeightsSection', () => {
  it('renders a CompactedHeightsSection', () => {
    const _component = mount(<CompactedHeightsSection><div /></CompactedHeightsSection>);
    expect(_component.type()).to.eql(CompactedHeightsSection);
  });
});
