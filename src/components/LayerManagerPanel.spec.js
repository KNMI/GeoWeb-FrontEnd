import React from 'react';
import LayerManagerPanel from './LayerManagerPanel';
import Panel from './Panel';
import { shallow } from 'enzyme';

const state = {
  adagucProperties: {
    animationSettings: {
      animate: false,
      duration: 3
    },
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

describe('(Component) LayerManagerPanel', () => {
  it('Renders a LayerManagerPanel', () => {
    const _component = shallow(<LayerManagerPanel
      mapProperties={state.mapProperties}
      title='title'
      panelsProperties={state.panelsProperties}
      adagucProperties={state.adagucProperties}
      dispatch={emptyDispatch}
      actions={emptyActions} />);
    expect(_component.type()).to.eql(Panel);
  });
});
