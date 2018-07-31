import produce from 'immer';
import moment from 'moment';
import { SIGMET_TEMPLATES, UNITS, UNITS_ALT, MODES_LVL } from '../../components/Sigmet/SigmetTemplates';
import { SIGMET_MODES, LOCAL_ACTION_TYPES, CATEGORY_REFS, STATUSES } from './SigmetActions';
import { clearNullPointersAndAncestors, mergeInTemplate } from '../../utils/json';
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
  const { dispatch, mapActions, drawActions } = container.props;
  container.setState(produce(container.state, draftState => {
    if (ref === CATEGORY_REFS.ADD_SIGMET && ref !== draftState.focussedCategoryRef) {
      draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
      draftState.focussedSigmet.uuid = null;
    }
    draftState.focussedSigmet.drawMode = null;
    draftState.focussedCategoryRef = (draftState.focussedCategoryRef === ref)
      ? null
      : ref;
  }), () => {
    dispatch(mapActions.setMapMode('pan'));
    if (ref === CATEGORY_REFS.ADD_SIGMET) {
      dispatch(drawActions.setGeoJSON(initialGeoJson()));
    } else {
      setSigmetDrawing(null, container);
    }
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
  container.setState(produce(container.state, draftState => {
    const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
    if (!isNaN(categoryIndex) && categoryIndex >= 0) {
      draftState.categories[categoryIndex].sigmets.length = 0;
      sigmets.sort(byValidDate);
      sigmets.forEach((incomingSigmet) => {
        draftState.categories[categoryIndex].sigmets.push(mergeInTemplate(incomingSigmet, 'SIGMET', SIGMET_TEMPLATES));
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
    updateParameters(response.data, container);
    addSigmet(CATEGORY_REFS.ADD_SIGMET, container);
  } else {
    console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
  }
};

const updateParameters = (parameters, container) => {
  container.setState(produce(container.state, draftState => {
    Object.assign(draftState.parameters, parameters);
  }));
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
    updatePhenomena(response.data, container);
    addSigmet(CATEGORY_REFS.ADD_SIGMET, container);
  } else {
    console.error(ERROR_MSG.RETRIEVE_PHENOMENA, response.status, response.data);
  }
};

const updatePhenomena = (phenomena, container) => {
  const SEPARATOR = '_';
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
  }));
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
  const { dispatch, mapActions } = container.props;
  if (evt.target.tagName === 'BUTTON') {
    return;
  }
  let shouldClearDrawing = false;
  container.setState(produce(container.state, draftState => {
    if (draftState.focussedSigmet.uuid !== uuid) {
      draftState.focussedSigmet.uuid = uuid;
    } else {
      draftState.focussedSigmet.uuid = null;
      shouldClearDrawing = true
    }
    draftState.focussedSigmet.mode = SIGMET_MODES.READ;
    draftState.focussedSigmet.drawMode = null;
  }), () => {
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

// TODO: Should be Immutable, but AdagucMapDraw can't handle this ATM. Fix this.
const initialGeoJson = () => {
  const draftState = cloneDeep(SIGMET_TEMPLATES.GEOJSON);
  draftState.features.push(cloneDeep(SIGMET_TEMPLATES.FEATURE), cloneDeep(SIGMET_TEMPLATES.FEATURE), cloneDeep(SIGMET_TEMPLATES.FEATURE));
  const startId = uuidv4();
  const endId = uuidv4();
  draftState.features[0].id = startId;
  draftState.features[0].properties.featureFunction = 'start';
  draftState.features[0].properties.selectionType = 'poly';
  draftState.features[0].properties['fill-opacity'] = 0.2;
  draftState.features[0].properties.fill = '#0f0';
  draftState.features[0].properties['stroke-width'] = 0.8;
  draftState.features[0].geometry.type = 'Polygon';

  draftState.features[1].id = endId;
  draftState.features[1].properties.featureFunction = 'end';
  draftState.features[1].properties.relatesTo = startId;
  draftState.features[1].properties.selectionType = 'poly';
  draftState.features[1].properties['fill-opacity'] = 0.2;
  draftState.features[1].properties.fill = '#f00';
  draftState.features[1].properties['stroke-width'] = 0.8;
  draftState.features[1].geometry.type = 'Polygon';

  draftState.features[2].id = uuidv4();
  draftState.features[2].properties.featureFunction = 'intersection';
  draftState.features[2].properties.relatesTo = startId;
  draftState.features[2].properties.selectionType = 'poly';
  draftState.features[2].properties['fill-opacity'] = 0.33;
  draftState.features[2].properties.fill = '#2a2';
  draftState.features[2].properties['stroke-width'] = 2;
  draftState.features[2].geometry.type = 'Polygon';

  draftState.features[3].id = uuidv4();
  draftState.features[3].properties.featureFunction = 'intersection';
  draftState.features[3].properties.relatesTo = endId;
  draftState.features[3].properties.selectionType = 'poly';
  draftState.features[3].properties['fill-opacity'] = 0.33;
  draftState.features[3].properties.fill = '#a22';
  draftState.features[3].properties['stroke-width'] = 2;
  draftState.features[3].geometry.type = 'Polygon';
  return draftState;
};

const getEmptySigmet = (container) => produce(SIGMET_TEMPLATES.SIGMET, draftSigmet => {
  draftSigmet.validdate = getRoundedNow().format();
  draftSigmet.validdate_end = getRoundedNow().add(container.state.parameters.maxhoursofvalidity, 'hour').format();
  draftSigmet.location_indicator_mwo = container.state.parameters.location_indicator_wmo;
  draftSigmet.status = STATUSES.CONCEPT;
  draftSigmet.levelinfo.mode = MODES_LVL.AT;
  draftSigmet.levelinfo.levels[0].unit = UNITS.FL;
  draftSigmet.levelinfo.levels.push(cloneDeep(SIGMET_TEMPLATES.LEVEL));
  draftSigmet.levelinfo.levels[1].unit = UNITS.FL;
  if (Array.isArray(container.state.parameters.firareas)) {
    draftSigmet.location_indicator_icao = container.state.parameters.firareas[0].location_indicator_icao;
    draftSigmet.firname = container.state.parameters.firareas[0].firname;
    updateFir(draftSigmet.firname, container);
  }
  draftSigmet.change = container.state.parameters.change;
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
  return { sigmetIndex, categoryIndex };
};

const updateSigmet = (uuid, dataField, value, container) => {
  container.setState(produce(container.state, draftState => {
    if (dataField) {
      const indices = findCategoryAndSigmetIndex(uuid, draftState);
      if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1) {
        if (dataField === 'phenomenon' && Array.isArray(value)) {
          if (value.length === 0) {
            value = '';
          } else {
            value = value[0].code;
          }
        }
        draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex][dataField] = value;
        draftState.focussedSigmet.hasEdits = true;
      }
    }
  }));
};

const updateSigmetLevel = (uuid, dataField, context, container) => {
  const indices = findCategoryAndSigmetIndex(uuid, container.state);
  if (indices.categoryIndex === -1 || indices.sigmetIndex === -1) {
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
    dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'poly', featureId: relatedIntersection.id }));
  }
};

const drawSigmet = (event, uuid, container, action, featureFunction) => {
  const { dispatch, mapActions, drawActions, drawProperties } = container.props;
  const features = drawProperties.adagucMapDraw.geojson.features;
  // Select relevant polygon to edit, this assumes there is ONE start and ONE end feature.
  const featureIndex = features.findIndex((feature) =>
    feature.properties.featureFunction === featureFunction);
  if (featureIndex === -1) {
    return;
  }
  const featureId = features[featureIndex].id;
  const drawMode = `drawMode${featureFunction.charAt(0).toUpperCase() + featureFunction.slice(1)}`;
  switch (action) {
    case 'select-point':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPoint());
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'point', featureId }));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'select-region':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditBox());
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'box', featureId }));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'select-shape':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPolygon());
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'poly', featureId }));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'select-fir':
      const allSigmets = container.state.categories.find((cat) => cat.ref === container.state.focussedCategoryRef).sigmets;
      const coordinates = container.state.firs[allSigmets.find((sigmet) => sigmet.uuid === uuid).firname].geometry.coordinates;
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeatureEditPolygon());
      dispatch(drawActions.setFeature({ coordinates, selectionType: 'poly', featureId }));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, action, container);
      break;
    case 'delete-selection':
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'poly', featureId }));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      modifyFocussedSigmet(drawMode, null, container);
      break;
    default:
      console.error(`Selection method ${action} unknown and not implemented`);
  }
  dispatch(drawActions.setFeatureNr(featureIndex));
};

