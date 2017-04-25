import React from 'react';
import SigmetParameterManagementPanel from './SigmetParameterManagementPanel';
import Panel from '../Panel';
import { mount, shallow } from 'enzyme';

describe('(Component) SigmetParameterManagementPanel', () => {
  it('Shallow renders a Panel', () => {
    const _component = shallow(<SigmetParameterManagementPanel />);
    expect(_component.type()).to.equal(Panel);
  });
  it('Renders an SigmetParameterManagementPanel', () => {
    const _component = mount(<SigmetParameterManagementPanel />);
    expect(_component.type()).to.equal(SigmetParameterManagementPanel);
  });
});
