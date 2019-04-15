import produce from 'immer';
import moment from 'moment';
import { notify } from 'reapop';
import {
  AIRMET_MODES, AIRMET_TEMPLATES, UNITS, UNITS_LABELED, MODES_LVL, MOVEMENT_TYPES, DISTRIBUTION_TYPES, CHANGE_TYPES,
  AIRMET_VARIANTS_PREFIXES } from '../../components/Airmet/AirmetTemplates';
import { DATETIME_FORMAT } from '../../config/DayTimeConfig';
import { LOCAL_ACTION_TYPES, CATEGORY_REFS, STATUSES } from './AirmetActions';
import { clearEmptyPointersAndAncestors, safeMerge, isFeatureGeoJsonComplete,
  MODES_GEO_SELECTION, MODES_GEO_MAPPING, isObject } from '../../utils/json';
import { getPresetForPhenomenon } from '../../components/Airmet/AirmetPresets';
import { FEEDBACK_STATUS } from '../../config/StatusConfig';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import uuidv4 from 'uuid/v4';

const ERROR_MSG = {
  RETRIEVE_AIRMETS: 'Could not retrieve AIRMETs:',
  POST_AIRMET: 'Could not post AIRMET:',
  SELECT_AIRMET: 'The AIRMET to set the focus to, could not be found',
  RETRIEVE_PARAMS: 'Could not retrieve AIRMET parameters',
  RETRIEVE_PHENOMENA: 'Could not retrieve AIRMET phenomena',
  RETRIEVE_OBSCURING_PHENOMENA: 'Could not retrieve AIRMET obscuring phenomena',
  RETRIEVE_TACS: 'Could not retrieve AIRMET TAC:',
  FEATURE_ID_MISMATCH: 'GeoJson: the %s feature has a mutated id',
  FIND_CATEGORY: 'Could not find category'
};

/**
* Generate a 'next-half-hour-rounded now Moment object
* @return {moment} Moment-object with the current now in UTC rounded to the next half hour
*/
const getRoundedNow = () => {
  return moment.utc().minutes() < 30 ? moment.utc().startOf('hour').minutes(30) : moment.utc().startOf('hour').add(1, 'hour');
};

/**
 * Sort by validity period, first by validity end - then by validity start
 * @param {string} airmetA The first AIRMET to compare
 * @param {string} airmetB The second AIRMET to compare
 * @returns {number} 0 when the periods of the two AIRMETs are equal,
 *                   a positive number when the end of airmetA is after the end of airmetB
 *                   a negative number when the end of airmetA is before the end of airmetB
 *                   a positive number when the ends are equal,  but the start of airmetA is after the start of airmetB
 *                   a negative number when the ends are equal,  but the start of airmetA is before the start of airmetB
 */
const byValidDate = (airmetA, airmetB) => {
  let result = 0;
  const { validdate: startA, validdate_end: endA } = airmetA;
  const { validdate: startB, validdate_end: endB } = airmetB;
  if (endA && endB) {
    result = moment(endA).valueOf() - moment(endB).valueOf();
  }
  if (result === 0 && startA && startB) {
    result = moment(startA).valueOf() - moment(startB).valueOf();
  }
  return result;
};

const showFeedback = (container, title, message, status) => {
  const { dispatch } = container.props;
  dispatch(notify({
    title: title,
    message: message,
    status: status,
    position: 'bl',
    dismissible: true,
    dismissAfter: 3000
  }));
};

const toggleContainer = (container) => {
  return setStatePromise(container, {
    isContainerOpen: !container.state.isContainerOpen
  });
};

const toggleCategory = (ref, container) => {
  const { state } = container;
  const isChangeToCategoryAddAirmet = ref !== state.focussedCategoryRef && ref === CATEGORY_REFS.ADD_AIRMET;
  const airmetSelection = isChangeToCategoryAddAirmet
    ? [getEmptyAirmet(container)]
    : [];
  return selectAirmet(airmetSelection, container).then(() =>
    setStatePromise(container, {
      focussedCategoryRef: (ref === state.focussedCategoryRef)
        ? null
        : ref,
      selectedAuxiliaryInfo: {
        mode: isChangeToCategoryAddAirmet
          ? AIRMET_MODES.EDIT
          : AIRMET_MODES.READ
      }
    })
  );
};

const retrieveParameters = (container) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/airmets/getairmetparameters`;
  axios({
    method: 'get',
    url: endpoint,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    if (response.status === 200 && response.data) {
      return updateParameters(response.data, container);
    } else {
      console.error(ERROR_MSG.RETRIEVE_PARAMS, response.status, response.data);
      Promise.reject(new Error(`${ERROR_MSG.RETRIEVE_PARAMS}: ${response.status} - ${response.data}`));
    }
  }).catch(error => {
    console.error(ERROR_MSG.RETRIEVE_PARAMS, error);
    Promise.reject(error);
  });
};

const updateParameters = (parameters, container) => {
  const { active_firs : activeFirs, firareas } = parameters;
  if (Array.isArray(activeFirs)) {
    activeFirs.forEach((firKey) => {
      const firData = firareas
        ? firareas[firKey]
        : null;
      if (firData) {
        updateFir(firData.firname, container);
      }
    });
  }
  return setStatePromise(container, {
    parameters
  });
};

const retrievePhenomena = (container) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/airmets/getairmetphenomena`;

  axios({
    method: 'get',
    url: endpoint,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    if (response.status === 200 && response.data) {
      return updatePhenomena(response.data, container);
    } else {
      console.error(ERROR_MSG.RETRIEVE_PHENOMENA, response.status, response.data);
      Promise.reject(new Error(`${ERROR_MSG.RETRIEVE_PHENOMENA}: ${response.status} - ${response.data}`));
    }
  }).catch(error => {
    console.error(ERROR_MSG.RETRIEVE_PHENOMENA, error);
    Promise.reject(error);
  });
};

const updatePhenomena = (rawPhenomenaData, container) => {
  if (!Array.isArray(rawPhenomenaData)) {
    return Promise.resolve();
  }

  return setStatePromise(container, {
    phenomena: rawPhenomenaData
  });
};

