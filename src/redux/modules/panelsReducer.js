import { createAction, handleActions } from 'redux-actions';
import { MAP_STYLES } from '../../constants/map_styles';
import cloneDeep from 'lodash.clonedeep';
const ADD_LAYER = 'ADD_LAYER';
const ADD_OVERLAY_LAYER = 'ADD_OVERLAY_LAYER';
const DELETE_LAYER = 'DELETE_LAYER';
const SET_PRESET = 'SET_PRESET';
const REPLACE_LAYER = 'REPLACE_LAYER';
const MOVE_LAYER = 'MOVE_LAYER';
const SET_WMJSLAYERS = 'SET_WMJSLAYERS';
const SET_PANEL_TYPE = 'SET_PANEL_TYPE';
const SET_ACTIVE_LAYER = 'SET_ACTIVE_LAYER';
const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL';
const SET_PANEL_LAYOUT = 'SET_PANEL_LAYOUT';

const addLayer = createAction(ADD_LAYER);
const setActiveLayer = createAction(SET_ACTIVE_LAYER);
const addOverlaysLayer = createAction(ADD_OVERLAY_LAYER);
const deleteLayer = createAction(DELETE_LAYER);
const setPreset = createAction(SET_PRESET);
const replaceLayer = createAction(REPLACE_LAYER);
const moveLayer = createAction(MOVE_LAYER);
const setPanelType = createAction(SET_PANEL_TYPE);
const setActivePanel = createAction(SET_ACTIVE_PANEL);
const setPanelLayout = createAction(SET_PANEL_LAYOUT);

const getNumPanels = (name) => {
  let numPanels = 0;
  if (/quad/.test(name)) {
    numPanels = 4;
  } else if (/triple/.test(name)) {
    numPanels = 3;
  } else if (/dual/.test(name)) {
    numPanels = 2;
  } else {
    numPanels = 1;
  }
  return numPanels;
};

let INITIAL_STATE = {
  panels: [
    {
      baselayers: [MAP_STYLES[1]],
      layers: [],
      type: 'ADAGUC'
    },
    {
      baselayers: [MAP_STYLES[1]],
      layers: [],
      type: 'ADAGUC'
    },
    {
      baselayers: [MAP_STYLES[1]],
      layers: [],
      type: 'ADAGUC'
    },
    {
      baselayers: [MAP_STYLES[1]],
      layers: [],
      type: 'ADAGUC'
    }
  ],
  panelLayout: 'single',
  activePanelId: 0
};

export const actions = {
  addLayer,
  addOverlaysLayer,
  deleteLayer,
  replaceLayer,
  moveLayer,
  setActiveLayer,
  setPreset,
  setPanelType,
  setActivePanel,
  setPanelLayout
};

