import produce from 'immer';
import axios from 'axios';
import moment from 'moment';
import { arrayMove } from 'react-sortable-hoc';
import setNestedProperty from 'lodash.set';
import getNestedProperty from 'lodash.get';
import { safeMerge, removeNestedProperty, getJsonPointers, clearEmptyPointersAndAncestors } from '../../utils/json';
import { notify } from 'reapop';
import cloneDeep from 'lodash.clonedeep';
import { ReadLocations } from '../../utils/admin';
import { LOCAL_ACTION_TYPES, STATUSES, LIFECYCLE_STAGE_NAMES, MODES, FEEDBACK_CATEGORIES, FEEDBACK_STATUSES } from './TafActions';
import { TAF_TEMPLATES, TIMELABEL_FORMAT, DATELABEL_FORMAT, TIMESTAMP_FORMAT } from '../../components/Taf/TafTemplates';
import TafValidator from '../../components/Taf/TafValidator';

const STATUS_ICONS = {
  NEW: 'star-o',
  CONCEPT: 'folder-open-o',
  PUBLISHED: 'folder-open'
};

/**
 * Creates all posible combinations of locations and timestamps, with a label
 * @param {set} locations The locations to combine
 * @param {object} timestamps The timestamps to combine
 * @returns {array} The labeled combinations
 */
const createSpaceTimeCombinations = (locations, timestamps) => {
  const hasTimestamps = timestamps &&
    timestamps.hasOwnProperty('current') && timestamps.current instanceof moment &&
    timestamps.hasOwnProperty('next') && timestamps.next instanceof moment;
  const hasLocations = locations && Array.isArray(locations) && locations.length > 0;
  if (!hasTimestamps || !hasLocations) {
    return null;
  }
  let combinations = [];
  locations.forEach((location) => {
    if (typeof location !== 'string') {
      return;
    }
    combinations.push({
      location: location,
      timestamp: timestamps.current
    }, {
      location: location,
      timestamp: timestamps.next
    });
  });
  return combinations;
};

/**
 * Determines whether or not a provided TAF has all the info to be compared to other tafs
 * @param {object} taf The selectable TAF to check
 */
const hasSelectableTafEssentialCompareInfo = (taf) =>
  taf && (taf.timestamp && taf.location && moment.isMoment(taf.timestamp) && typeof taf.location === 'string');

/**
 * Comparator for selectable TAFs
 * @param {object} tafA The first TAF to compare
 * @param {object} tafB The second TAF to compare
 * @returns {boolean} Results in true when the TAFs are equal, false otherwise
 */
const isSameSelectableTaf = (tafA, tafB) => {
  const hasTafBEssentials = hasSelectableTafEssentialCompareInfo(tafB);
  if (!hasSelectableTafEssentialCompareInfo(tafA)) {
    return !hasTafBEssentials;
  }
  if (!hasTafBEssentials) {
    return false;
  }
  if (tafA.hasOwnProperty('uuid') && tafB.hasOwnProperty('uuid') && tafA.uuid && tafB.uuid) {
    return tafA.uuid === tafB.uuid;
  }

  if (tafA.timestamp.isSame(tafB.timestamp) && tafA.location.toUpperCase() === tafB.location.toUpperCase()) {
    if (tafA.tafData.metadata.type && tafB.tafData.metadata.type) {
      return tafA.tafData.metadata.type === tafB.tafData.metadata.type;
    } else {
      return true;
    }
  }
};

/**
 * Create a function that determines the selectability of TAFs
 * @param {array} locations The locations that should be selectable
 * @param {object} timestamps The timestamps that should be selectable
 * @returns {func} A function which determines whether or not a TAF should be listed as selectable
 */
const isTafSelectable = (locations, timestamps) => (taf) => {
  if (!taf || !taf.metadata || typeof taf.metadata.validityStart !== 'string' ||
    typeof taf.metadata.location !== 'string' || typeof taf.metadata.type !== 'string') {
    return false;
  }
  return true;
  /* MaartenPlieger, 12-09-2018, why should we do this ? Let the backend handle this logic? */
  // const validityStart = moment.utc(taf.metadata.validityStart);
  // return locations.includes(taf.metadata.location.toUpperCase()) &&
  //   (timestamps.current.isSame(validityStart) || timestamps.next.isSame(validityStart) ||
  //   ((taf.metadata.type === LIFECYCLE_STAGE_NAMES.AMENDMENT || taf.metadata.type === LIFECYCLE_STAGE_NAMES.CANCELED) &&
  //     timestamps.current.isSameOrBefore(validityStart)));
};

