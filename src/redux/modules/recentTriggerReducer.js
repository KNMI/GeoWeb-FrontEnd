import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import { createAction, handleActions } from 'redux-actions';

// An array to store notifications object
const INITIAL_STATE = [];
// Action types
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';
const SET_TRIGGER_LOCATIONS = 'SET_TRIGGER_LOCATIONS';

const addNotification = createAction(ADD_NOTIFICATION);
const removeNotification = createAction(REMOVE_NOTIFICATION);
const setTriggerLocations = createAction(SET_TRIGGER_LOCATIONS);

export const actions = {
  addNotification,
  removeNotification,
  setTriggerLocations
};

const filterYoung = trigger => moment.duration(moment().diff(moment(trigger.issuedate))).asHours() < 1;
// Reducers
export default handleActions({
  [ADD_NOTIFICATION]: (state, { payload }) => [...state, { ...payload.raw, discarded: false }].filter(filterYoung),
  [REMOVE_NOTIFICATION]: (state, { payload }) => {
    const stateClone = cloneDeep(state);
    stateClone.forEach((trigger) => { trigger.discarded = trigger.uuid === payload; });
    return stateClone;
  },
  [SET_TRIGGER_LOCATIONS]: (state, { payload }) => ({ ...state, triggerLocations: payload })
}, INITIAL_STATE);
