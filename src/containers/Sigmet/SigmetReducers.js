import produce from 'immer';
import moment from 'moment';
import { SIGMET_TEMPLATES } from '../../components/Sigmet/SigmetTemplates';
import { SIGMET_MODES, LOCAL_ACTION_TYPES, CATEGORY_REFS } from './SigmetActions';
import { clearNullPointersAndAncestors } from '../../utils/json';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
const uuidv4 = require('uuid/v4');

const WARN_MSG = {
  PREREQUISITES_NOT_MET: 'Not all prerequisites are met yet:'
};

/**
* Generate a 'next-half-hour-rounded now Moment object
* @return {moment} Moment-object with the current now in UTC rounded to the next half hour
*/
const getRoundedNow = () => {
  return moment().utc().minutes() < 30 ? moment().utc().startOf('hour').minutes(30) : moment().utc().startOf('hour').add(1, 'hour');
};

const toggleContainer = (evt, container) => {
  evt.preventDefault();
  container.setState(produce(container.state, draftState => {
    draftState.isContainerOpen = !draftState.isContainerOpen;
  }));
};

const toggleCategory = (evt, ref, container) => {
  evt.preventDefault();
  container.setState(produce(container.state, draftState => {
    if (ref === CATEGORY_REFS.ADD_SIGMET && ref !== draftState.focussedCategoryRef) {
      draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
    }
    draftState.focussedCategoryRef = (draftState.focussedCategoryRef === ref)
      ? ''
      : ref;
  }));
};

const updateCategory = (ref, sigmets, container) => {
  container.setState(produce(container.state, draftState => {
    const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
    if (!isNaN(categoryIndex) && categoryIndex > 0) {
      draftState.categories[categoryIndex].sigmets.length = 0;
      draftState.categories[categoryIndex].sigmets.push(...sigmets);
    }
  }));
};

const updateParameters = (parameters, container) => {
  container.setState(produce(container.state, draftState => {
    Object.assign(draftState.parameters, parameters);
  }));
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

const focusSigmet = (evt, uuid, container) => {
  evt.preventDefault();
  container.setState(produce(container.state, draftState => {
    if (draftState.focussedSigmet.mode === SIGMET_MODES.EDIT) {
      console.warn('focusSigmet: switching the focus while in edit mode is not yet implemented (otherwise it will unintentionally discard changes)');
    } else {
      draftState.focussedSigmet.uuid = uuid;
      draftState.focussedSigmet.mode = SIGMET_MODES.READ;
    }
  }));
};

const updateFir = (firName, container) => {
  let fir = null;
  let trimmedFirname = null;
  if (firName) {
    trimmedFirname = firName.trim();
  }
  if (trimmedFirname && !Object.keys(container.state.firs).includes(trimmedFirname)) {
    const { BACKEND_SERVER_URL } = container.props.urls;
    axios.get(`${BACKEND_SERVER_URL}/sigmet/getfir`, {
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

const addSigmet = (ref, container) => {
  if (container.state.parameters && Array.isArray(container.state.phenomena) && container.state.phenomena.length > 0) {
    const newSigmet = produce(SIGMET_TEMPLATES.SIGMET, draftState => {
      draftState.validdate = getRoundedNow().format();
      draftState.validdate_end = getRoundedNow().add(container.state.parameters.maxhoursofvalidity, 'hour').format();
      draftState.location_indicator_mwo = container.state.parameters.location_indicator_wmo;
      if (Array.isArray(container.state.parameters.firareas)) {
        draftState.location_indicator_icao = container.state.parameters.firareas[0].location_indicator_icao;
        draftState.firname = container.state.parameters.firareas[0].firname;
        updateFir(draftState.firname, container);
      }
      draftState.change = container.state.parameters.change;
      container.props.dispatch(container.props.drawActions.setGeoJSON(initialGeoJson()));
    });
    container.setState(produce(container.state, draftState => {
      const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
      if (!isNaN(categoryIndex) && categoryIndex > 0) {
        if (ref === CATEGORY_REFS.ADD_SIGMET) {
          draftState.categories[categoryIndex].sigmets.length = 0; // ensures always just one new sigmet
        }
        draftState.categories[categoryIndex].sigmets.push(newSigmet);
      }
    }));
  } else {
    !container.state.parameters
      ? console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'parameters:', container.state.parameters)
      : console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'phenomena:', container.state.phenomena);
  }
};

const updateSigmet = (uuid, dataField, value, container) => {
  container.setState(produce(container.state, draftState => {
    if (dataField) {
      let sigmetIndex = -1;
      const categoryIndex = draftState.categories.findIndex((category) => {
        sigmetIndex = category.sigmets.findIndex((sigmet) => sigmet.uuid === uuid);
        return sigmetIndex !== -1;
      });
      if (categoryIndex !== -1 && sigmetIndex !== -1) {
        if (dataField === 'phenomenon' && Array.isArray(value)) {
          if (value.length === 0) {
            value = '';
          } else {
            value = value[0].code;
          }
        }
        draftState.categories[categoryIndex].sigmets[sigmetIndex][dataField] = value;
      }
    }
  }));
  console.warn('updateSigmet is not yet implemented');
};

const drawSigmet = (event, uuid, container, action, featureFunction) => {
  event.preventDefault();
  const { dispatch, mapActions, drawActions, drawProperties } = container.props;
  const features = drawProperties.adagucMapDraw.geojson.features;
  // Select relevant polygon to edit, this assumes there is ONE start and ONE end feature.
  const featureIndex = features.findIndex((feature) =>
    feature.properties.featureFunction === featureFunction);
  if (featureIndex === -1) {
    return;
  }
  const featureId = features[featureIndex].id;
  switch (action) {
    case 'select-point':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPoint());
      break;
    case 'select-region':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditBox());
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'box', featureId }));
      break;
    case 'select-shape':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPolygon());
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'poly', featureId }));
      break;
    case 'select-fir':
      const allSigmets = container.state.categories.find((cat) => cat.ref === container.state.focussedCategoryRef).sigmets;
      const coordinates = container.state.firs[allSigmets.find((sigmet) => sigmet.uuid === uuid).firname].geometry.coordinates;
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeatureEditPolygon());
      dispatch(drawActions.setFeature({ coordinates, selectionType: 'poly', featureId }));
      break;
    case 'delete-selection':
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeature({ coordinates: [], selectionType: 'poly', featureId }));
      break;
    default:
      console.error(`Selection method ${action} unknown and not implemented`);
  }
  dispatch(drawActions.setFeatureNr(featureIndex));
};

