import React from 'react';
import ProgtempComponent from './ProgtempComponent';
import { mount } from 'enzyme';
import moment from 'moment';

describe('(Component) ProgtempComponent', () => {
  it('Renders a ProgtempComponent', () => {
    const location = {
      name: 'EHAM',
      x: 4.77,
      y: 52.3
    };
    const urls = {
      BACKEND_SERVER_URL: ''
    };
    const onError = () => null;
    const referenceTime = moment.utc((moment.utc().format('YYYY-MM-DDT06:00:00')));
    const _component = mount(<ProgtempComponent urls={urls} location={location} referenceTime={referenceTime}
      selectedModel={'Harmonie36'} onError={onError} time={moment.utc().startOf('hour')} className='popover-content' />);
    expect(_component.type()).to.eql(ProgtempComponent);
  });
});
