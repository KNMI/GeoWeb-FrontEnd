import cloneDeep from 'lodash/cloneDeep';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { ADD_LAYER,
ADD_OVERLAY_LAYER,
ADAGUCMAPDRAW_UPDATEFEATURE,
ADAGUCMEASUREDISTANCE_UPDATE,
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
SET_TRIGGER_LOCATIONS,
SET_ACTIVE_PANEL } from '../constants/actions';

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
  const layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);
  layersCpy.datalayers.unshift(payload);

  const oldPanel = cloneDeep(state.layers.panel);
  oldPanel[state.activeMapId] = layersCpy;
  const newlayers = Object.assign({}, state.layers, { panel: oldPanel });

  return Object.assign({}, state, { layers: newlayers });
};

const doAddOverlayLayer = (state, payload) => {
  const layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);
  const layerCpy = cloneDeep(payload);
  if (!layerCpy.enabled) {
    layerCpy.enabled = true;
  }
  layersCpy.overlays.unshift(layerCpy);

  const oldPanel = cloneDeep(state.layers.panel);
  oldPanel[state.activeMapId] = layersCpy;
  const newlayers = Object.assign({}, state.layers, { panel: oldPanel });

  return Object.assign({}, state, { layers: newlayers });
};

const doLogin = (state, payload) => {
  return Object.assign({}, state, { user: { isLoggedIn: true, userName: payload.userName, roles: payload.roles ? payload.roles : [] } });
};

const doLogout = (state) => {
  return Object.assign({}, state, { user: { isLoggedIn: false, userName: '', roles: [] } });
};

