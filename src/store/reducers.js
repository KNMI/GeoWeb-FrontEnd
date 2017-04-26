import { combineReducers } from 'redux';
import { reducer as notificationsReducer } from 'reapop';
import { default as recentTriggerReducer } from '../reducers/recentTriggerReducer';
import { default as adagucReducer } from '../reducers/adagucReducer';
import { default as dummyReducer } from '../reducers/dummyReducer';

export const makeRootReducer = () => {
  return combineReducers({
    adagucProperties: adagucReducer,
    header: dummyReducer,
    rightSideBar: dummyReducer,
    leftSideBar: dummyReducer,
    mainViewport: dummyReducer,
    recentTriggers: recentTriggerReducer,
    notifications: notificationsReducer()
  });
};
export default makeRootReducer;
