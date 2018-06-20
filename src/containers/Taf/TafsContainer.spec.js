import React from 'react';
import TafsContainer from './TafsContainer';
import { mount } from 'enzyme';

describe('(Container) Taf/TafsContainer', () => {
  it('renders a TafsContainer', () => {
    const _component = mount(<TafsContainer />);
    expect(_component.type()).to.eql(TafsContainer);
  });
});