const sigmetLayers = (p) => {
  if (p === 'sigmet_layer_TS') {
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
    }
    );
  } else {
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

const setNewPreset = (state, payload) => {
  if (typeof payload === 'string') {
    const sigmetPreset = sigmetLayers(payload);
    const newLayers = Object.assign({}, state.layers, { panel: sigmetPreset.layers.panel });
    return Object.assign({}, state, { layers: newLayers, layout: sigmetPreset.layout, boundingBox: sigmetPreset.boundingBox });
  } else {
    const transform = (panels) => {
      const panel = [];
      panels.forEach((p) => {
        panel.push(Object.assign({
          datalayers: p.filter((layer) => layer.overlay === false).map((layer) => {
            layer.enabled = true;
            return layer;
          }),
          overlays: p.filter((layer) => layer.overlay === true)
        }));
      });
      while (panel.length !== 4) {
        panel.push(Object.assign({
          datalayers: [],
          overlays: []
        }));
      }
      return panel;
    };
    const payloadCpy = cloneDeep(payload);
    const bbox = payloadCpy.bbox ? Object.assign({}, state.boundingBox, { bbox: [0, payloadCpy.bbox.top, 1, payloadCpy.bbox.bottom] }) : state.boundingBox;
    const layout = payloadCpy.display ? payloadCpy.display.type : state.layout;
    const panel = payloadCpy.layers ? transform(payloadCpy.layers) : state.layers.panel;
    const newLayers = Object.assign({}, state.layers, { panel: panel });
    return Object.assign({}, state, { layers: newLayers, boundingBox: bbox, layout: layout });
  }
};

const doAlterLayer = (state, payload) => {
  const { index, layerType, fieldsNewValuesObj } = payload;
  const layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);

  switch (layerType) {
    case 'data':
      const oldDataLayer = layersCpy.datalayers[index];
      const newDatalayer = Object.assign({}, oldDataLayer, fieldsNewValuesObj);
      layersCpy.datalayers[index] = newDatalayer;
      const oldDataPanel = cloneDeep(state.layers.panel);
      oldDataPanel[state.activeMapId] = layersCpy;
      const newDataLayers = Object.assign({}, state.layers, { panel: oldDataPanel });
      return Object.assign({}, state, { layers: newDataLayers });
    case 'overlay':
      const oldOverlayLayer = layersCpy.overlays[index];
      const newOverlayLayer = Object.assign({}, oldOverlayLayer, fieldsNewValuesObj);
      layersCpy.overlays[index] = newOverlayLayer;
      const oldOverlayPanel = cloneDeep(state.layers.panel);
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

  const layersCpy = cloneDeep(state.layers.panel[state.activeMapId].datalayers);
  const temp = layersCpy[idx];
  layersCpy[idx] = layersCpy[direction + idx];
  layersCpy[direction + idx] = temp;

  const oldDataPanel = cloneDeep(state.layers.panel);
  oldDataPanel[state.activeMapId] = Object.assign({}, oldDataPanel[state.activeMapId], { datalayers: layersCpy });
  const newDataLayers = Object.assign({}, state.layers, { panel: oldDataPanel });
  return Object.assign({}, state, { layers: newDataLayers });
};

const doDeleteLayer = (state, payload) => {
  const { idx, type } = payload;
  const layersCpy = cloneDeep(state.layers.panel[state.activeMapId]);

  switch (type) {
    case 'data':
      layersCpy.datalayers.splice(idx, 1);
      const oldDataPanel = cloneDeep(state.layers.panel);
      oldDataPanel[state.activeMapId] = layersCpy;
      const newDataLayers = Object.assign({}, state.layers, { panel: oldDataPanel });
      return Object.assign({}, state, { layers: newDataLayers });
    case 'overlay':
      layersCpy.overlays.splice(idx, 1);
      const oldOverlayPanel = cloneDeep(state.layers.panel);
      oldOverlayPanel[state.activeMapId] = layersCpy;
      const newOverlayLayers = Object.assign({}, state.layers, { panel: oldOverlayPanel });
      return Object.assign({}, state, { layers: newOverlayLayers });
    default:
      return state;
  }
};

const newGeoJSON = (state, payload) => {
  return Object.assign({}, state, { adagucmapdraw: payload });
};

const handleAdagucMapDrawUpdateFeature = (state, payload) => {
  /* Returning new state is not strictly necessary,
    as the geojson in AdagucMapDraw is the same and does not require rerendering of the AdagucMapDraw component
  */
  const adagucmapdraw = Object.assign({}, state.adagucmapdraw, { geojson : payload.geojson });
  const adagucmeasuredistance = Object.assign({}, state.adagucmeasuredistance, { isInEditMode : false });
  return Object.assign({}, state, { adagucmeasuredistance: adagucmeasuredistance, adagucmapdraw: adagucmapdraw });
};
const handleAdagucMeasureDistanceUpdate = (state, payload) => {
  const adagucmeasuredistance = Object.assign({}, state.adagucmeasuredistance,
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
  let numPanels;
  let fixedPayload = payload;
  if (/quad/.test(payload)) {
    numPanels = 4;
  } else if (/triple/.test(payload)) {
    numPanels = 3;
  } else if (/dual/.test(payload)) {
    numPanels = 2;
  } else {
    numPanels = 1;
    fixedPayload = 'single';
  }
  const activeMapId = state.activeMapId < numPanels ? state.activeMapId : 0;
  return Object.assign({}, state, { layout: fixedPayload, activeMapId: activeMapId });
};
const newActivePanel = (state, payload) => {
  let numPanels;
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
const newTriggerLocations = (state, payload) => {
  return Object.assign({}, state, { triggerLocations: payload });
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
  [LOGOUT]                        : (state) => doLogout(state),
  [SET_PRESET]                    : (state, action) => setNewPreset(state, action.payload),
  [REORDER_LAYER]                 : (state, action) => doReorderLayer(state, action.payload),
  [SET_CUT]                       : (state, action) => newCut(state, action.payload),
  [SET_MAP_STYLE]                 : (state, action) => newMapStyle(state, action.payload),
  [SET_WMJSLAYERS]                : (state, action) => doSetWMJSLayers(state, action.payload),
  [SET_TIME_DIMENSION]            : (state, action) => doSetTimeDim(state, action.payload),
  [TOGGLE_ANIMATION]              : (state) => doToggleAnimation(state),
  [SET_MAP_MODE]                  : (state, action) => newMapMode(state, action.payload),
  [CURSOR_LOCATION]               : (state, action) => setCursorLocation(state, action.payload),
  [SET_LAYOUT]                    : (state, action) => newLayout(state, action.payload),
  [SET_GEOJSON]                   : (state, action) => newGeoJSON(state, action.payload),
  [SET_ACTIVE_PANEL]              : (state, action) => newActivePanel(state, action.payload),
  [SET_TRIGGER_LOCATIONS]         : (state, action) => newTriggerLocations(state, action.payload)
};

// ------------------------------------
// Reducer
// ------------------------------------
export default function adagucReducer (state, action) {
  if (!state) {
    state = {};
  }
  const handler = ACTION_HANDLERS[action.type];
  return handler ? handler(state, action) : state;
}
