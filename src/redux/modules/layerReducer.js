import { createAction, handleActions } from 'redux-actions';
import { MAP_STYLES } from '../../constants/map_styles';
import cloneDeep from 'lodash.clonedeep';
const ADD_LAYER = 'ADD_LAYER';
const ADD_OVERLAY_LAYER = 'ADD_OVERLAY_LAYER';
const DELETE_LAYER = 'DELETE_LAYER';
const SET_PRESET = 'SET_PRESET';
const ALTER_LAYER = 'ALTER_LAYER';
const REORDER_LAYER = 'REORDER_LAYER';
const SET_WMJSLAYERS = 'SET_WMJSLAYERS';
const SET_PANEL_TYPE = 'SET_PANEL_TYPE';
const SET_ACTIVE_LAYER = 'SET_ACTIVE_LAYER';

const addLayer = createAction(ADD_LAYER);
const setActiveLayer = createAction(SET_ACTIVE_LAYER);
const addOverlaysLayer = createAction(ADD_OVERLAY_LAYER);
const deleteLayer = createAction(DELETE_LAYER);
const setPreset = createAction(SET_PRESET);
const alterLayer = createAction(ALTER_LAYER);
const reorderLayers = createAction(REORDER_LAYER);
const setWMJSLayers = createAction(SET_WMJSLAYERS);
const setPanelType = createAction(SET_PANEL_TYPE);

let INITIAL_STATE = {
  wmjsLayers: {},
  baselayer: MAP_STYLES[1],
  panels: [
    {
      overlays: [],
      layers: [],
      type: 'ADAGUC'
    },
    {
      overlays: [],
      layers: [],
      type: 'ADAGUC'
    },
    {
      overlays: [],
      layers: [],
      type: 'ADAGUC'
    },
    {
      overlays: [],
      layers: [],
      type: 'ADAGUC'
    }
  ]
};

export const actions = {
  addLayer,
  setPanelType,
  addOverlaysLayer,
  deleteLayer,
  setPreset,
  setActiveLayer,
  alterLayer,
  reorderLayers,
  setWMJSLayers
};

export default handleActions({
  [SET_ACTIVE_LAYER]: (state, { payload }) => {
    const panels = cloneDeep(state.panels);
    const panel = panels[payload.activeMapId];
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
    const activeMapId = payload.activeMapId;
    const layer = { ...payload.layer };
    layer.enabled = 'enabled' in payload.layer ? payload.layer.enabled : true;
    layer.active = 'active' in payload.layer ? payload.layer.active : false;
    const newLayers = [payload.layer, ...state.panels[activeMapId].layers];
    if (newLayers.length === 1 || !newLayers.some((layer) => layer.active === true)) {
      newLayers[0].active = true;
    }
    const newPanel = { ...state.panels[activeMapId], layers: newLayers };
    const newPanels = [...state.panels];
    newPanels[activeMapId] = newPanel;
    return { ...state, panels: newPanels };
  },
  [ADD_OVERLAY_LAYER]: (state, { payload }) => {
    const activeMapId = payload.activeMapId;
    const newLayers = [payload.layer, ...state.panels[activeMapId].overlays];
    const newPanel = { ...state.panels[activeMapId], overlays: newLayers };
    const newPanels = [...state.panels];
    newPanels[activeMapId] = newPanel;
    return { ...state, panels: newPanels };
  },
  [DELETE_LAYER]: (state, { payload }) => {
    const { idx, type, activeMapId } = payload;
    let layers,
      panel,
      panels;
    switch (type) {
      case 'data':
        layers = [...state.panels[activeMapId].layers];
        layers.splice(idx, 1);
        if (layers.length === 1 || (layers.length > 0 && !layers.some((layer) => layer.active === true))) {
          layers[0].active = true;
        }

        panel = { ...state.panels[activeMapId], layers };
        panels = [...state.panels];
        panels[activeMapId] = panel;
        return { ...state, panels };

      case 'overlay':
        layers = [...state.panels[activeMapId].overlays];
        layers.splice(idx, 1);
        panel = { ...state.panels[activeMapId], overlays: layers };
        panels = [...state.panels];
        panels[activeMapId] = panel;
        return { ...state, panels };

      default:
        return state;
    }
  },
  [ALTER_LAYER]: (state, { payload }) => {
    const { index, layerType, fieldsNewValuesObj, activeMapId } = payload;
    let alteredLayer,
      layers,
      panel,
      panels;
    switch (layerType) {
      case 'data':
        alteredLayer = Object.assign({}, state.panels[activeMapId].layers[index], fieldsNewValuesObj);
        layers = [...state.panels[activeMapId].layers];
        layers[index] = alteredLayer;
        panel = { ...state.panels[activeMapId], layers };
        panels = [...state.panels];
        panels[activeMapId] = panel;
        return { ...state, panels };

      case 'overlay':
        alteredLayer = Object.assign({}, state.panels[activeMapId].overlays[index], fieldsNewValuesObj);
        layers = [...state.panels[activeMapId].overlays];
        layers[index] = alteredLayer;
        panel = { ...state.panels[activeMapId], overlays: layers };
        panels = [...state.panels];
        panels[activeMapId] = panel;
        return { ...state, panels };

      case 'base':
        const newBaseLayer = Object.assign({}, state.baselayer, fieldsNewValuesObj);
        return { ...state, baselayer: newBaseLayer };
      default:
        return state;
    }
  },
  [REORDER_LAYER]: (state, { payload }) => {
    const { direction, index, activeMapId } = payload;
    if ((index === 0 && direction === 'up') || (index === state.panels[activeMapId].layers.length - 1 && direction === 'down')) {
      return state;
    }
    const layers = [...state.panels[activeMapId].layers];
    layers.splice(index + (direction === 'up' ? -1 : 1), 0, layers.splice(index, 1)[0]);
    const panel = { ...state.panels[activeMapId], layers };
    const panels = [...state.panels];
    panels[activeMapId] = panel;
    return { ...state, panels };
  },
  [SET_WMJSLAYERS]: (state, { payload }) => ({ ...state, wmjsLayers: payload }),
  [SET_PRESET]: (state, { payload }) => {
    const panels = [
      {
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      },
      {
        overlays: [],
        layers: [],
        type: 'PROGTEMP'
      },
      {
        overlays: [],
        layers: [],
        type: 'TIMESERIES'
      },
      {
        overlays: [],
        layers: [],
        type: 'ADAGUC'
      }
    ];

    payload.forEach((panel, i) => {
      panels[i].layers = panel.filter(layer => layer.overlay === false);
      panels[i].overlays = panel.filter(layer => layer.overlay === true);
    });

    return { ...state, panels };
  }
}, INITIAL_STATE);
