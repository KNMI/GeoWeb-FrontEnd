import React from 'react';
import SigmetsContainer from './SigmetsContainer';
import { mount } from 'enzyme';
import moxios from 'moxios';

describe('(Container) Sigmet/SigmetsContainer', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('renders a SigmetsContainer', (done) => {
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
    const _component = mount(<SigmetsContainer drawProperties={drawProperties} urls={urls} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        expect(_component.type()).to.eql(SigmetsContainer);
        done();
      }).catch(done);
    });
  });
});
