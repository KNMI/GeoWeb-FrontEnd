// ------------------------------------
// Constants
// ------------------------------------
export const CREATE_MAP = 'CREATE_MAP';
export const SET_CUT = 'SET_CUT';
export const SET_MAP_STYLE = 'SET_MAP_STYLE';
export const SET_SOURCE = 'SET_SOURCE';
export const SET_LAYER = 'SET_LAYER';
export const SET_LAYERS = 'SET_LAYERS';
export const SET_STYLE = 'SET_STYLE';
export const SET_STYLES = 'SET_STYLES';
export const SET_OVERLAY = 'SET_OVERLAY';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { ADAGUCMAPDRAW_EDITING, ADAGUCMAPDRAW_DELETE, ADAGUCMAPDRAW_UPDATEFEATURE } from '../components/AdagucMapDraw';
// ------------------------------------
// Actions
// ------------------------------------
function createMap (sources, overlays) {
  return {
    type: CREATE_MAP,
    payload: {
      sources: sources,
      overlays: overlays
    }
  };
}
function setCut (boundingbox = BOUNDING_BOXES[0]) {
  return {
    type: SET_CUT,
    payload: boundingbox
  };
}
function setMapStyle (styleIdx = 0) {
  return {
    type: SET_MAP_STYLE,
    payload: styleIdx
  };
}
function setSource (dataIdx = 0) {
  return {
    type: SET_SOURCE,
    payload: dataIdx
  };
}
function setLayer (dataIdx = 0) {
  return {
    type: SET_LAYER,
    payload: dataIdx
  };
}
function setLayers (dataIdx = { }) {
  return {
    type: SET_LAYERS,
    payload: dataIdx
  };
}
function setStyle (style = 0) {
  return {
    type: SET_STYLE,
    payload: style
  };
}
function setStyles (styles = { }) {
  return {
    type: SET_STYLES,
    payload: styles
  };
}
function setOverlay (dataidx = 0) {
  return {
    type: SET_OVERLAY,
    payload: dataidx
  };
}

function adagucmapdrawToggleEdit (adagucmapdraw) {
  console.log('adagucmapdrawToggleEdit', adagucmapdraw);
  return {
    type: 'ADAGUCMAPDRAW_EDITING',
    payload: Object.assign({}, adagucmapdraw, { isInEditMode: !adagucmapdraw.isInEditMode })
  };
}

function adagucmapdrawToggleDelete (adagucmapdraw) {
  console.log('adagucmapdrawToggleDelete', adagucmapdraw);
  return {
    type: 'ADAGUCMAPDRAW_DELETE',
    payload: Object.assign({}, adagucmapdraw, { isInDeleteMode: !adagucmapdraw.isInDeleteMode })
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
  setStyle,
  setOverlay,
  adagucmapdrawToggleEdit,
  adagucmapdrawToggleDelete
};

const newMapState = (state, payload) => {
  console.log(payload);
  return Object.assign({}, state, { mapCreated: true },
    { sources: payload.sources },
    { overlayService: payload.overlays },
    { overlayLayers: payload.overlays.layers.map((layer) => ({ title: layer })) });
};

const newSource = (state, payload) => {
  return Object.assign({}, state, { source: state.sources[payload] }, { layer: null }, { style: null });
};
const newLayer = (state, payload) => {
  return Object.assign({}, state, { layer: state.layers[payload].title });
};
const newLayers = (state, payload) => {
  return Object.assign({}, state, { layers: payload.map((layer) => ({ title: layer })) });
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
const newOverlay = (state, payload) => {
  console.log(state.overlay);
  console.log(payload);
  if (payload >= state.overlayLayers.length) {
    return Object.assign({}, state, { overlay: null });
  } else {
    const overlayObject = Object.assign({}, state.overlayService, { name: state.overlayLayers[payload].title });
    console.log(overlayObject);
    return Object.assign({}, state, { overlay: overlayObject });
  }
};
const handleAdagucMapDrawEditing = (state, payload) => {
  console.log('handleAdagucMapDrawEditing', payload);
  let newState = Object.assign({}, state);
  newState.adagucmapdraw.isInEditMode = payload.isInEditMode;
  return newState;
};
const handleAdagucMapDrawDelete = (state, payload) => {
  console.log('handleAdagucMapDrawDelete', payload);
  let newState = Object.assign({}, state);
  newState.adagucmapdraw.isInDeleteMode = payload.isInDeleteMode;
  return newState;
};
const handleAdagucMapDrawUpdateFeature = (state, payload) => {
  console.log('handleAdagucMapDrawUpdateFeature', payload);
  /* Returning new state is not strictly necessary,
    as the geojson in AdagucMapDraw is the same and does not require rerendering of the AdagucMapDraw component
  */
  let newState = Object.assign({}, state);
  newState.adagucmapdraw.geojson = payload.geojson;
  return newState;
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
  [SET_STYLES]           : (state, action) => newStyles(state, action.payload),
  [SET_OVERLAY]          : (state, action) => newOverlay(state, action.payload),
  [ADAGUCMAPDRAW_EDITING] : (state, action) => handleAdagucMapDrawEditing(state, action.payload),
  [ADAGUCMAPDRAW_DELETE] : (state, action) => handleAdagucMapDrawDelete(state, action.payload),
  [ADAGUCMAPDRAW_UPDATEFEATURE] : (state, action) => handleAdagucMapDrawUpdateFeature(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function adagucReducer (state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
