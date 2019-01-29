import React from 'react';
import DrawSection from './DrawSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/DrawSection', () => {
  it('renders a DrawSection', () => {
    const _component = mount(<DrawSection><div /></DrawSection>);
    expect(_component.type()).to.eql(DrawSection);
  });
});