const retrieveObscuringPhenomena = (container) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/airmets/getobscuringphenomena`;

  axios({
    method: 'get',
    url: endpoint,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    if (response.status === 200 && response.data) {
      return updateObscuringPhenomena(response.data, container);
    } else {
      console.error(ERROR_MSG.RETRIEVE_OBSCURING_PHENOMENA, response.status, response.data);
      Promise.reject(new Error(`${ERROR_MSG.RETRIEVE_OBSCURING_PHENOMENA}: ${response.status} - ${response.data}`));
    }
  }).catch(error => {
    console.error(ERROR_MSG.RETRIEVE_OBSCURING_PHENOMENA, error);
    Promise.reject(error);
  });
};

const updateObscuringPhenomena = (rawObscuringPhenomenaData, container) => {
  if (!Array.isArray(rawObscuringPhenomenaData)) {
    return Promise.resolve();
  }

  return setStatePromise(container, {
    obscuringPhenomena: rawObscuringPhenomenaData
  });
};

/**
 * Temporary fallback, since TACs should be included in the AIRMET retrieval
 * @param {Element} container The container where the AIRMETs and there TACs will land
 * @param {string} uuid The id of the AIRMET to retrieve the TAC for
 * @returns {Promise} A promise which resolves when the data is loaded, and rejects otherwise
 */
const retrieveAirmetTac = (container, uuid) => {
  const { urls } = container.props;

  if (!uuid || typeof uuid !== 'string') {
    Promise.reject(new Error(`${ERROR_MSG.RETRIEVE_TACS} no uuid provided`));
  }

  return new Promise((resolve, reject) =>
    axios({
      method: 'get',
      url: `${urls.BACKEND_SERVER_URL}/airmets/${uuid}`,
      withCredentials: true,
      responseType: 'text',
      headers: {
        'Accept': 'text/plain'
      }
    }).then(response => {
      if (response.status === 200 && response.data && typeof response.data === 'string') {
        resolve({ uuid, code: response.data });
      } else {
        console.warn(`${ERROR_MSG.RETRIEVE_TACS} for AIRMET ${uuid}`,
          `because ${response.status === 200 ? 'no response data could be retrieved' : `status was not OK [${response.status}]`}`);
        resolve({ uuid, code: null });
      }
    }, (error) => {
      console.error(`${error.message}`);
      resolve({ uuid, code: null });
    }).catch(error => {
      console.error(`${ERROR_MSG.RETRIEVE_TACS} for AIRMET ${uuid} because ${error.message}`);
      // resolve({ uuid, code: null });
      reject(error);
    })
  );
};

/**
 * Retrieve AIRMETs from the backend
 * @param {Element} container The container where the AIRMETs will land
 * @param {object} retrievableCategory The category metadata used to retrieve the AIRMETs
 * @returns {Promise} A promise which resolves when the data is properly load, and rejects otherwise
 */
const retrieveCategorizedAirmets = (container, retrievableCategory) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/airmets`;
  return new Promise((resolve, reject) =>
    axios({
      method: 'get',
      url: `${endpoint}${retrievableCategory.urlSuffix}`,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      if (response.status === 200 && response.data) {
        const incomingAirmets = [];
        if (response.data.nairmets !== 0 && response.data.airmets &&
          Array.isArray(response.data.airmets) && response.data.airmets.length > 0) {
          incomingAirmets.push(...response.data.airmets);
        }
        incomingAirmets.sort(byValidDate);
        // temporary functionality to add TAC to AIRMET
        const augmentedAirmets = incomingAirmets.map((incomingAirmet) =>
          retrieveAirmetTac(container, incomingAirmet.uuid).then(tacResult => {
            incomingAirmet.tac = tacResult.code;
            return Promise.resolve(incomingAirmet);
          })
        );
        Promise.all(augmentedAirmets).then((airmets) =>
          resolve({ ref: retrievableCategory.ref, airmets })
        );
        // FIXME: replace code below previous comment with the next line
        // resolve({ ref: retrievableCategory.ref, airmets: incomingAirmets });
      } else {
        reject(new Error(`${ERROR_MSG.RETRIEVE_AIRMETS} for ${retrievableCategory.ref} `,
          `because ${response.status === 200 ? 'no response data could be retrieved' : `status was not OK [${response.status}]`}`));
      }
    }, (error) => {
      console.error(`${error.message}`);
      reject(error);
    }).catch(error => {
      console.error(`${ERROR_MSG.RETRIEVE_AIRMETS} for ${retrievableCategory.ref} because ${error.message}`);
      reject(error);
    })
  );
};

/**
 * Refresh (replace) the category data in the state
 * @param {Element} container The container which holds the category
 * @param {Object} categorizedAirmets The new AIRMETs and category metadata
 * @returns {Promise} A promise which resolves when the category data is refreshed, and rejects otherwise
 */
const refreshCategoryState = (container, categorizedAirmets) => {
  const { ref: categoryRef, airmets } = categorizedAirmets;
  const { categories, focussedCategoryRef, selectedAirmet, selectedAuxiliaryInfo } = container.state;

  const categoryIndex = categories.findIndex((category) => category.ref === categoryRef);
  if (isNaN(categoryIndex) || categoryIndex === -1) {
    return Promise.reject(new Error(`${ERROR_MSG.FIND_CATEGORY}`));
  }

  if (categoryRef === focussedCategoryRef) {
    const selectedId = selectedAirmet.length > 0 ? selectedAirmet[0].uuid : null;
    if (selectedId !== null) {
      const incomingSelected = airmets.filter((possibleSelected) =>
        possibleSelected.uuid === selectedId);
      if (incomingSelected.length === 0) {
        // no longer in this category
        showFeedback(container,
          'Selected Airmet no longer exists in category',
          `The status has changed, so this Airmet doesn't exist anymore in the ${categories[categoryIndex].title}`,
          FEEDBACK_STATUS.WARN
        );
      } else {
        const baseSelected = categories[categoryIndex].airmets.filter((possibleSelected) =>
          possibleSelected.uuid === selectedId);
        if (baseSelected.length === 1 && !isEqual(baseSelected[0], incomingSelected[0]) &&
          selectedAuxiliaryInfo.hasEdits) {
          // base AIRMET changed locally and remotely
          showFeedback(container,
            'Selected Airmet has been changed remotely',
            'Reselect the Airmet to update, or click [Save] to override',
            FEEDBACK_STATUS.WARN
          );
        }
      }
    }
  }

  const emptyCategories = [...Array(categoryIndex).fill({}), { airmets: [] }];
  const newCategories = [...Array(categoryIndex).fill({}), { airmets }];
  return setStatePromise(container, { categories: emptyCategories })
    .then(() => setStatePromise(container, { categories: newCategories }));
};

