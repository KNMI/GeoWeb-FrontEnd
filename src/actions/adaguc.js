// ------------------------------------
// Actions
// ------------------------------------
import { ADD_LAYER,
ADD_OVERLAY_LAYER,
CREATE_MAP,
DELETE_LAYER,
LOGIN,
LOGOUT,
SET_CUT,
SET_MAP_STYLE,
SET_PRESET,
ALTER_LAYER,
REORDER_LAYER,
SET_WMJSLAYERS,
SET_TIME_DIMENSION,
TOGGLE_ANIMATION,
SET_MAP_MODE,
SET_LAYOUT,
CURSOR_LOCATION,
SET_GEOJSON,
SET_ACTIVE_PANEL,
ADAGUCMAPDRAW_UPDATEFEATURE } from '../constants/actions';

function updateFeature (geojson, text) {
  return {
    type: ADAGUCMAPDRAW_UPDATEFEATURE,
    payload: {
      geojson: geojson,
      text: text
    }
  };
}
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
function setCut (boundingbox) {
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
function setPreset (presetObj) {
  return {
    type: SET_PRESET,
    payload: presetObj
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

function setGeoJSON (json) {
  return {
    type: SET_GEOJSON,
    payload: json
  };
}

export const actions = {
  addLayer,
  addOverlayLayer,
  alterLayer,
  createMap,
  cursorLocation,
  deleteLayer,
  login,
  logout,
  reorderLayer,
  setActivePanel,
  setCut,
  setGeoJSON,
  setMapMode,
  setMapStyle,
  setLayout,
  setPreset,
  setTimeDimension,
  setWMJSLayers,
  toggleAnimation,
  updateFeature
};
