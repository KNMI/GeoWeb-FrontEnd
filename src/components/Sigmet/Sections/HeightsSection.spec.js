import React from 'react';
import HeightsSection from './HeightsSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/HeightsSection', () => {
  it('renders a HeightsSection', () => {
    const _component = mount(<HeightsSection><div /></HeightsSection>);
    expect(_component.type()).to.eql(HeightsSection);
  });
});
