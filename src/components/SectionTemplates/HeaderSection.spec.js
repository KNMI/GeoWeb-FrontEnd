import React from 'react';
import HeaderSection from './HeaderSection';
import { mount } from 'enzyme';

describe('(Component) SectionTemplates/HeaderSection', () => {
  it('renders a HeaderSection', () => {
    const _component = mount(<HeaderSection><div /></HeaderSection>);
    expect(_component.type()).to.eql(HeaderSection);
  });
});
