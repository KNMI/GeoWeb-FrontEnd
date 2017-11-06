import React from 'react';
import { default as MapPanel } from './MapPanel';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import { Row } from 'reactstrap';
const state = {
  adagucActions: {
    setTimeDimension: () => null
  },
  layerActions: {
    setWMJSLayers: () => null
  },
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
        layers: [],
        type: 'ADAGUC'
      },
      {
        overlays: [],
        layers: [],
        type: 'PROGTEMP'
      },
      {
        overlays: [],
        layers: [],
        type: 'TIMESERIES'
      },
      {
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      }
    ]
  }
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = { /* intentionally left blank */ };

describe('(Component) MapPanel', () => {
  before(() => {
    const emptyFunc = () => null;
    class LocalStorageMock {
      constructor () {
        this.store = {};
      }

      clear () {
        this.store = {};
      }

      getItem (key) {
        return this.store[key] || null;
      }

      setItem (key, value) {
        this.store[key] = value.toString();
      }

      removeItem (key) {
        delete this.store[key];
      }
    };

    global.localStorage = new LocalStorageMock();

    global.getCurrentDateIso8601 = () => {
      return { toISO8601: emptyFunc };
    };
    global.WMJSLayer = sinon.stub().returns({});
    global.WMJSMap = sinon.stub().returns({
      addLayer: emptyFunc,
      addListener: emptyFunc,
      destroy: emptyFunc,
      draw: emptyFunc,
      drawAutomatic: emptyFunc,
      getBaseLayers: emptyFunc,
      getDimension: emptyFunc,
      getLatLongFromPixelCoord: emptyFunc,
      getLayers: emptyFunc,
      getListener: emptyFunc,
      getPixelCoordFromLatLong: emptyFunc,
      positionMapPinByLatLon: emptyFunc,
      removeAllLayers: emptyFunc,
      removeListener: emptyFunc,
      setActive: emptyFunc,
      setAnimationDelay: emptyFunc,
      setBaseLayers: emptyFunc,
      setBaseURL: emptyFunc,
      setBBOX: emptyFunc,
      setDimension: emptyFunc,
      setMapModeNone: emptyFunc,
      setMapModePan: emptyFunc,
      setMapModeZoomBoxIn: emptyFunc,
      setMessage: emptyFunc,
      setProjection: emptyFunc,
      setSize: emptyFunc,
      setTimeOffset: emptyFunc,
      stopAnimating: emptyFunc
    });
  });
  it('Renders a Row', () => {
    const _component = shallow(<MapPanel
      adagucProperties={state.adagucProperties}
      drawProperties={state.drawProperties}
      mapProperties={state.mapProperties}
      layers={state.layers}
      dispatch={emptyDispatch}
      actions={emptyActions} />);
    expect(_component.type()).to.eql(Row);
  });

  it('Renders a single adaguc component', () => {
    const _component = mount(<MapPanel
      adagucActions={state.adagucActions}
      adagucProperties={state.adagucProperties}
      drawProperties={state.drawProperties}
      mapProperties={state.mapProperties}
      layers={state.layers}
      layerActions={state.layerActions}
      dispatch={emptyDispatch}
      actions={emptyActions} />);
    expect(_component.type()).to.eql(MapPanel);
  });
});
