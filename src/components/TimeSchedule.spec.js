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
    const items = [ { start: moment().utc().add(6, 'hour'), end: moment().utc().subtract(6, 'hour'), group: 'default group', value: 'default value' } ];
    const _component = mount(<TimeSchedule items={items} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item start before scope start', () => {
    const items = [ { start: moment().utc().subtract(24, 'hour'), end: moment().utc().add(6, 'hour'), group: 'default group', value: 'default value' } ];
    const _component = mount(<TimeSchedule items={items} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item start after scope end', () => {
    const items = [ { start: moment().utc().add(24, 'hour'), end: moment().utc().add(25, 'hour'), group: 'default group', value: 'default value' } ];
    const _component = mount(<TimeSchedule items={items} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item end after scope end', () => {
    const items = [ { start: moment().utc().subtract(12, 'hour'), end: moment().utc().add(24, 'hour'), group: 'default group', value: 'default value' } ];
    const _component = mount(<TimeSchedule items={items} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule with item start equal to end', () => {
    const time = moment().utc().subtract(6, 'hour');
    const items = [ { start: time, end: time, group: 'default group', value: 'default value' } ];
    const _component = mount(<TimeSchedule items={items} />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});
