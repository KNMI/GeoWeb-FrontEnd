import React from 'react';
import BaseForecast from './BaseForecast';
import { mount } from 'enzyme';

let baseForecastValue = {
};

describe('(Container) Taf/BaseForecast.jsx', () => {
  it('Renders a BaseForecast', () => {
    const _component = mount(<BaseForecast value={baseForecastValue} />);
    expect(_component.type()).to.eql(BaseForecast);
  });
});
