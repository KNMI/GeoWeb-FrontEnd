import React from 'react';
import { default as TafValidationManagementPanel } from './TafValidationManagementPanel';
import { mount } from 'enzyme';
import moxios from 'moxios';

describe('(Component) TafValidationManagementPanel', () => {
  let _component;
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('Renders a TafValidationManagementPanel', (done) => {
    _component = mount(<TafValidationManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          '$schema': 'http://json-schema.org/draft-04/schema#',
          'additionalProperties': false,
          'properties': {
            'changegroups': { '$ref': 'changegroup.json#/definitions/changegroups' },
            'forecast': { '$ref': 'forecast.json#/definitions/base_forecast' },
            'metadata': { '$ref': 'metadata.json#/definitions/base_metadata' }
          },
          'required': ['metadata', 'forecast', 'changegroups'],
          'type': 'object'
        }
      }).then(() => {
        expect(_component.type()).to.eql(TafValidationManagementPanel);
        done();
      }).catch(done);
    });
  });
});