/**
 * Determines if the available timestamps and locations don't match the selectable TAFs for a TAF-container
 * @param {Element} container The container to determine synchronisation necessity for
 * @returns {boolean} True when the available Tafs are out of sync with timestamps / locations
 */
const shouldSync = (container) => {
  const { locations, timestamps, selectableTafs } = container.state;
  const hasTimestamps = timestamps &&
    timestamps.hasOwnProperty('current') && timestamps.current instanceof moment &&
    timestamps.hasOwnProperty('next') && timestamps.next instanceof moment;
  const hasLocations = locations && Array.isArray(locations) && locations.length > 0;
  const hasSelectableTafs = selectableTafs && Array.isArray(selectableTafs) && selectableTafs.length > 0;
  if (!hasTimestamps || !hasLocations) {
    return false;
  }
  if (!hasSelectableTafs) {
    return true;
  }

  const spacetimeCombinations = createSpaceTimeCombinations(locations, timestamps);
  if (!spacetimeCombinations || !Array.isArray(spacetimeCombinations) || spacetimeCombinations.length === 0) {
    return false;
  }

  if (spacetimeCombinations.length !== selectableTafs.length) {
    return true;
  }

  const noExtraSelectables = selectableTafs.every((selectable) =>
    spacetimeCombinations.some((combination) => combination.location === selectable.location &&
      combination.timestamp.isSame(selectable.timestamp))
  );

  return !noExtraSelectables;
};

/**
 * Load the existing TAFs
 * @param {Element} container The container to load the TAFs for
 */
const synchronizeSelectableTafs = (container) => {
  const { urls } = container.props;
  if (!urls || !urls.hasOwnProperty('BACKEND_SERVER_URL') || typeof urls.BACKEND_SERVER_URL !== 'string') {
    return;
  }

  const tafResources = [
    { url: `${urls.BACKEND_SERVER_URL}/tafs?active=true`, status: STATUSES.PUBLISHED },
    { url: `${urls.BACKEND_SERVER_URL}/tafs?active=false&status=${STATUSES.CONCEPT}`, status: STATUSES.CONCEPT }
  ];
  tafResources.forEach((tafResource) => {
    axios({
      method: 'get',
      url: tafResource.url,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      if (response.data && Number.isInteger(response.data.ntafs)) {
        if (!Array.isArray(response.data.tafs)) {
          response.data.tafs = [];
        }
        updateSelectableTafs(container, response.data.tafs, tafResource.status);
      }
    }).catch(error => {
      console.error('Couldn\'t retrieve TAFs', error);
    });
  });
};

/**
 * Update the list of locations for which a TAF can be issued
 * @param {Element} container The container to update the locations for
 */
const updateLocations = (container) => {
  const { urls } = container.props;
  if (!urls || !urls.hasOwnProperty('BACKEND_SERVER_URL') || typeof urls.BACKEND_SERVER_URL !== 'string') {
    return;
  }
  ReadLocations(`${urls.BACKEND_SERVER_URL}/admin/read`, (tafLocationsData) => {
    if (tafLocationsData && Array.isArray(tafLocationsData)) {
      const locationNames = [];
      tafLocationsData.forEach((location) => {
        if (location.hasOwnProperty('name') && typeof location.name === 'string' &&
          location.hasOwnProperty('availability') && Array.isArray(location.availability) && location.availability.includes('taf') &&
          !locationNames.includes(location.name)) {
          locationNames.push(location.name);
        }
      });
      container.setState(produce(container.state, draftState => {
        draftState.locations.length = 0;
        draftState.locations.push(...locationNames);
      }), () => {
        if (shouldSync(container)) {
          synchronizeSelectableTafs(container);
        }
      });
    } else {
      console.error('Couldn\'t retrieve TAF locations');
    }
  }, (error) => console.error('Couldn\'t retrieve TAF locations -', error));
};

/**
 * Update the timestamps for which a TAF can be issued
 * @param {Element} container The container to update the timestamps for
 */
const updateTimestamps = (container) => {
  const { state } = container;
  const now = moment.utc();
  let TAFStartHour = now.hour();
  TAFStartHour = TAFStartHour - TAFStartHour % 6;
  const currentTafTimestamp = now.clone().hour(TAFStartHour).startOf('hour');
  container.setState(produce(state, draftState => {
    draftState.timestamps.current = currentTafTimestamp;
    draftState.timestamps.next = currentTafTimestamp.clone().add(6, 'hour');
    draftState.timestamps.modified = now;
  }), () => {
    if (shouldSync(container)) {
      synchronizeSelectableTafs(container);
    }
  });
};

/**
 * Update the feedback
 * @param {string} title The title for the feedback
 * @param {string} status The status for the feedback
 * @param {string} category The category for the feedback
 * @param {string} subTitle The subtitle for the feedback
 * @param {array} list The list of messages
 * @param {Element} container The container to update the feedback for
 * @param {func} callback The function to call after updating the state
 */
