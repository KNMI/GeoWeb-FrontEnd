import { ReadLocations, SaveLocations } from './admin';
import moxios from 'moxios';
import { BACKEND_SERVER_URL } from '../constants/backend';

import sinon from 'sinon';
describe('(Utils) admin', () => {
  beforeEach(() => {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(() => {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });

  it('Can read from backend', () => {
    const callback = sinon.spy();
    moxios.wait(function () {
      const req = moxios.stubRequest(BACKEND_SERVER_URL + '/admin/read');
      req.respondWith({
        status: 200,
        response: {
          payload: 'hi'
        }
      });
    });
    ReadLocations(callback);
  });

  it('Can store locations', () => {
    moxios.wait(function () {
      const request = moxios.stubRequest(BACKEND_SERVER_URL + '/admin/create');
      request.respondWith({
        status: 200,
        response: {
          message: 'ok'
        }
      });
    });
    SaveLocations({ name: 'asdf' });
  });
});