const complementFeatureCoordinates = (feature, container) => {
  const result = { complemented: false, coordinates: [] };
  if (container.featureHasCoordinates(feature)) {
    result.coordinates.push(...feature.geometry.coordinates);
    if (result.coordinates[0][0] !== result.coordinates[0][result.coordinates[0].length - 1]) {
      result.coordinates[0].push(result.coordinates[0][0]);
      result.complemented = true;
    }
  }
  return result;
};

const createIntersectionData = (feature, firname, container) => {
  const cleanedFeature = cloneDeep(feature);
  const complementResult = complementFeatureCoordinates(cleanedFeature, container);
  if (complementResult.complemented === true) {
    cleanedFeature.geometry.coordinates = complementResult.coordinates;
  }
  clearNullPointersAndAncestors(cleanedFeature);
  return (!container.featureHasCoordinates(cleanedFeature) || cleanedFeature.geometry.coordinates[0].length < 4)
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
        dispatch(drawActions.setFeature({ coordinates: response.data.geometry.coordinates, selectionType: 'poly', featureId: intersectionFeature.id }));
      }
    }).catch(error => {
      console.error('Couldn\'t retrieve intersection for feature', error, featureId);
    });
  } else {
    console.warn('The intersection feature was not found');
  }
};

const modifyFocussedSigmet = (dataField, value, container) => {
  container.setState(produce(container.state, draftState => {
    draftState.focussedSigmet[dataField] = value;
    draftState.focussedSigmet.hasEdits = true;
    switch (dataField) {
      case 'useGeometryForEnd': {
        if (value === true) {
          const indices = findCategoryAndSigmetIndex(draftState.focussedSigmet.uuid, draftState);
          if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1) {
            draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex]['movement'] = produce(SIGMET_TEMPLATES.MOVEMENT,
              movementDraftState => { movementDraftState.stationary = false; });
          }
        }
        break;
      }
      default:
        break;
    }
  }));
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
    }));
  });
};