const updateFeedback = (title, status, category, subTitle, list, container, callback = () => {}) => {
  const { state } = container;
  if (!Object.values(FEEDBACK_CATEGORIES).includes(category)) {
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.feedback[category] = {
      title: title,
      status: status,
      subTitle: subTitle,
      list: list
    };
  }), () => callback(container));
  if (category === FEEDBACK_CATEGORIES.LIFECYCLE) {
    setTimeout(() => container.setState(produce(container.state, draftState => {
      draftState.feedback[category] = null;
    })), 5000);
  }
};

/**
 * Creates a selectable TAF object out of a regular TAF object
 * @param {object} tafData The TAF object to wrap
 * @returns A selectable TAF corresponding to the incoming TAF
 */
const wrapIntoSelectableTaf = (tafData) => {
  let iconName = STATUS_ICONS.CONCEPT;
  if (tafData.metadata.status && typeof tafData.metadata.status === 'string') {
    const tafStatus = tafData.metadata.status.toLowerCase();
    switch (tafStatus) {
      case STATUSES.PUBLISHED:
        iconName = STATUS_ICONS.PUBLISHED;
        break;
      case STATUSES.CONCEPT:
        break;
      default:
        break;
    }
  }
  const location = tafData.metadata.location.toUpperCase();
  const timestamp = moment.utc(tafData.metadata.validityStart);
  const time = timestamp.format(TIMELABEL_FORMAT);
  const date = timestamp.format(DATELABEL_FORMAT);

  const newProperties = {
    location: location,
    uuid: tafData.metadata.uuid,
    timestamp: timestamp,
    label: {
      time: time,
      date: date,
      text: `${location} ${time} ${date}`,
      status: `${tafData.metadata.status} / ${tafData.metadata.type}`,
      icon: iconName
    },
    tafData
  };
  return safeMerge(newProperties, TAF_TEMPLATES.SELECTABLE_TAF);
};

/** Validate taf
 * @param {object} tafAsObject The TAF object validate
*/
const validateTaf = (tafAsObject, container) => {
  if (!tafAsObject) {
    return;
  }

  const handleValidationResult = (validationReport) => {
    let validationErrors = [];
    let validationSucceeded = false;
    if (validationReport) {
      if (validationReport.errors) {
        validationErrors = validationReport.errors;
      }
      if (validationReport.message) {
        validationMessage = validationReport.message;
      }
      if (validationReport.succeeded === true) {
        validationSucceeded = true;
      }
    }

    updateFeedback(
      validationMessage,
      validationSucceeded ? FEEDBACK_STATUSES.SUCCESS : FEEDBACK_STATUSES.ERROR, FEEDBACK_CATEGORIES.VALIDATION, null, validationErrors, container
    );

    if (validationReport && validationReport.TAC) {
      updateTAC(validationReport.TAC, container);
    } else {
      updateTAC(null, container);
    }
  };

  const { props } = container;
  const { urls } = props;
  let validationMessage = 'Unable to get validation report';
  if (!urls) {
    updateFeedback(validationMessage, FEEDBACK_STATUSES.ERROR, FEEDBACK_CATEGORIES.VALIDATION, null, null, container);
    return;
  }
  const sanitizedTaf = sanitizeTaf(tafAsObject);
  TafValidator(urls.BACKEND_SERVER_URL, sanitizedTaf.taf, sanitizedTaf.report).then(handleValidationResult);
};

/**
 * Once loaded, this method processes the existing TAFs into the selectable TAFs list
 * @param {Element} container The container to update the selectable TAFs for
 * @param {Array} tafs The TAFs to update the list selectable TAFs with
 * @param {string} status The status of the TAFs to update
 */
