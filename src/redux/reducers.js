import { combineReducers } from 'redux';
import { reducer as notificationsReducer } from 'reapop';
import recentTriggerReducer from './modules/recentTriggerReducer';
import adagucReducer from './modules/adagucReducer';
import mapReducer from './modules/mapReducer';
import userReducer from './modules/userReducer';
import panelsReducer from './modules/panelsReducer';
import drawReducer from './modules/drawReducer';
import urlsReducer from './modules/urlsReducer';

export const makeRootReducer = () => combineReducers({
  adagucProperties: adagucReducer,
  drawProperties: drawReducer,
  mapProperties: mapReducer,
  userProperties: userReducer,
  panelsProperties: panelsReducer,
  recentTriggerProperties: recentTriggerReducer,
  notifications: notificationsReducer(),
  urls: urlsReducer
});
export default makeRootReducer;
