import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store/createStore';
import GeoWeb from './containers/GeoWeb';
import { DATASETS } from './routes/ADAGUC/constants/datasets';
import { MAP_STYLES } from './routes/ADAGUC/constants/map_styles';
import { BOUNDING_BOXES } from './routes/ADAGUC/constants/bounding_boxes';
// ========================================================
// Store Instantiation
// ========================================================
const initialState = {
  adagucProperties: {
    source: null,
    layer: null,
    layers: null,
    style: null,
    styles: null,
    mapType: MAP_STYLES[1],
    boundingBox: BOUNDING_BOXES[0],
    projectionName: 'EPSG:3857',
    mapCreated: false
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
    <GeoWeb store={store} routes={routes} adagucProperties={store.getState()} />,
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
