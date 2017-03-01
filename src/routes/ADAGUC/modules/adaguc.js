import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
// ------------------------------------
// Constants
// ------------------------------------
const ADD_LAYER = 'ADD_LAYER';
const ADD_OVERLAY_LAYER = 'ADD_OVERLAY_LAYER';
const CREATE_MAP = 'CREATE_MAP';
const DELETE_LAYER = 'DELETE_LAYER';
const LOGIN = 'LOGIN';
const SET_CUT = 'SET_CUT';
const SET_MAP_STYLE = 'SET_MAP_STYLE';
const SET_STYLE = 'SET_STYLE';
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

function login (username) {
  return {
    type: LOGIN,
    payload: username
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
function setStyle (style = 0) {
  return {
    type: SET_STYLE,
    payload: style
  };
}
function addLayer (layer) {
  return {
    type: ADD_LAYER,
    payload: layer
  };
}

function addOverlayLayer (layer) {
  return {
    type: ADD_OVERLAY_LAYER,
    payload: layer
  };
}

function deleteLayer (layerParams) {
  return {
    type: DELETE_LAYER,
    payload: layerParams
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
  addLayer,
  addOverlayLayer,
  createMap,
  deleteLayer,
  login,
  setCut,
  setMapStyle,
  setStyle
};

/*
const initialState = {
  adagucProperties: {
    sources: {
      data: null,
      overlay: null
    },
    layers: {
      baselayer: MAP_STYLES[1],
      datalayers: [],
      overlays: []
    },
    boundingBox: BOUNDING_BOXES[0],
    projectionName: 'EPSG:3857',
    mapCreated: false
  },
  header: {
    title: 'hello Headers'
  },
  leftSideBar: {
    title: 'hello LeftSideBar'
  },
  m.ainViewport: {
    title: 'hello MainViewport'
  },
  rightSideBar: {
    title: 'hello RightSideBar'
  }
};
 */
const newMapState = (state, payload) => {
  console.log(payload);
  return Object.assign({}, state, { mapCreated: true },
    { sources: { data: payload.sources, overlay: [payload.overlays] } });
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
const doAddLayer = (state, payload) => {
  if (!state.layers) {
    state.layers = { datalayers: [], overlays: [] };
  }
  let oldlayers = state.layers.datalayers;
  const newlayers = Object.assign({}, state.layers, { datalayers: oldlayers.concat(payload) });

  return Object.assign({}, state, { layers: newlayers });
};

const doAddOverlayLayer = (state, payload) => {
  if (!state.layers) {
    state.layers = { datalayers: [], overlays: [] };
  }

  let oldlayers = state.layers.overlays;
  const newlayers = Object.assign({}, state.layers, { overlays: oldlayers.concat(payload) });

  return Object.assign({}, state, { layers: newlayers });
};

const doLogin = (state, payload) => {
  return Object.assign({}, state, { loggedIn: true, username: payload });
};

const doDeleteLayer = (state, payload) => {
  const newDataLayers = state.layers.datalayers.filter((layer) => layer !== payload);
  const newOverlayLayers = state.layers.overlays.filter((layer) => layer !== payload);
  let fitleredLayers;
  if (newDataLayers.length !== state.layers.datalayers.length) {
    fitleredLayers = { datalayers: newDataLayers };
  } else if (newOverlayLayers !== state.layers.datalayers.length) {
    fitleredLayers = { overlays: newOverlayLayers };
  }
  const newLayers = Object.assign({}, state.layers, fitleredLayers);
  return Object.assign({}, state, { layers: newLayers });
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ADD_LAYER]            : (state, action) => doAddLayer(state, action.payload),
  [ADD_OVERLAY_LAYER]    : (state, action) => doAddOverlayLayer(state, action.payload),
  [CREATE_MAP]           : (state, action) => newMapState(state, action.payload),
  [DELETE_LAYER]         : (state, action) => doDeleteLayer(state, action.payload),
  [LOGIN]                : (state, action) => doLogin(state, action.payload),
  [SET_CUT]              : (state, action) => newCut(state, action.payload),
  [SET_MAP_STYLE]        : (state, action) => newMapStyle(state, action.payload),
  [SET_STYLE]            : (state, action) => newStyle(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function adagucReducer (state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