const updateSelectableTafs = (container, tafs, status) => {
  const { state } = container;
  if (!Array.isArray(tafs)) {
    if (tafs === null) {
      tafs = [];
    } else {
      return;
    }
  }
  const byDifferentStatus = (selectable) => selectable.tafData.metadata.status.toLowerCase() !== status &&
    selectable.tafData.metadata.status.toLowerCase() !== STATUSES.NEW;

  container.setState(produce(state, draftState => {
    const persistingTafs = draftState.selectableTafs.filter(byDifferentStatus);
    draftState.selectableTafs.length = 0;
    const { locations, timestamps } = draftState;
    tafs.filter(isTafSelectable(locations, timestamps)).forEach((incomingTaf) => {
      draftState.selectableTafs.push(wrapIntoSelectableTaf(incomingTaf));
    });
    draftState.selectableTafs.push(...persistingTafs);
    const spacetimeCombinations = createSpaceTimeCombinations(locations, timestamps);
    if (spacetimeCombinations && Array.isArray(spacetimeCombinations) && spacetimeCombinations.length > 0) {
      const newCombinations = spacetimeCombinations.filter((combination) => !draftState.selectableTafs.some((selectableTaf) =>
        combination.timestamp.isSame(selectableTaf.timestamp) && combination.location === selectableTaf.location));
      newCombinations.forEach((combination) => {
        const selectableTaf = produce(TAF_TEMPLATES.SELECTABLE_TAF, (draftSelectable) => {
          draftSelectable.location = combination.location;
          draftSelectable.timestamp = combination.timestamp;
          draftSelectable.label.time = combination.timestamp.format(TIMELABEL_FORMAT);
          draftSelectable.label.date = combination.timestamp.format(DATELABEL_FORMAT);
          draftSelectable.label.text = `${combination.location} ${draftSelectable.label.time} ${draftSelectable.label.date}`;
          draftSelectable.label.status = `${STATUSES.NEW} / ${LIFECYCLE_STAGE_NAMES.NORMAL}`;
          draftSelectable.label.icon = STATUS_ICONS.NEW;
          draftSelectable.tafData.metadata.location = combination.location;
          draftSelectable.tafData.metadata.validityStart = combination.timestamp.format(TIMESTAMP_FORMAT);
          draftSelectable.tafData.metadata.validityEnd = combination.timestamp.clone().add(30, 'hour').format(TIMESTAMP_FORMAT);
          draftSelectable.tafData.metadata.status = STATUSES.NEW;
          draftSelectable.tafData.metadata.type = LIFECYCLE_STAGE_NAMES.NORMAL;
        });
        draftState.selectableTafs.push(selectableTaf);
      });
    }
    draftState.selectableTafs.sort((tafA, tafB) => {
      const byLocation = tafA.location.localeCompare(tafB.location);
      if (byLocation === 0) {
        return tafA.timestamp.isAfter(tafB.timestamp);
      }
      return byLocation;
    });
    // Update selectedTaf
    if (draftState.selectedTaf && Array.isArray(draftState.selectedTaf) &&
      draftState.selectedTaf.length > 0 && draftState.selectedTaf[0].tafData.metadata.status === status) {
      const newDataSelectedTaf = draftState.selectableTafs.find((selectableTaf) => isSameSelectableTaf(selectableTaf, draftState.selectedTaf[0]));
      draftState.selectedTaf.length = 0;
      if (newDataSelectedTaf) {
        draftState.selectedTaf.push(produce(newDataSelectedTaf, d => { d.TAC = 'Verifying TAF...'; }));
      }
    }
  }), () => {
    if (state && state.selectedTaf && state.selectedTaf.length === 1) {
      validateTaf(state.selectedTaf[0].tafData, container);
    }
  });
};

/**
 * Select a TAF
 * @param {array} selection The list of TAF(s) to be selected
 * @param {Element} container The container to select the TAF(s) in
 */
const selectTaf = (selection, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!Array.isArray(selection)) {
    return;
  }
  const hasPreviousSelection = Array.isArray(selectedTaf) && selectedTaf.length > 0;
  if (selection.length === 0) {
    if (!hasPreviousSelection) {
      return;
    } else {
      container.setState(produce(state, draftState => {
        draftState.selectedTaf.length = 0;
        draftState.mode = MODES.READ;
        draftState.feedback[FEEDBACK_CATEGORIES.VALIDATION] = null;
        draftState.feedback[FEEDBACK_CATEGORIES.LIFECYCLE] = null;
      }));
      return;
    }
  }

  if (hasPreviousSelection && isSameSelectableTaf(selection[0], state.selectedTaf[0])) {
    return;
  }
  container.setState(produce(state, draftState => {
    if (!Array.isArray(draftState.selectedTaf)) {
      draftState.selectedTaf = [];
    }
    draftState.selectedTaf.length = 0;
    draftState.selectedTaf.push(selection[0]);
    if (selection[0].tafData && selection[0].tafData.metadata && selection[0].tafData.metadata.status &&
      selection[0].tafData.metadata.status === STATUSES.NEW) {
      draftState.mode = MODES.EDIT;
    }
  }), () => {
    if (state && state.selectedTaf && state.selectedTaf.length === 1) {
      validateTaf(state.selectedTaf[0].tafData, container);
    }
  });
};

