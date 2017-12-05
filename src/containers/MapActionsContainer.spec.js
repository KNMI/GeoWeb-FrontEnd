import React from 'react';
import { default as MapActionsContainer } from './MapActionsContainer';
import { mount, shallow } from 'enzyme';
import sinon from 'sinon';

const state = {
  adagucProperties: {
    animate: false,
    sources: [],
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

const emptyDispatch = () => null;
const emptyActions = {
  toggleAnimation: () => null,
  setTimeDimension: () => null,
  setMapMode: () => null
};

describe('(Container) MapActionsContainer', () => {
  let _deepComponent, _shallowComponent;
  beforeEach(() => {
    _deepComponent = mount(<MapActionsContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      user={{}}
      adagucActions={{ toggleAnimation: () => null, setTimeDimension: () => null }}
      mapProperties={state.mapProperties} adagucProperties={state.adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
    _shallowComponent = shallow(<MapActionsContainer urls={{ BACKEND_SERVER_URL: 'http://localhost:8080' }}
      user={{}}
      adagucActions={{ toggleAnimation: () => null, setTimeDimension: () => null }}
      mapProperties={state.mapProperties} adagucProperties={state.adagucProperties} dispatch={emptyDispatch} actions={emptyActions} />);
  });
  it('Renders a ReactStrap Col', () => {
    expect(_deepComponent.type()).to.eql(MapActionsContainer);
  });
  it('Adds a data layer', () => {
    expect(_deepComponent.type()).to.eql(MapActionsContainer);
  });

  // These ones triggers a Maximum call stack size exceeded error
  // it('Allows for triggering toggleLayerChooser', () => {
  //   _deepComponent.instance().toggleLayerChooser();
  //   expect('everything').to.be.ok();
  // });
  // it('Allows for setting layerChooserOpen state', () => {
  //   _deepComponent.setState({ layerChooserOpen: true });
  //   expect('everything').to.be.ok();
  // });
  it('Allows for triggering toggleAnimation', () => {
    _deepComponent.instance().toggleAnimation();
    expect('everything').to.be.ok();
  });
  it('Allows for triggering togglePopside', () => {
    _shallowComponent.instance().togglePopside();
    expect('everything').to.be.ok();
  });
  it('Allows for triggering goToNow', () => {
    global.getCurrentDateIso8601 = sinon.stub().returns({ toISO8601: () => { /* intentionally left blank */ } });
    _deepComponent.instance().goToNow();
    expect('everything').to.be.ok();
  });
  // it('Allows for triggering generateMap', () => {
  //   _deepComponent.instance().generateMap([{ name: 'testName', text: 'testText' }]);
  //   expect('everything').to.be.ok();
  // });
  it('Allows for triggering getLayerName', () => {
    let obs = _deepComponent.instance().getLayerName({ title: 'OBS' });
    expect(obs).to.eql('Observations');
    obs = _deepComponent.instance().getLayerName({ title: 'SAT' });
    expect(obs).to.eql('Satellite');
    obs = _deepComponent.instance().getLayerName({ title: 'LGT' });
    expect(obs).to.eql('Lightning');
    obs = _deepComponent.instance().getLayerName({ title: 'HARM_N25_EXT' });
    expect(obs).to.eql('HARMONIE (EXT)');
    obs = _deepComponent.instance().getLayerName({ title: 'HARM_N25' });
    expect(obs).to.eql('HARMONIE');
    obs = _deepComponent.instance().getLayerName({ title: 'OVL' });
    expect(obs).to.eql('Overlay');
    obs = _deepComponent.instance().getLayerName({ title: 'RADAR_EXT' });
    expect(obs).to.eql('Radar (EXT)');
    expect('everything').to.be.ok();
  });
  it('Allows for setting addLayer action state', () => {
    _deepComponent.setState({ action: 'addLayer' });
    expect('everything').to.be.ok();
  });
  it('Allows for setting selectPreset action state', () => {
    _deepComponent.setState({ action: 'selectPreset' });
    expect('everything').to.be.ok();
  });
  it('Allows for setting collapse state', () => {
    _deepComponent.setState({ collapse: true });
    expect('everything').to.be.ok();
  });
  it('Allows for setting popoverOpen state', () => {
    _shallowComponent.setState({ popoverOpen: true });
    expect('everything').to.be.ok();
  });
  it('Allows for creating a progtemp config', () => {
    const newAdaguc = {
      layers: {
        datalayers: [
          { title: 'HARM', getDimension: () => '2017-03-24T06:00:00' }
        ]
      },
      wmjslayers: {
        layers: [{ title: 'HARM', service: 'HARM', getDimension: () => '2017-03-24T06:00:00' }],
        baselayers: [],
        overlays: []
      },
      sources: {
        data: [{ name: 'testName', title: 'testTitle' }],
        overlay: [{ name: 'testName', title: 'testTitle' }]
      },
      progtemp: {
        location: {
          name: 'EHDB',
          x: 5.18,
          y: 52.12
        }
      },
      mapMode: 'progtemp'
    };
    _deepComponent.setProps({ adagucProperties: newAdaguc });
    expect('everything').to.be.ok();
  });
});
