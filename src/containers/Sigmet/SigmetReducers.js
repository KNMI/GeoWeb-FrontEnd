import produce from 'immer';
import moment from 'moment';
import { notify } from 'reapop';
import {
  SIGMET_MODES, SIGMET_TEMPLATES, UNITS, UNITS_ALT, MODES_LVL, MOVEMENT_TYPES, DISTRIBUTION_TYPES, CHANGE_TYPES,
  PHENOMENON_CODE_VOLCANIC_ASH, SIGMET_VARIANTS_PREFIXES } from '../../components/Sigmet/SigmetTemplates';
import { DATETIME_FORMAT } from '../../config/DayTimeConfig';
import { LOCAL_ACTION_TYPES, CATEGORY_REFS, STATUSES } from './SigmetActions';
import { clearEmptyPointersAndAncestors, safeMerge, isFeatureGeoJsonComplete,
  MODES_GEO_SELECTION, MODES_GEO_MAPPING, isObject } from '../../utils/json';
import { FEEDBACK_STATUS } from '../../config/StatusConfig';
import { getPresetForPhenomenon } from '../../components/Sigmet/SigmetPresets';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import uuidv4 from 'uuid/v4';

const ERROR_MSG = {
  RETRIEVE_SIGMETS: 'Could not retrieve SIGMETs:',
  POST_SIGMET: 'Could not post SIGMET:',
  SELECT_SIGMET: 'The SIGMET to set the focus to, could not be found',
  RETRIEVE_PARAMS: 'Could not retrieve SIGMET parameters',
  RETRIEVE_PHENOMENA: 'Could not retrieve SIGMET phenomena',
  RETRIEVE_TACS: 'Could not retrieve SIGMET TAC:',
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
 * @param {string} sigmetA The first SIGMET to compare
 * @param {string} sigmetB The second SIGMET to compare
 * @returns {number} 0 when the periods of the two SIGMETs are equal,
 *                   a positive number when the end of sigmetA is after the end of sigmetB
 *                   a negative number when the end of sigmetA is before the end of sigmetB
 *                   a positive number when the ends are equal,  but the start of sigmetA is after the start of sigmetB
 *                   a negative number when the ends are equal,  but the start of sigmetA is before the start of sigmetB
 */
const byValidDate = (sigmetA, sigmetB) => {
  let result = 0;
  const { validdate: startA, validdate_end: endA } = sigmetA;
  const { validdate: startB, validdate_end: endB } = sigmetB;
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
  const isChangeToCategoryAddSigmet = ref !== state.focussedCategoryRef && ref === CATEGORY_REFS.ADD_SIGMET;
  const sigmetSelection = isChangeToCategoryAddSigmet
    ? [getEmptySigmet(container)]
    : [];
  return selectSigmet(sigmetSelection, container).then(() =>
    setStatePromise(container, {
      focussedCategoryRef: (ref === state.focussedCategoryRef)
        ? null
        : ref,
      selectedAuxiliaryInfo: {
        mode: isChangeToCategoryAddSigmet
          ? SIGMET_MODES.EDIT
          : SIGMET_MODES.READ
      }
    })
  );
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
  const endpoint = `${urls.BACKEND_SERVER_URL}/sigmets/getsigmetphenomena`;

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

/**
 * Expand all combinations of variants and additions (flatten the phenomenon)
 * @param {object} phenomenonData A data structure containing phenomenons, variants and additions
 * @returns {Array} An array of all variations for this phenomenon
 */
const expandPhenomenonCombinatorics = (phenomenonData) => {
  const SEPARATOR = '_';
  const { variants, phenomenon, additions } = phenomenonData;
  const combinatorics = [];

  // possible names:
  // phenName, phenName addName, varName lowerCase(phenName), varName lowerCase(phenName) addName
  const combineNames = (varName, phenName, addName) => {
    return `${varName ? `${varName} ` : ''}${varName ? phenName.toLowerCase() : phenName}${addName ? ` ${addName}` : ''}`;
  };

  // possible codes:
  // phenCode, phenCodeSEPARATORaddCode, varCodeSEPARATORphenCode, varCodeSEPARATORphenCodeaddCode
  const combineCodes = (varCode, phenCode, addCode) => {
    return `${varCode ? `${varCode}${SEPARATOR}` : ''}${phenCode}${addCode
      ? varCode
        ? addCode
        : `${SEPARATOR}${addCode}`
      : ''}`;
  };

  const insertCombination = (variant, phenomenon, addition) => {
    combinatorics.push({
      name: combineNames(variant && variant.name, phenomenon.name, addition && addition.name),
      code: combineCodes(variant && variant.code, phenomenon.code, addition && addition.code),
      layerpreset: phenomenon.layerpreset
    });
  };

  if (variants.length === 0) {
    variants.push(null);
  }

  variants.forEach((variant) => {
    additions.forEach((addition) => {
      insertCombination(variant, phenomenon, addition);
    });
    insertCombination(variant, phenomenon, null);
  });
  return combinatorics;
};

const updatePhenomena = (rawPhenomenaData, container) => {
  if (!Array.isArray(rawPhenomenaData)) {
    return Promise.resolve();
  }

  const processedPhenomena = [];
  rawPhenomenaData.forEach((rawPhenomenonData) => {
    processedPhenomena.push(...expandPhenomenonCombinatorics(rawPhenomenonData));
  });

  return setStatePromise(container, {
    phenomena: processedPhenomena
  });
};

/**
 * Temporary fallback, since TACs should be included in the SIGMET retrieval
 * @param {Element} container The container where the SIGMETs and there TACs will land
 * @param {string} uuid The id of the SIGMET to retrieve the TAC for
 * @returns {Promise} A promise which resolves when the data is loaded, and rejects otherwise
 */
const retrieveSigmetTac = (container, uuid) => {
  const { urls } = container.props;

  if (!uuid || typeof uuid !== 'string') {
    Promise.reject(new Error(`${ERROR_MSG.RETRIEVE_TACS} no uuid provided`));
  }

  return new Promise((resolve, reject) =>
    axios({
      method: 'get',
      url: `${urls.BACKEND_SERVER_URL}/sigmets/${uuid}`,
      withCredentials: true,
      responseType: 'text',
      headers: {
        'Accept': 'text/plain'
      }
    }).then(response => {
      if (response.status === 200 && response.data && typeof response.data === 'string') {
        resolve({ uuid, code: response.data });
      } else {
        console.warn(`${ERROR_MSG.RETRIEVE_TACS} for SIGMET ${uuid}`,
          `because ${response.status === 200 ? 'no response data could be retrieved' : `status was not OK [${response.status}]`}`);
        resolve({ uuid, code: null });
      }
    }, (error) => {
      console.error(`${error.message}`);
      resolve({ uuid, code: null });
    }).catch(error => {
      console.error(`${ERROR_MSG.RETRIEVE_TACS} for SIGMET ${uuid} because ${error.message}`);
      // resolve({ uuid, code: null });
      reject(error);
    })
  );
};

/**
 * Retrieve SIGMETs from the backend
 * @param {Element} container The container where the SIGMETs will land
 * @param {object} retrievableCategory The category metadata used to retrieve the SIGMETs
 * @returns {Promise} A promise which resolves when the data is properly load, and rejects otherwise
 */
const retrieveCategorizedSigmets = (container, retrievableCategory) => {
  const { urls } = container.props;
  const endpoint = `${urls.BACKEND_SERVER_URL}/sigmets`;
  return new Promise((resolve, reject) =>
    axios({
      method: 'get',
      url: `${endpoint}${retrievableCategory.urlSuffix}`,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      if (response.status === 200 && response.data) {
        const incomingSigmets = [];
        if (response.data.nsigmets !== 0 && response.data.sigmets &&
          Array.isArray(response.data.sigmets) && response.data.sigmets.length > 0) {
          incomingSigmets.push(...response.data.sigmets);
        }
        incomingSigmets.sort(byValidDate);
        // temporary functionality to add TAC to SIGMET
        const augmentedSigmets = incomingSigmets.map((incomingSigmet) =>
          retrieveSigmetTac(container, incomingSigmet.uuid).then(tacResult => {
            incomingSigmet.tac = tacResult.code;
            return Promise.resolve(incomingSigmet);
          })
        );
        Promise.all(augmentedSigmets).then((sigmets) =>
          resolve({ ref: retrievableCategory.ref, sigmets })
        );
        // FIXME: replace code below previous comment with the next line
        // resolve({ ref: retrievableCategory.ref, sigmets: incomingSigmets });
      } else {
        reject(new Error(`${ERROR_MSG.RETRIEVE_SIGMETS} for ${retrievableCategory.ref} `,
          `because ${response.status === 200 ? 'no response data could be retrieved' : `status was not OK [${response.status}]`}`));
      }
    }, (error) => {
      console.error(`${error.message}`);
      reject(error);
    }).catch(error => {
      console.error(`${ERROR_MSG.RETRIEVE_SIGMETS} for ${retrievableCategory.ref} because ${error.message}`);
      reject(error);
    })
  );
};

/**
 * Refresh (replace) the category data in the state
 * @param {Element} container The container which holds the category
 * @param {Object} categorizedSigmets The new SIGMETs and category metadata
 * @returns {Promise} A promise which resolves when the category data is refreshed, and rejects otherwise
 */
const refreshCategoryState = (container, categorizedSigmets) => {
  const { ref: categoryRef, sigmets } = categorizedSigmets;
  const { categories, focussedCategoryRef, selectedSigmet, selectedAuxiliaryInfo } = container.state;

  const categoryIndex = categories.findIndex((category) => category.ref === categoryRef);
  if (isNaN(categoryIndex) || categoryIndex === -1) {
    return Promise.reject(new Error(`${ERROR_MSG.FIND_CATEGORY}`));
  }

  if (categoryRef === focussedCategoryRef) {
    const selectedId = selectedSigmet.length > 0 ? selectedSigmet[0].uuid : null;
    if (selectedId !== null) {
      const incomingSelected = sigmets.filter((possibleSelected) =>
        possibleSelected.uuid === selectedId);
      if (incomingSelected.length === 0) {
        // no longer in this category
        showFeedback(container,
          'Selected Sigmet no longer exists in category',
          `The status has changed, so this Sigmet doesn't exist anymore in the ${categories[categoryIndex].title}`,
          FEEDBACK_STATUS.WARN
        );
      } else {
        const baseSelected = categories[categoryIndex].sigmets.filter((possibleSelected) =>
          possibleSelected.uuid === selectedId);
        if (baseSelected.length === 1 && !isEqual(baseSelected[0], incomingSelected[0]) &&
          selectedAuxiliaryInfo.hasEdits) {
          // base SIGMET changed locally and remotely
          showFeedback(container,
            'Selected Sigmet has been changed remotely',
            'Reselect the Sigmet to update, or click [Save] to override',
            FEEDBACK_STATUS.WARN
          );
        }
      }
    }
  }

  const emptyCategories = [...Array(categoryIndex).fill({}), { sigmets: [] }];
  const newCategories = [...Array(categoryIndex).fill({}), { sigmets }];
  return setStatePromise(container, { categories: emptyCategories })
    .then(() => setStatePromise(container, { categories: newCategories }));
};

/**
 * Synchronize the SIGMET data in the state with data from the backend
 * @param {Element} container The container where the SIGMETs will land in
 * @returns {Promise} Resolves when done, rejects when errors occur
 */
const synchronizeSigmets = (container) => {
  const retrievableCategories = [
    { ref: CATEGORY_REFS.ACTIVE_SIGMETS, urlSuffix: '?active=true' },
    { ref: CATEGORY_REFS.CONCEPT_SIGMETS, urlSuffix: `?active=false&status=${STATUSES.CONCEPT}` },
    { ref: CATEGORY_REFS.ARCHIVED_SIGMETS, urlSuffix: `?active=false&status=${STATUSES.CANCELED}` }
  ];

  // collect SIGMETs from the backend and refresh the state
  const refreshedSigmetCategories = retrievableCategories.map(category =>
    retrieveCategorizedSigmets(container, category).then(categorizedSigmets => refreshCategoryState(container, categorizedSigmets))
  );

  return Promise.all(refreshedSigmetCategories);
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
      SIGMET_TEMPLATES.CONTAINER,
      container.state
    ),
    () => { resolve(); });
  });
};

