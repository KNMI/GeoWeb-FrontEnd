import React from 'react';
import { default as TimeseriesComponent } from './TimeseriesComponent';
import { mount } from 'enzyme';

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
const emptyActions = {};

describe('(Component) TimeseriesComponent', () => {
  it('Renders a TimeseriesComponent', () => {
    const _component = mount(<TimeseriesComponent
      layers={state.layers}
      adagucProperties={state.adagucProperties}
      dispatch={emptyDispatch} actions={emptyActions} isOpen={false} />);
    expect(_component.type()).to.eql(TimeseriesComponent);
  });
});
