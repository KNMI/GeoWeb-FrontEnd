import React from 'react';
import FirSection from './FirSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/FirSection', () => {
  it('renders a FirSection', () => {
    const _component = mount(<FirSection><div /><div /></FirSection>);
    expect(_component.type()).to.eql(FirSection);
  });
});
