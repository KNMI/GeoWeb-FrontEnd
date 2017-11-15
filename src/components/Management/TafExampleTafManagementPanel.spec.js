import React from 'react';
import { default as TafExampleTafManagementPanel } from './TafExampleTafManagementPanel';
import { mount } from 'enzyme';

describe('(Component) TafExampleTafManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TafExampleTafManagementPanel />);
  });
  it('Renders a TafExampleTafManagementPanel', () => {
    expect(_component.type()).to.eql(TafExampleTafManagementPanel);
  });
});
