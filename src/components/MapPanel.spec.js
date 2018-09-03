import React from 'react';
import { default as MapPanel } from './MapPanel';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';
import { Row } from 'reactstrap';
import moxios from 'moxios';
const baselayer = {
  service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
  name: 'streetmap',
  title: 'OpenStreetMap',
  format: 'image/gif',
  enabled: true
};
const state = {
  adagucActions: {
    setTimeDimension: () => null
  },
  panelsActions: {
    setWMJSLayers: () => null
  },
  drawActions: {
    updateFeature: () => null
  },
  adagucProperties: {
    animate: false,
    sources: {},
    timeDimension: '2017-07-19T11:32:03Z',
    cursor: null
  },
  mapProperties: {
    mapCreated: false,
    mapMode: 'pan',
    projection: {
      name: 'Mercator',
      code: 'EPSG:3857'
    },
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
    panels: [
      {
        baselayers: [baselayer],
        layers: [],
        type: 'ADAGUC'
      },
      {
        baselayers: [baselayer],
        layers: [],
        type: 'PROGTEMP'
      },
      {
        baselayers: [baselayer],
        layers: [],
        type: 'TIMESERIES'
      },
      {
        baselayers: [baselayer],
        layers: [],
        type: 'ADAGUC'
      }
    ],
    activePanelId: 0,
    panelLayout: 'single'
  }
};

const emptyDispatch = () => { /* intentionally left blank */ };
const emptyActions = { /* intentionally left blank */ };

describe('(Component) MapPanel', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
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
      getActiveLayer: emptyFunc,
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
      setWMJSTileRendererTileSettings: emptyFunc,
      showDialogs: emptyFunc,
      stopAnimating: emptyFunc
    });
  });
  it('Renders a Row', (done) => {
    const _component = shallow(<MapPanel
      urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      adagucProperties={state.adagucProperties}
      drawProperties={state.drawProperties}
      mapProperties={state.mapProperties}
      panelsProperties={state.panelsProperties}
      dispatch={emptyDispatch}
      actions={emptyActions} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: { personal_urls: [] }
      }).then(() => {
        expect(_component.type()).to.eql(Row);
        done();
      }).catch(done);
    });
  });

  it('Renders a single adaguc component', (done) => {
    const _component = mount(<MapPanel
      urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      adagucActions={state.adagucActions}
      adagucProperties={state.adagucProperties}
      drawActions={state.drawActions}
      drawProperties={state.drawProperties}
      mapProperties={state.mapProperties}
      panelsProperties={state.panelsProperties}
      panelsActions={state.panelsActions}
      dispatch={emptyDispatch}
      actions={emptyActions} />);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: { personal_urls: [] }
      }).then(() => {
        expect(_component.type()).to.eql(MapPanel);
        done();
      }).catch(done);
    });
  });
});
