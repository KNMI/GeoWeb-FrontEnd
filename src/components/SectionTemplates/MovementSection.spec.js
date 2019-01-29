import React from 'react';
import MovementSection from './MovementSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/MovementSection', () => {
  it('renders a MovementSection', () => {
    const _component = mount(<MovementSection><div /></MovementSection>);
    expect(_component.type()).to.eql(MovementSection);
  });
});
