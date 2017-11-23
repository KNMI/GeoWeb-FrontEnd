import React from 'react';
import BaseForecast from './BaseForecast';
import { mount } from 'enzyme';
import { TAF_TEMPLATES } from './TafTemplates';

const baseForecast = TAF_TEMPLATES.FORECAST;
const baseMetadata = TAF_TEMPLATES.METADATA;

describe('(Container) Taf/BaseForecast.jsx', () => {
  it('Renders a BaseForecast', () => {
    const _component = mount(<BaseForecast tafMetadata={baseMetadata} tafForecast={baseForecast} />);
    expect(_component.type()).to.eql(BaseForecast);
  });
});