const discardTaf = (event, shouldSwitch, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    const { selectedTaf } = state;
    draftState.mode = MODES.EDIT;
    draftState.displayModal = null;
    draftState.selectedTaf.length = 0;
    if (shouldSwitch) {
      return;
    }
    if (selectedTaf && Array.isArray(selectedTaf) && selectedTaf.length === 1) {
      if (selectedTaf[0].tafData && selectedTaf[0].tafData.metadata && selectedTaf[0].tafData.metadata.uuid) {
        const uuid = selectedTaf[0].tafData.metadata.uuid;
        const previousSelected = draftState.selectableTafs.find((selectable) => selectable.tafData.metadata.uuid === uuid);
        if (previousSelected) {
          draftState.selectedTaf.push(previousSelected);
        }
      }
    }
  }), () => {
    if (state && state.selectedTaf && state.selectedTaf.length === 1) {
      validateTaf(state.selectedTaf[0].tafData, container);
    }
  });
};

/**
 * Cleans TAF, returns cleaned taf object and report based on fallback properties
 @param {object} tafAsObject, the taf object to clean
 @return {object} Object with taf and report properties
*/
const sanitizeTaf = (tafAsObject) => {
  const taf = cloneDeep(tafAsObject);
  const fallbackPointers = [];
  getJsonPointers(taf, (field) => field && field.hasOwnProperty('fallback'), fallbackPointers);

  const inputParsingReport = {};
  const fallbackPointersLength = fallbackPointers.length;
  if (fallbackPointersLength > 0) {
    inputParsingReport.message = 'TAF is not valid';
    inputParsingReport.succeeded = false;
    if (!inputParsingReport.hasOwnProperty('errors')) {
      inputParsingReport.errors = {};
    }
    fallbackPointers.reverse(); // handle high (array-)indices first
    fallbackPointers.forEach((pointer) => {
      if (!inputParsingReport.errors.hasOwnProperty(pointer)) {
        inputParsingReport.errors[pointer] = [];
      }
      const pointerParts = pointer.split('/');
      pointerParts.shift();
      let message = 'The pattern of the input was not recognized.';
      const fallbackedProperty = getNestedProperty(taf, pointerParts);
      if (fallbackedProperty.hasOwnProperty('fallback') && fallbackedProperty.fallback.hasOwnProperty('message')) {
        message = fallbackedProperty.fallback.message;
      }
      inputParsingReport.errors[pointer].push(message);
      removeNestedProperty(taf, pointerParts);
    });
  } else {
    inputParsingReport.message = 'TAF input is verified';
    inputParsingReport.succeeded = true;
  }

  // remove caVOK when false
  const forecastPointers = [];
  getJsonPointers(taf, (field) => field && field.hasOwnProperty('caVOK') && field.caVOK === false, forecastPointers);
  const forecastPointersLength = forecastPointers.length;
  if (forecastPointersLength > 0) {
    forecastPointers.forEach((pointer) => {
      const pointerParts = pointer.split('/');
      pointerParts.shift();
      pointerParts.push('caVOK');
      removeNestedProperty(taf, pointerParts);
    });
  }

  clearEmptyPointersAndAncestors(taf);

  if (!getNestedProperty(taf, ['changegroups'])) {
    setNestedProperty(taf, ['changegroups'], []);
  }

  // status NEW does only exist in the frontend, don't post it to the backend
  if (taf.metadata) {
    taf.metadata.status = taf.metadata.status.toLowerCase();
    taf.metadata.type = taf.metadata.type.toLowerCase();
    if (taf.metadata.status === STATUSES.NEW) {
      delete taf.metadata.status;
    }
  }
  return {
    taf: taf,
    report: inputParsingReport
  };
};

/**
 * Saving TAF to backend
 * @param {object} event The event that triggered saving
 * @param {Element} container The container in which the save action was triggered
 */
const saveTaf = (event, container) => {
  saveTafPromise(event, container).then((response) => {
    const status = response.data.succeeded ? FEEDBACK_STATUSES.SUCCESS : FEEDBACK_STATUSES.ERROR;
    updateFeedback('TAF is saved', status, FEEDBACK_CATEGORIES.LIFECYCLE, response.data.message, null, container, synchronizeSelectableTafs);
  }).catch((e) => {
    console.error('saveTaf error', e);
    const { props } = container;
    const { dispatch } = props;
    dispatch(notify({
      title: 'Couldn\'t save TAF',
      message: 'Unable to save TAF',
      status: 'error',
      position: 'bl',
      dismissible: false
    }));
    // TODO: Discuss with diMosellaAtWork if this is OK
    // updateFeedback('Couldn\'t save TAF',
    //   FEEDBACK_STATUSES.ERROR, FEEDBACK_CATEGORIES.LIFECYCLE, null, null, container, (container) => {
    //     container.setState(produce(state, draftState => {
    //       if (!draftState.selectedTaf[0].tafData.metadata.uuid) {
    //         draftState.selectedTaf[0].tafData.metadata.status = STATUSES.NEW;
    //       } else if (draftState.selectedTaf[0].tafData.metadata.status === STATUSES.PUBLISHED) {
    //         draftState.selectedTaf[0].tafData.metadata.status = STATUSES.CONCEPT;
    //       }
    //     }));
    //   });
  });
};