/**
 * Select a Sigmet in a asynchronous way
 * @param {array} selection The list of SIGMET(s) to be selected
 * @param {Element} container The container to select the SIGMET(s) in
 */
const selectSigmet = (selection, container) => {
  const { state, props } = container;
  const { selectedSigmet } = state;
  const { sources } = props;
  if (!Array.isArray(selection)) {
    return Promise.reject(new Error(`To enable selecting SIGMETs, the selection must be provided as an array`));
  }
  const hasPreviousSelection = Array.isArray(selectedSigmet) && selectedSigmet.length > 0;

  // handle combinatorics n(previousSelection) x m(selection)
  if (selection.length === 0 && !hasPreviousSelection) {
    // nothing to do
    return Promise.resolve();
  }

  if (selection.length === 0) {
    // clear all
    setPanelFeedback(null, container);
    return setStatePromise(container, {
      selectedSigmet: [],
      selectedAuxiliaryInfo: {
        mode: SIGMET_MODES.READ,
        drawModeStart: null,
        drawModeEnd: null,
        feedbackStart: null,
        feedbackEnd: null,
        hasEdits: false
      }
    }).then(() => setSigmetDrawing(initialGeoJson(), null, container))
      .then(() => getPresetForPhenomenon(null, sources))
      .then((preset) => updateDisplayedPreset(preset, container));
  }

  const geojson = selection[0].geojson || null;
  const firName = selection[0].firname || null;
  const startFeature = geojson && Array.isArray(geojson.features)
    ? geojson.features.find((feature) => feature.properties.featureFunction === 'start')
    : null;
  const endFeature = geojson && Array.isArray(geojson.features)
    ? geojson.features.find((feature) => feature.properties.featureFunction === 'end')
    : null;
  const drawModeStart = startFeature
    ? MODES_GEO_MAPPING[startFeature.properties.selectionType] || null
    : null;
  const drawModeEnd = endFeature
    ? MODES_GEO_MAPPING[endFeature.properties.selectionType] || null
    : null;

  // irrespective of the previous selection:
  // set the new selection, auxiliary info and
  // * draw SIGMET features,
  // * retrieve SIGMET preset and
  // * update display preset
  setPanelFeedback(null, container);
  return setStatePromise(container, {
    selectedSigmet: selection,
    selectedAuxiliaryInfo: {
      mode: SIGMET_MODES.READ,
      drawModeStart: drawModeStart || null,
      drawModeEnd: drawModeEnd || null,
      feedbackStart: null,
      feedbackEnd: null,
      hasEdits: false
    }
  }).then(() => setSigmetDrawing(geojson, firName, container))
    .then(() => getPresetForPhenomenon(null, sources))
    .then((preset) => updateDisplayedPreset(preset, container));
};

