import React from 'react';
import SigmetMinifiedMode from './SigmetMinifiedMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

const sigmet = {
  phenomenon: 'TEST',
  levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] },
  va_extra_fields: {
    volcano: {}
  }
};

describe('(Component) SigmetMinifiedMode', () => {
  it('mount renders a SigmetMinifiedMode', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = mount(<SigmetMinifiedMode sigmet={sigmet} abilities={abilities} />);
    expect(_component.type()).to.eql(SigmetMinifiedMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = shallow(<SigmetMinifiedMode sigmet={sigmet} abilities={abilities} />);
    expect(_component.type()).to.eql(Button);
  });
});
