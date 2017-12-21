import React from 'react';
import TafCell from './TafCell';
import { mount } from 'enzyme';

describe('(Component) Taf/TafCell.jsx', () => {
  it('Renders an empty TafCell', () => {
    const _component = mount(<TafCell />);
    expect(_component.type()).to.eql(TafCell);
  });
  it('Renders a TafCell', () => {
    const _component = mount(<TafCell name='TestTafCell' value='TestValue' disabled autoFocus isButton />);
    expect(_component.type()).to.eql(TafCell);
  });

  it('Renders an editable TafCell', () => {
    const _component = mount(<TafCell name='TestTafCell' value='TestValue' editable />);
    expect(_component.type()).to.eql(TafCell);
  });
});
