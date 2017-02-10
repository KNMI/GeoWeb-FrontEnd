// ------------------------------------
// Constants
// ------------------------------------
export const COUNTER_INCREMENT = 'COUNTER_INCREMENT';
export const COUNTER_DOUBLE_ASYNC = 'COUNTER_DOUBLE_ASYNC';
export const CREATE_MAP = 'CREATE_MAP';
export const SET_CUT = 'SET_CUT';
export const SET_MAP_STYLE = 'SET_MAP_STYLE';
export const SET_DATA = 'SET_DATA';

import { DATASETS } from '../constants/datasets';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
// ------------------------------------
// Actions
// ------------------------------------
export function createMap () {
  return {
    type: CREATE_MAP
  };
}
export function setCut (boundingbox) {
  return {
    type: SET_CUT,
    payload: boundingbox
  };
}
export function setMapStyle (styleIdx) {
  return {
    type: SET_MAP_STYLE,
    payload: styleIdx
  };
}
export function setData (dataIdx) {
  return {
    type: SET_DATA,
    payload: dataIdx
  };
}

/*  This is a thunk, meaning it is a function that immediately
    returns a function for lazy evaluation. It is incredibly useful for
    creating async actions, especially when combined with redux-thunk! */

// export const doubleAsync = () => {
//   return (dispatch, getState) => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         dispatch({
//           type    : COUNTER_DOUBLE_ASYNC,
//           payload : getState().adagucProperties
//         });
//         resolve();
//       }, 200);
//     });
//   };
// };

export const actions = {
  createMap,
  setCut,
  setMapStyle,
  setData
};

const newMapState = (state) => {
  return Object.assign({}, state, { mapCreated: true });
};

const newData = (state, payload) => {
  return Object.assign({}, state, { layer: DATASETS[payload - 1] });
};

const newMapStyle = (state, payload) => {
  return Object.assign({}, state, { mapType: MAP_STYLES[payload - 1] });
};
const newCut = (state, payload) => {
  return Object.assign({}, state, { boundingBox: BOUNDING_BOXES[payload - 1] });
};
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [CREATE_MAP]           : (state, action) => newMapState(state),
  [SET_DATA]             : (state, action) => newData(state, action.payload),
  [SET_MAP_STYLE]        : (state, action) => newMapStyle(state, action.payload),
  [SET_CUT]              : (state, action) => newCut(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = 0;
export default function adagucReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