/**
 * Synchronize the AIRMET data in the state with data from the backend
 * @param {Element} container The container where the AIRMETs will land in
 * @returns {Promise} Resolves when done, rejects when errors occur
 */
const synchronizeAirmets = (container) => {
  const retrievableCategories = [
    { ref: CATEGORY_REFS.ACTIVE_AIRMETS, urlSuffix: '?active=true' },
    { ref: CATEGORY_REFS.CONCEPT_AIRMETS, urlSuffix: `?active=false&status=${STATUSES.CONCEPT}` },
    { ref: CATEGORY_REFS.ARCHIVED_AIRMETS, urlSuffix: `?active=false&status=${STATUSES.CANCELED}` }
  ];

  // collect AIRMETs from the backend and refresh the state
  const refreshedAirmetCategories = retrievableCategories.map(category =>
    retrieveCategorizedAirmets(container, category).then(categorizedAirmets => refreshCategoryState(container, categorizedAirmets))
  );

  return Promise.all(refreshedAirmetCategories);
};

/**
 * Set state in an asynchronous, controlled and immutable way
 * @param {Object} container The context containing the state
 * @param {Object} newProps The new properties
 * @returns {Promise} The promise of setting the state in the context
 */
const setStatePromise = (container, newProps) => {
  return new Promise((resolve, reject) => {
    container.setState(safeMerge(
      newProps,
      AIRMET_TEMPLATES.CONTAINER,
      container.state
    ),
    () => { resolve(); });
  });
};

/**
 * Select a Airmet in a asynchronous way
 * @param {array} selection The list of AIRMET(s) to be selected
 * @param {Element} container The container to select the AIRMET(s) in
 */
const selectAirmet = (selection, container) => {
  const { state, props } = container;
  const { selectedAirmet } = state;
  const { sources } = props;
  if (!Array.isArray(selection)) {
    return Promise.reject(new Error(`To enable selecting AIRMETs, the selection must be provided as an array`));
  }
  const hasPreviousSelection = Array.isArray(selectedAirmet) && selectedAirmet.length > 0;

  // handle combinatorics n(previousSelection) x m(selection)
  if (selection.length === 0 && !hasPreviousSelection) {
    // nothing to do
    return Promise.resolve();
  }

  if (selection.length === 0) {
    // clear all
    setPanelFeedback(null, container);
    return setStatePromise(container, {
      selectedAirmet: [],
      selectedAuxiliaryInfo: {
        mode: AIRMET_MODES.READ,
        drawModeStart: null,
        feedbackStart: null,
        hasEdits: false
      }
    }).then(() => setAirmetDrawing(initialGeoJson(), null, container))
      .then(() => getPresetForPhenomenon(null, sources))
      .then((preset) => updateDisplayedPreset(preset, container));
  }

  const geojson = selection[0].geojson || null;
  const firName = selection[0].firname || null;
  const startFeature = geojson && Array.isArray(geojson.features)
    ? geojson.features.find((feature) => feature.properties.featureFunction === 'start')
    : null;
  const drawModeStart = startFeature
    ? MODES_GEO_MAPPING[startFeature.properties.selectionType] || null
    : null;

  // irrespective of the previous selection:
  // set the new selection, auxiliary info and
  // * draw AIRMET features,
  // * retrieve AIRMET preset and
  // * update display preset
  setPanelFeedback(null, container);
  return setStatePromise(container, {
    selectedAirmet: selection,
    selectedAuxiliaryInfo: {
      mode: AIRMET_MODES.READ,
      drawModeStart: drawModeStart || null,
      feedbackStart: null,
      hasEdits: false
    }
  }).then(() => setAirmetDrawing(geojson, firName, container))
    .then(() => getPresetForPhenomenon(null, sources))
    .then((preset) => updateDisplayedPreset(preset, container));
};

