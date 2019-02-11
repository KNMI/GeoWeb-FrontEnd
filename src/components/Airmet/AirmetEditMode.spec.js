import React from 'react';
import AirmetEditMode from './AirmetEditMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

describe('(Component) AirmetEditMode', () => {
  it('mount renders a AirmetEditMode', () => {
    const airmet = {
      phenomenon: 'TEST',
      levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] }
    };
    const abilities = { isClearable: true, isDiscardable: true, isPastable: true, isSavable: true };
    const actions = { verifyAirmetAction: () => {} };
    const dispatch = () => {};
    const _component = mount(<AirmetEditMode availablePhenomena={[]} availableFirs={[]} obscuring={[]} airmet={airmet} abilities={abilities} actions={actions} dispatch={dispatch} />);
    expect(_component.type()).to.eql(AirmetEditMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const airmet = {
      phenomenon: 'TEST',
      levelinfo: { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] }
    };
    const abilities = { isClearable: true, isDiscardable: true, isPastable: true, isSavable: true };
    const actions = { verifyAirmetAction: () => {} };
    const dispatch = () => {};
    const _component = shallow(<AirmetEditMode availablePhenomena={[]} availableFirs={[]} obscuring={[]} airmet={airmet} abilities={abilities} actions={actions} dispatch={dispatch} />);
    expect(_component.type()).to.eql(Button);
  });
});
