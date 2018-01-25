import React from 'react';
import { default as SmallLayerManagerPanel } from './SmallLayerManagerPanel';
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

  panelsProperties: {
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
        panelsProperties: []
      },
      {
        overlays: [],
        panelsProperties: []
      },
      {
        overlays: [],
        panelsProperties: []
      },
      {
        overlays: [],
        panelsProperties: []
      }
    ]
  }
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = {};

const evt = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
  view: window
});

describe('(Component) SmallLayerManagerPanel', () => {
  it('Renders a SmallLayerManagerPanel', () => {
    const _component = mount(<SmallLayerManagerPanel
      adagucProperties={state.adagucProperties}
      mapProperties={state.mapProperties} panelsProperties={state.panelsProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(SmallLayerManagerPanel);
  });
  it('Renders with 5 buttons', () => {
    const _component = mount(<SmallLayerManagerPanel
      adagucProperties={state.adagucProperties}
      mapProperties={state.mapProperties} panelsProperties={state.panelsProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.type()).to.eql(SmallLayerManagerPanel);
    expect(_component.find('.btn').length).to.eql(6);
  });
  it('Allows for triggering visibility of buttons', () => {
    const _component = mount(<SmallLayerManagerPanel
      adagucProperties={state.adagucProperties}
      mapProperties={state.mapProperties} panelsProperties={state.panelsProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    expect(_component.find('.btn').length).to.eql(6);
    _component.instance().toggle(evt);
    expect(_component.find('.btn').length).to.eql(2);
  });
});