const focusAirmet = (uuid, container) => {
  const { dispatch, mapActions } = container.props;
  const { state } = container;
  const selection = [];
  const indices = findCategoryAndAirmetIndex(uuid, state);
  let categoryRef = null;

  if (uuid == null) {
    categoryRef = state.focussedCategoryRef;
  } else if (indices.isFound) {
    const category = state.categories[indices.categoryIndex];
    const airmet = category.airmets[indices.airmetIndex];
    if (airmet) {
      categoryRef = category.ref;
      selection.push(airmet);
    } else {
      return Promise.reject(new Error(`${ERROR_MSG.SELECT_AIRMET}`));
    }
  } else {
    return Promise.reject(new Error(`${ERROR_MSG.SELECT_AIRMET}`));
  }
  const categoryTogglePromise = categoryRef !== state.focussedCategoryRef
    ? toggleCategory(categoryRef, container)
    : Promise.resolve();

  return categoryTogglePromise
    .then(() => selectAirmet(selection, container))
    .then(() => {
      dispatch(mapActions.setMapMode('pan'));
      return Promise.resolve(uuid);
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
    axios.get(`${BACKEND_SERVER_URL}/airmets/getfir`, {
      withCredentials: true,
      params: {
        name: trimmedFirname
      }
    }).then(res => {
      fir = res.data;
      if (fir !== null) {
        setStatePromise(container, {
          firs: {
            [trimmedFirname]: fir
          }
        });
      }
    }).catch(ex => {
      console.error('Error!: ', ex);
    });
  }
};

const initialGeoJson = () => {
  const startId = uuidv4();
  const newProps = {
    features: [
      {
        id: startId,
        properties: {
          featureFunction: 'start',
          selectionType: null,
          'fill-opacity': 0.2,
          fill: '#0f0',
          'stroke-width': 0.8
        },
        geometry: {
          type: null,
          coordinates: []
        }
      },
      {
        id: uuidv4(),
        properties: {
          featureFunction: 'intersection',
          relatesTo: startId,
          selectionType: null,
          'fill-opacity': 0.33,
          fill: '#2a2',
          'stroke-width': 2
        },
        geometry: {
          type: null,
          coordinates: []
        }
      }
    ]
  };
  return safeMerge(newProps, AIRMET_TEMPLATES.GEOJSON);
};

const addFirFeature = (geojson, firName, container) => {
  const { firs: availableFirs } = container.state;
  if (!geojson || !firName) {
    return null;
  }
  if (!availableFirs.hasOwnProperty(firName)) {
    return null;
  }
  const featureForFir = availableFirs[firName];
  const lastFeatureIndex = geojson.features.length;
  return safeMerge({
    features: Array(lastFeatureIndex).concat({
      type: featureForFir.type,
      properties: {
        featureFunction: 'base-fir',
        selectionType: 'fir',
        fill: 'transparent',
        'fill-opacity': 0.01,
        stroke: '#017daf',
        'stroke-width': 1.2
      },
      geometry: {
        type: featureForFir.geometry.type,
        coordinates: featureForFir.geometry.coordinates
      }
    })
  }, AIRMET_TEMPLATES.GEOJSON, geojson);
};

const getEmptyAirmet = (container) => {
  const { parameters } = container.state;
  const defaultFirKey = Array.isArray(parameters.active_firs) && parameters.active_firs.length > 0 ? parameters.active_firs[0] : null;
  const defaultFirData = (defaultFirKey !== null && parameters.firareas[defaultFirKey])
    ? parameters.firareas[defaultFirKey]
    : parameters.firareas && Object.keys(parameters.firareas).length > 0
      ? parameters.firareas[Object.keys(parameters.firareas)[0]]
      : null;
  const newProps = {
    status: STATUSES.CONCEPT,
    type: DISTRIBUTION_TYPES.NORMAL,
    change: CHANGE_TYPES.NO_CHANGE,
    levelinfo: {
      mode: MODES_LVL.AT,
      levels: [
        { unit: UNITS.FL },
        { unit: UNITS.FL }
      ]
    },
    wind: {
      speed: {
        unit: UNITS.KT
      },
      direction: {
        unit: UNITS.DEGREES
      }
    },
    visibility: {
      unit: UNITS.M
    },
    cloudLevels: {
      lower: {
        unit: UNITS.FT
      },
      upper: {
        unit: UNITS.FT
      }
    },
    movement_type: MOVEMENT_TYPES.STATIONARY,
    location_indicator_mwo: parameters.location_indicator_wmo,
    validdate: getRoundedNow().format(),
    validdate_end: defaultFirData ? getRoundedNow().add(defaultFirData.maxhoursofvalidity, 'hour').format() : null,
    location_indicator_icao: defaultFirData ? defaultFirData.location_indicator_icao : null,
    firname: defaultFirData ? defaultFirData.firname : null,
    geojson: initialGeoJson()
  };
  return safeMerge(newProps, AIRMET_TEMPLATES.AIRMET);
};

const findCategoryAndAirmetIndex = (uuid, state) => {
  let airmetIndex = -1;
  const categoryIndex = state.categories.findIndex((category) => {
    airmetIndex = category.airmets.findIndex((airmet) => airmet.uuid === uuid);
    return airmetIndex !== -1;
  });
  return { airmetIndex, categoryIndex, isFound: (categoryIndex !== -1 && airmetIndex !== -1) };
};

const updateDisplayedPreset = (preset, container) => {
  // FIXME: this code closely resembles the TitleBarContainer.setPreset, it should be generalized
  const { dispatch, panelsActions, mapActions, adagucActions } = container.props;
  if (!preset) {
    return Promise.resolve();
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
    preset.layers.forEach((panel, panelIdx) => {
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
        panel.forEach((layer, i) => {
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
                Object.keys(layer.dimensions).forEach((dim) => {
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
      layers.forEach((layerDescription) => {
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
      return Promise.resolve();
    });
  }
};

const updateAirmet = (dataField, value, container) => {
  const { props } = container;
  const { sources } = props;
  const { selectedAirmet, parameters } = container.state;

  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet) {
    return Promise.reject(new Error(`To enable updating a AIRMET, there must be a AIRMET selected (selectedAirmet must be a non-empty array)`));
  }

  const shouldCleanMovement = dataField === 'movement_type' && value !== MOVEMENT_TYPES.MOVEMENT;
  let preset = null;
  const shouldUpdatePreset = (preset) => !!preset;
  let maxHoursDuration = null;
  const shouldUpdateMaxHoursDuration = (maxHoursDuration) => !!maxHoursDuration;
  let shouldCleanLevels = false;

  const dataFieldParts = dataField.split('.');
  const fieldToUpdate = dataFieldParts.length > 0 && dataFieldParts.pop();
  const isPhenomenonUpdate = fieldToUpdate === 'phenomenon';
  if (isPhenomenonUpdate) {
    value = Array.isArray(value) && value.length > 0
      ? value[0].code
      : null;

    if (value) {
      const prefix = AIRMET_VARIANTS_PREFIXES.NORMAL;
      const activeFirEntry = Object.entries(parameters.firareas).filter((entry) => entry[1].firname === affectedAirmet.firname &&
        entry[1].location_indicator_icao === affectedAirmet.location_indicator_icao);
      const activeFir = Array.isArray(activeFirEntry) && activeFirEntry.length === 1
        ? activeFirEntry[0][1]
        : null;
      maxHoursDuration = activeFir
        ? activeFir[`${prefix}maxhoursofvalidity`]
        : null;
      preset = getPresetForPhenomenon(value, sources);
    }
  }
  if ((dataField === 'validdate' || dataField === 'validdate_end') && value === null) {
    value = moment.utc().add(1, 'minute').format(DATETIME_FORMAT);
  }
  if (dataField.indexOf('levelinfo') !== -1) {
    switch (fieldToUpdate) {
      case 'unit':
        value = UNITS_LABELED.includes(value)
          ? value.unit
          : UNITS.FL.unit;
        break;
      case 'value':
        value = value !== null && !isNaN(value) && value !== 0 && value !== '0' ? parseInt(value) : null;
        break;
      case 'mode':
        const betweenModes = [MODES_LVL.BETW, MODES_LVL.BETW_SFC];
        const isCurrentModeABetween = betweenModes.includes(affectedAirmet.levelinfo.mode);
        const isNextModeABetween = betweenModes.includes(value);
        if ((isCurrentModeABetween && !isNextModeABetween) || (!isCurrentModeABetween && isNextModeABetween)) {
          shouldCleanLevels = true;
        }
        break;
    }
  }
  if (dataField.indexOf('cloudLevels') !== -1 && fieldToUpdate === 'val') {
    value = value !== null && !isNaN(value) && value !== 0 && value !== '0' ? parseInt(value) : null;
  }

  const toStructure = (key, value) =>
    !isNaN(key)
      ? [...Array(parseInt(key)).fill({}), value]
      : { [key]: value };
  const selectedAirmetUpdate = dataFieldParts.reduceRight(
    (traverser, propertyKey) => toStructure(propertyKey, traverser),
    toStructure(fieldToUpdate, value)
  );
  if (isPhenomenonUpdate) {
    selectedAirmetUpdate.wind = produce(AIRMET_TEMPLATES.WIND, (draftState) => {
      draftState.speed.unit = UNITS.KT;
      draftState.direction.unit = UNITS.DEGREES;
    });
    selectedAirmetUpdate.visibility = produce(AIRMET_TEMPLATES.VISIBILITY, (draftState) => {
      draftState.unit = UNITS.M;
    });
    selectedAirmetUpdate.cloudLevels = produce(AIRMET_TEMPLATES.CLOUD_LEVELS, (draftState) => {
      draftState.lower.unit = UNITS.FT;
      draftState.upper.unit = UNITS.FT;
    });
  }
  if (shouldCleanMovement) {
    selectedAirmetUpdate.movement = produce(AIRMET_TEMPLATES.MOVEMENT, () => { });
  }
  if (shouldUpdateMaxHoursDuration(maxHoursDuration)) {
    selectedAirmetUpdate.validdate = getRoundedNow().format();
    selectedAirmetUpdate.validdate_end = getRoundedNow().add(maxHoursDuration, 'hour').format();
  }
  if (shouldCleanLevels) {
    selectedAirmetUpdate.levelinfo.levels = [
      { value: null, unit: UNITS.FL },
      { value: null, unit: UNITS.FL }
    ];
  }
  return setStatePromise(container, {
    selectedAirmet: [
      selectedAirmetUpdate
    ],
    selectedAuxiliaryInfo: {
      hasEdits: true
    }
  }).then(() => shouldUpdatePreset(preset)
    ? updateDisplayedPreset(preset, container)
    : Promise.resolve()
  ).then(() => {
    if (container.state.selectedAirmet.length > 0) {
      return verifyAirmet(container.state.selectedAirmet[0], container);
    }
    return Promise.resolve();
  });
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

const drawAirmet = (event, uuid, container, action, featureFunction) => {
  const { dispatch, mapActions, drawActions, drawProperties } = container.props;
  const { selectedAuxiliaryInfo } = container.state;
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
  if (action === selectedAuxiliaryInfo[drawMode]) {
    updatableFeatureProps.geometry.coordinates.push(...features[featureIndex].geometry.coordinates);
  }
  setPanelFeedback(null, container);
  switch (action) {
    case 'select-point':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPoint());
      updatableFeatureProps.geometry.type = 'Point';
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.POINT;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      setStatePromise(container, { selectedAuxiliaryInfo: { [drawMode]: action } });
      break;
    case 'select-region':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditBox());
      updatableFeatureProps.geometry.type = 'Polygon';
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.BOX;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      setStatePromise(container, { selectedAuxiliaryInfo: { [drawMode]: action } });
      break;
    case 'select-shape':
      dispatch(mapActions.setMapMode('draw'));
      dispatch(drawActions.setFeatureEditPolygon());
      updatableFeatureProps.geometry.type = 'Polygon';
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.POLY;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      setStatePromise(container, { selectedAuxiliaryInfo: { [drawMode]: action } });
      break;
    case 'select-fir':
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeatureEditPolygon());
      updatableFeatureProps.properties.selectionType = MODES_GEO_SELECTION.FIR;
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      setStatePromise(container, { selectedAuxiliaryInfo: { [drawMode]: action } });
      break;
    case 'delete-selection':
      dispatch(mapActions.setMapMode('pan'));
      dispatch(drawActions.setFeature(updatableFeatureProps));
      clearRelatedIntersection(featureId, features, dispatch, drawActions);
      setStatePromise(container, { selectedAuxiliaryInfo: { [drawMode]: action } });
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

const setPanelFeedback = (message, container) => {
  const { dispatch, panelsActions } = container.props;
  dispatch(panelsActions.setPanelFeedback({
    status: message ? FEEDBACK_STATUS.ERROR : FEEDBACK_STATUS.OK,
    message: message
  }));
};

const cleanup = (container) => {
  const { dispatch, drawActions } = container.props;
  setPanelFeedback(null, container);
  dispatch(drawActions.setGeoJSON(initialGeoJson()));
  return setStatePromise(container, {
    selectedAuxiliaryInfo: {
      feedbackStart: null,
      feedbackEnd: null
    }
  });
};

const createIntersectionData = (feature, firname, container) => {
  const cleanedFeature = cleanFeatures(feature);
  return (!isFeatureGeoJsonComplete(cleanedFeature))
    ? null
    : { firname: firname, feature: cleanedFeature };
};

const createFirIntersection = (featureId, geojson, container) => {
  const { dispatch, drawActions, urls } = container.props;
  const { selectedAirmet, categories, focussedCategoryRef } = container.state;
  const activeCategory = categories.find((category) => category.ref === focussedCategoryRef);
  if (!activeCategory) {
    return Promise.reject(new Error('No selected category found to create an intersection in'));
  }
  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet) {
    return Promise.reject(new Error('No selected AIRMET found to create an intersection in'));
  }
  const featureToIntersect = geojson.features.find((feature) =>
    feature.id === featureId);
  const intersectionData = createIntersectionData(featureToIntersect, affectedAirmet.firname, container);
  const intersectionFeature = geojson.features.find((iSFeature) => {
    return iSFeature.properties.relatesTo === featureId && iSFeature.properties.featureFunction === 'intersection';
  });
  if (intersectionData && intersectionFeature) {
    return axios({
      method: 'post',
      url: `${urls.BACKEND_SERVER_URL}/airmets/airmetintersections`,
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
        return setStatePromise(container, {
          selectedAuxiliaryInfo: {
            [feedbackProperty]: responseMessage
          }
        }).then(() => {
          setPanelFeedback(responseMessage, container);
          if (responseSucceeded === true) {
            dispatch(drawActions.setFeature({
              geometry: { coordinates: responseFeature.geometry.coordinates, type: responseFeature.geometry.type },
              properties: { selectionType: responseFeature.properties.selectionType },
              featureId: intersectionFeature.id
            }));
          }
          return Promise.resolve(true);
        });
      }
      Promise.reject(new Error(`Couldn't retrieve intersection for feature ${featureId}`));
    }).catch(error => Promise.reject(new Error(`Couldn't retrieve intersection for feature ${featureId}: ${error}`)));
  } else {
    console.warn('The intersection feature was not found');
    return Promise.resolve(false);
  }
};

const clearAirmet = (event, uuid, container) => {
  selectAirmet([getEmptyAirmet(container)], container).then(() =>
    setStatePromise(container, {
      selectedAuxiliaryInfo: {
        mode: AIRMET_MODES.EDIT
      }
    })).then(() =>
    showFeedback(container, 'Airmet cleared',
      'The input on this Airmet has been cleared successfully', FEEDBACK_STATUS.OK)
  );
};

const discardAirmet = (event, uuid, container) => {
  focusAirmet(null, container)
    .then(() => synchronizeAirmets(container))
    .then(() => focusAirmet(uuid, container))
    .then(() => setStatePromise(container, {
      displayModal: null,
      selectedAuxiliaryInfo: {
        mode: AIRMET_MODES.EDIT
      }
    }))
    .then(() => showFeedback(container, 'Changes discarded', 'The changes are successfully discarded', FEEDBACK_STATUS.OK));
};

/**
 * Cleans airmet, returns cleaned airmet object
 @param {object} airmetAsObject, the airmet object to clean
 @param {array} cleanedFeatures, the cleaned features to add
 @return {object} Object with taf and report properties
*/
const sanitizeAirmet = (airmetAsObject, cleanedFeatures) => {
  // const volcanoPosition = airmetAsObject.va_extra_fields.volcano.position;
  // const hasVolcanoPosition = volcanoPosition.some((coordinate) => typeof coordinate === 'number');
  return produce(airmetAsObject, draftState => {
    draftState.tac = null;
    clearEmptyPointersAndAncestors(draftState);
    draftState.geojson.features.length = 0;
    draftState.geojson.features.push(...cleanedFeatures);
    /* if (hasVolcanoPosition) {
      if (!draftState.va_extra_fields.volcano) {
        draftState.va_extra_fields['volcano'] = {};
        if (!draftState.va_extra_fields.volcano.position) {
          draftState.va_extra_fields.volcano.position = [];
        }
      }
      draftState.va_extra_fields.volcano.position.length = 0;
      draftState.va_extra_fields.volcano.position.push(...volcanoPosition);
    } */
  });
};

const postAirmet = (container) => {
  const { urls, drawProperties } = container.props;
  const { selectedAirmet } = container.state;

  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet) {
    return;
  }
  const cleanedFeatures = cleanFeatures(drawProperties.adagucMapDraw.geojson.features);
  const complementedAirmet = sanitizeAirmet(affectedAirmet, cleanedFeatures);

  return new Promise((resolve, reject) =>
    axios({
      method: 'post',
      url: `${urls.BACKEND_SERVER_URL}/airmets`,
      withCredentials: true,
      responseType: 'json',
      data: complementedAirmet
    }).then(response => {
      if (response.status === 200 && response.data) {
        let responseUuid = response.data.uuid;
        setStatePromise(container, {
          selectedAuxiliaryInfo: {
            hasEdits: false
          },
          displayModal: null
        }).then(() => resolve(responseUuid));
      } else {
        reject(new Error(`${ERROR_MSG.POST_AIRMET} ${complementedAirmet.uuid}`,
          `because ${response.status === 200 ? 'no response data could be retrieved' : `status was not OK [${response.status}]`}`));
      }
    }, (error) => {
      console.error(`${error.message}`);
      reject(error);
    }).catch(error => {
      console.error(`${ERROR_MSG.POST_AIRMET} ${complementedAirmet.uuid} because ${error.message}`);
      reject(error);
    })
  );
};

const saveAirmet = (event, container) => {
  postAirmet(container).then((uuid) => {
    showFeedback(container, 'Airmet saved', `Airmet ${uuid} was successfully saved`, FEEDBACK_STATUS.OK);
    focusAirmet(null, container)
      .then(() => synchronizeAirmets(container))
      .then(() => focusAirmet(uuid, container));
  }, (error) => {
    const errMsg = `Could not save Airmet: ${error.message}`;
    console.error(errMsg);
    showFeedback(container, 'Error', errMsg, FEEDBACK_STATUS.ERROR);
  });
};

/**
 * Switch AIRMET mode to edit
 * @param {Event} event The event which triggered the switch
 * @param {Element} container The container on which the switch was triggered
 */
const editAirmet = (event, container) => {
  const { dispatch, mapActions } = container.props;
  return setStatePromise(container, {
    selectedAuxiliaryInfo: {
      mode: AIRMET_MODES.EDIT,
      hasEdits: false
    }
  }).then(() => dispatch(mapActions.setMapMode('pan')));
};

/**
* Deleting Airmet from backend
* @param {object} event The event that triggered deleting
* @param {Element} container The container in which the delete action was triggered
*/
const deleteAirmet = (event, container) => {
  const { state, props } = container;
  const { BACKEND_SERVER_URL } = props.urls;
  const { selectedAirmet } = state;
  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet || !affectedAirmet.uuid || !BACKEND_SERVER_URL || affectedAirmet.status !== STATUSES.CONCEPT) {
    return;
  }
  axios({
    method: 'delete',
    url: `${BACKEND_SERVER_URL}/airmets/${affectedAirmet.uuid}`,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    showFeedback(container, 'Airmet deleted', `Airmet ${affectedAirmet.uuid} was successfully deleted`, FEEDBACK_STATUS.OK);
    setStatePromise(container, { displayModal: null })
      .then(() => focusAirmet(null, container))
      .then(() => synchronizeAirmets(container));
  }).catch(error => {
    console.error('Couldn\'t delete Airmet', error);
    showFeedback(container, 'Error', `An error occurred while deleting the Airmet: ${error.response.data.error}`, FEEDBACK_STATUS.ERROR);
  });
};

/**
 * Copy Airmet information
 * @param {object} event The event that triggered copying
 * @param {string} uuid The identifier for the Airmet to copy
 * @param {Element} container The container in which the copy action was triggered
 */
const copyAirmet = (event, container) => {
  const { state } = container;
  const { selectedAirmet } = state;
  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet || !affectedAirmet.uuid) {
    showFeedback(container, 'Airmet could not be copied',
      `There is no AIRMET selected, therefore there is nothing to be copied`, FEEDBACK_STATUS.ERROR);
    return;
  }

  setStatePromise(container, {
    copiedAirmetRef: affectedAirmet.uuid
  }).then(() => {
    showFeedback(container, 'Airmet copied',
      `The properties of AIRMET ${affectedAirmet.uuid} have been copied successfully`, FEEDBACK_STATUS.OK);
  });
};

/**
 * Paste Airmet information
 * @param {object} event The event that triggered pasting
 * @param {Element} container The container in which the paste action was triggered
 */
const pasteAirmet = (event, container) => {
  const { state } = container;
  const { selectedAirmet, categories, focussedCategoryRef } = state;
  const indicesCopiedAirmet = findCategoryAndAirmetIndex(state.copiedAirmetRef, state);
  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet || !indicesCopiedAirmet.isFound) {
    return;
  }
  const copiedAirmet = categories[indicesCopiedAirmet.categoryIndex].airmets[indicesCopiedAirmet.airmetIndex];
  if (!copiedAirmet && focussedCategoryRef !== CATEGORY_REFS.ADD_AIRMET) {
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
    'location_indicator_mwo',
    'cloudLevels',
    'visibility',
    'obscuring',
    'wind',
    'type'
  ];
  const newPartialState = {};
  propertiesToCopy.forEach((property) => {
    if (copiedAirmet.hasOwnProperty(property) && copiedAirmet[property] !== null && typeof copiedAirmet[property] !== 'undefined') {
      newPartialState[property] = copiedAirmet[property];
    }
  });
  setStatePromise(container, {
    selectedAirmet: [newPartialState],
    copiedAirmetRef: null
  }).then(() => {
    return setAirmetDrawing(copiedAirmet.geojson, copiedAirmet.firname, container);
  }).then(() => {
    showFeedback(container, 'Airmet pasted',
      'The copied properties have been pasted successfully into the current Airmet', FEEDBACK_STATUS.OK);
  });
};

