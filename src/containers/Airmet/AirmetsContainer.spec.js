import React from 'react';
import AirmetsContainer from './AirmetsContainer';
import { mount } from 'enzyme';
import moxios from 'moxios';

describe('(Container) Airmet/AirmetsContainer', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('renders a AirmetsContainer', (done) => {
    const drawProperties = {
      adagucMapDraw: {
        geojson: {
          features: []
        }
      }
    };
    const urls = {
      BACKEND_SERVER_URL: 'http://localhost'
    };
    const _component = mount(<AirmetsContainer drawProperties={drawProperties} urls={urls} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        expect(_component.type()).to.eql(AirmetsContainer);
        done();
      }).catch(done);
    });
  });
});
