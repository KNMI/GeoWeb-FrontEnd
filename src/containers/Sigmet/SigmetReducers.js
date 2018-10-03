import produce from 'immer';
import moment from 'moment';
import { SIGMET_TEMPLATES, UNITS, UNITS_ALT, MODES_LVL, MOVEMENT_TYPES } from '../../components/Sigmet/SigmetTemplates';
import { SIGMET_MODES, LOCAL_ACTION_TYPES, CATEGORY_REFS, STATUSES } from './SigmetActions';
import { clearEmptyPointersAndAncestors, mergeInTemplate, isFeatureGeoJsonComplete, MODES_GEO_SELECTION, isObject } from '../../utils/json';
import { getPresetForPhenomenon } from '../../components/Sigmet/SigmetPresets';
import axios from 'axios';
import { notify } from 'reapop';
import cloneDeep from 'lodash.clonedeep';
import uuidv4 from 'uuid/v4';

const WARN_MSG = {
  PREREQUISITES_NOT_MET: 'Not all prerequisites are met yet:'
};

const ERROR_MSG = {
  RETRIEVE_SIGMETS: 'Could not retrieve SIGMETs:',
  RETRIEVE_PARAMS: 'Could not retrieve SIGMET parameters',
  RETRIEVE_PHENOMENA: 'Could not retrieve SIGMET phenomena',
  FEATURE_ID_MISMATCH: 'GeoJson: the %s feature has a mutated id'
};

/**
* Generate a 'next-half-hour-rounded now Moment object
* @return {moment} Moment-object with the current now in UTC rounded to the next half hour
*/
const getRoundedNow = () => {
  return moment.utc().minutes() < 30 ? moment.utc().startOf('hour').minutes(30) : moment.utc().startOf('hour').add(1, 'hour');
};

const toggleContainer = (evt, container) => {
  container.setState(produce(container.state, draftState => {
    draftState.isContainerOpen = !draftState.isContainerOpen;
  }));
};

const toggleCategory = (evt, ref, container) => {
  const { dispatch, mapActions } = container.props;
  container.setState(produce(container.state, draftState => {
    if (ref === CATEGORY_REFS.ADD_SIGMET && ref !== draftState.focussedCategoryRef) {
      draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
      draftState.focussedSigmet.uuid = null;
    }
    draftState.focussedSigmet.drawModeStart = null;
    draftState.focussedSigmet.drawModeEnd = null;
    draftState.focussedCategoryRef = (draftState.focussedCategoryRef === ref)
      ? null
      : ref;
  }), () => {
    dispatch(mapActions.setMapMode('pan'));
    setSigmetDrawing(null, container, ref === CATEGORY_REFS.ADD_SIGMET);
  });
};

const byValidDate = (sigmetA, sigmetB) => {
  let result = 0;
  if (sigmetA.validdate_end && sigmetB.validdate_end) {
    result = moment(sigmetA.validdate_end).valueOf() - moment(sigmetB.validdate_end).valueOf();
  }
  if (result === 0 && sigmetA.validdate && sigmetB.validdate) {
    result = moment(sigmetA.validdate).valueOf() - moment(sigmetB.validdate).valueOf();
  }
  return result;
};

const updateCategory = (ref, sigmets, container, callback = () => {}) => {
  const templateWithDefaults = {
    'SIGMET': getEmptySigmet(container)
  };
  templateWithDefaults['SIGMET'] = produce(templateWithDefaults['SIGMET'], draftState => {
    draftState.geojson = initialGeoJson();
  });
  container.setState(produce(container.state, draftState => {
    const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
    if (!isNaN(categoryIndex) && categoryIndex >= 0) {
      draftState.categories[categoryIndex].sigmets.length = 0;
      sigmets.sort(byValidDate);
      sigmets.forEach((incomingSigmet) => {
        /* FIXME: for diMosellaAtWork (reported MaartenPlieger, 05-09-2018, 10:30). MergeInTemplate coordinates needs different nesting for point/poly */
        let mergedSigmet = produce(mergeInTemplate(incomingSigmet, 'SIGMET', templateWithDefaults), sigmetToAddCoordsTo => {
          if (incomingSigmet && incomingSigmet.geojson && incomingSigmet.geojson.features && incomingSigmet.geojson.features.length > 0) {
            for (let f = 0; f < incomingSigmet.geojson.features.length; f++) {
              let incomingFeature = incomingSigmet.geojson.features[f];
              if (incomingFeature.geometry && incomingFeature.geometry.coordinates && incomingFeature.geometry.coordinates.length > 0) {
                sigmetToAddCoordsTo.geojson.features[f].geometry.coordinates = incomingFeature.geometry.coordinates;
              }
            }
          }
        });
        draftState.categories[categoryIndex].sigmets.push(mergedSigmet);
        if (incomingSigmet.uuid) {
          retrieveTAC(incomingSigmet.uuid, container);
        }
      });
    }
  }), callback);
};

const retrieveParameters = (container) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/sigmets/getsigmetparameters`;
  axios({
    method: 'get',
    url: endpoint,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    receivedParametersCallback(response, container);
  }).catch(error => {
    console.error(ERROR_MSG.RETRIEVE_PARAMS, error);
  });
};

const receivedParametersCallback = (response, container) => {
  if (response.status === 200 && response.data) {
    updateParameters(response.data, container, () => addSigmet(CATEGORY_REFS.ADD_SIGMET, container));
  } else {
    console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
  }
};

const updateParameters = (parameters, container, callback) => {
  if (process.env.NODE_ENV === 'development') {
    parameters.firareas = {
      EHAA: {
        firname: 'AMSTERDAM FIR',
        location_indicator_icao: 'EHAA',
        areapreset: 'NL_FIR',
        wv_maxhoursofvalidity: 4,
        wv_hoursbeforevalidity: 4,
        tc_maxhoursofvalidity: 0,
        tc_hoursbeforevalidity: 0,
        va_maxhoursofvalidity: 12,
        va_hoursbeforevalidity: 6,
        adjacent_firs: [
          'EKDK',
          'EDWW',
          'EDGG',
          'EBBU',
          'EGTT',
          'EGPX'
        ]
      }
    };
    parameters.active_firs = [ 'EHAA' ];
  }
  container.setState(produce(container.state, draftState => {
    draftState.parameters = parameters;
  }), callback);
};

const retrievePhenomena = (container) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/sigmets/getsigmetphenomena`;

  axios({
    method: 'get',
    url: endpoint,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    receivedPhenomenaCallback(response, container);
  }).catch(error => {
    console.error(ERROR_MSG.RETRIEVE_PHENOMENA, error);
  });
};

