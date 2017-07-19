import React from 'react';
import { default as MapPanel } from './MapPanel';
import { mount } from 'enzyme';
import sinon from 'sinon';

const state = {
  adagucProperties: {
    animate: false,
    sources: {},
    timeDimension: '2017-07-19T11:32:03Z',
    cursor: null
  },
  mapProperties: {
    mapCreated: false,
    activeMapId: 0,
    layout: 'single',
    mapMode: 'pan',
    projectionName: 'EPSG:3857',
    boundingBox: {
      title: 'Netherlands',
      bbox: [
        314909.3659069278,
        6470493.345653814,
        859527.2396033217,
        7176664.533565958
      ]
    }
  },
  drawProperties: {
    geojson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: []
          },
          properties: {
            prop0: 'value0',
            prop1: {
              'this': 'that'
            }
          }
        }
      ]
    },
    measureDistance: {
      isInEditMode: false
    }
  },

  layers: {
    wmjsLayers: [],
    baselayer: {
      service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
      name: 'streetmap',
      title: 'OpenStreetMap',
      format: 'image/gif',
      enabled: true
    },
    panels: [
      {
        overlays: [],
        layers: []
      },
      {
        overlays: [],
        layers: []
      },
      {
        overlays: [],
        layers: []
      },
      {
        overlays: [],
        layers: []
      }
    ]
  }
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = { /* intentionally left blank */ };

describe('(Component) MapPanel', () => {
  it('Renders a MapPanel', () => {
    global.WMJSMap = sinon.stub().returns({
      addListener: () => null,
      setTimeOffset: () => null,
      stopAnimating: () => null,
      setActive: () => null,
      draw: () => null
    });
    const _component = mount(<MapPanel
      adagucProperties={state.adagucProperties}
      drawProperties={state.drawProperties}
      mapProperties={state.mapProperties}
      layers={state.layers}
      dispatch={emptyDispatch}
      actions={emptyActions} />);
    expect(_component.type()).to.eql(MapPanel);
  });
});
