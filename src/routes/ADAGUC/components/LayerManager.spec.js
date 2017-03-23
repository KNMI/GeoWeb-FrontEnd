import React from 'react';
import { default as LayerManager } from './LayerManager';
import { mount } from 'enzyme';
describe('(Component) LayerManager', () => {
  it('Renders an empty div without layers', () => {
    const _component = mount(<LayerManager dispatch={() => {}} actions={{}} />);
    expect(_component.type()).to.eql(LayerManager);
  });
});
