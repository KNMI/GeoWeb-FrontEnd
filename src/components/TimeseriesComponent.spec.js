import React from 'react';
import { default as TimeseriesComponent } from './TimeseriesComponent';
import { mount } from 'enzyme';

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  },
  cursor: {
    location: {
      name: 'EHAM',
      x: 4.77,
      y: 52.3
    }
  },
  timedim: '2017-04-06T21:00:00Z'
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = {};

describe('(Component) TimeseriesComponent', () => {
  it('Renders a TimeseriesComponent', () => {
    const _component = mount(<TimeseriesComponent adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(TimeseriesComponent);
  });
});