export default handleActions({
  [SET_ACTIVE_LAYER]: (state, { payload }) => {
    const panels = cloneDeep(state.panels);
    const panel = panels[payload.activePanelId];
    panel.layers.map((layer, i) => {
      layer.active = i === payload.layerClicked;
    });
    return { ...state, panels };
  },
  [SET_PANEL_TYPE]: (state, { payload }) => {
    const mapId = payload.mapId;
    const panel = { ...state.panels[mapId], type: payload.type };
    const panelsCpy = [...state.panels];
    panelsCpy[mapId] = panel;
    return { ...state, panels: panelsCpy };
  },
  [ADD_LAYER]: (state, { payload }) => {
    const panelId = payload.panelId;

    const stateCpy = cloneDeep(state);
    stateCpy.panels[panelId].layers.push(payload.layer);
    if (stateCpy.panels[panelId].layers.length === 1) {
      stateCpy.panels[panelId].layers[0].active = true;
    }
    return stateCpy;
  },
  [ADD_OVERLAY_LAYER]: (state, { payload }) => {
    const panelId = payload.panelId;
    const currentOverlays = state.panels[panelId].baselayers.filter((layer) => layer.keepOnTop === true);

    // Dont add it if it is already in the panel
    if (currentOverlays.some((layer) => layer.service === payload.layer.service && layer.name === payload.layer.name)) {
      return state;
    }
    const stateCpy = cloneDeep(state);
    stateCpy.panels[panelId].baselayers.push(payload.layer);
    return stateCpy;
  },
  [DELETE_LAYER]: (state, { payload }) => {
    const { idx, type, mapId } = payload;
    const stateCpy = cloneDeep(state);
    switch (type) {
      case 'data':
        const { layers } = stateCpy.panels[mapId || state.activePanelId];
        layers.splice(idx, 1);
        if (layers.length === 1 || (layers.length > 0 && !layers.some((layer) => layer.active === true))) {
          layers[0].active = true;
        }
        return stateCpy;


      case 'overlay':
        const { baselayers } = stateCpy.panels[mapId || state.activePanelId];
        const base = baselayers.filter((layer) => layer.keepOnTop === false);
        const overlay = baselayers.filter((layer) => layer.keepOnTop === true);
        overlay.splice(idx, 1);
        stateCpy.panels[mapId || state.activePanelId].baselayers = base.concat(overlay);
        return stateCpy;
      default:
        return state;
    }
  },
  [REPLACE_LAYER]: (state, { payload }) => {
    const { index, layer } = payload;
    const stateCpy = cloneDeep(state);

    stateCpy.panels[state.activePanelId].layers[index] = layer;

    const numActiveLayers = stateCpy.panels[state.activePanelId].layers.filter((layer) => layer.active === true).length;

    // If there are no active layers left, set it active
    if (numActiveLayers === 0) {
      stateCpy.panels[state.activePanelId].layers[index].active = true;
    }

    // If there are more than one, set it to false and figure this out later
    if (numActiveLayers > 1) {
      stateCpy.panels[state.activePanelId].layers[index].active = false;
    }

    return stateCpy;
  },
  [MOVE_LAYER]: (state, { payload }) => {
    const { oldIndex, newIndex, type } = payload;
    const move = function(arr, from, to) {
        arr.splice(to, 0, arr.splice(from, 1)[0]);
    };

    const stateCpy = cloneDeep(state);
    if (type === 'data') {
      move(stateCpy.panels[state.activePanelId].layers, oldIndex, newIndex);
    } else {
      const base = stateCpy.panels[state.activePanelId].baselayers.filter((layer) => layer.keepOnTop === false);
      const overlays = stateCpy.panels[state.activePanelId].baselayers.filter((layer) => layer.keepOnTop === true);
      move(overlays, oldIndex, newIndex);
      stateCpy.panels[state.activePanelId].baselayers = base.concat(overlays);
    }
    return stateCpy;
  },
  [SET_PRESET]: (state, { payload }) => {
    const panels = [
      {
        overlays: [],
        panelsProperties: [],
        type: 'ADAGUC'
      },
      {
        overlays: [],
        panelsProperties: [],
        type: 'PROGTEMP'
      },
      {
        overlays: [],
        panelsProperties: [],
        type: 'TIMESERIES'
      },
      {
        overlays: [],
        panelsProperties: [],
        type: 'ADAGUC'
      }
    ];

    payload.forEach((panel, i) => {
      panels[i].panelsProperties = panel.filter(layer => layer.overlay === false);
      panels[i].overlays = panel.filter(layer => layer.overlay === true);
    });

    return { ...state, panels };
  },
  [SET_ACTIVE_PANEL]: (state, { payload }) => {
    const numPanels = getNumPanels(state.panelLayout);
    const activePanelId = payload < numPanels ? payload : 0;
    return { ...state, activePanelId };
  },
  [SET_PANEL_LAYOUT]: (state, { payload }) => {
    const numPanels = getNumPanels(payload);
    const panelLayout = numPanels === 1 ? 'single' : payload;
    const activePanelId = state.activePanelId < numPanels ? state.activePanelId : 0;
    return { ...state, panelLayout, activePanelId };
  }
}, INITIAL_STATE);