const complementCoordinates = (coordinates) => {
  const result = { complemented: false, coordinates: cloneDeep(coordinates) };
  if (result.coordinates && Array.isArray(result.coordinates) && result.coordinates.length > 0 &&
    result.coordinates[0] && Array.isArray(result.coordinates[0]) && result.coordinates[0].length > 0 &&
    result.coordinates[0][0] !== result.coordinates[0][result.coordinates[0].length - 1]) {
    result.coordinates[0].push(result.coordinates[0][0]);
    result.complemented = true;
  }
  return result;
};

const combineSigmetWithGeo = (sigmet, geojson) => {
  let cleanedFeatures = cloneDeep(geojson.features);
  cleanedFeatures.forEach((feature) => {
    if (feature.properties.featureFunction === 'intersection') {
      feature.geometry.coordinates = [[]];
    }
    const complementResult = complementCoordinates(feature.geometry.coordinates);
    if (complementResult.complemented === true) {
      feature.geometry.coordinates = complementResult.coordinates;
    }
  });
  return produce(sigmet, draftState => {
    clearNullPointersAndAncestors(draftState);
    draftState.geojson.features.length = 0;
    draftState.geojson.features.push(...cleanedFeatures);
  });
};

const createFirIntersection = (featureId, geojson, container) => {
  const { dispatch, drawActions, urls } = container.props;
  const activeCategory = container.state.categories.find((category) => category.ref === container.state.focussedCategoryRef);
  if (!activeCategory) {
    return;
  }
  const activePartialSigmet = activeCategory.sigmets.find((sigmet) => sigmet.uuid === container.state.focussedSigmet.uuid);
  if (!activePartialSigmet) {
    return;
  }
  /* const featureToIntersect = container.props.drawProperties.adagucMapDraw.geojson.features.find((feature) =>
    feature.id === featureId); */
  const complementedSigmet = combineSigmetWithGeo(activePartialSigmet, geojson);
  const intersectionFeature = geojson.features.find((iSFeature) => {
    return iSFeature.properties.relatesTo === featureId && iSFeature.properties.featureFunction === 'intersection';
  });
  if (intersectionFeature) {
    axios({
      method: 'post',
      url: `${urls.BACKEND_SERVER_URL}/sigmet/sigmetintersections`,
      withCredentials: true,
      responseType: 'json',
      data: complementedSigmet
    }).then((response) => {
      const resultingFeature = response.data.sigmet.geojson.features.find((rFeature) =>
        rFeature.properties.relatesTo === intersectionFeature.properties.relatesTo &&
        rFeature.properties.featureFunction === intersectionFeature.properties.featureFunction);
      if (resultingFeature) {
        dispatch(drawActions.setFeature({ coordinates: resultingFeature.geometry.coordinates, selectionType: 'poly', featureId: intersectionFeature.id }));
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
  }));
};

const clearSigmet = (event, uuid, container) => {
  console.warn('clearSigmet is not yet implemented');
};

const discardSigmet = (event, uuid, container) => {
  console.warn('discardSigmet is not yet implemented');
};

const saveSigmet = (event, uuid, container) => {
  console.warn('saveSigmet is not yet implemented');
};

const editSigmet = (event, uuid, container) => {
  container.setState(produce(container.state, draftState => {
    draftState.focussedSigmet.uuid = uuid;
    draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
  }));
};

const deleteSigmet = (event, uuid, container) => {
  console.warn('deleteSigmet is not yet implemented');
};

const copySigmet = (event, uuid, container) => {
  console.warn('copySigmet is not yet implemented');
};

const publishSigmet = (event, uuid, container) => {
  console.warn('publishSigmet is not yet implemented');
};

const cancelSigmet = (event, uuid, container) => {
  console.warn('cancelSigmet is not yet implemented');
};

/**
 * SigmetsContainer has its own state, this is the dispatch for updating the state
 * @param {object} localAction Action-object containing the type and additional, action specific, parameters
 * @param {object} state Object reference for the actual state
 * @param {component} container The component to update the state
 }}
 */
export const localDispatch = (localAction, container) => {
  switch (localAction.type) {
    case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
      toggleContainer(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_CATEGORY:
      toggleCategory(localAction.event, localAction.ref, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_CATEGORY:
      updateCategory(localAction.ref, localAction.sigmets, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_PARAMETERS:
      updateParameters(localAction.parameters, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_PHENOMENA:
      updatePhenomena(localAction.phenomena, container);
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
  }
};
