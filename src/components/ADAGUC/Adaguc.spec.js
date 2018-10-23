import React from 'react';
import { default as Adaguc } from './Adaguc';
import reducer from '../../redux/reducers';
import { shallow } from 'enzyme';
import sinon from 'sinon';

const baselayer = {
  service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
  name: 'streetmap',
  title: 'OpenStreetMap',
  format: 'image/gif',
  enabled: true
};

describe('(Component) Adaguc', () => {
  let _globalState;
  let _dispatchSpy;
  beforeEach(() => {
    _globalState = {
      adagucActions: {
        setTimeDimension: () => null
      },
      adagucProperties: {
        animate: false,
        sources: {},
        timeDimension: null,
        cursor: null
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
      mapProperties: {
        mapCreated: false,
        activeMapId: 0,
        layout: 'single',
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
      userProperties: {
        isLoggedIn: false,
        username: '',
        roles: []
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
      },
      recentTriggers: [],
      notifications: []
    };
    _dispatchSpy = sinon.spy((action) => {
      _globalState = reducer(_globalState, action);
    });
  });

  before(() => {
    const emptyFunc = () => null;
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

  it('Renders a div', () => {
    const _component = shallow(<Adaguc
      urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      active dispatch={_dispatchSpy}
      panelsActions={{}}
      adagucActions={_globalState.adagucActions}
      mapActions={{}}
      drawActions={{}}
      adagucProperties={_globalState.adagucProperties}
      mapProperties={_globalState.mapProperties}
      panelsProperties={_globalState.panelsProperties}
      mapId={0}
      drawProperties={_globalState.drawProperties} />);
    expect(_component.type()).to.eql('div');
  });
});