const receivedPhenomenaCallback = (response, container) => {
  if (response.status === 200 && response.data) {
    updatePhenomena(response.data, container, () => addSigmet(CATEGORY_REFS.ADD_SIGMET, container));
  } else {
    console.error(ERROR_MSG.RETRIEVE_PHENOMENA, response.status, response.data);
  }
};

const updatePhenomena = (phenomena, container, callback) => {
  const SEPARATOR = '_';
  if (process.env.NODE_ENV === 'development') {
    phenomena.push({
      phenomenon: {
        layerpreset: null,
        name: 'Volcanic Ash eruption',
        code: 'VA_ERUPTION'
      },
      variants: [],
      additions: []
    });
  }
  container.setState(produce(container.state, draftState => {
    if (Array.isArray(phenomena)) {
      draftState.phenomena.length = 0;
      phenomena.forEach((item) => {
        if (item.variants.length === 0) {
          const res = {
            name: item.phenomenon.name,
            code: item.phenomenon.code,
            layerpreset: item.phenomenon.layerpreset
          };
          item.additions.forEach((addition) => {
            draftState.phenomena.push({
              name: res.name + ' ' + addition.name,
              code: res.code + SEPARATOR + addition.code,
              layerpreset: item.phenomenon.layerpreset
            });
          });
          draftState.phenomena.push(res);
        } else {
          item.variants.forEach((variant) => {
            const res = {
              name: variant.name + ' ' + item.phenomenon.name.toLowerCase(),
              code: variant.code + SEPARATOR + item.phenomenon.code,
              layerpreset: item.phenomenon.layerpreset
            };
            item.additions.forEach((addition) => {
              draftState.phenomena.push({
                name: res.name + ' ' + addition.name,
                code: res.code + addition.code,
                layerpreset: item.phenomenon.layerpreset
              });
            });
            draftState.phenomena.push(res);
          });
        }
      });
    }
  }), callback);
};

