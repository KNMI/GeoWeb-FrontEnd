import React from 'react';
import SigmetParameterManagementPanel from './SigmetParameterManagementPanel';
import Panel from '../Panel';
import { mount, shallow } from 'enzyme';
import moxios from 'moxios';

describe('(Component) SigmetParameterManagementPanel', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  const sigmetObj = {
    maxhoursofvalidity: 4,
    hoursbeforevalidity: 4,
    location_indicator_wmo: 'EHDB',
    firareas: [
      {
        firname: 'AMSTERDAM FIR',
        areapreset: 'NL_FIR',
        location_indicator_icao: 'EHAA'
      }
    ]
  };
  it('Shallow renders a Panel', (done) => {
    const _component = shallow(<SigmetParameterManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} sigmetParameters={sigmetObj} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: null
      }).then(() => {
        expect(_component.type()).to.equal(Panel);
        done();
      }).catch(done);
    });
  });
  it('Renders an SigmetParameterManagementPanel', (done) => {
    const _component = mount(<SigmetParameterManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} sigmetParameters={sigmetObj} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: {
          maxhoursofvalidity: 4.0,
          hoursbeforevalidity: 4.0,
          firareas: [{ location_indicator_icao: 'EHAA', firname: 'FIR AMSTERDAM', areapreset: 'NL_FIR' }],
          location_indicator_wmo: 'EHDB'
        }
      }).then(() => {
        expect(_component.type()).to.equal(SigmetParameterManagementPanel);
        done();
      }).catch(done);
    });
  });
});
