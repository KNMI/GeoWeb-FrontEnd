import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store/createStore';
import AppContainer from './containers/AppContainer';
import { MAP_STYLES } from './routes/ADAGUC/constants/map_styles';
import { BOUNDING_BOXES } from './routes/ADAGUC/constants/bounding_boxes';
// ========================================================
// Store Instantiation
// ========================================================
const initialState = {
  adagucProperties: {
    sources: null,
    source: {
      name: 'HARM_N25',
      service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.HARM_N25.cgi?',
      title: 'HARM_N25'
    },
    layer: 'precipitation_flux',
    layers: [
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
    mapType: MAP_STYLES[1],
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

const store = createStore(initialState);
// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

let render = () => {
  const routes = require('./routes/index').default(store);
  ReactDOM.render(
    <AppContainer store={store} routes={routes} />,
    MOUNT_NODE
  );
};

// This code is excluded from production bundle
if (__DEV__) {
  if (module.hot) {
    // Development render functions
    const renderApp = render;
    const renderError = (error) => {
      const RedBox = require('redbox-react').default;

      ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
    };

    // Wrap render in try/catch
    render = () => {
      try {
        renderApp();
      } catch (error) {
        console.error(error);
        renderError(error);
      }
    };

    // Setup hot module replacement
    module.hot.accept('./routes/index', () =>
      setImmediate(() => {
        ReactDOM.unmountComponentAtNode(MOUNT_NODE);
        render();
      })
    );
  }
}

// ========================================================
// Go!
// ========================================================
render();
