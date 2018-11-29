import React from 'react';
import OldTriggersContainer from './OldTriggersContainer';
import { mount } from 'enzyme';

const emptyDispatch = () => null;
const emptyActions = { setGeoJSON: () => null };

describe('(Container) OldTriggersContainer', () => {
  it('Renders a OldTriggersContainer', () => {
    const _component = mount(<OldTriggersContainer dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(OldTriggersContainer);
  });
});
