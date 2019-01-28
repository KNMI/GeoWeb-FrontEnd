import React from 'react';
import SigmetEditMode from './SigmetEditMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

describe('(Component) SigmetEditMode', () => {
  it('mount renders a SigmetEditMode', () => {
    const sigmet = {
      phenomenon: 'TEST',
      levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] },
      va_extra_fields: {
        volcano: {}
      }
    };
    const abilities = { isClearable: true, isDiscardable: true, isPastable: true, isSavable: true };
    const actions = { verifySigmetAction: () => {} };
    const dispatch = () => {};
    const _component = mount(<SigmetEditMode availablePhenomena={[]} availableFirs={[]} sigmet={sigmet} abilities={abilities} actions={actions} dispatch={dispatch} />);
    expect(_component.type()).to.eql(SigmetEditMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const sigmet = {
      phenomenon: 'TEST',
      levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] },
      va_extra_fields: {
        volcano: {}
      }
    };
    const abilities = { isClearable: true, isDiscardable: true, isPastable: true, isSavable: true };
    const actions = { verifySigmetAction: () => {} };
    const dispatch = () => {};
    const _component = shallow(<SigmetEditMode availablePhenomena={[]} availableFirs={[]} sigmet={sigmet} abilities={abilities} actions={actions} dispatch={dispatch} />);
    expect(_component.type()).to.eql(Button);
  });
});
