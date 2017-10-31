import React from 'react';
import Taf from './Taf';
import { mount } from 'enzyme';
import { TAFS_URL } from '../../constants/backend';

describe('(Container) Taf/Taf.jsx', () => {
  it('Renders a Taf', () => {
    const _component = mount(<Taf />);
    expect(_component.type()).to.eql(Taf);
  });

  it('Renders an editable Taf', () => {
    const _component = mount(<Taf tafEditable />);
    expect(_component.type()).to.eql(Taf);
  });

  it('Renders concept Tafs', () => {
    const _component = mount(<Taf source={TAFS_URL + '/tafs?active=false&status=concept'} />);
    expect(_component.type()).to.eql(Taf);
  });
});
