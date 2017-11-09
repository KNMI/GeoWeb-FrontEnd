import React from 'react';
import TimeSchedule from './TimeSchedule';
import moment from 'moment';
import { mount } from 'enzyme';

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule', () => {
    const _component = mount(<TimeSchedule />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with range end before start', () => {
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().add(6, 'hour'), end: moment().utc().subtract(6, 'hour'), value: value, styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with range start before scope start', () => {
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().subtract(24, 'hour'), end: moment().utc().add(6, 'hour'), value: value, styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with range start after scope end', () => {
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().add(24, 'hour'), end: moment().utc().add(25, 'hour'), value: value, styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with range end after scope end', () => {
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: moment().utc().add(6, 'hour'), end: moment().utc().add(24, 'hour'), value: value, styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with range start equal to end', () => {
    const time = moment().utc().subtract(6, 'hour');
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: time, end: time, value: value, styles: [] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with an scheduleLabel style', () => {
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: moment().utc(), end: moment().utc().add(8, 'hour'), value: value, styles: ['scheduleLabel'] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });

  it('Renders a TimeSchedule with an striped style', () => {
    const value = <span>Default value</span>;
    const series = [ { label: 'default label', ranges: [ { start: moment().utc(), end: moment().utc().add(8, 'hour'), value: value, styles: ['striped'] } ] } ];
    const _component = mount(<TimeSchedule series={series} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});
