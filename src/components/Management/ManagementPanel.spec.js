import React from 'react';
import { default as ManagementPanel } from './ManagementPanel';
import { mount } from 'enzyme';

describe('(Component) ManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<ManagementPanel />);
  });

  it('Can render', () => {
    expect(_component.type()).to.equal(ManagementPanel);
  });
});
