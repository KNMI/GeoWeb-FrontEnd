import React from 'react';
import AirmetReadMode from './AirmetReadMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

const airmet = {
  phenomenon: 'TEST',
  levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] }
};

describe('(Component) AirmetReadMode', () => {
  it('mount renders a AirmetReadMode', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = mount(<AirmetReadMode airmet={airmet} obscuring={[]} abilities={abilities} />);
    expect(_component.type()).to.eql(AirmetReadMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = shallow(<AirmetReadMode airmet={airmet} obscuring={[]} abilities={abilities} />);
    expect(_component.type()).to.eql(Button);
  });
});
