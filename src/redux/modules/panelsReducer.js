import { createAction, handleActions } from 'redux-actions';
import { MAP_STYLES } from '../../constants/map_styles';
import { FEEDBACK_STATUS } from '../../config/StatusConfig';
import produce from 'immer';
import { cloneWMJSLayerProps } from '../../utils/CloneWMJSLayerProps';
const ADD_LAYER = 'ADD_LAYER';
const ADD_OVERLAY_LAYER = 'ADD_OVERLAY_LAYER';
const DELETE_LAYER = 'DELETE_LAYER';
const SET_PRESET_LAYERS = 'SET_PRESET_LAYERS';
const REPLACE_LAYER = 'REPLACE_LAYER';
const MOVE_LAYER = 'MOVE_LAYER';
const SET_PANEL_TYPE = 'SET_PANEL_TYPE';
const SET_ACTIVE_LAYER = 'SET_ACTIVE_LAYER';
const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL';
const SET_PANEL_LAYOUT = 'SET_PANEL_LAYOUT';
const SET_PANEL_FEEDBACK = 'SET_PANEL_FEEDBACK';
const RESET_LAYERS = 'RESET_LAYERS';
const SET_DIMENSION_VALUE = 'SET_DIMENSION_VALUE';
const SET_BASELAYER = 'SET_BASELAYER';

const addLayer = createAction(ADD_LAYER);
const setActiveLayer = createAction(SET_ACTIVE_LAYER);
const addOverlaysLayer = createAction(ADD_OVERLAY_LAYER);
const deleteLayer = createAction(DELETE_LAYER);
const setPresetLayers = createAction(SET_PRESET_LAYERS);
const replaceLayer = createAction(REPLACE_LAYER);
const moveLayer = createAction(MOVE_LAYER);
const setPanelType = createAction(SET_PANEL_TYPE);
const setActivePanel = createAction(SET_ACTIVE_PANEL);
const setPanelLayout = createAction(SET_PANEL_LAYOUT);
const setPanelFeedback = createAction(SET_PANEL_FEEDBACK);
const resetLayers = createAction(RESET_LAYERS);
const setDimensionValue = createAction(SET_DIMENSION_VALUE);
const setBaseLayer = createAction(SET_BASELAYER);

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

/* istanbul ignore next */
let INITIAL_STATE = {
  panels: [
    {
      baselayers: [MAP_STYLES[0]],
      layers: [],
      type: 'ADAGUC'
    },
    {
      baselayers: [MAP_STYLES[0]],
      layers: [],
      type: 'ADAGUC'
    },
    {
      baselayers: [MAP_STYLES[0]],
      layers: [],
      type: 'ADAGUC'
    },
    {
      baselayers: [MAP_STYLES[0]],
      layers: [],
      type: 'ADAGUC'
    }
  ],
  panelLayout: 'single',
  panelFeedback: {
    status: FEEDBACK_STATUS.OK,
    message: null
  },
  activePanelId: 0
};

export const actions = {
  addLayer,
  addOverlaysLayer,
  deleteLayer,
  replaceLayer,
  moveLayer,
  setActiveLayer,
  setPresetLayers,
  setPanelType,
  setActivePanel,
  setPanelLayout,
  setPanelFeedback,
  resetLayers,
  setDimensionValue,
  setBaseLayer
};

