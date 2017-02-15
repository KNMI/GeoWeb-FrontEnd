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
      'cloud_base_altitude',
      'cloud_top_altitude',
      'convective_cloud_area_fraction',
      'geopotential__at_pl',
      'geopotential__at_sfc',
      'high_type_cloud_area_fraction',
      'low_type_cloud_area_fraction',
      'air_temperature__max_at_2m',
      'medium_type_cloud_area_fraction',
      'air_temperature__min_at_2m',
      'orography',
      'precipitation_flux',
      'snowfall_flux',
      'graupel_flux',
      'air_pressure_at_sea_level',
      'relative_humidity__at_2m',
      'relative_humidity__at_pl',
      'air_temperature__at_pl',
      'air_temperature__at_2m',
      'cloud_area_fraction',
      'wind_speed_of_gust__at_10m',
      'wind__at_10m',
      'wind__at_pl'
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
