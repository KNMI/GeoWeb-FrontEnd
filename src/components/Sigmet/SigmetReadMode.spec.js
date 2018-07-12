import React from 'react';
import SigmetReadMode from './SigmetReadMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

describe('(Component) SigmetReadMode', () => {
  it('mount renders a SigmetReadMode', () => {
    const _component = mount(<SigmetReadMode />);
    expect(_component.type()).to.eql(SigmetReadMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const _component = shallow(<SigmetReadMode />);
    expect(_component.type()).to.eql(Button);
  });
});
