import dispatch from './SigmetReducers';
import { LOCAL_ACTIONS, CATEGORY_REFS, SIGMET_MODES } from './SigmetActions';
import { MODES_GEO_SELECTION } from '../../utils/json';
import produce from 'immer';
import moxios from 'moxios';

describe('(Reducer) Sigmet/SigmetReducers', () => {
  beforeEach(() => {
    moxios.install();
  });
  afterEach(() => {
    moxios.uninstall();
  });
  it('should be a function', () => {
    expect(dispatch).to.be.a('function');
  });
  it('should handle toggleContainer', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        isContainerOpen: false,
        parameters: {
          location_indicator_mwo: 'EHDB',
          active_firs: ['EHAA'],
          firareas: { EHAA: {} }
        }
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.toggleContainerAction(null), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('isContainerOpen', true);
    dispatch(LOCAL_ACTIONS.toggleContainerAction(null), container);
    expect(container.state).to.have.property('isContainerOpen', false);
    done();
  });
  it('should handle toggleCategory', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        },
        drawActions: {
          setGeoJSON: () => { }
        },
        panelsActions: {
          setPanelLayout: () => { },
          setPresetLayers: () => { }
        },
        mapActions: {
          setCut: () => { }
        },
        dispatch: () => { }
      },
      state: {
        selectedAuxiliaryInfo: {
          mode: SIGMET_MODES.READ
        },
        focussedCategoryRef: CATEGORY_REFS.CONCEPT_SIGMETS,
        parameters: {
          active_firs: ['TEST'],
          firareas: {
            'TEST': {
              adjacent_firs: ['ADJ1', 'ADJ2'],
              areapreset: 'TST_FIR',
              firname: 'TEST FIR',
              location_indicator_icao: 'TSME',
              hoursbeforevalidity: 2,
              maxhoursofvalidity: 3,
              tc_hoursbeforevalidity: 4,
              tc_maxhoursofvalidity: 5,
              va_hoursbeforevalidity: 6,
              va_maxhoursofvalidity: 7
            }
          },
          location_indicator_wmo: 'TSMF'
        },
        firs: {
          'TEST FIR': {
            type: 'Feature',
            id: 1,
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates: [[[4.9999984, 54.9999982], [5, 55], [4.33191389, 55.33264444], [4.9999984, 54.9999982]]]
            }
          }
        }
      }
    };
    container.setState = (partialState, callback) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
      callback();
    };
    dispatch(LOCAL_ACTIONS.toggleCategoryAction(null, CATEGORY_REFS.ADD_SIGMET), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('focussedCategoryRef', CATEGORY_REFS.ADD_SIGMET);
    expect(container.state).to.have.property('selectedAuxiliaryInfo');
    expect(container.state.selectedAuxiliaryInfo).to.be.a('object');
    // expect(container.state.selectedAuxiliaryInfo).to.have.property('mode', SIGMET_MODES.EDIT);
    dispatch(LOCAL_ACTIONS.toggleCategoryAction(null, CATEGORY_REFS.ACTIVE_SIGMETS), container);
    expect(container.state).to.have.property('focussedCategoryRef', CATEGORY_REFS.ACTIVE_SIGMETS);
    dispatch(LOCAL_ACTIONS.toggleCategoryAction(null, CATEGORY_REFS.ACTIVE_SIGMETS), container);
    expect(container.state).to.have.property('focussedCategoryRef', null);
    done();
  });
  it('should handle retrieveParameters', (done) => {
    const initialParameters = {
      active_firs: [null],
      firareas: {
        'pattern_^[A-Z]{4}$': {
          adjacent_firs: [null],
          areapreset: null,
          firname: null,
          location_indicator_icao: null,
          hoursbeforevalidity: null,
          maxhoursofvalidity: null,
          tc_hoursbeforevalidity: null,
          tc_maxhoursofvalidity: null,
          va_hoursbeforevalidity: null,
          va_maxhoursofvalidity: null
        }
      },
      location_indicator_wmo: null
    };
    const parameters = {
      'location_indicator_wmo': 'EHDB',
      'firareas': {
        'EHAA': {
          'firname': 'AMSTERDAM FIR',
          'location_indicator_icao': 'EHAA',
          'areapreset': 'NL_FIR',
          'maxhoursofvalidity': 4,
          'hoursbeforevalidity': 4,
          'tc_maxhoursofvalidity': 0,
          'tc_hoursbeforevalidity': 0,
          'va_maxhoursofvalidity': 12,
          'va_hoursbeforevalidity': 6,
          'adjacent_firs': [
            'EKDK',
            'EDWW',
            'EDGG',
            'EBBU',
            'EGTT',
            'EGPX'
          ]
        }
      },
      'active_firs': ['EHAA']
    };
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        parameters: initialParameters
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.retrieveParametersAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: parameters
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state).to.have.property('parameters');
        expect(container.state.parameters).to.have.property('location_indicator_wmo', 'EHDB');
        expect(container.state.parameters).to.have.property('active_firs');
        expect(container.state.parameters['active_firs']).to.eql(parameters['active_firs']);
        expect(container.state.parameters).to.have.property('firareas');
        expect(container.state.parameters.firareas).to.eql(Object.assign({}, parameters.firareas, initialParameters.firareas));
        done();
      }).catch(done);
    });
  });
  it('should handle retrievePhenomena', (done) => {
    const phenomena = [{
      'phenomenon': {
        'name': 'Thunderstorm',
        'code': 'TS',
        'layerpreset': 'sigmet_layer_TS'
      },
      'variants': [{ 'name': 'Obscured', 'code': 'OBSC' }, { 'name': 'Embedded', 'code': 'EMBD' }],
      'additions': [{ 'name': 'with hail', 'code': 'GR' }]
    }];
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        phenomena: [],
        parameters: {}
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.retrievePhenomenaAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: phenomena
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state).to.have.property('phenomena');
        expect(container.state.phenomena).to.eql([
          {
            'code': 'OBSC_TSGR',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Obscured thunderstorm with hail'
          },
          {
            'code': 'OBSC_TS',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Obscured thunderstorm'
          },
          {
            'code': 'EMBD_TSGR',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Embedded thunderstorm with hail'
          },
          {
            'code': 'EMBD_TS',
            'layerpreset': 'sigmet_layer_TS',
            'name': 'Embedded thunderstorm'
          }
        ]);
        done();
      }).catch(done);
    });
  });
  it('should handle addSigmet', (done) => {
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        },
        drawActions: {
          setGeoJSON: () => { }
        },
        dispatch: () => { }
      },
      state: {
        phenomena: [{
          'code': 'OBSC_TSGR',
          'layerpreset': 'sigmet_layer_TS',
          'name': 'Obscured thunderstorm with hail'
        }],
        parameters: {
          'maxhoursofvalidity': 4.0,
          'hoursbeforevalidity': 4.0,
          'firareas': [{ 'location_indicator_icao': 'EHAA', 'firname': 'FIR AMSTERDAM', 'areapreset': 'NL_FIR' }],
          'location_indicator_wmo': 'EHDB'
        },
        firs: {},
        categories: [{
          ref: CATEGORY_REFS.ADD_SIGMET,
          sigmets: [{ test: null }, { test: null }]
        }]
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('categories');
    expect(container.state.categories).to.have.length(1);
    expect(container.state.categories[0]).to.have.property('sigmets');
    expect(container.state.categories[0].sigmets).to.have.length(2);
    dispatch(LOCAL_ACTIONS.addSigmetAction(CATEGORY_REFS.ADD_SIGMET), container);
    expect(container.state).to.be.a('object');
    expect(container.state).to.have.property('categories');
    expect(container.state.categories).to.have.length(1);
    expect(container.state.categories[0]).to.have.property('sigmets');
    expect(container.state.categories[0].sigmets).to.have.length(1);
    done();
  });
  it('should handle retrieveSigmets', (done) => {
    const sigmet = {
      'geojson': {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'properties': { 'selectionType': MODES_GEO_SELECTION.BOX, 'featureFunction': 'start', 'stroke-width': 0.8, 'fill': '#0f0', 'fill-opacity': 0.2 },
          'geometry': { 'type': 'Polygon', 'coordinates': [[[2.84, 52.18], [2.84, 50.36], [7.92, 50.36], [7.92, 52.18], [2.84, 52.18], [2.84, 52.18]]] },
          'id': '5eb7877c-ddab-4f8a-a419-c7051d5b4af8'
        }]
      },
      'phenomenon': 'SQL_TSGR',
      'obs_or_forecast': { 'obs': true },
      'levelinfo': { 'levels': [{ 'value': 0, 'unit': 'FL' }, { 'value': 1, 'unit': 'M' }], 'mode': 'AT' },
      'movement': {},
      'change': 'WKN',
      'validdate': '2018-07-16T16:00:00Z',
      'validdate_end': '2018-07-16T20:00:00Z',
      'firname': 'FIR AMSTERDAM',
      'location_indicator_icao': 'EHAA',
      'location_indicator_mwo': 'EHDB',
      'uuid': '8918a112-5e75-4e74-983e-ce33b3b8d8a2',
      'status': 'concept',
      'sequence': -1,
      'cancels': null
    };
    const sigmetsResponse = {
      'sigmets': [sigmet]
    };
    const resultSigmet = produce(sigmet, draftState => {
      draftState.geojson.features[0].properties.relatesTo = null;
      draftState.geojson.features[0].properties.stroke = null;
      draftState.geojson.features[0].properties['stroke-opacity'] = null;
      draftState.forecast_position_time = null;
      draftState.issuedate = null;
      draftState.movement.dir = null;
      draftState.movement.speed = null;
      draftState.obs_or_forecast.obsFcTime = null;
    });
    const container = {
      props: {
        urls: {
          BACKEND_SERVER_URL: 'http://localhost'
        }
      },
      state: {
        categories: [
          { ref: CATEGORY_REFS.ACTIVE_SIGMETS, sigmets: [] },
          { ref: CATEGORY_REFS.CONCEPT_SIGMETS, sigmets: [] },
          { ref: CATEGORY_REFS.ADD_SIGMET, sigmets: [] },
          { ref: CATEGORY_REFS.ARCHIVED_SIGMETS, sigmets: [] }
        ],

        phenomena: [{
          'code': 'OBSC_TSGR',
          'layerpreset': 'sigmet_layer_TS',
          'name': 'Obscured thunderstorm with hail'
        }],
        parameters: {
          'maxhoursofvalidity': 4.0,
          'hoursbeforevalidity': 4.0,
          'firareas': [{ 'location_indicator_icao': 'EHAA', 'firname': 'FIR AMSTERDAM', 'areapreset': 'NL_FIR' }],
          'location_indicator_wmo': 'EHDB'
        },
        firs: {}
      }
    };
    container.setState = (partialState) => {
      Object.entries(partialState).forEach((entry) => {
        container.state[entry[0]] = entry[1];
      });
    };
    dispatch(LOCAL_ACTIONS.retrieveSigmetsAction(), container);
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({
        status: 200,
        response: sigmetsResponse
      }).then(() => {
        expect(container.state).to.be.a('object');
        expect(container.state).to.have.property('categories');
        expect(container.state.categories).to.be.a('array');
        expect(container.state.categories).to.have.length(4);
        expect(container.state.categories[3]).to.have.property('sigmets');
        /* expect(container.state.categories[3].sigmets).to.have.length(1);
        expect(container.state.categories[3].sigmets[0]).to.have.property('phenomenon', resultSigmet.phenomenon);
        expect(container.state.categories[3].sigmets[0]).to.have.property('change', resultSigmet.change);
        expect(container.state.categories[3].sigmets[0]).to.have.property('validdate', resultSigmet.validdate);
        expect(container.state.categories[3].sigmets[0]).to.have.property('validdate_end', resultSigmet.validdate_end);
        expect(container.state.categories[3].sigmets[0]).to.have.property('firname', resultSigmet.firname);
        expect(container.state.categories[3].sigmets[0]).to.have.property('location_indicator_icao', resultSigmet.location_indicator_icao);
        expect(container.state.categories[3].sigmets[0]).to.have.property('location_indicator_mwo', resultSigmet.location_indicator_mwo);
        expect(container.state.categories[3].sigmets[0]).to.have.property('uuid', resultSigmet.uuid);
        expect(container.state.categories[3].sigmets[0]).to.have.property('status', resultSigmet.status);
        expect(container.state.categories[3].sigmets[0]).to.have.property('sequence', resultSigmet.sequence);
        expect(container.state.categories[3].sigmets[0]).to.have.property('cancels', resultSigmet.cancels);
        expect(container.state.categories[3].sigmets[0]).to.have.property('forecast_position_time', resultSigmet.forecast_position_time);
        expect(container.state.categories[3].sigmets[0]).to.have.property('issuedate', resultSigmet.issuedate);
        expect(container.state.categories[3].sigmets[0]).to.have.property('obs_or_forecast');
        expect(container.state.categories[3].sigmets[0].obs_or_forecast).to.eql(resultSigmet.obs_or_forecast);
        expect(container.state.categories[3].sigmets[0]).to.have.property('levelinfo');
        expect(container.state.categories[3].sigmets[0].levelinfo).to.eql(resultSigmet.levelinfo);
        expect(container.state.categories[3].sigmets[0]).to.have.property('movement');
        expect(container.state.categories[3].sigmets[0].movement).to.eql(resultSigmet.movement);
        expect(container.state.categories[3].sigmets[0]).to.have.property('geojson');
        expect(container.state.categories[3].sigmets[0].geojson).to.have.property('features');
        expect(container.state.categories[3].sigmets[0].geojson.features).to.have.length(4);
        expect(container.state.categories[3].sigmets[0].geojson.features[0]).to.eql(resultSigmet.geojson.features[0]);
        expect(container.state.categories[3].sigmets[0].geojson.features[1].properties.featureFunction).to.eql('end');
        expect(container.state.categories[3].sigmets[0].geojson.features[2].properties.featureFunction).to.eql('intersection');
        expect(container.state.categories[3].sigmets[0].geojson.features[3].properties.featureFunction).to.eql('intersection'); */
        done();
      }).catch(done);
    });
  });
});