/**
 * Saving TAF to backend
 * @param {object} event The event that triggered saving
 * @param {Element} container The container in which the save action was triggered
 * @returns {Promise}
 */
const saveTafPromise = (event, container) => {
  return new Promise((resolve, reject) => {
    const { state, props } = container;
    const { selectedTaf } = state;
    const { BACKEND_SERVER_URL } = props.urls;
    if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1 || !BACKEND_SERVER_URL) {
      reject(new Error('Unable to save TAF: No TAF is selected'));
      return;
    }
    axios({
      method: 'post',
      url: `${BACKEND_SERVER_URL}/tafs`,
      withCredentials: true,
      data: JSON.stringify(sanitizeTaf(container.state.selectedTaf[0].tafData).taf),
      headers: { 'Content-Type': 'application/json' }
    }).then(response => {
      /* Update the state after successful save, not before */
      container.setState(produce(container.state, draftState => {
        if (draftState.selectedTaf[0].tafData.metadata.status === STATUSES.NEW) {
          draftState.selectedTaf[0].tafData.metadata.status = STATUSES.CONCEPT;
        }
        draftState.mode = MODES.READ;
        /* Update the UUID of the selectable taf with the new one from the backend, this will be used in isSameSelectableTaf TAF to find the TAF */
        if (response.data.tafjson && response.data.tafjson.metadata && response.data.tafjson.metadata.uuid) {
          draftState.selectedTaf[0].tafData.metadata.uuid = response.data.tafjson.metadata.uuid;
          draftState.selectedTaf[0].uuid = response.data.tafjson.metadata.uuid;
        }
      }), () => {
        synchronizeSelectableTafs(container);
        resolve(response);
      });
    }).catch(error => {
      console.error('Couldn\'t save TAF', error);
      /* Revert status, sync with backend */
      synchronizeSelectableTafs(container);
      reject(new Error('Unable to save TAF'));
    });
  });
};

/**
 * Set TAF mode to EDIT
 * @param {object} event The event that triggered editing
 * @param {Element} container The container in which the edit action was triggered
 */
const editTaf = (event, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    draftState.mode = MODES.EDIT;
  }));
};

/**
 * Deleting TAF from backend
 * @param {object} event The event that triggered deleting
 * @param {Element} container The container in which the delete action was triggered
 */
const deleteTaf = (event, container) => {
  const { state, props } = container;
  const { selectedTaf } = state;
  const { BACKEND_SERVER_URL } = props.urls;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1 || !BACKEND_SERVER_URL) {
    return;
  }
  const uuid = selectedTaf[0].tafData.metadata.uuid;
  if (!uuid) {
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.mode = MODES.EDIT;
    draftState.displayModal = null;
  }), () => {
    axios({
      method: 'delete',
      url: `${BACKEND_SERVER_URL}/tafs/${uuid}`,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      updateFeedback('TAF has been deleted', FEEDBACK_STATUSES.SUCCESS, FEEDBACK_CATEGORIES.LIFECYCLE, response.data, null, container, synchronizeSelectableTafs);
    }).catch(error => {
      console.error('Couldn\'t delete TAF', error);
      updateFeedback('Couldn\'t delete TAF',
        FEEDBACK_STATUSES.ERROR, FEEDBACK_CATEGORIES.LIFECYCLE, null, null, container, () => {
          container.setState(produce(state, draftState => {
            draftState.mode = MODES.READ;
          }));
        });
    });
  });
};

/**
 * Copy TAF information
 * @param {object} event The event that triggered copying
 * @param {Element} container The container in which the copy action was triggered
 */
const copyTaf = (event, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    draftState.copiedTafRef = draftState.selectedTaf[0].tafData.metadata.uuid;
  }));
};

/**
 * Paste TAF information
 * @param {object} event The event that triggered pasting
 * @param {Element} container The container in which the paste action was triggered
 */
const pasteTaf = (event, container) => {
  const { state } = container;
  const copiedTaf = state.selectableTafs.find((selectable) => selectable.tafData.metadata.uuid === state.copiedTafRef);
  if (!copiedTaf) {
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.forecast = copiedTaf.tafData.forecast;
    if (copiedTaf.tafData.changegroups.length > 0) {
      draftState.selectedTaf[0].tafData.changegroups.length = 0;
      draftState.selectedTaf[0].tafData.changegroups.push(...copiedTaf.tafData.changegroups);
    }
    draftState.copiedTafRef = null;
    draftState.selectedTaf[0].hasEdits = true;
  }));
};

