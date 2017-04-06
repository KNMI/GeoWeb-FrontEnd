import React from 'react';
import { default as MapPanel } from './MapPanel';
import { mount } from 'enzyme';
import sinon from 'sinon';

const adagucProperties = {
  wmjslayers: {
    layers: [],
    baselayers: [],
    overlays: []
  },
  adagucmapdraw: {
    geojson: { 'type': 'FeatureCollection',
      'features': [
        { 'type': 'Feature',
          'geometry': {
            'type': 'Polygon',
            'coordinates': []
          },
          'properties': {
            'prop0': 'value0',
            'prop1': { 'this':  'that' }
          }
        }
      ]
    }
  }
};

const emptyDispatch = () => {};
const emptyActions = {};

describe('(Component) MapPanel', () => {
  it('Renders a MapPanel', () => {
    global.WMJSMap = sinon.stub().returns({});
    global.localStorage = sinon.stub();
    global.localStorage.getItem = sinon.stub();
    global.localStorage.setItem = sinon.stub();
    const _component = mount(<MapPanel adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(MapPanel);
  });
});
