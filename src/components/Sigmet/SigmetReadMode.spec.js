import React from 'react';
import SigmetReadMode from './SigmetReadMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

const sigmet = {
  phenomenon: 'TEST',
  levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] },
  va_extra_fields: {
    volcano: {}
  }
};

describe('(Component) SigmetReadMode', () => {
  it('mount renders a SigmetReadMode', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = mount(<SigmetReadMode sigmet={sigmet} abilities={abilities} />);
    expect(_component.type()).to.eql(SigmetReadMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const abilities = { isCancelable: false, isDeletable: true, isEditable: true, isCopyable: true, isPublishable: true };
    const _component = shallow(<SigmetReadMode sigmet={sigmet} abilities={abilities} />);
    expect(_component.type()).to.eql(Button);
  });
});
