import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
// An array to store notifications object
const INITIAL_STATE = [];
// Action types
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';
const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

// Actions types
export const types = {
  ADD_NOTIFICATION: ADD_NOTIFICATION,
  REMOVE_NOTIFICATION: REMOVE_NOTIFICATION
};

// Reducers
export default function (state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case ADD_NOTIFICATION:
      const rawTrigger = payload.raw;
      // remove triggers that are too old
      const youngStateCpy = cloneDeep(state).filter((trigger) => moment.duration(moment().diff(moment(trigger.issuedate))).asHours() < 1);
      // add trigger to list
      youngStateCpy.push({ ...rawTrigger, discarded: false });
      return youngStateCpy;
    case REMOVE_NOTIFICATION:
      const stateCpy = cloneDeep(state);
      stateCpy.map((trigger) => {
        if (trigger.uuid === payload) {
          trigger.discarded = true;
        }
        return trigger;
      });
      return stateCpy;
    default:
      return state;
  }
};
