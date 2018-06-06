import React from 'react';
import HeightSection from './HeightSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/HeightSection', () => {
  it('renders a HeightSection', () => {
    const _component = mount(<HeightSection><div /></HeightSection>);
    expect(_component.type()).to.eql(HeightSection);
  });
});
