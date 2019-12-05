import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';
const INITIAL_STATE = {
  animationSettings: {
    animate: false,
    duration: ''
  },
  sources: { },
  timeDimension: null,
  cursor: null
};
const SET_TIME_DIMENSION = 'SET_TIME_DIMENSION';
const TOGGLE_ANIMATION = 'TOGGLE_ANIMATION';
const CURSOR_LOCATION = 'CURSOR_LOCATION';
const SET_SOURCES = 'SET_SOURCES';
const SET_ANIMATION_LENGTH = 'SET_ANIMATION_LENGTH';

const setTimeDimension = createAction(SET_TIME_DIMENSION);
const toggleAnimation = createAction(TOGGLE_ANIMATION);
const setAnimationLength = createAction(SET_ANIMATION_LENGTH);
const setCursorLocation = createAction(CURSOR_LOCATION);
const setSources = createAction(SET_SOURCES);

export const actions = {
  setTimeDimension,
  toggleAnimation,
  setCursorLocation,
  setSources,
  setAnimationLength
};

export default handleActions({
  [SET_TIME_DIMENSION]: (state, { payload }) => ({ ...state, timeDimension: payload }),
  [TOGGLE_ANIMATION]: (state, { payload }) => ({ ...state, animationSettings: { ...state.animationSettings, animate: !state.animationSettings.animate } }),
  [CURSOR_LOCATION]: (state, { payload }) => ({ ...state, cursor: { location: payload } }),
  [SET_SOURCES]: (state, { payload }) => {
    return produce(state, draft => {
      draft.sources = payload;
    });
  },
  [SET_ANIMATION_LENGTH]: (state, { payload }) => ({ ...state, animationSettings: { ...state.animationSettings, duration: payload } })
}, INITIAL_STATE);
