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

  it('Can read from backend', (done) => {
    const callback = sinon.spy();
    ReadLocations(callback);
    moxios.wait(function () {
      const req = moxios.stubRequest(BACKEND_SERVER_URL + '/admin/read');
      if (!req) { done(); return; }
      req.respondWith({
        status: 200,
        response: {
          payload: 'admin.spec.js.hi'
        }
      }).then(() => {
        done();
      });
    });
  });

  it('Can store locations', (done) => {
    SaveLocations({ name: 'asdf' });
    moxios.wait(function () {
      const request = moxios.stubRequest(BACKEND_SERVER_URL + '/admin/create');
      if (!request) { done(); return; }
      request.respondWith({
        status: 200,
        response: {
          message: 'ok'
        }
      }).then(() => {
        done();
      });
    });
  });
});