const retrieveSigmets = (container, callback = () => {}) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/sigmets`;
  const addOneSigmetResponse = {
    status: 200,
    data: {
      nsigmets: 1,
      sigmets: [getEmptySigmet(container)]
    }
  };
  receivedSigmetsCallback(CATEGORY_REFS.ADD_SIGMET, addOneSigmetResponse, container, callback);
  let retrievableSigmets = [
    { ref: CATEGORY_REFS.ACTIVE_SIGMETS, urlSuffix: '?active=true' },
    { ref: CATEGORY_REFS.CONCEPT_SIGMETS, urlSuffix: `?active=false&status=${STATUSES.CONCEPT}` },
    { ref: CATEGORY_REFS.ARCHIVED_SIGMETS, urlSuffix: `?active=false&status=${STATUSES.CANCELED}` }
  ];
  retrievableSigmets.forEach((retrievableSigmet) => {
    axios({
      method: 'get',
      url: `${endpoint}${retrievableSigmet.urlSuffix}`,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      receivedSigmetsCallback(retrievableSigmet.ref, response, container, callback);
    }).catch(error => {
      console.error(ERROR_MSG.RETRIEVE_SIGMETS, retrievableSigmet.ref, error);
    });
  });
};

const receivedSigmetsCallback = (ref, response, container, callback) => {
  if (response.status === 200 && response.data) {
    if (response.data.nsigmets === 0 || !response.data.sigmets) {
      response.data.sigmets = [];
    }
    updateCategory(ref, response.data.sigmets, container, callback);
  } else {
    console.error(ERROR_MSG.RETRIEVE_SIGMETS, ref, response.status, response.data);
  }
};

const focusSigmet = (evt, uuid, container) => {
  const { dispatch, mapActions, sources } = container.props;
  const { state } = container;
  if (evt.target.tagName === 'BUTTON') {
    return;
  }
  let shouldClearDrawing = false;
  const modeMapping = {};
  modeMapping[MODES_GEO_SELECTION.POINT] = 'select-point';
  modeMapping[MODES_GEO_SELECTION.BOX] = 'select-region';
  modeMapping[MODES_GEO_SELECTION.POLY] = 'select-shape';
  modeMapping[MODES_GEO_SELECTION.FIR] = 'select-fir';

  const indices = findCategoryAndSigmetIndex(uuid, state);
  let drawModeStart = null;
  let drawModeEnd = null;

  if (indices.isFound) {
    const sigmet = state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex];
    if (sigmet) {
      const startFeature = sigmet.geojson.features.find((feature) => feature.properties.featureFunction === 'start');
      const endFeature = sigmet.geojson.features.find((feature) => feature.properties.featureFunction === 'end');
      drawModeStart = startFeature ? modeMapping[startFeature.properties.selectionType] : null;
      drawModeEnd = endFeature ? modeMapping[endFeature.properties.selectionType] : null;
    }
    const preset = getPresetForPhenomenon(sigmet.phenomenon, sources);
    updateDisplayedPreset(preset, container);
  }
  container.setState(produce(container.state, draftState => {
    if (draftState.focussedSigmet.uuid !== uuid) {
      draftState.focussedSigmet.uuid = uuid;
      draftState.focussedSigmet.drawModeStart = drawModeStart || null;
      draftState.focussedSigmet.drawModeEnd = drawModeEnd || null;
    } else {
      draftState.focussedSigmet.uuid = null;
      draftState.focussedSigmet.drawModeStart = null;
      draftState.focussedSigmet.drawModeEnd = null;
      shouldClearDrawing = true;
    }
    draftState.focussedSigmet.feedbackStart = null;
    draftState.focussedSigmet.feedbackEnd = null;
    draftState.focussedSigmet.mode = SIGMET_MODES.READ;
  }), () => {
    // TODO: display preset
    dispatch(mapActions.setMapMode('pan'));
    if (shouldClearDrawing) {
      setSigmetDrawing(null, container);
    } else {
      setSigmetDrawing(uuid, container);
    }
  });
};

const updateFir = (firName, container) => {
  let fir = null;
  let trimmedFirname = null;
  if (firName) {
    trimmedFirname = firName.trim();
  }
  if (trimmedFirname && !Object.keys(container.state.firs).includes(trimmedFirname)) {
    const { BACKEND_SERVER_URL } = container.props.urls;
    axios.get(`${BACKEND_SERVER_URL}/sigmets/getfir`, {
      withCredentials: true,
      params: {
        name: trimmedFirname
      }
    }).then(res => {
      fir = res.data;
      if (fir !== null) {
        container.setState(produce(container.state, draftState => {
          draftState.firs[trimmedFirname] = fir;
        }));
      }
    }).catch(ex => {
      console.error('Error!: ', ex);
    });
  }
};

// FIXME: Should be Immutable, but AdagucMapDraw can't handle this ATM. Fix this.
const initialGeoJson = () => {
  const draftState = cloneDeep(SIGMET_TEMPLATES.GEOJSON);
  draftState.features.push(cloneDeep(SIGMET_TEMPLATES.FEATURE), cloneDeep(SIGMET_TEMPLATES.FEATURE), cloneDeep(SIGMET_TEMPLATES.FEATURE));
  const startId = uuidv4();
  const endId = uuidv4();
  draftState.features[0].id = startId;
  draftState.features[0].properties.featureFunction = 'start';
  draftState.features[0].properties.selectionType = null;
  draftState.features[0].properties['fill-opacity'] = 0.2;
  draftState.features[0].properties.fill = '#0f0';
  draftState.features[0].properties['stroke-width'] = 0.8;
  draftState.features[0].geometry.type = null;

  draftState.features[1].id = endId;
  draftState.features[1].properties.featureFunction = 'end';
  draftState.features[1].properties.relatesTo = startId;
  draftState.features[1].properties.selectionType = null;
  draftState.features[1].properties['fill-opacity'] = 0.2;
  draftState.features[1].properties.fill = '#f00';
  draftState.features[1].properties['stroke-width'] = 0.8;
  draftState.features[1].geometry.type = null;

  draftState.features[2].id = uuidv4();
  draftState.features[2].properties.featureFunction = 'intersection';
  draftState.features[2].properties.relatesTo = startId;
  draftState.features[2].properties.selectionType = null;
  draftState.features[2].properties['fill-opacity'] = 0.33;
  draftState.features[2].properties.fill = '#2a2';
  draftState.features[2].properties['stroke-width'] = 2;
  draftState.features[2].geometry.type = null;

  draftState.features[3].id = uuidv4();
  draftState.features[3].properties.featureFunction = 'intersection';
  draftState.features[3].properties.relatesTo = endId;
  draftState.features[3].properties.selectionType = null;
  draftState.features[3].properties['fill-opacity'] = 0.33;
  draftState.features[3].properties.fill = '#a22';
  draftState.features[3].properties['stroke-width'] = 2;
  draftState.features[3].geometry.type = null;
  return draftState;
};

// FIXME: Should be Immutable, but AdagucMapDraw can't handle this ATM. Fix this.
const addFirFeature = (geojson, firName, container) => {
  const { firs: availableFirs } = container.state;
  if (!geojson || !firName) {
    return null;
  }
  const draftState = cloneDeep(geojson);
  if (!Array.isArray(geojson.features)) {
    return null;
  }
  if (!availableFirs.hasOwnProperty(firName)) {
    return null;
  }
  const firFeature = availableFirs[firName];
  const newFeatureIndex = draftState.features.push(cloneDeep(SIGMET_TEMPLATES.FEATURE)) - 1;
  draftState.features[newFeatureIndex].type = firFeature.type;
  draftState.features[newFeatureIndex].properties.featureFunction = 'base-fir';
  draftState.features[newFeatureIndex].properties.selectionType = 'fir';
  draftState.features[newFeatureIndex].properties.fill = 'transparent';
  draftState.features[newFeatureIndex].properties['fill-opacity'] = 0.01;
  draftState.features[newFeatureIndex].properties.stroke = '#017daf';
  draftState.features[newFeatureIndex].properties['stroke-width'] = 1.2;
  draftState.features[newFeatureIndex].geometry.type = firFeature.geometry.type;
  draftState.features[newFeatureIndex].geometry.coordinates.length = 0;
  draftState.features[newFeatureIndex].geometry.coordinates.push(...firFeature.geometry.coordinates);
  return draftState;
};

const getEmptySigmet = (container) => produce(SIGMET_TEMPLATES.SIGMET, draftSigmet => {
  const { parameters } = container.state;
  draftSigmet.status = STATUSES.CONCEPT;
  draftSigmet.levelinfo.mode = MODES_LVL.AT;
  draftSigmet.levelinfo.levels[0].unit = UNITS.FL;
  draftSigmet.levelinfo.levels.push(cloneDeep(SIGMET_TEMPLATES.LEVEL));
  draftSigmet.levelinfo.levels[1].unit = UNITS.FL;
  draftSigmet.va_extra_fields.volcano.position.push(null);
  draftSigmet.movement_type = MOVEMENT_TYPES.STATIONARY;
  draftSigmet.location_indicator_mwo = parameters.location_indicator_wmo;
  draftSigmet.validdate = getRoundedNow().format();
  const defaultFirKey = Array.isArray(parameters.active_firs) && parameters.active_firs.length > 0 ? parameters.active_firs[0] : null;
  const defaultFirData = defaultFirKey !== null && parameters.firareas[defaultFirKey]
    ? parameters.firareas[defaultFirKey]
    : parameters.firareas && Object.keys(parameters.firareas).length > 0
      ? parameters.firareas[Object.keys(parameters.firareas)[0]]
      : null;
  if (defaultFirData) {
    draftSigmet.validdate_end = getRoundedNow().add(defaultFirData.wv_maxhoursofvalidity, 'hour').format();
    draftSigmet.location_indicator_icao = defaultFirData.location_indicator_icao;
    draftSigmet.firname = defaultFirData.firname;
  }
  if (draftSigmet.firname) {
    updateFir(draftSigmet.firname, container);
  }
});

const addSigmet = (ref, container) => {
  if (container.state.parameters && Array.isArray(container.state.phenomena) && container.state.phenomena.length > 0) {
    const newSigmet = getEmptySigmet(container);
    container.setState(produce(container.state, draftState => {
      const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
      if (!isNaN(categoryIndex) && categoryIndex !== -1) {
        if (ref === CATEGORY_REFS.ADD_SIGMET) {
          draftState.categories[categoryIndex].sigmets.length = 0; // ensures always just one new sigmet
        }
        draftState.categories[categoryIndex].sigmets.push(newSigmet);
      }
    }), () => container.props.dispatch(container.props.drawActions.setGeoJSON(initialGeoJson())));
  } else {
    !container.state.parameters
      ? console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'parameters:', container.state.parameters)
      : console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'phenomena:', container.state.phenomena);
  }
};

const findCategoryAndSigmetIndex = (uuid, state) => {
  let sigmetIndex = -1;
  const categoryIndex = state.categories.findIndex((category) => {
    sigmetIndex = category.sigmets.findIndex((sigmet) => sigmet.uuid === uuid);
    return sigmetIndex !== -1;
  });
  return { sigmetIndex, categoryIndex, isFound: (categoryIndex !== -1 && sigmetIndex !== -1) };
};

const updateDisplayedPreset = (preset, container) => {
  // FIXME: how to properly chain all these asynchronous dispatches?
  // FIXME: this code closely resembles the TitleBarContainer.setPreset, it should be generalized
  const { dispatch, panelsActions, mapActions, adagucActions } = container.props;
  if (!preset) {
    return;
  }
  if (preset.area) {
    dispatch(panelsActions.setPanelLayout(preset.display.type));
  }
  if (preset.display) {
    dispatch(mapActions.setCut({ name: 'Custom', bbox: [preset.area.left || 570875, preset.area.bottom, preset.area.right || 570875, preset.area.top] }));
  }

  if (preset.layers) {
    // This is tricky because all layers need to be restored in the correct order
    // So first create all panels as null....
    const newPanels = [null, null, null, null];
    const promises = [];
    preset.layers.map((panel, panelIdx) => {
      // Then for each panel initialize it to this object where layers is an empty array with the
      // length of the layers in the panel, as it needs to be inserted in a certain order. For the baselayers
      // this is irrelevant because the order of overlays is not relevant
      if (panel.length === 1 && panel[0].type && panel[0].type.toLowerCase() !== 'adaguc') {
        newPanels[panelIdx] = { 'layers': [], 'baselayers': [], type: panel[0].type.toUpperCase() };
        if (this.state.locations && panel[0].location) {
          // Assume ICAO name
          if (typeof panel[0].location === 'string') {
            const possibleLocation = this.state.locations.filter((loc) => loc.name === panel[0].location);
            if (possibleLocation.length === 1) {
              dispatch(adagucActions.setCursorLocation(possibleLocation[0]));
            } else {
              dispatch(adagucActions.setCursorLocation(panel[0].location));
            }
          }
        }
      } else {
        newPanels[panelIdx] = { 'layers': new Array(panel.length), 'baselayers': [] };
        panel.map((layer, i) => {
          // Create a Promise for parsing all WMJSlayers because we can only do something when ALL layers have been parsed
          promises.push(new Promise((resolve, reject) => {
            // eslint-disable-next-line no-undef
            const wmjsLayer = new WMJSLayer(layer);
            wmjsLayer.parseLayer((newLayer) => {
              if (!newLayer.service) {
                return resolve(null);
              }
              newLayer.keepOnTop = (layer.overlay || layer.keepOnTop);
              if (layer.dimensions) {
                Object.keys(layer.dimensions).map((dim) => {
                  newLayer.setDimension(dim, layer.dimensions[dim]);
                });
              }
              return resolve({ layer: newLayer, panelIdx: panelIdx, index: i });
            });
          }));
        });
      }
    });

    // Once that happens, insert the layer in the appropriate place in the appropriate panel
    Promise.all(promises).then((layers) => {
      layers.map((layerDescription) => {
        if (layerDescription) {
          const { layer, panelIdx, index } = layerDescription;
          if (layer.keepOnTop === true) {
            layer.keepOnTop = true;
            newPanels[panelIdx].baselayers.push(layer);
          } else {
            newPanels[panelIdx].layers[index] = layer;
          }
        }
      });
      // Beware: a layer can still contain null values because a layer might have been a null value
      // also, panels may have had no layers in them
      dispatch(panelsActions.setPresetLayers(newPanels));
    });
  }
};

const updateSigmet = (uuid, dataField, value, container) => {
  const { state, props } = container;
  const { drawProperties, dispatch, drawActions } = props;
  const shouldCleanEndFeature = dataField === 'movement_type' && value !== MOVEMENT_TYPES.FORECAST_POSITION;
  const shouldCleanMovement = dataField === 'movement_type' && value !== MOVEMENT_TYPES.MOVEMENT;
  const indices = findCategoryAndSigmetIndex(uuid, state);
  if (!dataField || !indices.isFound) {
    return;
  }
  const dataFieldParts = dataField.split('.');
  console.log(dataField, value);
  const fieldToUpdate = dataFieldParts.length > 0 && dataFieldParts.pop();
  if (fieldToUpdate === 'phenomenon') {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        value = '';
      } else {
        value = value[0].code;
      }
    }
    if (value) {
      const { sources } = props;
      const preset = getPresetForPhenomenon(value, sources);
      updateDisplayedPreset(preset, container);
    }
  }
  if (dataField.indexOf('volcano.position') !== -1) {
    value = value !== null && !isNaN(value) ? parseFloat(value) : null;
  }
  container.setState(produce(state, draftState => {
    const parentToUpdate = dataFieldParts.reduce(
      (traverser, propertyKey) => traverser && traverser[propertyKey],
      draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]
    );
    parentToUpdate[!isNaN(fieldToUpdate) ? parseInt(fieldToUpdate) : fieldToUpdate] = value;
    if (shouldCleanMovement) {
      draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]['movement'] = produce(SIGMET_TEMPLATES.MOVEMENT, () => {});
    }
    draftState.focussedSigmet.hasEdits = true;
  }), () => {
    if (shouldCleanEndFeature === true) {
      const features = cloneDeep(drawProperties.adagucMapDraw.geojson.features);
      const endFeature = features.find((potentialEndFeature) => potentialEndFeature.properties.featureFunction === 'end');
      if (endFeature && endFeature.id) {
        dispatch(drawActions.setFeature({
          geometry: { coordinates: [], type: null },
          properties: { selectionType: null },
          featureId: endFeature.id }));
        clearRelatedIntersection(endFeature.id, features, dispatch, drawActions);
      }
    }
  });
};

const updateSigmetLevel = (uuid, dataField, context, container) => {
  const indices = findCategoryAndSigmetIndex(uuid, container.state);
  if (!indices.isFound) {
    return;
  }
  let newLevelInfo = {};
  switch (dataField) {
    case 'mode':
      newLevelInfo.mode = context;
      const betwModes = [MODES_LVL.BETW, MODES_LVL.BETW_SFC];
      const prevLevelInfo = container.state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex].levelinfo;
      let modeCatChange = false;
      if ((betwModes.includes(context) && !betwModes.includes(prevLevelInfo.mode)) ||
          (!betwModes.includes(context) && betwModes.includes(prevLevelInfo.mode))) {
        modeCatChange = true;
      }
      newLevelInfo = produce(SIGMET_TEMPLATES.LEVELINFO, (draftLevelInfo) => {
        draftLevelInfo.mode = context;
        draftLevelInfo.levels.length = 0;
        [0, 1].forEach((index) => {
          draftLevelInfo.levels.push(produce(SIGMET_TEMPLATES.LEVEL, (draftLevel) => {
            if (modeCatChange !== true && prevLevelInfo.levels[index]) {
              Object.entries(draftLevel).forEach((entry) => {
                draftLevel[entry[0]] = prevLevelInfo.levels[index][entry[0]];
              });
            } else {
              draftLevel.unit = UNITS.FL;
            }
          }));
        });
      });
      break;
    case 'unit':
      if (UNITS_ALT.includes(context.unit) && typeof context.isUpperLevel === 'boolean') {
        newLevelInfo.levels = [];
        newLevelInfo.levels[context.isUpperLevel ? 1 : 0] = { unit: context.unit.unit };
      }
      break;
    case 'value':
      if (typeof context.isUpperLevel === 'boolean') {
        newLevelInfo.levels = [];
        newLevelInfo.levels[context.isUpperLevel ? 1 : 0] = { value: !isNaN(context.value) ? parseInt(context.value) : null };
      }
      break;
    default:
      console.error(`Level dataField ${dataField} is unknown and not implemented.`);
  }
  container.setState(produce(container.state, draftState => {
    if (Object.keys(newLevelInfo).length > 0) {
      if (newLevelInfo.mode && typeof newLevelInfo.mode === 'string') {
        draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]['levelinfo']['mode'] = newLevelInfo.mode;
        if (newLevelInfo.mode !== MODES_LVL.BETW) {
          draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]['levelinfo']['levels'][1].value = null;
        }
      }
      if (newLevelInfo.levels && Array.isArray(newLevelInfo.levels)) {
        newLevelInfo.levels.map((level, index) => {
          if (typeof level === 'object') {
            Object.entries(level).map((entry) => {
              draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]['levelinfo']['levels'][index][entry[0]] = entry[1];
            });
          }
        });
      }
      draftState.focussedSigmet.hasEdits = true;
    }
  }));
};

const clearRelatedIntersection = (featureId, features, dispatch, drawActions) => {
  const relatedIntersection = features.find((feature) =>
    feature.properties.featureFunction === 'intersection' && feature.properties.relatesTo === featureId
  );
  if (relatedIntersection) {
    dispatch(drawActions.setFeature({
      geometry: { coordinates: [], type: null },
      properties: { selectionType: null },
      featureId: relatedIntersection.id }));
  }
};

const drawSigmet = (event, uuid, container, action, featureFunction) => {
  const { dispatch, mapActions, drawActions, drawProperties } = container.props;
  const { focussedSigmet } = container.state;
  const features = drawProperties.adagucMapDraw.geojson.features;
  // Select relevant polygon to edit, this assumes there is ONE start and ONE end feature.
  const featureIndex = features.findIndex((feature) =>
    feature.properties.featureFunction === featureFunction);
  if (featureIndex === -1) {
    return;
  }
  const featureId = features[featureIndex].id;
  const drawMode = `drawMode${featureFunction.charAt(0).toUpperCase() + featureFunction.slice(1)}`;
  const updatableFeatureProps = {
    geometry: { coordinates: [], type: null },
    properties: { selectionType: null },
    featureId: featureId
  };
  if (action === focussedSigmet[drawMode]) {
    updatableFeatureProps.geometry.coordinates.push(...features[featureIndex].geometry.coordinates);
  }
  switch (action) {
    case 'select-point':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPoint());
      updatableFeatureProps.geometry.type = 'Point';
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.POINT;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'select-region':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditBox());
      updatableFeatureProps.geometry.type = 'Polygon';
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.BOX;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'select-shape':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPolygon());
      updatableFeatureProps.geometry.type = 'Polygon';
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.POLY;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'select-fir':
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeatureEditPolygon());
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.FIR;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'delete-selection':
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, null, container);
      break;
    default:
      console.error(`Selection method ${action} unknown and not implemented`);
  }
  dispatch(drawActions.setFeatureNr(featureIndex));
};

const cleanFeatures = (features) => {
  // features with featureFunction equal to 'base-fir' should be filtered
  const isNotBaseFirFeature = (feature) => (!feature || !feature.properties || feature.properties.featureFunction !== 'base-fir');

  // The features can be an array, or an individual feature - which in turn can be a removable base-fir feature
  const cleanedFeatures = Array.isArray(features)
    ? cloneDeep(features.filter(isNotBaseFirFeature))
    : isNotBaseFirFeature(features) === true
      ? [cloneDeep(features)]
      : []; // single, removable base-fir, feature

  cleanedFeatures.forEach((feature) => {
    const isEntireFir = (feature && feature.properties && feature.properties.selectionType === MODES_GEO_SELECTION.FIR);
    if (isEntireFir === true && feature.geometry && feature.geometry.hasOwnProperty('type')) {
      feature.geometry.type = null;
    }
    clearEmptyPointersAndAncestors(feature);
  });
  return Array.isArray(features)
    ? cleanedFeatures
    : cleanedFeatures.length > 0
      ? cleanedFeatures[0]
      : null;
};

const createIntersectionData = (feature, firname, container) => {
  const cleanedFeature = cleanFeatures(feature);
  return (!isFeatureGeoJsonComplete(cleanedFeature))
    ? null
    : { firname: firname, feature: cleanedFeature };
};

const createFirIntersection = (featureId, geojson, container) => {
  const { dispatch, drawActions, urls } = container.props;
  const activeCategory = container.state.categories.find((category) => category.ref === container.state.focussedCategoryRef);
  if (!activeCategory) {
    return;
  }
  const affectedSigmet = activeCategory.sigmets.find((sigmet) => sigmet.uuid === container.state.focussedSigmet.uuid);
  if (!affectedSigmet) {
    return;
  }
  const featureToIntersect = geojson.features.find((feature) =>
    feature.id === featureId);
  const intersectionData = createIntersectionData(featureToIntersect, affectedSigmet.firname, container);
  const intersectionFeature = geojson.features.find((iSFeature) => {
    return iSFeature.properties.relatesTo === featureId && iSFeature.properties.featureFunction === 'intersection';
  });
  if (intersectionData && intersectionFeature) {
    axios({
      method: 'post',
      url: `${urls.BACKEND_SERVER_URL}/sigmets/sigmetintersections`,
      withCredentials: true,
      responseType: 'json',
      data: intersectionData
    }).then((response) => {
      if (response.data) {
        const { feature: stringifiedFeature, message, succeeded: stringifiedSucceeded } = response.data;
        const responseFeature = !isObject(stringifiedFeature) ? JSON.parse(stringifiedFeature) : stringifiedFeature;
        const responseSucceeded = typeof stringifiedSucceeded !== 'boolean' ? JSON.parse(stringifiedSucceeded) : stringifiedSucceeded;
        const responseMessage = typeof message === 'string' ? message : null;
        const { featureFunction } = featureToIntersect.properties;
        const feedbackProperty = `feedback${featureFunction.charAt(0).toUpperCase()}${featureFunction.slice(1)}`;
        container.setState(produce(container.state, draftState => {
          draftState.focussedSigmet[feedbackProperty] = responseMessage;
        }), () => {
          if (responseSucceeded === true) {
            dispatch(drawActions.setFeature({
              geometry: { coordinates: responseFeature.geometry.coordinates, type: responseFeature.geometry.type },
              properties: { selectionType:  responseFeature.properties.selectionType },
              featureId: intersectionFeature.id
            }));
          }
        });
      }
    }).catch(error => {
      console.error('Couldn\'t retrieve intersection for feature', error, featureId);
    });
  } else {
    console.warn('The intersection feature was not found');
  }
};

const modifyFocussedSigmet = (dataField, value, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    draftState.focussedSigmet[dataField] = value;
    draftState.focussedSigmet.hasEdits = true;
  }), () => {
  });
};

const clearSigmet = (event, uuid, container) => {
  const { dispatch } = container.props;
  addSigmet(container.state.focussedCategoryRef, container);
  dispatch(notify({
    title: 'Sigmet cleared',
    message: 'The input on this Sigmet has been cleared successfully',
    status: 'success',
    position: 'bl',
    dismissible: true,
    dismissAfter: 3000
  }));
};

const discardSigmet = (event, uuid, container) => {
  const { dispatch, mapActions } = container.props;
  dispatch(notify({
    title: 'Changes discarded',
    message: 'The changes are successfully discarded',
    status: 'success',
    position: 'bl',
    dismissible: true,
    dismissAfter: 3000
  }));
  retrieveSigmets(container, () => {
    container.setState(produce(container.state, draftState => {
      draftState.focussedSigmet.mode = SIGMET_MODES.READ;
      draftState.focussedSigmet.hasEdits = false;
      dispatch(mapActions.setMapMode('pan'));
      setSigmetDrawing(uuid, container);
    }));
  });
};

/**
 * Cleans sigmet, returns cleaned sigmet object
 @param {object} sigmetAsObject, the sigmet object to clean
 @param {array} cleanedFeatures, the cleaned features to add
 @return {object} Object with taf and report properties
*/
const sanitizeSigmet = (sigmetAsObject, cleanedFeatures) => {
  const volcanoPosition = sigmetAsObject.va_extra_fields.volcano.position;
  const hasVolcanoPosition = volcanoPosition.some((coordinate) => typeof coordinate === 'number');
  return produce(sigmetAsObject, draftState => {
    clearEmptyPointersAndAncestors(draftState);
    draftState.geojson.features.length = 0;
    draftState.geojson.features.push(...cleanedFeatures);
    if (hasVolcanoPosition) {
      if (!draftState.va_extra_fields.volcano) {
        draftState.va_extra_fields['volcano'] = {};
        if (!draftState.va_extra_fields.volcano.position) {
          draftState.va_extra_fields.volcano.position = [];
        }
      }
      draftState.va_extra_fields.volcano.position.length = 0;
      draftState.va_extra_fields.volcano.position.push(...volcanoPosition);
    }
  });
};

const saveSigmet = (event, uuid, container) => {
  const { drawProperties, urls, dispatch, mapActions } = container.props;
  const indices = findCategoryAndSigmetIndex(uuid, container.state);
  if (!indices.isFound) {
    return;
  }
  const affectedSigmet = container.state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex];
  if (!affectedSigmet) {
    return;
  }
  const cleanedFeatures = cleanFeatures(drawProperties.adagucMapDraw.geojson.features);
  const complementedSigmet = sanitizeSigmet(affectedSigmet, cleanedFeatures);

  axios({
    method: 'post',
    url: `${urls.BACKEND_SERVER_URL}/sigmets`,
    withCredentials: true,
    responseType: 'json',
    data: complementedSigmet
  }).then(response => {
    dispatch(notify({
      title: 'Sigmet saved',
      message: 'Sigmet ' + response.data.uuid + ' was successfully saved',
      status: 'success',
      position: 'bl',
      dismissible: true,
      dismissAfter: 3000
    }));
    retrieveSigmets(container, () => {
      // Set mode to READ, set focus of category and Sigmet, and clear new Sigmet
      let uuid = response.data.uuid;
      let shouldUpdateFocussed = false;
      let indices = findCategoryAndSigmetIndex(uuid, container.state);
      if (indices.isFound) {
        shouldUpdateFocussed = true;
        const sigmet = container.state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex];
        if (sigmet.status === STATUSES.CANCELED) {
          const publishedCategory = container.state.categories.find((category) => category.ref === CATEGORY_REFS.ACTIVE_SIGMETS);
          if (publishedCategory) {
            const relatedCancelSigmet = publishedCategory.sigmets.find((cancelSigmet) => cancelSigmet.cancels === sigmet.sequence);
            if (relatedCancelSigmet) {
              uuid = relatedCancelSigmet.uuid;
              indices = findCategoryAndSigmetIndex(uuid, container.state);
            }
          }
        }
      }
      container.setState(produce(container.state, draftState => {
        draftState.focussedSigmet.mode = SIGMET_MODES.READ;
        draftState.focussedSigmet.hasEdits = false;
        if (shouldUpdateFocussed) {
          const catRef = draftState.categories[indices.categoryIndex].ref;
          if (catRef && catRef !== draftState.focussedCategoryRef) {
            draftState.focussedCategoryRef = catRef;
          }
          draftState.focussedSigmet.uuid = uuid;
        }
      }), () => {
        dispatch(mapActions.setMapMode('pan'));
        setSigmetDrawing(uuid, container);
      });
    });
  }).catch(error => {
    console.error(`Could not save Sigmet identified by ${uuid}`, error);
    dispatch(notify({
      title: 'Error',
      message: error.response.data.error,
      status: 'error',
      position: 'bl',
      dismissible: true,
      dismissAfter: 3000
    }));
  });
};

const editSigmet = (event, uuid, container) => {
  const { dispatch, mapActions } = container.props;
  container.setState(produce(container.state, draftState => {
    draftState.focussedSigmet.uuid = uuid;
    draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
  }), () => dispatch(mapActions.setMapMode('pan')));
};

/**
* Deleting Sigmet from backend
* @param {object} event The event that triggered deleting
* @param {string} uuid The identifier of the Sigmet to be deleted
* @param {Element} container The container in which the delete action was triggered
*/
const deleteSigmet = (event, uuid, container) => {
  const { state, props } = container;
  const { dispatch, mapActions } = props;
  const { BACKEND_SERVER_URL } = props.urls;
  if (!uuid || !BACKEND_SERVER_URL) {
    return;
  }
  const indices = findCategoryAndSigmetIndex(uuid, state);
  if (indices.isFound &&
      state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex].status === STATUSES.CONCEPT) {
    axios({
      method: 'delete',
      url: `${BACKEND_SERVER_URL}/sigmets/${uuid}`,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      dispatch(notify({
        title: 'Sigmet deleted',
        message: `Sigmet ${uuid} was successfully deleted`,
        status: 'success',
        position: 'bl',
        dismissible: true,
        dismissAfter: 3000
      }));
      retrieveSigmets(container, () => {
        // Set mode to READ, set focus of category and Sigmet, and clear new Sigmet
        container.setState(produce(container.state, draftState => {
          draftState.focussedSigmet.mode = SIGMET_MODES.READ;
          draftState.focussedSigmet.uuid = null;
        }), () => {
          dispatch(mapActions.setMapMode('pan'));
          setSigmetDrawing(null, container);
        });
      });
    }).catch(error => {
      console.error('Couldn\'t delete Sigmet', error);
      dispatch(notify({
        title: 'Error',
        message: `An error occurred while deleting the Sigmet: ${error.response.data.error}`,
        status: 'error',
        position: 'bl',
        dismissible: true,
        dismissAfter: 3000
      }));
    });
  }
};

/**
 * Copy Sigmet information
 * @param {object} event The event that triggered copying
 * @param {string} uuid The identifier for the Sigmet to copy
 * @param {Element} container The container in which the copy action was triggered
 */
const copySigmet = (event, uuid, container) => {
  const { state } = container;
  const { dispatch } = container.props;
  const indices = findCategoryAndSigmetIndex(uuid, state);
  if (indices.isFound) {
    container.setState(produce(state, draftState => {
      draftState.copiedSigmetRef = uuid;
    }), () => {
      dispatch(notify({
        title: 'Sigmet copied',
        message: 'The properties of this Sigmet have been copied successfully' + uuid,
        status: 'success',
        position: 'bl',
        dismissible: true,
        dismissAfter: 3000
      }));
    });
  }
};

/**
 * Paste Sigmet information
 * @param {object} event The event that triggered pasting
 * @param {Element} container The container in which the paste action was triggered
 */
const pasteSigmet = (event, container) => {
  const { state } = container;
  const { dispatch, drawActions } = container.props;
  const indicesCopiedSigmet = findCategoryAndSigmetIndex(state.copiedSigmetRef, state);
  const indicesCurrentSigmet = findCategoryAndSigmetIndex(state.focussedSigmet.uuid, state);
  if (indicesCopiedSigmet.isFound && indicesCurrentSigmet.isFound) {
    const copiedSigmet = state.categories[indicesCopiedSigmet.categoryIndex].sigmets[indicesCopiedSigmet.sigmetIndex];
    if (!copiedSigmet && state.categories[indicesCurrentSigmet.categoryIndex].ref !== CATEGORY_REFS.ADD_SIGMET) {
      return;
    }
    const propertiesToCopy = [
      'phenomenon',
      'obs_or_forecast',
      'geojson',
      'levelinfo',
      'firname',
      'validdate',
      'validdate_end',
      'change',
      'movement',
      'movement_type',
      'forecast_position_time',
      'location_indicator_icao',
      'location_indicator_mwo'
    ];
    container.setState(produce(state, draftState => {
      propertiesToCopy.forEach((property) => {
        if (copiedSigmet.hasOwnProperty(property) && copiedSigmet[property] !== null && typeof copiedSigmet[property] !== 'undefined') {
          draftState.categories[indicesCurrentSigmet.categoryIndex].sigmets[indicesCurrentSigmet.sigmetIndex][property] = copiedSigmet[property];
        }
      });
      draftState.copiedSigmetRef = null;
    }), () => {
      dispatch(drawActions.setGeoJSON(copiedSigmet.geojson));
      dispatch(notify({
        title: 'Sigmet pasted',
        message: 'The copied properties have been pasted successfully into the current Sigmet',
        status: 'success',
        position: 'bl',
        dismissible: true,
        dismissAfter: 3000
      }));
    });
  }
};

const publishSigmet = (event, uuid, container) => {
  container.setState(produce(container.state, draftState => {
    const indices = findCategoryAndSigmetIndex(uuid, draftState);
    if (indices.isFound) {
      draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex].status = STATUSES.PUBLISHED;
    }
  }), () => saveSigmet(event, uuid, container));
};

const retrieveTAC = (uuid, container) => {
  const { urls } = container.props;

  if (!uuid) {
    return;
  }

  axios({
    method: 'get',
    url: `${urls.BACKEND_SERVER_URL}/sigmets/${uuid}`,
    withCredentials: true,
    responseType: 'text',
    headers: {
      'Accept': 'text/plain'
    }
  }).then((response) => {
    const indexExisting = container.state.tacs.findIndex((tac) => tac.uuid === uuid);
    container.setState(produce(container.state, draftState => {
      if (indexExisting !== -1) {
        draftState.tacs[indexExisting].code = response.data;
      } else {
        draftState.tacs.push({ uuid: uuid, code: response.data });
      }
    }));
  }).catch(error => {
    console.error('Couldn\'t retrieve TAC for Sigmet', error);
  });
};

const cancelSigmet = (event, uuid, container) => {
  container.setState(produce(container.state, draftState => {
    const indices = findCategoryAndSigmetIndex(uuid, draftState);
    if (indices.isFound) {
      draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex].status = STATUSES.CANCELED;
    }
  }), () => {
    saveSigmet(event, uuid, container);
  });
};

const setSigmetDrawing = (uuid, container, useInitial = false) => {
  const { dispatch, drawActions } = container.props;
  if (container.state.focussedSigmet.uuid !== uuid && useInitial !== true) {
    return;
  }
  const indices = findCategoryAndSigmetIndex(uuid, container.state);
  if (!indices.isFound && useInitial !== true) {
    return;
  }
  const affectedSigmet = indices.isFound
    ? container.state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]
    : null;
  const geojson = !useInitial && affectedSigmet
    ? affectedSigmet.geojson
    : initialGeoJson();
  const enhancedGeojson = addFirFeature(geojson, affectedSigmet ? affectedSigmet.firname : null, container);
  dispatch(drawActions.setGeoJSON(enhancedGeojson || geojson));
};

/** Verify sigmet
 * @param {object} sigmetAsObject The SIGMET object validate
*/
const verifySigmet = (sigmetObject, container) => {
  if (!sigmetObject) {
    return;
  }
  const { drawProperties, urls } = container.props;
  const cleanedFeatures = cleanFeatures(drawProperties.adagucMapDraw.geojson.features);
  const complementedSigmet = sanitizeSigmet(sigmetObject, cleanedFeatures);
  container.setState(produce(container.state, draftState => {
    draftState.focussedSigmet['tac'] = '... retrieving TAC ...';
  }));
  axios({
    method: 'post',
    url: `${urls.BACKEND_SERVER_URL}/sigmets/verify`,
    withCredentials: true,
    responseType: 'json',
    data: complementedSigmet
  }).then(
    response => {
      if (response.data) {
        let responseJson = response.data;
        if (responseJson.TAC) {
          container.setState(produce(container.state, draftState => {
            draftState.focussedSigmet['tac'] = responseJson.TAC;
          }));
        } else {
          container.setState(produce(container.state, draftState => {
            draftState.focussedSigmet['tac'] = 'No TAC received from server';
          }));
        }
      } else {
        console.error('sigmet/verify has no response.data');
      }
    }
  ).catch(error => {
    console.error('sigmet/verify', error);
    container.setState(produce(container.state, draftState => {
      draftState.focussedSigmet['tac'] = 'Unable to make TAC request';
    }));
  });
};

/**
 * SigmetsContainer has its own state, this is the dispatch for updating the state
 * @param {object} localAction Action-object containing the type and additional, action specific, parameters
 * @param {object} state Object reference for the actual state
 * @param {component} container The component to update the state
 }}
 */
export default (localAction, container) => {
  switch (localAction.type) {
    case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
      toggleContainer(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_CATEGORY:
      toggleCategory(localAction.event, localAction.ref, container);
      break;
    case LOCAL_ACTION_TYPES.RETRIEVE_PARAMETERS:
      retrieveParameters(container);
      break;
    case LOCAL_ACTION_TYPES.RETRIEVE_PHENOMENA:
      retrievePhenomena(container);
      break;
    case LOCAL_ACTION_TYPES.RETRIEVE_SIGMETS:
      retrieveSigmets(container);
      break;
    case LOCAL_ACTION_TYPES.FOCUS_SIGMET:
      focusSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.ADD_SIGMET:
      addSigmet(localAction.ref, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_SIGMET:
      updateSigmet(localAction.uuid, localAction.dataField, localAction.value, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_SIGMET_LEVEL:
      updateSigmetLevel(localAction.uuid, localAction.dataField, localAction.context, container);
      break;
    case LOCAL_ACTION_TYPES.CLEAR_SIGMET:
      clearSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DISCARD_SIGMET:
      discardSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.SAVE_SIGMET:
      saveSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.EDIT_SIGMET:
      editSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DELETE_SIGMET:
      deleteSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.COPY_SIGMET:
      copySigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.PASTE_SIGMET:
      pasteSigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PUBLISH_SIGMET:
      publishSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.CANCEL_SIGMET:
      cancelSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DRAW_SIGMET:
      drawSigmet(localAction.event, localAction.uuid, container, localAction.action, localAction.featureFunction);
      break;
    case LOCAL_ACTION_TYPES.CREATE_FIR_INTERSECTION:
      createFirIntersection(localAction.featureId, localAction.geoJson, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_FIR:
      updateFir(localAction.firName, container);
      break;
    case LOCAL_ACTION_TYPES.MODIFY_FOCUSSED_SIGMET:
      modifyFocussedSigmet(localAction.dataField, localAction.value, container);
      break;
    case LOCAL_ACTION_TYPES.SET_DRAWING:
      setSigmetDrawing(localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.VERIFY_SIGMET:
      verifySigmet(localAction.sigmetObject, container);
      break;
  }
};
