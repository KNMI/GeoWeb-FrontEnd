import React from 'react';
import AirmetMinifiedMode from './AirmetMinifiedMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

const airmet = {
  phenomenon: 'TEST',
  levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] },
  va_extra_fields: {
    volcano: {}
  }
};

describe('(Component) AirmetMinifiedMode', () => {
  it('mount renders a AirmetMinifiedMode', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = mount(<AirmetMinifiedMode airmet={airmet} abilities={abilities} />);
    expect(_component.type()).to.eql(AirmetMinifiedMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = shallow(<AirmetMinifiedMode airmet={airmet} abilities={abilities} />);
    expect(_component.type()).to.eql(Button);
  });
});
