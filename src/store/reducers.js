import { combineReducers } from 'redux';
import adagucReducer from './adagucReducer';

export const makeRootReducer = (asyncReducers) => {
  return combineReducers({
    adaguc: adagucReducer,
    ...asyncReducers
  });
};

export const injectReducer = (store, { key, reducer }) => {
  if (Object.hasOwnProperty.call(store.asyncReducers, key)) return;

  store.asyncReducers[key] = reducer;
  store.replaceReducer(makeRootReducer(store.asyncReducers));
};

export default makeRootReducer;