export default handleActions({
  [RESET_LAYERS]: (state) => {
    return produce(state, draftState => {
      draftState.panels[state.activePanelId] = {
        baselayers: [MAP_STYLES[0]],
        layers: [],
        type: 'ADAGUC'
      };
    });
  },
  [SET_ACTIVE_LAYER]: (state, { payload }) => {
    return produce(state, draftState => {
      draftState.panels[payload.activePanelId].layers.map((layer, i) => {
        layer.active = (i === payload.layerClicked);
      });
    });
  },
  [SET_PANEL_TYPE]: (state, { payload }) => {
    const mapId = payload.mapId;
    const panel = { ...state.panels[mapId], type: payload.type };
    const panelsCpy = [...state.panels];
    panelsCpy[mapId] = panel;
    return { ...state, panels: panelsCpy };
  },
  [ADD_LAYER]: (state, { payload }) => {
    return produce(state, draftState => {
      const panelId = payload.panelId;
      draftState.panels[panelId].layers.unshift(payload.layer);
      if (draftState.panels[panelId].layers.length === 1) {
        draftState.panels[panelId].layers[0].active = true;
      }
    });
  },
  [ADD_OVERLAY_LAYER]: (state, { payload }) => {
    const panelId = payload.panelId;
    const currentOverlays = state.panels[panelId].baselayers.filter((layer) => layer.keepOnTop === true);

    // Dont add it if it is already in the panel
    if (currentOverlays.some((layer) => layer.service === payload.layer.service && layer.name === payload.layer.name)) {
      return state;
    }
    return produce(state, draftState => {
      draftState.panels[panelId].baselayers.unshift(payload.layer);
    });
  },
  [DELETE_LAYER]: (state, { payload }) => {
    const { idx, type, mapId } = payload;
    return produce(state, draftState => {
      switch (type) {
        case 'data':
          const { layers } = draftState.panels[mapId || state.activePanelId];
          layers.splice(idx, 1);
          if (layers.length === 1 || (layers.length > 0 && !layers.some((layer) => layer.active === true))) {
            layers[0].active = true;
          }
          return;

        case 'overlay':
          const { baselayers } = draftState.panels[mapId || state.activePanelId];
          const base = baselayers.filter((layer) => !layer.keepOnTop);
          const overlay = baselayers.filter((layer) => layer.keepOnTop === true);
          overlay.splice(idx, 1);
          draftState.panels[mapId || state.activePanelId].baselayers = base.concat(overlay);
          break;
        default:
      }
    });
  },
  [REPLACE_LAYER]: (state, { payload }) => {
    const { index, layer, mapId } = payload;
    return produce(state, draftState => {
      if (layer.keepOnTop === true) {
        const baseLayers = state.panels[mapId].baselayers.filter((layer) => !layer.keepOnTop);
        const overlays = state.panels[mapId].baselayers.filter((layer) => layer.keepOnTop === true);
        overlays[index] = layer;
        draftState.panels[mapId].baselayers = baseLayers.concat(overlays);
      } else {
        draftState.panels[mapId].layers[index] = { ...layer };
      }
      const numActiveLayers = state.panels[mapId].layers.filter((layer) => layer.active === true).length;
      // If there are no active layers left, set it active
      if (state.panels[mapId].layers.length > 0 && numActiveLayers === 0) {
        draftState.panels[mapId].layers[index].active = true;
      }
      // If there are more than one, set it to false and figure this out later
      if (numActiveLayers > 1) {
        draftState.panels[mapId].layers[index].active = false;
      }
    });
  },
  [MOVE_LAYER]: (state, { payload }) => {
    const { oldIndex, newIndex, type } = payload;
    const move = function (arr, from, to) {
      arr.splice(to, 0, arr.splice(from, 1)[0]);
    };
    return produce(state, draftState => {
      if (type === 'data') {
        move(draftState.panels[state.activePanelId].layers, oldIndex, newIndex);
      } else {
        const base = draftState.panels[state.activePanelId].baselayers.filter((layer) => !layer.keepOnTop);
        const overlays = draftState.panels[state.activePanelId].baselayers.filter((layer) => layer.keepOnTop === true);
        move(overlays, oldIndex, newIndex);
        draftState.panels[state.activePanelId].baselayers = base.concat(overlays);
      }
    });
  },
  [SET_PRESET_LAYERS]: (state, { payload }) => {
    return produce(state, draftState => {
      payload.map((panel, i) => {
        draftState.panels[i].layers = [];
        if (panel) {
          draftState.panels[i].layers = panel.layers.filter((layer) => cloneWMJSLayerProps(layer));
          draftState.panels[i].baselayers = [MAP_STYLES[0]].concat(panel.baselayers);
          draftState.panels[i].type = panel.type || 'ADAGUC';
        }
      });
      draftState.panels.map((panel) => {
        if (panel.layers.length > 0) {
          if (panel.layers.filter((layer) => layer.active).length !== 1) {
            panel.layers.map((layer, i) => { layer.active = (i === 0); });
          }
        }
      });
    });
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
  },
  [SET_PANEL_FEEDBACK]: (state, { payload }) => {
    const status = Object.values(FEEDBACK_STATUS).includes(payload.status) ? payload.status : FEEDBACK_STATUS.OK;
    const message = typeof payload.message === 'string' ? payload.message : null;
    const panelFeedback = { ...state.panelFeedback, status, message };
    return { ...state, panelFeedback };
  },
  [SET_DIMENSION_VALUE]: (state, { payload }) => {
    const { mapId, layerIndex, dimensionName, value } = payload;
    return produce(state, draftState => {
      const layer = draftState.panels[mapId].layers[layerIndex];
      const layerDim = layer.dimensions.filter((dim) => dim.name === dimensionName);
      if (layerDim.length !== 1) {
        return;
      }
      layerDim[0].currentValue = value;
    });
  },
  [SET_BASELAYER]: (state, { payload }) => {
    const { index, layer } = payload;
    return produce(state, draftState => {
      const baseLayer = draftState.panels[state.activePanelId].baselayers.filter((baselayer) => !baselayer.keepOnTop)[index];
      baseLayer.name = layer.name;
      baseLayer.service = layer.service;
      baseLayer.type = layer.type;
    });
  }
}, INITIAL_STATE);
