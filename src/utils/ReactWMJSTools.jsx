var generatedLayerIds = 0;
export const generateLayerId = () => {
  generatedLayerIds++;
  return 'layerid_' + generatedLayerIds;
};

var generatedMapIds = 0;
export const generateMapId = () => {
  generatedMapIds++;
  return 'mapid_' + generatedMapIds;
};

/**
 * Map for registering wmjslayers with their id's
 */
var registeredWMJSLayersForReactLayerId = {};

/**
 * Registers a WMJSLayer in a lookuptable with a layerId
 * @param {WMJSLayer} wmjsLayer
 * @param {string} layerId
 */
export const registerWMJSLayer = (wmjsLayer, layerId) => {
  registeredWMJSLayersForReactLayerId[layerId] = wmjsLayer;
};

/**
 * Get the WMJSLayer from the lookuptable with layerId
 * @param {string} layerId
 */
export const getWMJSLayerById = (layerId) => {
  if (!layerId) {
    return null;
  }
  return registeredWMJSLayersForReactLayerId[layerId];
};

/**
 * Map for registering wmjslayers with their id's
 */
var registeredWMJSMapForReactMapId = {};

/**
 * Registers a WMJSLayer in a lookuptable with a wmjsMapId
 * @param {WMJSMap} wmjsMap
 * @param {string} wmjsMapId
 */
export const registerWMJSMap = (wmjsMap, wmjsMapId) => {
  registeredWMJSMapForReactMapId[wmjsMapId] = wmjsMap;
};

/**
 * Get the wmjsMap from the lookuptable with wmjsMapId
 * @param {string} wmjsMapId
 */
export const getWMJSMapById = (wmjsMapId) => {
  return registeredWMJSMapForReactMapId[wmjsMapId];
};

/**
 * Gets the layerIndex from either the layerId or layerIndex provided in the actions payload object.
 * @param {action} action
 * @param {array} layers Layers of the mappanel in the state.
 */
export const getLayerIndexFromAction = (action, layers) => {
  if (!action.payload.layerId && !action.payload.layerIndex) {
    console.log(action);
    console.warn(action.type + ': invalid action payload, either layerId or layerIndex is required');
    return null;
  }
  if (!action.payload.layerId) {
    if (action.payload.layerIndex >= 0 && action.payload.layerIndex < layers.length) {
      return action.payload.layerIndex;
    }
    console.warn(action.type + ': invalid action payload, layerIndex is outside bounds');
    return null;
  }
  const layerIndex = layers.findIndex(layer => layer.id === action.payload.layerId);
  if (layerIndex === -1) {
    console.warn(action.type + ': layerId ' + action.payload.layerId + ' not found');
    return null;
  }
  return layerIndex;
};

/**
 * Gets the mapPanelIndex from either the mapPanelId or mapPanelIndex provided in the actions payload object.
 * @param {action} action
 * @param {array} mapPanels mapPanels of the mappanel in the state.
 */
export const getMapPanelIndexFromAction = (action, mapPanels) => {
  if (!action.payload || (!action.payload.mapPanelId && !action.payload.mapPanelIndex)) {
    console.warn(action.type + ': invalid action payload, either mapPanelId or mapPanelIndex is required', action);
    return null;
  }
  if (!action.payload.mapPanelId) {
    if (action.payload.mapPanelIndex >= 0 && action.payload.mapPanelIndex < mapPanels.length) {
      return action.payload.mapPanelIndex;
    }
    console.warn('getMapPanelIndexFromAction from ' + action.type + ': invalid action payload, mapPanelIndex is outside bounds', action);
    return null;
  }
  const mapPanelIndex = mapPanels.findIndex(mapPanel => mapPanel.id === action.payload.mapPanelId);
  if (mapPanelIndex === -1) {
    console.warn(action.type + ': mapPanelId ' + action.payload.mapPanelId + ' not found');
    return null;
  }
  return mapPanelIndex;
};

export const getDimensionIndexFromAction = (action, dimensions) => {
  if (dimensions && dimensions.length) {
    const dimensionIndex = dimensions.findIndex(dimension => dimension.name === action.payload.dimension.name);
    if (dimensionIndex === -1) {
      return null;
    }
    return dimensionIndex;
  }
  return null;
};