const saveSigmet = (event, uuid, container) => {
  const { drawProperties, urls, dispatch, mapActions } = container.props;
  const indices = findCategoryAndSigmetIndex(uuid, container.state);
  if (indices.categoryIndex === -1 || indices.sigmetIndex === -1) {
    return;
  }
  const affectedSigmet = container.state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex];
  if (!affectedSigmet) {
    return;
  }
  const geojson = cloneDeep(drawProperties.adagucMapDraw.geojson);
  let cleanedFeatures = geojson.features;
  clearNullPointersAndAncestors(cleanedFeatures);
  cleanedFeatures.forEach((feature) => {
    const complementResult = complementFeatureCoordinates(feature, container);
    if (complementResult.complemented === true) {
      feature.geometry.coordinates = complementResult.coordinates;
    }
  });
  const complementedSigmet = produce(affectedSigmet, draftState => {
    const origStationary = cloneDeep(draftState.movement.stationary);
    const origObs = cloneDeep(draftState.obs_or_forecast);
    clearNullPointersAndAncestors(draftState);
    if (!draftState.hasOwnProperty('movement')) {
      draftState.movement = {};
    }
    draftState.movement.stationary = origStationary;
    draftState.obs_or_forecast = origObs;
    draftState.geojson.features.length = 0;
    draftState.geojson.features.push(...cleanedFeatures);
    if (affectedSigmet.movement.stationary === true) {
      draftState.movement = { stationary: true };
    } else {
      if (container.state.useGeometryForEnd) {
        draftState.movement = { stationary: false };
      } else {
        const endGeometry = draftState.geojson.features.find((f) => f.properties.featureFunction === 'end');
        if (endGeometry) {
          const endGeometryUuid = endGeometry.uuid;
          draftState.geojson.features = draftState.geojson.features.filter((f) => {
            if (f.id === endGeometryUuid) {
              return false;
            }

            if (f.properties && f.properties.relatesTo === endGeometryUuid) {
              return false;
            }
            return true;
          });
        }
      }
    }
  });

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
      container.setState(produce(container.state, draftState => {
        draftState.focussedSigmet.mode = SIGMET_MODES.READ;
        draftState.focussedSigmet.hasEdits = false;
        const indices = findCategoryAndSigmetIndex(response.data.uuid, draftState);
        if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1) {
          const catRef = draftState.categories[indices.categoryIndex].ref;
          if (catRef && catRef !== draftState.focussedCategoryRef) {
            draftState.focussedCategoryRef = catRef;
          }
          draftState.focussedSigmet.uuid = response.data.uuid;
        }
      }), () => {
        dispatch(mapActions.setMapMode('pan'));
        setSigmetDrawing(response.data.uuid, container);
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
  }), () => dispatch(mapActions.setMapMode('draw')));
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
  if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1 &&
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
          const indices = findCategoryAndSigmetIndex(uuid, draftState);
          if (indices.categoryIndex !== -1) {
            const catRef = draftState.categories[indices.categoryIndex].ref;
            if (catRef && catRef !== draftState.focussedCategoryRef) {
              draftState.focussedCategoryRef = catRef;
            }
          }
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
  if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1) {
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
  if (indicesCopiedSigmet.categoryIndex !== -1 && indicesCopiedSigmet.sigmetIndex !== -1 &&
      indicesCurrentSigmet.categoryIndex !== -1 && indicesCurrentSigmet.sigmetIndex !== -1) {
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
    if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1) {
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
    if (indices.categoryIndex !== -1 && indices.sigmetIndex !== -1) {
      draftState.categories[indices.categoryIndex].sigmets[indices.sigmetIndex].status = STATUSES.CANCELED;
    }
  }), () => {
    saveSigmet(event, uuid, container);
  });
};

const setSigmetDrawing = (uuid, container) => {
  const { dispatch, drawActions } = container.props;
  if (container.state.focussedSigmet.uuid !== uuid) {
    return;
  }
  const indices = findCategoryAndSigmetIndex(uuid, container.state);
  if (indices.categoryIndex === -1 || indices.sigmetIndex === -1) {
    return;
  }
  const affectedSigmet = container.state.categories[indices.categoryIndex].sigmets[indices.sigmetIndex];
  dispatch(drawActions.setGeoJSON(affectedSigmet.geojson));
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
  }
};
