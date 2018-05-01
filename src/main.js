import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './store/createStore';
import routesDefinition from './routes';
import 'font-awesome/css/font-awesome.css';

// ========================================================
// Render Setup
// ========================================================
const MOUNT_NODE = document.getElementById('root');

let globalStore = null;

let doTheRender = (AppContainer) => {
  const routes = routesDefinition(globalStore);
  ReactDOM.render(
    <AppContainer store={globalStore} routes={routes} />,
    MOUNT_NODE
  );
};

let render = (AppContainer) => {
  if (!globalStore) {
    createStore({}, __DEV__).then((store) => {
      globalStore = store;
      doTheRender(AppContainer);
    });
  } else {
    console.log('reusing store');
    doTheRender(AppContainer);
  }
};

// This code is excluded from production bundle
if (__DEV__) {
  // Development render functions
  const renderApp = render;
  const renderError = (error) => {
    const RedBox = require('redbox-react').default;

    ReactDOM.render(<RedBox error={error} />, MOUNT_NODE);
  };

  // Wrap render in try/catch
  render = (AppContainer) => {
    try {
      renderApp(AppContainer);
    } catch (error) {
      console.error(error);
      renderError(error);
    }
  };

  // HMR interface
  if (module.hot) {
    // Capture hot update
    const AppContainer = require('./containers/AppContainer').default;

    module.hot.accept(['./routes/index'], () => {
      ReactDOM.unmountComponentAtNode(MOUNT_NODE);
      render(AppContainer);
    });
  }
}
// ========================================================
// Go!
// ========================================================
render(require('./containers/AppContainer').default);
