import React from 'react';
import ProgressSection from './ProgressSection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/ProgressSection', () => {
  it('renders a ProgressSection', () => {
    const _component = mount(<ProgressSection><div /></ProgressSection>);
    expect(_component.type()).to.eql(ProgressSection);
  });
});
