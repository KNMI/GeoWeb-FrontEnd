import { createAction, handleActions } from 'redux-actions';

const INITIAL_STATE = {
  animate: false,
  sources: { },
  timeDimension: null,
  cursor: null
};
const SET_TIME_DIMENSION = 'SET_TIME_DIMENSION';
const TOGGLE_ANIMATION = 'TOGGLE_ANIMATION';
const CURSOR_LOCATION = 'CURSOR_LOCATION';
const SET_SOURCES = 'SET_SOURCES';

const setTimeDimension = createAction(SET_TIME_DIMENSION);
const toggleAnimation = createAction(TOGGLE_ANIMATION);
const setCursorLocation = createAction(CURSOR_LOCATION);
const setSources = createAction(SET_SOURCES);

export const actions = {
  setTimeDimension,
  toggleAnimation,
  setCursorLocation,
  setSources
};

export default handleActions({
  [SET_TIME_DIMENSION]: (state, { payload }) => ({ ...state, timeDimension: payload }),
  [TOGGLE_ANIMATION]: (state, { payload }) => ({ ...state, animate: !state.animate }),
  [CURSOR_LOCATION]: (state, { payload }) => ({ ...state, cursor: { location: payload } }),
  [SET_SOURCES]: (state, { payload }) => ({ ...state, sources: { ...state.sources, ...payload } })
}, INITIAL_STATE);