const focusSigmet = (uuid, container) => {
  const { dispatch, mapActions } = container.props;
  const { state } = container;
  const selection = [];
  const indices = findCategoryAndSigmetIndex(uuid, state);
  let categoryRef = null;

  if (uuid == null) {
    categoryRef = state.focussedCategoryRef;
  } else if (indices.isFound) {
    const category = state.categories[indices.categoryIndex];
    const sigmet = category.sigmets[indices.sigmetIndex];
    if (sigmet) {
      categoryRef = category.ref;
      selection.push(sigmet);
    } else {
      return Promise.reject(new Error(`${ERROR_MSG.SELECT_SIGMET}`));
    }
  } else {
    return Promise.reject(new Error(`${ERROR_MSG.SELECT_SIGMET}`));
  }
  const categoryTogglePromise = categoryRef !== state.focussedCategoryRef
    ? toggleCategory(categoryRef, container)
    : Promise.resolve();

  return categoryTogglePromise
    .then(() => selectSigmet(selection, container))
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
    axios.get(`${BACKEND_SERVER_URL}/sigmets/getfir`, {
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
  const endId = uuidv4();
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
        id: endId,
        properties: {
          featureFunction: 'end',
          relatesTo: startId,
          selectionType: null,
          'fill-opacity': 0.2,
          fill: '#f00',
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
      },
      {
        id: uuidv4(),
        properties: {
          featureFunction: 'intersection',
          relatesTo: endId,
          selectionType: null,
          'fill-opacity': 0.33,
          fill: '#a22',
          'stroke-width': 2
        },
        geometry: {
          type: null,
          coordinates: []
        }
      }
    ]
  };
  return safeMerge(newProps, SIGMET_TEMPLATES.GEOJSON);
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
  }, SIGMET_TEMPLATES.GEOJSON, geojson);
};