/**
 * Publish TAF
 * @param {object} event The event that triggered publishing
 * @param {Element} container The container in which the publish action was triggered
 */
const publishTaf = (event, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.status = STATUSES.PUBLISHED;
    draftState.mode = MODES.READ;
  }), () => {
    saveTafPromise(event, container).then((response) => {
      updateFeedback('TAF is published', status, FEEDBACK_CATEGORIES.LIFECYCLE, response.data.message, null, container, synchronizeSelectableTafs);
    }).catch((e) => {
      console.error('publishTaf failed', e);
      const { props } = container;
      const { dispatch } = props;
      dispatch(notify({
        title:'Error: Unable to publish TAF',
        message: e,
        status: 'error',
        position: 'bl',
        dismissible: false
      }));
    });
  });
};

/**
 * Amend TAF
 * @param {object} event The event that triggered creating a amendation
 * @param {Element} container The container in which the create amendation action was triggered
 */
const amendTaf = (event, container) => {
  const { state } = container;
  if (container.state.selectedTaf[0].tafData.metadata.status !== STATUSES.PUBLISHED) {
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.previousUuid = draftState.selectedTaf[0].tafData.metadata.uuid;
    draftState.selectedTaf[0].tafData.metadata.uuid = null;
    draftState.selectedTaf[0].uuid = null;
    draftState.selectedTaf[0].tafData.metadata.status = STATUSES.CONCEPT;
    draftState.selectedTaf[0].tafData.metadata.type = LIFECYCLE_STAGE_NAMES.AMENDMENT;
    draftState.mode = MODES.EDIT;
  }));
};

/**
 * Correct TAF
 * @param {object} event The event that triggered creating a correction
 * @param {Element} container The container in which the create correction action was triggered
 */
const correctTaf = (event, container) => {
  const { state } = container;
  if (container.state.selectedTaf[0].tafData.metadata.status !== STATUSES.PUBLISHED) {
    console.error('Unable to correct TAF, status is already published');
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.previousUuid = draftState.selectedTaf[0].tafData.metadata.uuid;
    draftState.selectedTaf[0].tafData.metadata.uuid = null;
    draftState.selectedTaf[0].uuid = null;
    draftState.selectedTaf[0].tafData.metadata.status = STATUSES.CONCEPT;
    draftState.selectedTaf[0].tafData.metadata.type = LIFECYCLE_STAGE_NAMES.CORRECTION;
    draftState.mode = MODES.EDIT;
  }));
};

/**
 * Cancel TAF
 * @param {object} event The event that triggered canceling a TAF
 * @param {Element} container The container in which the cancel action was triggered
 */
const cancelTaf = (event, container) => {
  const { state } = container;
  if (container.state.selectedTaf[0].tafData.metadata.status !== STATUSES.PUBLISHED) {
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.previousUuid = draftState.selectedTaf[0].tafData.metadata.uuid;
    draftState.selectedTaf[0].tafData.metadata.uuid = null;
    draftState.selectedTaf[0].uuid = null;
    draftState.selectedTaf[0].tafData.metadata.status = STATUSES.PUBLISHED;
    draftState.selectedTaf[0].tafData.metadata.type = LIFECYCLE_STAGE_NAMES.CANCELED;
    draftState.selectedTaf[0].tafData.changegroups.length = 0;
    draftState.selectedTaf[0].tafData.forecast = {};
    draftState.mode = MODES.READ;
    draftState.displayModal = null;
  }), () => saveTaf(event, container));
};

/**
 * Add a row to the TAF table
 * @param {number} rowIndex The index at which the row should be inserted, if null the row is appended at the end
 * @param {Element} container The container in which the TAF table should be altered
 */
const addTafRow = (rowIndex, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1) {
    return;
  }
  if (typeof rowIndex !== 'number') {
    rowIndex = selectedTaf[0].tafData.changegroups.length;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.changegroups.splice(rowIndex, 0, produce(TAF_TEMPLATES.CHANGE_GROUP, draftChangegroup => {}));
  }));
};

/**
 * Remove a row from the TAF table
 * @param {number} rowIndex The index of the row that should be removed
 * @param {Element} container The container in which the TAF table should be altered
 */
const removeTafRow = (rowIndex, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1 || typeof rowIndex !== 'number') {
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.changegroups.splice(rowIndex, 1);
    draftState.selectedTaf[0].hasEdits = true;
  }));
};

/**
 * Reorder a row of the TAF table
 * @param {number} affectedIndex The index of the row that should be reordered
 * @param {number} newIndexValue The new position of the row
 * @param {Element} container The container in which the TAF table should be altered
 */