const publishAirmet = (event, uuid, container) => {
  const { selectedAirmet } = container.state;
  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet) {
    return;
  }
  setStatePromise(container, {
    selectedAirmet: [{ status: STATUSES.PUBLISHED }]
  }).then(() => postAirmet(container))
    .then((uuid) => {
      showFeedback(container, 'Airmet published', `Airmet ${uuid} was successfully published`, FEEDBACK_STATUS.OK);
      return focusAirmet(null, container)
        .then(() => synchronizeAirmets(container))
        .then(() => focusAirmet(affectedAirmet.uuid, container));
    }, (error) => {
      const errMsg = `Could not publish Airmet: ${error.message}`;
      console.error(errMsg);
      showFeedback(container, 'Error', errMsg, FEEDBACK_STATUS.ERROR);
      return Promise.reject(new Error(errMsg));
    });
};

const cancelAirmet = (event, container) => {
  const { selectedAirmet } = container.state;
  const affectedAirmet = Array.isArray(selectedAirmet) && selectedAirmet.length === 1
    ? selectedAirmet[0]
    : null;
  if (!affectedAirmet) {
    return;
  }
  setStatePromise(container, {
    selectedAirmet: [ { status: STATUSES.CANCELED } ]
  }).then(() => postAirmet(container))
    .then((uuid) => {
      showFeedback(container, 'Airmet canceled', `Airmet ${uuid} was successfully canceled`, FEEDBACK_STATUS.OK);
      return synchronizeAirmets(container);
    }, (error) => {
      const errMsg = `Could not cancel Airmet: ${error.message}`;
      console.error(errMsg);
      showFeedback(container, 'Error', errMsg, FEEDBACK_STATUS.ERROR);
      return Promise.reject(new Error(errMsg));
    }).then(() => {
      const { state } = container;
      const { categories } = state;
      const indices = findCategoryAndAirmetIndex(affectedAirmet.uuid, state);
      const publishedCategory = categories.find((category) => category.ref === CATEGORY_REFS.ACTIVE_AIRMETS);
      if (indices.isFound && publishedCategory) {
        const canceledAirmet = categories[indices.categoryIndex].airmets[indices.airmetIndex];
        const cancelAirmet = publishedCategory.airmets.find((airmet) => airmet.cancels === canceledAirmet.sequence &&
        airmet.phenomenon === canceledAirmet.phenomenon);
        if (cancelAirmet) {
          focusAirmet(cancelAirmet.uuid, container);
        }
      }
    });
};

