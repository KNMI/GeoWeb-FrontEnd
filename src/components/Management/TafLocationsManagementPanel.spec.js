import React from 'react';
import { default as TafLocationsManagementPanel } from './TafLocationsManagementPanel';
import { mount } from 'enzyme';

describe('(Component) TafLocationsManagementPanel', () => {
  let _component;
  beforeEach(() => {
    _component = mount(<TafLocationsManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
  });

  it('Renders a TafLocationsManagementPanel', () => {
    expect(_component.type()).to.eql(TafLocationsManagementPanel);
  });
});
