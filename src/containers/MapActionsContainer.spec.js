import React from 'react';
import { default as MapActionsContainer } from './MapActionsContainer';
import { mount } from 'enzyme';

const dispatch = () => {};
const actions = () => {};

describe('(Container) MapActionsContainer', () => {
  it('Renders a ReactStrap Col', () => {
    const _component = mount(<MapActionsContainer adagucProperties={{ mapMode: 'pan' }} dispatch={dispatch} actions={actions} />);
    expect(_component.type()).to.eql(MapActionsContainer);
  });
  it('Adds a data layer', () => {
    const _component = mount(<MapActionsContainer adagucProperties={{ mapMode: 'pan' }} dispatch={dispatch} actions={actions} />);
    expect(_component.type()).to.eql(MapActionsContainer);
  });
});
