import React from 'react';
import { default as TafExampleTafManagementPanel } from './TafExampleTafManagementPanel';
import { mount } from 'enzyme';
import moxios from 'moxios';

describe('(Component) TafExampleTafManagementPanel', () => {
  let _component;
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('Renders a TafExampleTafManagementPanel', (done) => {
    _component = mount(<TafExampleTafManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          payload: []
        }
      }).then(() => {
        expect(_component.type()).to.eql(TafExampleTafManagementPanel);
        done();
      }).catch(done);
    });
  });
});
