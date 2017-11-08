import React from 'react';
import TimeSchedule from './TimeSchedule';
import moment from 'moment';
import { mount } from 'enzyme';

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule', () => {
    const _component = mount(<TimeSchedule />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item end before start', () => {
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().add(6, 'hour'), end: moment().utc().subtract(6, 'hour'), value: 'default value', styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item start before scope start', () => {
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().subtract(24, 'hour'), end: moment().utc().add(6, 'hour'), value: 'default value', styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item start after scope end', () => {
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().add(24, 'hour'), end: moment().utc().add(25, 'hour'), value: 'default value', styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item end after scope end', () => {
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().add(24, 'hour'), end: moment().utc().add(24, 'hour'), value: 'default value', styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item start equal to end', () => {
    const time = moment().utc().subtract(6, 'hour');
    const series = [ { label: 'default label', ranges: [ { start: time, end: time, value: 'default value', styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});
