import React from 'react';
import { default as TafExampleTafManagementPanel } from './TafExampleTafManagementPanel';
import { mount } from 'enzyme';

describe('(Component) TafExampleTafManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TafExampleTafManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
  });
  it('Renders a TafExampleTafManagementPanel', () => {
    expect(_component.type()).to.eql(TafExampleTafManagementPanel);
  });
});
