// ------------------------------------
// Constants
// ------------------------------------
export const COUNTER_INCREMENT = 'COUNTER_INCREMENT';
export const COUNTER_DOUBLE_ASYNC = 'COUNTER_DOUBLE_ASYNC';
export const CREATE_MAP = 'CREATE_MAP';
export const SET_CUT = 'SET_CUT';
export const SET_MAP_STYLE = 'SET_MAP_STYLE';
export const SET_SOURCE = 'SET_SOURCE';
export const SET_LAYER = 'SET_LAYER';
export const SET_LAYERS = 'SET_LAYERS';
export const SET_STYLE = 'SET_STYLE';
export const SET_STYLES = 'SET_STYLES';
import { DATASETS } from '../constants/datasets';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
// ------------------------------------
// Actions
// ------------------------------------
export function createMap (sources) {
  return {
    type: CREATE_MAP,
    payload: sources
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
export function setSource (dataIdx) {
  return {
    type: SET_SOURCE,
    payload: dataIdx
  };
}
export function setLayer (dataIdx) {
  return {
    type: SET_LAYER,
    payload: dataIdx
  };
}
export function setLayers (dataIdx) {
  return {
    type: SET_LAYERS,
    payload: dataIdx
  };
}
export function setStyle (style) {
  return {
    type: SET_STYLE,
    payload: style
  };
}
export function setStyles (styles) {
  return {
    type: SET_STYLES,
    payload: styles
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
  setSource,
  setLayer,
  setLayers,
  setStyles,
  setStyle
};

const newMapState = (state, payload) => {
  console.log('newmapstate', payload);
  return Object.assign({}, state, { mapCreated: true }, { sources: payload });
};

const newSource = (state, payload) => {
  return Object.assign({}, state, { source: state.sources[payload] });
};
const newLayer = (state, payload) => {
  return Object.assign({}, state, { layer: state.layers[payload] });
};
const newLayers = (state, payload) => {
  return Object.assign({}, state, { layers: payload });
};
const newStyles = (state, payload) => {
  return Object.assign({}, state, { styles: payload });
};
const newMapStyle = (state, payload) => {
  return Object.assign({}, state, { mapType: MAP_STYLES[payload] });
};
const newCut = (state, payload) => {
  return Object.assign({}, state, { boundingBox: BOUNDING_BOXES[payload] });
};
const newStyle = (state, payload) => {
  return Object.assign({}, state, { style: state.styles[payload].name });
};
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [CREATE_MAP]           : (state, action) => newMapState(state, action.payload),
  [SET_SOURCE]           : (state, action) => newSource(state, action.payload),
  [SET_LAYER]            : (state, action) => newLayer(state, action.payload),
  [SET_LAYERS]           : (state, action) => newLayers(state, action.payload),
  [SET_MAP_STYLE]        : (state, action) => newMapStyle(state, action.payload),
  [SET_CUT]              : (state, action) => newCut(state, action.payload),
  [SET_STYLE]            : (state, action) => newStyle(state, action.payload),
  [SET_STYLES]           : (state, action) => newStyles(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
const initialState = 0;
export default function adagucReducer (state = initialState, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
