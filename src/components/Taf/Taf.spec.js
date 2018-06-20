import React from 'react';
import Taf from './Taf';
import { mount } from 'enzyme';

describe('(Container) Taf/Taf.jsx', () => {
  it('Renders a Taf', () => {
    const _component = mount(<Taf />);
    expect(_component.type()).to.eql(Taf);
  });

  it('Renders an editable Taf', () => {
    const _component = mount(<Taf editable />);
    expect(_component.type()).to.eql(Taf);
  });
});
