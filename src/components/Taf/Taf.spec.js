import React from 'react';
import Taf from './Taf';
import { mount } from 'enzyme';

describe('(Container) Taf/Taf.jsx', () => {
  it('Renders a Taf', () => {
    const _component = mount(<Taf />);
    expect(_component.type()).to.eql(Taf);
  });

  it('Renders an editable Taf', () => {
    const _component = mount(<Taf tafEditable />);
    expect(_component.type()).to.eql(Taf);
  });

  it('Renders concept Tafs', () => {
    const _component = mount(<Taf source={'http://localhost:8080/tafs?active=false&status=concept'} />);
    expect(_component.type()).to.eql(Taf);
  });

  it('Handles triggering selectLocation', () => {
    const _component = mount(<Taf editable />);
    _component.setState({ tafLocations: ['A', 'B', 'C'], tafSelectedLocation: 'A' });
    const buttons = _component.find('button[data-location]');
    expect(buttons).to.have.length(3);
    const buttonA = buttons.first();
    expect(buttonA.hasClass('active')).to.eql(true);
    const buttonB = buttons.at(1);
    expect(buttonB.hasClass('active')).to.eql(false);
    expect(buttonB.prop('data-location')).to.eql('B');
    buttonB.simulate('click');
    expect(buttonA.hasClass('active')).to.eql(false);
    expect(buttonB.hasClass('active')).to.eql(true);
  });

  it('Handles triggering setStatusFilter', () => {
    const _component = mount(<Taf />);
    _component.setState({ tafTypeSelections: ['NORMAL'] });
    const buttons = _component.find('button[data-status]');
    expect(buttons).to.have.length(6);
    const buttonORG = buttons.at(0);
    expect(buttonORG.hasClass('active')).to.eql(true);
    const buttonCOR = buttons.at(2);
    expect(buttonCOR.hasClass('active')).to.eql(false);
    expect(buttonCOR.prop('data-status')).to.eql('CORRECTION');
    buttonCOR.simulate('click');
    expect(buttonORG.hasClass('active')).to.eql(true);
    expect(buttonCOR.hasClass('active')).to.eql(true);
    buttonORG.simulate('click');
    expect(buttonORG.hasClass('active')).to.eql(false);
    expect(buttonCOR.hasClass('active')).to.eql(true);
  });
});
