import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import cloneDeep from 'lodash/cloneDeep';
import { ADAGUCMAPDRAW_UPDATEFEATURE } from '../components/AdagucMapDraw';
import { ADAGUCMEASUREDISTANCE_UPDATE } from '../components/AdagucMeasureDistance';
// ------------------------------------
// Constants
// ------------------------------------

const ADD_LAYER = 'ADD_LAYER';
const ADD_OVERLAY_LAYER = 'ADD_OVERLAY_LAYER';
const CREATE_MAP = 'CREATE_MAP';
const DELETE_LAYER = 'DELETE_LAYER';
const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';
const SET_CUT = 'SET_CUT';
const SET_MAP_STYLE = 'SET_MAP_STYLE';
const SET_PRESET = 'SET_PRESET';
const ALTER_LAYER = 'ALTER_LAYER';
const REORDER_LAYER = 'REORDER_LAYER';
const SET_WMJSLAYERS = 'SET_WMJSLAYERS';
const SET_TIME_DIMENSION = 'SET_TIME_DIMENSION';
const TOGGLE_ANIMATION = 'TOGGLE_ANIMATION';
const SET_MAP_MODE = 'SET_MAP_MODE';
const SET_LAYOUT = 'SET_LAYOUT';
const CURSOR_LOCATION = 'CURSOR_LOCATION';
const SET_GEOJSON = 'SET_GEOJSON';
const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL';

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
function setActivePanel (mapId) {
  return {
    type: SET_ACTIVE_PANEL,
    payload: mapId
  };
}
function setLayout (layout) {
  return {
    type: SET_LAYOUT,
    payload: layout
  };
}
function cursorLocation (closest) {
  return {
    type: CURSOR_LOCATION,
    payload: closest
  };
}
function setMapMode (mode) {
  return {
    type: SET_MAP_MODE,
    payload: mode
  };
}
function setWMJSLayers (layers) {
  return {
    type: SET_WMJSLAYERS,
    payload: layers
  };
}
function login (userobject) {
  return {
    type: LOGIN,
    payload: userobject
  };
}
function logout () {
  return {
    type: LOGOUT
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
function addLayer (layer) {
  return {
    type: ADD_LAYER,
    payload: Object.assign({}, layer, { enabled: true, opacity: 1 })
  };
}
function alterLayer (index, layerType, fieldsNewValuesObj) {
  return {
    type: ALTER_LAYER,
    payload: { index, layerType, fieldsNewValuesObj }
  };
}
function addOverlayLayer (layer) {
  return {
    type: ADD_OVERLAY_LAYER,
    payload: layer
  };
}
function reorderLayer (direction, index) {
  return {
    type: REORDER_LAYER,
    payload: { direction, index }
  };
}
function setPreset (presetName) {
  return {
    type: SET_PRESET,
    payload: presetName
  };
}
function deleteLayer (layerParams, layertype) {
  return {
    type: DELETE_LAYER,
    payload: {
      idx: layerParams,
      type : layertype
    }
  };
}
function setTimeDimension (timedim) {
  return {
    type: SET_TIME_DIMENSION,
    payload: timedim
  };
}
function toggleAnimation () {
  return {
    type: TOGGLE_ANIMATION
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

// TODO: This info should be obtained form the backend
const sigmetLayers = (p) => {
  console.log(p);
  switch (p) {
    case 'sigmet_layer_TS':
      return (
      {
        layers: {
          panel: [
            {
              datalayers: [
                {
                  service: 'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
                  title: 'HARM_N25_EXT',
                  name: 'precipitation_flux',
                  label: 'Prec: Precipitation rate',
                  opacity: 1,
                  enabled: true
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            },
            {
              datalayers: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OBS.cgi?',
                  title: 'OBS',
                  name: '10M/ww',
                  label: 'wawa Weather Code (ww)',
                  enabled: true,
                  opacity: 1
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            },
            {
              datalayers: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
                  title: 'RADAR',
                  name: 'precipitation',
                  label: 'Neerslag',
                  opacity: 1,
                  enabled: true
                }, {
                  service: 'http://bvmlab-218-41.knmi.nl/cgi-bin/WWWRADAR3.cgi?',
                  title: 'LGT',
                  name: 'LGT_NL25_LAM_05M',
                  label: 'LGT_NL25_LAM_05M',
                  enabled: true,
                  opacity: 1
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            },
            {
              datalayers: [],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            }
          ]
        },
        boundingBox: BOUNDING_BOXES[1],
        layout: 'quaduneven'
      });
    default:
      return (
      {
        layers: {
          panel: [
            {
              datalayers: [
                {
                  service: 'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
                  title: 'HARM_N25_EXT',
                  name: 'precipitation_flux',
                  label: 'Prec: Precipitation rate',
                  opacity: 1,
                  enabled: true
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            },
            {
              datalayers: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OBS.cgi?',
                  title: 'OBS',
                  name: '10M/ww',
                  label: 'wawa Weather Code (ww)',
                  enabled: true,
                  opacity: 1
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            },
            {
              datalayers: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
                  title: 'RADAR',
                  name: 'precipitation',
                  label: 'Neerslag',
                  opacity: 1,
                  enabled: true
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            },
            {
              datalayers: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.SAT.cgi?',
                  title: 'SAT',
                  name: 'HRV-COMB',
                  label: 'RGB-HRV-COMB',
                  enabled: true,
                  opacity: 1
                }
              ],
              overlays: [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true
                }
              ]
            }
          ]
        },
        boundingBox: BOUNDING_BOXES[1],
        layout: 'quaduneven'
      });
  }
};

export const actions = {
  addLayer,
  addOverlayLayer,
  createMap,
  deleteLayer,
  login,
  logout,
  setCut,
  setMapStyle,
  setPreset,
  reorderLayer,
  setWMJSLayers,
  alterLayer,
  setMapMode,
  toggleAnimation,
  setTimeDimension,
  cursorLocation,
  setLayout,
  setGeoJSON,
  setActivePanel
};

const newMapState = (state, payload) => {
  return Object.assign({}, state, { mapCreated: true },
    { sources: { data: payload.sources, overlay: [payload.overlays] } });
};
const newMapStyle = (state, payload) => {
  return Object.assign({}, state, { mapType: MAP_STYLES[payload] });
};
const newCut = (state, payload) => {
  return Object.assign({}, state, { boundingBox: payload });
};
const doAddLayer = (state, payload) => {
  let layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);
  layersCpy.datalayers.unshift(payload);

  let oldPanel = cloneDeep(state.layers.panel);
  oldPanel[state.activeMapId] = layersCpy;
  const newlayers = Object.assign({}, state.layers, { panel: oldPanel });

  return Object.assign({}, state, { layers: newlayers });
};

const doAddOverlayLayer = (state, payload) => {
  let layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);
  if (!payload.enabled) {
    payload.enabled = true;
  }
  layersCpy.overlays.unshift(payload);

  let oldPanel = cloneDeep(state.layers.panel);
  oldPanel[state.activeMapId] = layersCpy;
  const newlayers = Object.assign({}, state.layers, { panel: oldPanel });

  return Object.assign({}, state, { layers: newlayers });
};

const doLogin = (state, payload) => {
  return Object.assign({}, state, { user: { isLoggedIn: true, userName: payload.userName, roles: payload.roles ? payload.roles : [] } });
};

const doLogout = (state, payload) => {
  return Object.assign({}, state, { user: { isLoggedIn: false, userName: '', roles: [] } });
};

const setNewPreset = (state, payload) => {
  console.log(payload);
  // Fetch preset with name from server and apply it
  const sigmet = sigmetLayers(payload);
  const newLayers = Object.assign({}, state.layers, { panel: sigmet.layers.panel });
  return Object.assign({}, state, { layers: newLayers, boundingBox: sigmet.boundingBox, layout: sigmet.layout });
};

const doAlterLayer = (state, payload) => {
  const { index, layerType, fieldsNewValuesObj } = payload;
  let layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);

  switch (layerType) {
    case 'data':
      const oldDataLayer = layersCpy.datalayers[index];
      const newDatalayer = Object.assign({}, oldDataLayer, fieldsNewValuesObj);
      layersCpy.datalayers[index] = newDatalayer;
      let oldDataPanel = cloneDeep(state.layers.panel);
      oldDataPanel[state.activeMapId] = layersCpy;
      const newDataLayers = Object.assign({}, state.layers, { panel: oldDataPanel });
      return Object.assign({}, state, { layers: newDataLayers });
    case 'overlay':
      const oldOverlayLayer = layersCpy.overlays[index];
      const newOverlayLayer = Object.assign({}, oldOverlayLayer, fieldsNewValuesObj);
      layersCpy.overlays[index] = newOverlayLayer;
      let oldOverlayPanel = cloneDeep(state.layers.panel);
      oldOverlayPanel[state.activeMapId] = layersCpy;
      const newOverlayLayers = Object.assign({}, state.layers, { panel: oldOverlayPanel });
      return Object.assign({}, state, { layers: newOverlayLayers });
    case 'base':
      const newBaseLayer = Object.assign({}, state.layers.baselayer, fieldsNewValuesObj);
      const newLayersObj = Object.assign({}, state.layers, { baselayer: newBaseLayer });
      return Object.assign({}, state, { layers: newLayersObj });
    default:
      return state;
  }
};

const doReorderLayer = (state, payload) => {
  const direction = payload.direction === 'up' ? -1 : 1;
  const idx = payload.index;
  if (idx + direction < 0 || idx + direction >= state.layers.panel[state.activeMapId].datalayers.length) {
    return state;
  }

  let layersCpy = cloneDeep(state.layers.panel[state.activeMapId].datalayers);
  const temp = layersCpy[idx];
  layersCpy[idx] = layersCpy[direction + idx];
  layersCpy[direction + idx] = temp;

  let oldDataPanel = cloneDeep(state.layers.panel);
  oldDataPanel[state.activeMapId] = Object.assign({}, oldDataPanel[state.activeMapId], { datalayers: layersCpy });
  const newDataLayers = Object.assign({}, state.layers, { panel: oldDataPanel });
  return Object.assign({}, state, { layers: newDataLayers });
};

const doDeleteLayer = (state, payload) => {
  const { idx, type } = payload;
  let layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);

  switch (type) {
    case 'data':
      layersCpy.datalayers.splice(idx, 1);
      let oldDataPanel = cloneDeep(state.layers.panel);
      oldDataPanel[state.activeMapId] = layersCpy;
      const newDataLayers = Object.assign({}, state.layers, { panel: oldDataPanel });
      return Object.assign({}, state, { layers: newDataLayers });
    case 'overlay':
      layersCpy.overlays.splice(idx, 1);
      let oldOverlayPanel = cloneDeep(state.layers.panel);
      oldOverlayPanel[state.activeMapId] = layersCpy;
      const newOverlayLayers = Object.assign({}, state.layers, { panel: oldOverlayPanel });
      return Object.assign({}, state, { layers: newOverlayLayers });
    default:
      return state;
  }
};

function setGeoJSON (json) {
  return {
    type: SET_GEOJSON,
    payload: json
  };
}

const newGeoJSON = (state, payload) => {
  return Object.assign({}, state, { adagucmapdraw: payload });
};

const handleAdagucMapDrawUpdateFeature = (state, payload) => {
  /* Returning new state is not strictly necessary,
    as the geojson in AdagucMapDraw is the same and does not require rerendering of the AdagucMapDraw component
  */
  let adagucmapdraw = Object.assign({}, state.adagucmapdraw, { geojson : payload.geojson });
  let adagucmeasuredistance = Object.assign({}, state.adagucmeasuredistance, { isInEditMode : false });
  return Object.assign({}, state, { adagucmeasuredistance: adagucmeasuredistance, adagucmapdraw: adagucmapdraw });
};
const handleAdagucMeasureDistanceUpdate = (state, payload) => {
  let adagucmeasuredistance = Object.assign({}, state.adagucmeasuredistance,
    { distance : payload.distance,
      bearing : payload.bearing
    });
  return Object.assign({}, state, { adagucmeasuredistance: adagucmeasuredistance });
};
const doSetWMJSLayers = (state, payload) => {
  return Object.assign({}, state, { wmjslayers: payload });
};
const doSetTimeDim = (state, payload) => {
  return Object.assign({}, state, { timedim: payload });
};
const doToggleAnimation = (state) => {
  return Object.assign({}, state, { animate: !state.animate });
};
const newMapMode = (state, payload) => {
  return Object.assign({}, state, { mapMode: payload });
};
const setCursorLocation = (state, payload) => {
  const loc = { location: payload };
  return Object.assign({}, state, { cursor: loc });
};
const newLayout = (state, payload) => {
  let numPanels = -1;
  if (/quad/.test(payload)) {
    numPanels = 4;
  } else if (/triple/.test(payload)) {
    numPanels = 3;
  } else if (/dual/.test(payload)) {
    numPanels = 2;
  } else {
    numPanels = 1;
  }
  const activeMapId = state.activeMapId < numPanels ? state.activeMapId : 0;
  return Object.assign({}, state, { layout: payload, activeMapId: activeMapId });
};
const newActivePanel = (state, payload) => {
  let numPanels = -1;
  if (/quad/.test(state.layout)) {
    numPanels = 4;
  } else if (/triple/.test(state.layout)) {
    numPanels = 3;
  } else if (/dual/.test(state.layout)) {
    numPanels = 2;
  } else {
    numPanels = 1;
  }
  const activeMapId = payload < numPanels ? payload : 0;
  return Object.assign({}, state, { activeMapId: activeMapId });
};
// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS = {
  [ADAGUCMAPDRAW_UPDATEFEATURE]   : (state, action) => handleAdagucMapDrawUpdateFeature(state, action.payload),
  [ADAGUCMEASUREDISTANCE_UPDATE]  : (state, action) => handleAdagucMeasureDistanceUpdate(state, action.payload),
  [ADD_LAYER]                     : (state, action) => doAddLayer(state, action.payload),
  [ADD_OVERLAY_LAYER]             : (state, action) => doAddOverlayLayer(state, action.payload),
  [ALTER_LAYER]                   : (state, action) => doAlterLayer(state, action.payload),
  [CREATE_MAP]                    : (state, action) => newMapState(state, action.payload),
  [DELETE_LAYER]                  : (state, action) => doDeleteLayer(state, action.payload),
  [LOGIN]                         : (state, action) => doLogin(state, action.payload),
  [LOGOUT]                        : (state, action) => doLogout(state, action.payload),
  [SET_PRESET]                    : (state, action) => setNewPreset(state, action.payload),
  [REORDER_LAYER]                 : (state, action) => doReorderLayer(state, action.payload),
  [SET_CUT]                       : (state, action) => newCut(state, action.payload),
  [SET_MAP_STYLE]                 : (state, action) => newMapStyle(state, action.payload),
  [SET_WMJSLAYERS]                : (state, action) => doSetWMJSLayers(state, action.payload),
  [SET_TIME_DIMENSION]            : (state, action) => doSetTimeDim(state, action.payload),
  [TOGGLE_ANIMATION]              : (state, action) => doToggleAnimation(state),
  [SET_MAP_MODE]                  : (state, action) => newMapMode(state, action.payload),
  [CURSOR_LOCATION]               : (state, action) => setCursorLocation(state, action.payload),
  [SET_LAYOUT]                    : (state, action) => newLayout(state, action.payload),
  [SET_GEOJSON]                   : (state, action) => newGeoJSON(state, action.payload),
  [SET_ACTIVE_PANEL]              : (state, action) => newActivePanel(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function adagucReducer (state = {}, action) {
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