const setAirmetDrawing = (geojson, firName, container) => {
  const { dispatch, drawActions } = container.props;
  const enhancedGeojson = addFirFeature(geojson, firName || null, container);
  dispatch(drawActions.setGeoJSON(enhancedGeojson || geojson));
  return Promise.resolve();
};

/** Verify airmet
 * @param {object} airmetAsObject The AIRMET object validate
*/
const verifyAirmet = (airmetObject, container) => {
  if (!airmetObject) {
    return;
  }
  const { drawProperties, urls } = container.props;
  const cleanedFeatures = cleanFeatures(drawProperties.adagucMapDraw.geojson.features);
  const complementedAirmet = sanitizeAirmet(airmetObject, cleanedFeatures);
  const setTacRepresentation = (representation) =>
    setStatePromise(container, {
      selectedAirmet: [{ tac: representation }]
    });
  setTacRepresentation('... retrieving TAC ...').then(() =>
    axios({
      method: 'post',
      url: `${urls.BACKEND_SERVER_URL}/airmets/verify`,
      withCredentials: true,
      responseType: 'json',
      data: complementedAirmet
    }).then(
      response => {
        if (response.data) {
          let responseJson = response.data;
          if (responseJson.TAC) {
            setTacRepresentation(responseJson.TAC);
          } else {
            setTacRepresentation('No TAC received from server');
          }
        } else {
          console.error('airmet/verify has no response.data');
        }
      }
    ).catch(error => {
      console.error('airmet/verify', error);
      setTacRepresentation('Unable to generate TAC');
    })
  );
};

