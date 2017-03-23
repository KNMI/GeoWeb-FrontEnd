import React from 'react';
import { default as SmallLayerManagerPanel } from './SmallLayerManagerPanel';
import { mount } from 'enzyme';

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  }
};

const emptyDispatch = () => {};
const emptyActions = {};

const evt = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
  view: window
});

describe('(Component) SmallLayerManagerPanel', () => {
  it('Renders a SmallLayerManagerPanel', () => {
    const _component = mount(<SmallLayerManagerPanel adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(SmallLayerManagerPanel);
  });
  it('Renders with 5 buttons', () => {
    const _component = mount(<SmallLayerManagerPanel adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(SmallLayerManagerPanel);
    expect(_component.find('.btn').length).to.eql(5);
  });
  it('Allows for triggering visibility of buttons', () => {
    const _component = mount(<SmallLayerManagerPanel adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.find('.btn').length).to.eql(5);
    _component.instance().toggle(evt);
    expect(_component.find('.btn').length).to.eql(1);
  });
});
