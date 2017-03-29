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
    sources: {
      data: null,
      overlay: null
    },
    layers: {
      baselayer: MAP_STYLES[1],
      datalayers: [],
      overlays: []
    },
    boundingBox: BOUNDING_BOXES[0],
    projectionName: 'EPSG:3857',
    mapCreated: false,
    user: {
      isLoggedIn: false,
      userName: ''
    },
    mapMode: 'pan',
    adagucmapdraw: {
      geojson: { 'type': 'FeatureCollection',
        'features': [
          { 'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': []
            },
            'properties': {
              'prop0': 'value0',
              'prop1': { 'this':  'that' }
            }
          }
        ]
      }
    }
  }
};

const store = createStore(initialState, __DEV__);
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