/**
 * Toggles AIRMET modals on and off
 * @param {Event} event The event which triggered the toggling
 * @param {string} type The modal type to toggle
 * @param {component} container The container in which the AIRMET modal should be toggled
 */
const toggleAirmetModal = (event, type, container) => {
  const { state } = container;
  if (event) {
    event.stopPropagation();
  }
  return setStatePromise(container, {
    displayModal: state.displayModal === type ? null : type
  });
};

/**
 * Toggles  on and off the hasEdits flag in the selected auxiliary info
 * @param {Event} event The event which triggered the toggling
 * @param {string} type The modal type to toggle
 * @param {component} container The container in which the AIRMET modal should be toggled
 */
const toggleHasEdits = (event, value, container) => {
  const { hasEdits : prevHasEdits } = container.state.selectedAuxiliaryInfo;
  const newValue = typeof value === 'boolean' ? value : !prevHasEdits;
  if (event) {
    event.stopPropagation();
  }
  return setStatePromise(container, {
    selectedAuxiliaryInfo: {
      hasEdits: newValue
    }
  });
};

/**
 * AirmetsContainer has its own state, this is the dispatch for updating the state
 * @param {object} localAction Action-object containing the type and additional, action specific, parameters
 * @param {object} state Object reference for the actual state
 * @param {component} container The component to update the state
 */
