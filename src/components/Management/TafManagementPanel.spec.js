import React from 'react';
import { default as TafManagementPanel } from './TafManagementPanel';
import { mount } from 'enzyme';

describe('(Component) TafManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TafManagementPanel />);
  });
  it('Renders a TafManagementPanel', () => {
    expect(_component.type()).to.eql(TafManagementPanel);
  });
});
