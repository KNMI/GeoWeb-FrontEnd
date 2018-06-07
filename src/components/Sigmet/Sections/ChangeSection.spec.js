import React from 'react';
import ChangeSection from './ChangeSection';
import { mount } from 'enzyme';

describe('(Component) Sigmet/ChangeSection', () => {
  it('renders a ChangeSection', () => {
    const _component = mount(<ChangeSection><div /></ChangeSection>);
    expect(_component.type()).to.eql(ChangeSection);
  });
});
