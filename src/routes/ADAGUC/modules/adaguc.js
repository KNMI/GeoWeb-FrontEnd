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
const PREPARE_SIGMET = 'PREPARE_SIGMET';
const COORDS = 'COORDS';
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
function prepareSIGMET (phenomenon) {
  return {
    type: PREPARE_SIGMET,
    payload: phenomenon
  };
}
function deleteLayer (layerParams, layertype) {
  return {
    type: DELETE_LAYER,
    payload: {
      removeLayer: layerParams,
      type : layertype
    }
  };
}
function coords (newcoords) {
  return {
    type: COORDS,
    payload: newcoords
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

const sigmetLayers = (p) => {
  switch (p) {
    case 'OBSC TS':
    case 'EMBD TS':
    case 'FRQ TS':
    case 'SQL TS':
    case 'OBSC TSGR':
    case 'EMBD TSGR':
    case 'FRQ TSGR':
    case 'SQL TSGR':
      return (
      {
        layers: {
          datalayers: [
            {
              service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OBS.cgi?',
              title: 'OBS',
              name: '10M/ww',
              label: 'wawa Weather Code (ww)'
            },
            {
              service: 'http://bvmlab-218-41.knmi.nl/cgi-bin/WWWRADAR3.cgi?',
              title: 'LGT',
              name: 'LGT_NL25_LAM_05M',
              label: 'LGT_NL25_LAM_05M'
            },
            {
              service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
              title: 'RADAR',
              name: 'echotops',
              label: 'Echotoppen'
            },
            {
              service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
              title: 'RADAR',
              name: 'precipitation',
              label: 'Neerslag'
            },
            {
              service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.SAT.cgi?',
              title: 'SAT',
              name: 'HRV-COMB',
              label: 'RGB-HRV-COMB'
            }
          ],
          overlays: [
            {
              service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
              title: 'OVL',
              name: 'FIR_DEC_2013_EU',
              label: 'FIR areas'
            }
          ]
        },
        boundingBox: BOUNDING_BOXES[1]
      });
  }
};

export const actions = {
  addLayer,
  addOverlayLayer,
  createMap,
  deleteLayer,
  login,
  setCut,
  setMapStyle,
  setStyle,
  prepareSIGMET,
  coords
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
  let oldlayers = [...state.layers.datalayers];
  oldlayers.unshift(payload);
  const newlayers = Object.assign({}, state.layers, { datalayers: oldlayers });

  return Object.assign({}, state, { layers: newlayers });
};

const doAddOverlayLayer = (state, payload) => {
  if (!state.layers) {
    state.layers = { datalayers: [], overlays: [] };
  }

  let oldlayers = [...state.layers.overlays];
  oldlayers.unshift(payload);

  const newlayers = Object.assign({}, state.layers, { overlays: oldlayers });

  return Object.assign({}, state, { layers: newlayers });
};

const doLogin = (state, payload) => {
  return Object.assign({}, state, { loggedIn: true, username: payload });
};

const setSigmet = (state, payload) => {
  const sigmet = sigmetLayers(payload[0]);
  const newlayers = Object.assign({}, state.layers, sigmet.layers);
  return Object.assign({}, state, { layers: newlayers, boundingBox: sigmet.boundingBox });
};

const doDeleteLayer = (state, payload) => {
  const { removeLayer, type } = payload;
  console.log(removeLayer);
  let fitleredLayers;
  switch (type) {
    case 'data':
      fitleredLayers = Object.assign({}, state.layers, { datalayers: state.layers.datalayers.filter((layer) => layer !== removeLayer) });
      break;
    case 'overlay':
      fitleredLayers = Object.assign({}, state.layers, { overlays: state.layers.overlays.filter((layer) => layer !== removeLayer) });
      break;
    default:
      fitleredLayers = state.layers;
      break;
  }
  return Object.assign({}, state, { layers: fitleredLayers });
};

const setNewCoords = (state, payload) => {
  return Object.assign({}, state, { coords: payload });
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
  [SET_STYLE]            : (state, action) => newStyle(state, action.payload),
  [PREPARE_SIGMET]       : (state, action) => setSigmet(state, action.payload),
  [COORDS]               : (state, action) => setNewCoords(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function adagucReducer (state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];

  return handler ? handler(state, action) : state;
}
