import React from 'react';
import { default as TafValidationManagementPanel } from './TafValidationManagementPanel';
import { mount } from 'enzyme';

describe('(Component) TafValidationManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TafValidationManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
  });
  it('Renders a TafValidationManagementPanel', () => {
    expect(_component.type()).to.eql(TafValidationManagementPanel);
  });
});
