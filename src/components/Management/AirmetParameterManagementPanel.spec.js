import React from 'react';
import AirmetParameterManagementPanel from './AirmetParameterManagementPanel';
import Panel from '../Panel';
import { mount, shallow } from 'enzyme';
import moxios from 'moxios';

describe('(Component) AirmetParameterManagementPanel', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  const airmetObj = {
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
    const _component = shallow(<AirmetParameterManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} airmetParameters={airmetObj} />);
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
  it('Renders an AirmetParameterManagementPanel', (done) => {
    const _component = mount(<AirmetParameterManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} airmetParameters={airmetObj} />);
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
        expect(_component.type()).to.equal(AirmetParameterManagementPanel);
        done();
      }).catch(done);
    });
  });
});