const getEmptySigmet = (container) => {
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
    movement_type: MOVEMENT_TYPES.STATIONARY,
    location_indicator_mwo: parameters.location_indicator_wmo,
    validdate: getRoundedNow().format(),
    validdate_end: defaultFirData ? getRoundedNow().add(defaultFirData.maxhoursofvalidity, 'hour').format() : null,
    location_indicator_icao: defaultFirData ? defaultFirData.location_indicator_icao : null,
    firname: defaultFirData ? defaultFirData.firname : null,
    geojson: initialGeoJson()
  };
  return safeMerge(newProps, SIGMET_TEMPLATES.SIGMET);
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

const updateSigmet = (dataField, value, container) => {
  const { props } = container;
  const { drawProperties, dispatch, drawActions, sources } = props;
  const { selectedSigmet, parameters } = container.state;

  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet) {
    return Promise.reject(new Error(`To enable updating a SIGMET, there must be a SIGMET selected (selectedSigmet must be a non-empty array)`));
  }

  const shouldCleanEndFeature = dataField === 'movement_type' && value !== MOVEMENT_TYPES.FORECAST_POSITION;
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
      const isVolcanicAsh = value === PHENOMENON_CODE_VOLCANIC_ASH;
      const prefix = isVolcanicAsh
        ? SIGMET_VARIANTS_PREFIXES.VOLCANIC_ASH
        : SIGMET_VARIANTS_PREFIXES.NORMAL;
      const activeFirEntry = Object.entries(parameters.firareas).filter((entry) => entry[1].firname === affectedSigmet.firname &&
        entry[1].location_indicator_icao === affectedSigmet.location_indicator_icao);
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
  if (dataField.indexOf('volcano.name') !== -1) {
    value = typeof value === 'string'
      ? value.toUpperCase()
      : null;
  }
  if (dataField.indexOf('volcano.position') !== -1) {
    value = (value !== null && !isNaN(value))
      ? parseFloat(value)
      : null;
  }
  if (dataField.indexOf('levelinfo') !== -1) {
    switch (fieldToUpdate) {
      case 'unit':
        value = UNITS_ALT.includes(value)
          ? value.unit
          : UNITS.FL.unit;
        break;
      case 'value':
        value = value !== null && !isNaN(value) && value !== 0 && value !== '0' ? parseInt(value) : null;
        break;
      case 'mode':
        const betweenModes = [MODES_LVL.BETW, MODES_LVL.BETW_SFC];
        const isCurrentModeABetween = betweenModes.includes(affectedSigmet.levelinfo.mode);
        const isNextModeABetween = betweenModes.includes(value);
        if ((isCurrentModeABetween && !isNextModeABetween) || (!isCurrentModeABetween && isNextModeABetween)) {
          shouldCleanLevels = true;
        }
        break;
    }
  }

  const toStructure = (key, value) =>
    !isNaN(key)
      ? [...Array(parseInt(key)).fill({}), value]
      : { [key]: value };
  const selectedSigmetUpdate = dataFieldParts.reduceRight(
    (traverser, propertyKey) => toStructure(propertyKey, traverser),
    toStructure(fieldToUpdate, value)
  );

  if (shouldCleanMovement) {
    selectedSigmetUpdate.movement = produce(SIGMET_TEMPLATES.MOVEMENT, () => { });
  }
  if (shouldUpdateMaxHoursDuration(maxHoursDuration)) {
    selectedSigmetUpdate.validdate = getRoundedNow().format();
    selectedSigmetUpdate.validdate_end = getRoundedNow().add(maxHoursDuration, 'hour').format();
  }
  if (shouldCleanLevels) {
    selectedSigmetUpdate.levelinfo.levels = [
      { value: null, unit: UNITS.FL },
      { value: null, unit: UNITS.FL }
    ];
  }
  return setStatePromise(container, {
    selectedSigmet: [
      selectedSigmetUpdate
    ],
    selectedAuxiliaryInfo: {
      hasEdits: true
    }
  }).then(() => shouldUpdatePreset(preset)
    ? updateDisplayedPreset(preset, container)
    : Promise.resolve()
  ).then(() => {
    if (shouldCleanEndFeature === true) {
      const features = cloneDeep(drawProperties.adagucMapDraw.geojson.features);
      const endFeature = features.find((potentialEndFeature) => potentialEndFeature.properties.featureFunction === 'end');
      if (endFeature && endFeature.id) {
        dispatch(drawActions.setFeature({
          geometry: { coordinates: [], type: null },
          properties: { selectionType: null },
          featureId: endFeature.id
        }));
        clearRelatedIntersection(endFeature.id, features, dispatch, drawActions);
      }
    }
    return Promise.resolve();
  }).then(() => {
    if (container.state.selectedSigmet.length > 0) {
      return verifySigmet(container.state.selectedSigmet[0], container);
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

const drawSigmet = (event, uuid, container, action, featureFunction) => {
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
  const { selectedSigmet, categories, focussedCategoryRef } = container.state;
  const activeCategory = categories.find((category) => category.ref === focussedCategoryRef);
  if (!activeCategory) {
    return Promise.reject(new Error('No selected category found to create an intersection in'));
  }
  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet) {
    return Promise.reject(new Error('No selected SIGMET found to create an intersection in'));
  }
  const featureToIntersect = geojson.features.find((feature) =>
    feature.id === featureId);
  const intersectionData = createIntersectionData(featureToIntersect, affectedSigmet.firname, container);
  const intersectionFeature = geojson.features.find((iSFeature) => {
    return iSFeature.properties.relatesTo === featureId && iSFeature.properties.featureFunction === 'intersection';
  });
  if (intersectionData && intersectionFeature) {
    return axios({
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

const clearSigmet = (event, uuid, container) => {
  selectSigmet([getEmptySigmet(container)], container).then(() =>
    setStatePromise(container, {
      selectedAuxiliaryInfo: {
        mode: SIGMET_MODES.EDIT
      }
    })).then(() =>
    showFeedback(container, 'Sigmet cleared',
      'The input on this Sigmet has been cleared successfully', FEEDBACK_STATUS.OK)
  );
};

const discardSigmet = (event, uuid, container) => {
  focusSigmet(null, container)
    .then(() => synchronizeSigmets(container))
    .then(() => focusSigmet(uuid, container))
    .then(() => setStatePromise(container, {
      displayModal: null,
      selectedAuxiliaryInfo: {
        mode: SIGMET_MODES.EDIT
      }
    }))
    .then(() => showFeedback(container, 'Changes discarded', 'The changes are successfully discarded', FEEDBACK_STATUS.OK));
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
    draftState.tac = null;
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

const postSigmet = (container) => {
  const { urls, drawProperties } = container.props;
  const { selectedSigmet } = container.state;

  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet) {
    return;
  }
  const cleanedFeatures = cleanFeatures(drawProperties.adagucMapDraw.geojson.features);
  const complementedSigmet = sanitizeSigmet(affectedSigmet, cleanedFeatures);

  return new Promise((resolve, reject) =>
    axios({
      method: 'post',
      url: `${urls.BACKEND_SERVER_URL}/sigmets`,
      withCredentials: true,
      responseType: 'json',
      data: complementedSigmet
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
        reject(new Error(`${ERROR_MSG.POST_SIGMET} ${complementedSigmet.uuid}`,
          `because ${response.status === 200 ? 'no response data could be retrieved' : `status was not OK [${response.status}]`}`));
      }
    }, (error) => {
      console.error(`${error.message}`);
      reject(error);
    }).catch(error => {
      console.error(`${ERROR_MSG.POST_SIGMET} ${complementedSigmet.uuid} because ${error.message}`);
      reject(error);
    })
  );
};

const saveSigmet = (event, container) => {
  postSigmet(container).then((uuid) => {
    showFeedback(container, 'Sigmet saved', `Sigmet ${uuid} was successfully saved`, FEEDBACK_STATUS.OK);
    focusSigmet(null, container)
      .then(() => synchronizeSigmets(container))
      .then(() => focusSigmet(uuid, container));
  }, (error) => {
    const errMsg = `Could not save Sigmet: ${error.message}`;
    console.error(errMsg);
    showFeedback(container, 'Error', errMsg, FEEDBACK_STATUS.ERROR);
  });
};

/**
 * Switch SIGMET mode to edit
 * @param {Event} event The event which triggered the switch
 * @param {Element} container The container on which the switch was triggered
 */
const editSigmet = (event, container) => {
  const { dispatch, mapActions } = container.props;
  return setStatePromise(container, {
    selectedAuxiliaryInfo: {
      mode: SIGMET_MODES.EDIT,
      hasEdits: false
    }
  }).then(() => dispatch(mapActions.setMapMode('pan')));
};

/**
* Deleting Sigmet from backend
* @param {object} event The event that triggered deleting
* @param {Element} container The container in which the delete action was triggered
*/
const deleteSigmet = (event, container) => {
  const { state, props } = container;
  const { BACKEND_SERVER_URL } = props.urls;
  const { selectedSigmet } = state;
  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet || !affectedSigmet.uuid || !BACKEND_SERVER_URL || affectedSigmet.status !== STATUSES.CONCEPT) {
    return;
  }
  axios({
    method: 'delete',
    url: `${BACKEND_SERVER_URL}/sigmets/${affectedSigmet.uuid}`,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    showFeedback(container, 'Sigmet deleted', `Sigmet ${affectedSigmet.uuid} was successfully deleted`, FEEDBACK_STATUS.OK);
    setStatePromise(container, { displayModal: null })
      .then(() => focusSigmet(null, container))
      .then(() => synchronizeSigmets(container));
  }).catch(error => {
    console.error('Couldn\'t delete Sigmet', error);
    showFeedback(container, 'Error', `An error occurred while deleting the Sigmet: ${error.response.data.error}`, FEEDBACK_STATUS.ERROR);
  });
};

/**
 * Copy Sigmet information
 * @param {object} event The event that triggered copying
 * @param {string} uuid The identifier for the Sigmet to copy
 * @param {Element} container The container in which the copy action was triggered
 */
const copySigmet = (event, container) => {
  const { state } = container;
  const { selectedSigmet } = state;
  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet || !affectedSigmet.uuid) {
    showFeedback(container, 'Sigmet could not be copied',
      `There is no SIGMET selected, therefore there is nothing to be copied`, FEEDBACK_STATUS.ERROR);
    return;
  }

  setStatePromise(container, {
    copiedSigmetRef: affectedSigmet.uuid
  }).then(() => {
    showFeedback(container, 'Sigmet copied',
      `The properties of SIGMET ${affectedSigmet.uuid} have been copied successfully`, FEEDBACK_STATUS.OK);
  });
};

/**
 * Paste Sigmet information
 * @param {object} event The event that triggered pasting
 * @param {Element} container The container in which the paste action was triggered
 */
const pasteSigmet = (event, container) => {
  const { state } = container;
  const { selectedSigmet, categories, focussedCategoryRef } = state;
  const indicesCopiedSigmet = findCategoryAndSigmetIndex(state.copiedSigmetRef, state);
  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet || !indicesCopiedSigmet.isFound) {
    return;
  }
  const copiedSigmet = categories[indicesCopiedSigmet.categoryIndex].sigmets[indicesCopiedSigmet.sigmetIndex];
  if (!copiedSigmet && focussedCategoryRef !== CATEGORY_REFS.ADD_SIGMET) {
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
    'va_extra_fields',
    'type'
  ];
  const newPartialState = {};
  propertiesToCopy.forEach((property) => {
    if (copiedSigmet.hasOwnProperty(property) && copiedSigmet[property] !== null && typeof copiedSigmet[property] !== 'undefined') {
      newPartialState[property] = copiedSigmet[property];
    }
  });
  setStatePromise(container, {
    selectedSigmet: [newPartialState],
    copiedSigmetRef: null
  }).then(() => {
    return setSigmetDrawing(copiedSigmet.geojson, copiedSigmet.firname, container);
  }).then(() => {
    showFeedback(container, 'Sigmet pasted',
      'The copied properties have been pasted successfully into the current Sigmet', FEEDBACK_STATUS.OK);
  });
};

const publishSigmet = (event, uuid, container) => {
  const { selectedSigmet } = container.state;
  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet) {
    return;
  }
  setStatePromise(container, {
    selectedSigmet: [{ status: STATUSES.PUBLISHED }]
  }).then(() => postSigmet(container))
    .then((uuid) => {
      showFeedback(container, 'Sigmet published', `Sigmet ${uuid} was successfully published`, FEEDBACK_STATUS.OK);
      return focusSigmet(null, container)
        .then(() => synchronizeSigmets(container))
        .then(() => focusSigmet(affectedSigmet.uuid, container));
    }, (error) => {
      const errMsg = `Could not publish Sigmet: ${error.message}`;
      console.error(errMsg);
      showFeedback(container, 'Error', errMsg, FEEDBACK_STATUS.ERROR);
      return Promise.reject(new Error(errMsg));
    });
};

const cancelSigmet = (event, container) => {
  const { selectedSigmet } = container.state;
  const affectedSigmet = Array.isArray(selectedSigmet) && selectedSigmet.length === 1
    ? selectedSigmet[0]
    : null;
  if (!affectedSigmet) {
    return;
  }
  setStatePromise(container, {
    selectedSigmet: [ { status: STATUSES.CANCELED } ]
  }).then(() => postSigmet(container))
    .then((uuid) => {
      showFeedback(container, 'Sigmet canceled', `Sigmet ${uuid} was successfully canceled`, FEEDBACK_STATUS.OK);
      return synchronizeSigmets(container);
    }, (error) => {
      const errMsg = `Could not cancel Sigmet: ${error.message}`;
      console.error(errMsg);
      showFeedback(container, 'Error', errMsg, FEEDBACK_STATUS.ERROR);
      return Promise.reject(new Error(errMsg));
    }).then(() => {
      const { state } = container;
      const { categories } = state;
      const indices = findCategoryAndSigmetIndex(affectedSigmet.uuid, state);
      const publishedCategory = categories.find((category) => category.ref === CATEGORY_REFS.ACTIVE_SIGMETS);
      if (indices.isFound && publishedCategory) {
        const canceledSigmet = categories[indices.categoryIndex].sigmets[indices.sigmetIndex];
        const cancelSigmet = publishedCategory.sigmets.find((sigmet) => sigmet.cancels === canceledSigmet.sequence &&
        sigmet.phenomenon === canceledSigmet.phenomenon);
        if (cancelSigmet) {
          focusSigmet(cancelSigmet.uuid, container);
        }
      }
    });
};

const setSigmetDrawing = (geojson, firName, container) => {
  const { dispatch, drawActions } = container.props;
  const enhancedGeojson = addFirFeature(geojson, firName || null, container);
  dispatch(drawActions.setGeoJSON(enhancedGeojson || geojson));
  return Promise.resolve();
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
  const setTacRepresentation = (representation) =>
    setStatePromise(container, {
      selectedSigmet: [{ tac: representation }]
    });
  setTacRepresentation('... retrieving TAC ...').then(() =>
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
            setTacRepresentation(responseJson.TAC);
          } else {
            setTacRepresentation('No TAC received from server');
          }
        } else {
          console.error('sigmet/verify has no response.data');
        }
      }
    ).catch(error => {
      console.error('sigmet/verify', error);
      setTacRepresentation('Unable to generate TAC');
    })
  );
};

