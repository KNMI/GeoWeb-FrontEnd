import React from 'react';
import SigmetParameterManagementPanel from './SigmetParameterManagementPanel';
import Panel from '../Panel';
import { mount, shallow } from 'enzyme';

describe('(Component) SigmetParameterManagementPanel', () => {
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
  it('Shallow renders a Panel', () => {
    const _component = shallow(<SigmetParameterManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} sigmetParameters={sigmetObj} />);
    expect(_component.type()).to.equal(Panel);
  });
  it('Renders an SigmetParameterManagementPanel', () => {
    const _component = mount(<SigmetParameterManagementPanel urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }} sigmetParameters={sigmetObj} />);
    expect(_component.type()).to.equal(SigmetParameterManagementPanel);
  });
});
