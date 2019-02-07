import React from 'react';
import EndPositionSection from './EndPositionSection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/EndPositionSection', () => {
  it('renders a EndPositionSection', () => {
    const _component = mount(<EndPositionSection><div /></EndPositionSection>);
    expect(_component.type()).to.eql(EndPositionSection);
  });
});
