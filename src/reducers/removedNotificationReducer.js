import cloneDeep from 'lodash/cloneDeep';
// An array to store notifications object
const INITIAL_STATE = [];
// Action types
const REMOVE_NOTIFICATION = 'REMOVE_NOTIFICATION';

// Actions types
export const types = {
  REMOVE_NOTIFICATION: REMOVE_NOTIFICATION
};

// Reducers
export default function (state = INITIAL_STATE, { type, payload }) {
  switch (type) {
    case REMOVE_NOTIFICATION:
      const stateCpy = cloneDeep(state);
      stateCpy.push(payload);
      return stateCpy;
    default:
      return state;
  }
};
