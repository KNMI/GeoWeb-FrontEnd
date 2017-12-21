import React from 'react';
import TimeseriesComponent from './TimeseriesComponent';
import { mount } from 'enzyme';
import moment from 'moment';

describe('(Component) TimeseriesComponent', () => {
  it('Renders a TimeseriesComponent', () => {
    const location = {
      name: 'EHAM',
      x: 4.77,
      y: 52.3
    };
    const urls = {
      BACKEND_SERVER_URL: ''
    };
    const referenceTime = moment.utc((moment.utc().format('YYYY-MM-DDT06:00:00')));
    const _component = mount(<TimeseriesComponent urls={urls} location={location} referenceTime={referenceTime}
      selectedModel={'HARMONIE'} time={moment.utc()} id={'timeseries0'} />);
    expect(_component.type()).to.eql(TimeseriesComponent);
  });
});
