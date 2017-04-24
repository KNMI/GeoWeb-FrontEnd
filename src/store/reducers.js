import { combineReducers } from 'redux';
import { reducer as notificationsReducer } from 'reapop';
import { default as removedNotificationReducer } from '../reducers/removedNotificationReducer';
import { default as adagucReducer } from '../reducers/adagucReducer';
import { default as dummyReducer } from '../reducers/dummyReducer';

export const makeRootReducer = () => {
  return combineReducers({
    adagucProperties: adagucReducer,
    header: dummyReducer,
    rightSideBar: dummyReducer,
    leftSideBar: dummyReducer,
    mainViewport: dummyReducer,
    discardedNotifications: removedNotificationReducer,
    notifications: notificationsReducer()
  });
};
export default makeRootReducer;
