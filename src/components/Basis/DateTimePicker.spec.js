import React from 'react';
import DateTimePicker from './DateTimePicker';
import moment from 'moment';
import { mount } from 'enzyme';
import { DATETIME_FORMAT } from '../Sigmet/SigmetTemplates';

describe('(Component) Basis/DateTimePicker', () => {
  it('renders a DateTimePicker', () => {
    const _component = mount(<DateTimePicker data-field='test' onChange={() => null}
      value={moment.utc().format(DATETIME_FORMAT)}
      minimum={moment.utc().subtract(1, 'hour').format(DATETIME_FORMAT)}
      maximum={moment.utc().add(1, 'hour').format(DATETIME_FORMAT)} />);
    expect(_component.type()).to.eql(DateTimePicker);
  });
});
