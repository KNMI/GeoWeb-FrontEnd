import React from 'react';
import TimeSchedule from './TimeSchedule';
import { mount } from 'enzyme';

describe('(Container) TimeSchedule', () => {
  it('Renders a TimeSchedule', () => {
    const _component = mount(<TimeSchedule />);
    expect(_component.type()).to.eql(TimeSchedule);
  });
});
