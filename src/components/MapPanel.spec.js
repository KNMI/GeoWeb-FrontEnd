import React from 'react';
import { default as MapPanel } from './MapPanel';
import { mount } from 'enzyme';
import sinon from 'sinon';

const adagucProperties = {
  layers: {
    baselayer: {},
    panel: [
      {
        baselayers: [],
        overlays: []
      }, {
        baselayers: [],
        overlays: []
      }, {
        baselayers: [],
        overlays: []
      }, {
        baselayers: [],
        overlays: []
      }
    ]
  },
  wmjslayers: {
    layers: [],
    baselayers: [{}]
  },
  adagucmapdraw: {
    geojson: { type: 'FeatureCollection',
      features: [
        { type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: []
          },
          properties: {
            prop0: 'value0',
            prop1: { this: 'that' }
          }
        }
      ]
    }
  }
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = { /* intentionally left blank */ };

describe('(Component) MapPanel', () => {
  it('Renders a MapPanel', () => {
    global.WMJSMap = sinon.stub().returns({});
    const _component = mount(<MapPanel adagucProperties={adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(MapPanel);
  });
});
