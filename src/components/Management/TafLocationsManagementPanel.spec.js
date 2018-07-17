import React from 'react';
import { default as TafLocationsManagementPanel } from './TafLocationsManagementPanel';
import { mount } from 'enzyme';
import moxios from 'moxios';

describe('(Component) TafLocationsManagementPanel', () => {
  let _component;
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('Renders a TafLocationsManagementPanel', (done) => {
    _component = mount(<TafLocationsManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          payload: []
        }
      }).then(() => {
        expect(_component.type()).to.eql(TafLocationsManagementPanel);
        done();
      }).catch(done);
    });
  });
});
