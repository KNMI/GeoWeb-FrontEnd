import React from 'react';
import { default as NumberSpinner } from './NumberSpinner';
import { mount, shallow } from 'enzyme';

describe('(Component) NumberSpinner', () => {
  it('Renders a div', () => {
    const _component = shallow(<NumberSpinner />);
    expect(_component.type()).to.eql('div');
  });

  it('Formats to at least two digits', () => {
    let _component = mount(<NumberSpinner value={'2'} />);
    expect(_component.find('input').first().props().value).to.have.length.of.at.least(2);
    _component = mount(<NumberSpinner value={'200'} />);
    expect(_component.find('input').first().props().value).to.have.length.of.at.least(2);
  });

  it('Returns a month string when given a valid month', () => {
    const _component = mount(<NumberSpinner value={10} renderAsMonth />);
    expect(_component.find('input').first().props().value).to.equal('OCT');
  });

  it('Returns 0 string when given an invalid month', () => {
    const _component = mount(<NumberSpinner value={22} renderAsMonth />);
    expect(_component.find('input').first().props().value).to.equal('0');
  });

  it('Increments when the up button is clicked', () => {
    let _component = mount(<NumberSpinner value={10} renderAsMonth />);
    _component.find('#incNumberspinner').simulate('click');
    expect(_component.find('input').first().props().value).to.equal('NOV');
    _component = mount(<NumberSpinner value={10} />);
    _component.find('#incNumberspinner').simulate('click');
    expect(_component.find('input').first().props().value).to.equal('11');
  });

  it('Decrements when the up button is clicked', () => {
    let _component = mount(<NumberSpinner value={10} renderAsMonth />);
    _component.find('#decNumberspinner').simulate('click');
    expect(_component.find('input').first().props().value).to.equal('SEP');
    _component = mount(<NumberSpinner value={10} />);
    _component.find('#decNumberspinner').simulate('click');
    expect(_component.find('input').first().props().value).to.equal('09');
  });
});
