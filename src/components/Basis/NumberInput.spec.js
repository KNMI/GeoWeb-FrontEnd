import React from 'react';
import NumberInput from './NumberInput';
import { mount } from 'enzyme';

describe('(Component) Basis/NumberInput', () => {
  it('renders a NumberInput', () => {
    const _component = mount(<NumberInput data-field='test' value={3} placeholder={'Enter a value'} />);
    expect(_component.type()).to.eql(NumberInput);
  });
  it('renders a NumberInput disabled', () => {
    const _component = mount(<NumberInput data-field='test' value={3} placeholder={'Enter a value'} disabled />);
    expect(_component.type()).to.eql(NumberInput);
  });
  it('handles changes', () => {
    let value = '0';
    const onChange = (evt, newValue) => { value = newValue; };
    const _component = mount(<NumberInput data-field='test' value={value} placeholder={'Enter a value'} min={0} max={5} onChange={onChange} />);
    expect(_component.type()).to.eql(NumberInput);
    const input = _component.find('input');
    input.simulate('change', { target: { value: 4 } });
    expect(value).to.eql('4');
    input.simulate('change', { target: { value: 6 } });
    expect(value).to.eql('4');
    input.simulate('change', { target: { value: 3 } });
    expect(value).to.eql('3');
    input.simulate('change', { target: { value: '' } });
    expect(value).to.eql(null);
    input.simulate('change', { target: { value: '5' } });
    expect(value).to.eql('5');
  });
});
