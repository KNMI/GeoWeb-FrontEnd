import React from 'react';
import { default as SigmetManagementPanel } from './SigmetManagementPanel';
import { mount } from 'enzyme';

describe('(Component) SigmetManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<SigmetManagementPanel />);
  });
  it('Renders a SigmetManagementPanel', () => {
    expect(_component.type()).to.eql(SigmetManagementPanel);
  });
});
