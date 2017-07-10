import React from 'react';
import { default as TriggersContainer } from './TriggersContainer';
import { mount } from 'enzyme';

const emptyDispatch = () => null;
const emptyActions = { setGeoJSON: () => null };

describe('(Container) TriggersContainer', () => {
  it('Renders a TriggersContainer', () => {
    const _component = mount(<TriggersContainer dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(TriggersContainer);
  });
});
