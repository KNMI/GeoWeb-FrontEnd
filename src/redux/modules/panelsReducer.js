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
const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL';
const SET_PANEL_LAYOUT = 'SET_PANEL_LAYOUT';

const addLayer = createAction(ADD_LAYER);
const setActiveLayer = createAction(SET_ACTIVE_LAYER);
const addOverlaysLayer = createAction(ADD_OVERLAY_LAYER);
const deleteLayer = createAction(DELETE_LAYER);
const setPreset = createAction(SET_PRESET);
const alterLayer = createAction(ALTER_LAYER);
const reorderLayers = createAction(REORDER_LAYER);
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
  alterLayer,
  reorderLayers,
  setActiveLayer,
  setPreset,
  setPanelType,
  setActivePanel,
  setPanelLayout
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
    const newLayers = [payload.layer, ...state.panels[activeMapId].panelsProperties];
    if (newLayers.length === 1 || !newLayers.some((layer) => layer.active === true)) {
      newLayers[0].active = true;
    }
    const newPanel = { ...state.panels[activeMapId], panelsProperties: newLayers };
    const newPanels = [...state.panels];
    newPanels[activeMapId] = newPanel;
    return { ...state, panels: newPanels };
  },
  [ADD_OVERLAY_LAYER]: (state, { payload }) => {
    const panelId = payload.panelId;
    const currentOverlays = state.panels[panelId].baselayers.filter((layer) => layer.keepOnTop === true);

    // Dont add it if it is already in the panel
    if (currentOverlays.some((layer) => layer.service === payload.layer.service && layer.name === payload.layer.name)) {
      return state;
    }
    const newWMJSLayer = new WMJSLayer({ ...payload, keepOnTop: true });
    const stateCpy = cloneDeep(state);
    stateCpy.panels[panelId].baselayers.unshift(newWMJSLayer);
    return stateCpy;
  },
  [DELETE_LAYER]: (state, { payload }) => {
    const { idx, type, activeMapId } = payload;
    let panelsProperties,
      panel,
      panels;
    switch (type) {
      case 'data':
        panelsProperties = [...state.panels[activeMapId].panelsProperties];
        panelsProperties.splice(idx, 1);
        if (panelsProperties.length === 1 || (panelsProperties.length > 0 && !layers.some((layer) => layer.active === true))) {
          panelsProperties[0].active = true;
        }

        panel = { ...state.panels[activeMapId], panelsProperties };
        panels = [...state.panels];
        panels[activeMapId] = panel;
        return { ...state, panels };

      case 'overlay':
        panelsProperties = [...state.panels[activeMapId].overlays];
        panelsProperties.splice(idx, 1);
        panel = { ...state.panels[activeMapId], overlays: panelsProperties };
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
      panelsProperties,
      panel,
      panels;
    switch (layerType) {
      case 'data':
        alteredLayer = Object.assign({}, state.panels[activeMapId].panelsProperties[index], fieldsNewValuesObj);
        panelsProperties = [...state.panels[activeMapId].panelsProperties];
        panelsProperties[index] = alteredLayer;
        panel = { ...state.panels[activeMapId], panelsProperties };
        panels = [...state.panels];
        panels[activeMapId] = panel;
        return { ...state, panels };

      case 'overlay':
        alteredLayer = Object.assign({}, state.panels[activeMapId].overlays[index], fieldsNewValuesObj);
        panelsProperties = [...state.panels[activeMapId].overlays];
        panelsProperties[index] = alteredLayer;
        panel = { ...state.panels[activeMapId], overlays: panelsProperties };
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
    if ((index === 0 && direction === 'up') || (index === state.panels[activeMapId].panelsProperties.length - 1 && direction === 'down')) {
      return state;
    }
    const panelsProperties = [...state.panels[activeMapId].panelsProperties];
    panelsProperties.splice(index + (direction === 'up' ? -1 : 1), 0, panelsProperties.splice(index, 1)[0]);
    const panel = { ...state.panels[activeMapId], panelsProperties };
    const panels = [...state.panels];
    panels[activeMapId] = panel;
    return { ...state, panels };
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
    const numPanels = getNumPanels(state.layout);
    const activeMapId = payload < numPanels ? payload : 0;
    return { ...state, activeMapId };
  },
  [SET_PANEL_LAYOUT]: (state, { payload }) => {
    const numPanels = getNumPanels(payload);
    const layout = numPanels === 1 ? 'single' : payload;
    const activeMapId = state.activeMapId < numPanels ? state.activeMapId : 0;
    return { ...state, layout, activeMapId };
  }
}, INITIAL_STATE);
