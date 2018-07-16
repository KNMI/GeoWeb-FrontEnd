import createStore from './createStore';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { BACKEND_SERVER_URL } from '../static/urls.json';
import { GetServiceByNamePromise } from '../utils/getServiceByName';
var fetchMock = require('fetch-mock');

describe('(Store) createStore', () => {
  let store;
  const initialState = {
    adagucProperties: {
      sources: null,
      source: {
        name: 'Harmonie36',
        service: `${BACKEND_SERVER_URL}/cgi-bin/geoweb/adaguc.Harmonie36.cgi?`,
        title: 'Harmonie36'
      },
      layer: 'precipitation_flux',
      panelsProperties: [
        { title: 'cloud_base_altitude' },
        { title: 'cloud_top_altitude' },
        { title: 'convective_cloud_area_fraction' },
        { title: 'geopotential__at_pl' },
        { title: 'geopotential__at_sfc' },
        { title: 'high_type_cloud_area_fraction' },
        { title: 'low_type_cloud_area_fraction' },
        { title: 'air_temperature__max_at_2m' },
        { title: 'medium_type_cloud_area_fraction' },
        { title: 'air_temperature__min_at_2m' },
        { title: 'orography' },
        { title: 'precipitation_flux' },
        { title: 'snowfall_flux' },
        { title: 'graupel_flux' },
        { title: 'air_pressure_at_sea_level' },
        { title: 'relative_humidity__at_2m' },
        { title: 'relative_humidity__at_pl' },
        { title: 'air_temperature__at_pl' },
        { title: 'air_temperature__at_2m' },
        { title: 'cloud_area_fraction' },
        { title: 'wind_speed_of_gust__at_10m' },
        { title: 'wind__at_10m' },
        { title: 'wind__at_pl' }
      ],
      style: null,
      styles: null,
      overlay: null,
      mapType: MAP_STYLES[0],
      boundingBox: BOUNDING_BOXES[0],
      projectionName: 'EPSG:3857',
      mapCreated: false
    },
    header: {
      title: 'hello Headers'
    },
    leftSideBar: {
      title: 'hello LeftSideBar'
    },
    mainViewport: {
      title: 'hello MainViewport'
    },
    rightSideBar: {
      title: 'hello RightSideBar'
    }
  };

  before(() => {
    fetchMock.get('*', { BACKEND_SERVER_URL: 'http://localhost:8080' });
    GetServiceByNamePromise(BACKEND_SERVER_URL, 'Harmonie36').then((service) => {
      initialState.adagucProperties.source.service = service;
    });
  });
  after(() => {
    fetchMock.restore();
  });
  beforeEach(async () => {
    store = await createStore(initialState);
  });

  it('should have an empty asyncReducers object', () => {
    expect(store.asyncReducers).to.be.an('object');
    expect(store.asyncReducers).to.be.empty();
  });

  describe('(ADAGUC)', () => {
    it('store should be initialized with ADAGUC state without mapCreated', () => {
      const adagucProps = store.getState().adagucProperties;
      expect(adagucProps.mapCreated).to.equal(false);
    });
    it('ADAGUC should be initialized with KNMI GeoWeb WorldMap style', () => {
      const adagucProps = store.getState().adagucProperties;
      expect(adagucProps.mapType.title).to.equal('KNMI GeoWeb WorldMap');
    });
    it('ADAGUC should be initialized with Mercator (EPSG:3857) projection', () => {
      const adagucProps = store.getState().adagucProperties;
      expect(adagucProps.projectionName).to.equal('EPSG:3857');
    });
  });
});