/**
 * Toggles SIGMET modals on and off
 * @param {Event} event The event which triggered the toggling
 * @param {string} type The modal type to toggle
 * @param {component} container The container in which the SIGMET modal should be toggled
 */
const toggleSigmetModal = (event, type, container) => {
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
 * @param {component} container The container in which the SIGMET modal should be toggled
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
 * SigmetsContainer has its own state, this is the dispatch for updating the state
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
    case LOCAL_ACTION_TYPES.RETRIEVE_SIGMETS:
      return synchronizeSigmets(container);
    case LOCAL_ACTION_TYPES.FOCUS_SIGMET:
      if (localAction.event && localAction.event.target && ['BUTTON', 'INPUT'].includes(localAction.event.target.tagName)) {
        return;
      }
      focusSigmet(localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.ADD_SIGMET:
      console.error('ADD_SIGMET is deprecated');
      break;
    case LOCAL_ACTION_TYPES.UPDATE_SIGMET:
      return updateSigmet(localAction.dataField, localAction.value, container);
    case LOCAL_ACTION_TYPES.UPDATE_SIGMET_LEVEL:
      console.error('UPDATE_SIGMET_LEVEL is deprecated');
      break;
    case LOCAL_ACTION_TYPES.CLEAR_SIGMET:
      clearSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DISCARD_SIGMET:
      discardSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.SAVE_SIGMET:
      saveSigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.EDIT_SIGMET:
      editSigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_HAS_EDITS:
      return toggleHasEdits(localAction.event, localAction.value, container);
    case LOCAL_ACTION_TYPES.DELETE_SIGMET:
      deleteSigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.COPY_SIGMET:
      copySigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PASTE_SIGMET:
      pasteSigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PUBLISH_SIGMET:
      publishSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.CANCEL_SIGMET:
      cancelSigmet(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.DRAW_SIGMET:
      drawSigmet(localAction.event, localAction.uuid, container, localAction.action, localAction.featureFunction);
      break;
    case LOCAL_ACTION_TYPES.CREATE_FIR_INTERSECTION:
      return createFirIntersection(localAction.featureId, localAction.geoJson, container);
    case LOCAL_ACTION_TYPES.UPDATE_FIR:
      updateFir(localAction.firName, container);
      break;
    case LOCAL_ACTION_TYPES.VERIFY_SIGMET:
      verifySigmet(localAction.sigmetObject, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_SIGMET_MODAL:
      toggleSigmetModal(localAction.event, localAction.modalType, container);
      break;
    case LOCAL_ACTION_TYPES.CLEANUP:
      cleanup(container);
  }
};
