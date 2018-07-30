import React from 'react';
import SigmetEditMode from './SigmetEditMode';
import { mount, shallow } from 'enzyme';
import { Button } from 'reactstrap';

describe('(Component) SigmetEditMode', () => {
  it('mount renders a SigmetEditMode', () => {
    const levelinfo = { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] };
    const abilities = { isClearable: true, isDisardable: true, isPastable: true, isSavable: true };
    const _component = mount(<SigmetEditMode availablePhenomena={[]} availableFirs={[]} levelinfo={levelinfo} abilities={abilities} />);
    expect(_component.type()).to.eql(SigmetEditMode);
  });

  it('shallow renders a ReactStrap Button', () => {
    const levelinfo = { levels: [{ unit: 'FL', value: 4 }, { unit: 'M', value: 4 }] };
    const abilities = { isClearable: true, isDisardable: true, isPastable: true, isSavable: true };
    const _component = shallow(<SigmetEditMode availablePhenomena={[]} availableFirs={[]} levelinfo={levelinfo} abilities={abilities} />);
    expect(_component.type()).to.eql(Button);
  });
});