export default (localAction, container) => {
  switch (localAction.type) {
    case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
      toggleContainer(container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_CATEGORY:
      return toggleCategory(localAction.ref, container);
    case LOCAL_ACTION_TYPES.RETRIEVE_PARAMETERS:
      return retrieveParameters(container);
    case LOCAL_ACTION_TYPES.RETRIEVE_PHENOMENA:
      return retrievePhenomena(container);
    case LOCAL_ACTION_TYPES.RETRIEVE_OBSCURING_PHENOMENA:
      return retrieveObscuringPhenomena(container);
    case LOCAL_ACTION_TYPES.RETRIEVE_AIRMETS:
      return synchronizeAirmets(container);
    case LOCAL_ACTION_TYPES.FOCUS_AIRMET:
      if (localAction.event && localAction.event.target && ['BUTTON', 'INPUT'].includes(localAction.event.target.tagName)) {
        return;
      }
      focusAirmet(localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.ADD_AIRMET:
      console.error('ADD_AIRMET is deprecated');
      break;
    case LOCAL_ACTION_TYPES.UPDATE_AIRMET:
      return updateAirmet(localAction.dataField, localAction.value, container);
    case LOCAL_ACTION_TYPES.UPDATE_AIRMET_LEVEL:
      console.error('UPDATE_AIRMET_LEVEL is deprecated');
      break;
    case LOCAL_ACTION_TYPES.CLEAR_AIRMET:
      clearAirmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DISCARD_AIRMET:
      discardAirmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.SAVE_AIRMET:
      saveAirmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.EDIT_AIRMET:
      editAirmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_HAS_EDITS:
      return toggleHasEdits(localAction.event, localAction.value, container);
    case LOCAL_ACTION_TYPES.DELETE_AIRMET:
      deleteAirmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.COPY_AIRMET:
      copyAirmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PASTE_AIRMET:
      pasteAirmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PUBLISH_AIRMET:
      publishAirmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.CANCEL_AIRMET:
      cancelAirmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.DRAW_AIRMET:
      drawAirmet(localAction.event, localAction.uuid, container, localAction.action, localAction.featureFunction);
      break;
    case LOCAL_ACTION_TYPES.CREATE_FIR_INTERSECTION:
      return createFirIntersection(localAction.featureId, localAction.geoJson, container);
    case LOCAL_ACTION_TYPES.UPDATE_FIR:
      updateFir(localAction.firName, container);
      break;
    case LOCAL_ACTION_TYPES.VERIFY_AIRMET:
      verifyAirmet(localAction.airmetObject, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_AIRMET_MODAL:
      toggleAirmetModal(localAction.event, localAction.modalType, container);
      break;
    case LOCAL_ACTION_TYPES.CLEANUP:
      cleanup(container);
  }
};