const reorderTafRow = (affectedIndex, newIndexValue, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1 ||
    typeof affectedIndex !== 'number' || typeof newIndexValue !== 'number') {
    return;
  }
  container.setState(produce(state, draftState => {
    const newRows = arrayMove(draftState.selectedTaf[0].tafData.changegroups, affectedIndex, newIndexValue);
    draftState.selectedTaf[0].tafData.changegroups.length = 0;
    draftState.selectedTaf[0].tafData.changegroups.push(...newRows);
    draftState.selectedTaf[0].hasEdits = true;
  }));
};

/**
 * Updates the value(s) of the properties of the TAF
 * @param {Array} valuesAtPaths An array with objects, each containing a propertyPath and propertyValue
 * @param {Element} container The container in which the TAF table should be altered

 */
const updateTafFields = (valuesAtPaths, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1 ||
    !Array.isArray(valuesAtPaths) || valuesAtPaths.length === 0) {
    return;
  }
  container.setState(produce(state, draftState => {
    const { selectedTaf } = draftState;
    const draftTafData = selectedTaf[0].tafData;
    valuesAtPaths.forEach((entry) => {
      if (entry && typeof entry === 'object' && entry.hasOwnProperty('propertyPath') && entry.hasOwnProperty('propertyValue')) {
        if (entry.deleteProperty === true) {
          removeNestedProperty(draftTafData, entry.propertyPath);
        } else {
          setNestedProperty(draftTafData, entry.propertyPath, entry.propertyValue);
        }
        draftState.selectedTaf[0].hasEdits = true;
      }
    });
  }));
};

/**
 * Updates the TAC display
 * @param {String} TAC code
 * @param {Element} container The container in which the TAF table should be altered
 */
const updateTAC = (TAC, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1) {
    console.error('No TAF selected');
    return;
  }
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].TAC = TAC;
  }));
};

/**
 * Toggles TAF modals on and off
 * @param {Event} event The event which triggered the toggling
 * @param {string} type The modal type to toggle
 * @param {component} container The container in which the TAF modal should be toggled
 */
const toggleTafModal = (event, type, container) => {
  const { state } = container;
  if (event) {
    event.stopPropagation();
  }
  container.setState(produce(state, draftState => {
    draftState.displayModal = draftState.displayModal === type ? null : type;
  }));
};

/**
 * TafsContainer has its own state, this is the dispatch for updating the state
 * @param {object} localAction Action-object containing the type and additional, action specific, parameters
 * @param {object} state Object reference for the actual state
 * @param {component} container The component to update the state
 }}
 */
export default (localAction, container) => {
  switch (localAction.type) {
    case LOCAL_ACTION_TYPES.UPDATE_LOCATIONS:
      updateLocations(container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_TIMESTAMPS:
      updateTimestamps(container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_TAFS:
      synchronizeSelectableTafs(container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_FEEDBACK:
      updateFeedback(localAction.title, localAction.status, localAction.category, localAction.subTitle, localAction.list, container);
      break;
    case LOCAL_ACTION_TYPES.SELECT_TAF:
      selectTaf(localAction.selection, container);
      break;
    case LOCAL_ACTION_TYPES.DISCARD_TAF:
      discardTaf(localAction.event, false, container);
      break;
    case LOCAL_ACTION_TYPES.SWITCH_TAF:
      discardTaf(localAction.event, true, container);
      break;
    case LOCAL_ACTION_TYPES.SAVE_TAF:
      saveTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.EDIT_TAF:
      editTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.DELETE_TAF:
      deleteTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.COPY_TAF:
      copyTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PASTE_TAF:
      pasteTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.PUBLISH_TAF:
      publishTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.AMEND_TAF:
      amendTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.CORRECT_TAF:
      correctTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.CANCEL_TAF:
      cancelTaf(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.ADD_TAF_ROW:
      addTafRow(localAction.rowIndex, container);
      break;
    case LOCAL_ACTION_TYPES.REMOVE_TAF_ROW:
      removeTafRow(localAction.rowIndex, container);
      break;
    case LOCAL_ACTION_TYPES.REORDER_TAF_ROW:
      reorderTafRow(localAction.affectedIndex, localAction.newIndexValue, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_TAF_FIELDS:
      updateTafFields(localAction.valuesAtPaths, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_TAC:
      updateTAC(localAction.TAC, container);
      break;
    case LOCAL_ACTION_TYPES.VALIDATE_TAF:
      validateTaf(localAction.tafObject, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_TAF_MODAL:
      toggleTafModal(localAction.event, localAction.modalType, container);
  }
};
