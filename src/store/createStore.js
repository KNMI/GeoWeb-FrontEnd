import { applyMiddleware, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import { browserHistory } from 'react-router';
import makeRootReducer from '../redux/reducers';
import { updateLocation } from './location';

export default (initialState = {}, isdev = false) => {
  // ======================================================
  // Middleware Configuration
  // ======================================================
  const middleware = [thunk];

  // ======================================================
  // Store Enhancers
  // ======================================================
  const enhancers = [];
  let composeEnhancers = compose;
  if (isdev) {
    const composeWithDevToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    if (typeof composeWithDevToolsExtension === 'function') {
      composeEnhancers = composeWithDevToolsExtension;
    }
  }

  // ======================================================
  // Store Instantiation and HMR Setup
  // ======================================================
  return fetch('urls.dat', { credentials: 'include' }).then((res) => res.json()).then((mod) => {
    const store = createStore(
      makeRootReducer(),
      { ...initialState, urls: mod },
      composeEnhancers(
        applyMiddleware(...middleware),
        ...enhancers
      )
    );
    store.asyncReducers = {};

    // To unsubscribe, invoke `store.unsubscribeHistory()` anytime
    store.unsubscribeHistory = browserHistory.listen(updateLocation(store));

    if (module.hot) {
      module.hot.accept('../redux/reducers', () => {
        const reducers = require('../redux/reducers').default;
        store.replaceReducer(reducers(store.asyncReducers));
      });
    }
    return store;
  });
};
