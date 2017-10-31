import React from 'react';
import TACColumn from './TACColumn';
import { mount } from 'enzyme';

describe('(Container) Taf/TACColumn.jsx', () => {
  it('Renders a TACColumn', () => {
    const _component = mount(<TACColumn />);
    expect(_component.type()).to.eql(TACColumn);
  });

  it('Renders a TACColumn with a validationerror for validation in baseforecast', () => {
    let errors = '{"/forecast/visibility/value":["Visibility cannot be greater than 100 kilometers"],"succeeded":"false"}';
    const _component = mount(<TACColumn rowIndex={-1} colIndex={5} validationReport={{ errors:errors }} />);
    expect(_component.type()).to.eql(TACColumn);
  });

  it('Renders a TACColumn with a validationerror for validation in changegroup 1', () => {
    let errors = '{"/changegroups/1/forecast/visibility/value":["Visibility cannot be greater than 100 kilometers"],"succeeded":"false"}';
    const _component = mount(<TACColumn rowIndex={1} colIndex={5} validationReport={{ errors:errors }} />);
    expect(_component.type()).to.eql(TACColumn);
  });
});
