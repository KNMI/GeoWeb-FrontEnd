import produce from 'immer';
import axios from 'axios';
import moment from 'moment';
import { arrayMove } from 'react-sortable-hoc';
import setNestedProperty from 'lodash.set';
import getNestedProperty from 'lodash.get';
import removeNestedProperty from 'lodash.unset';
import uuidv4 from 'uuid/v4';
import { clearNullPointersAndAncestors } from '../../utils/json';
import { ReadLocations } from '../../utils/admin';
import { LOCAL_ACTION_TYPES, STATUSES, LIFECYCLE_STAGE_NAMES, MODES } from './TafActions';
import { TAF_TEMPLATES, TIMELABEL_FORMAT, TIMESTAMP_FORMAT } from '../../components/Taf/TafTemplates';

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
  taf && taf.timestamp && taf.location && moment.isMoment(taf.timestamp) && typeof taf.location === 'string';

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
  return tafA.timestamp.isSame(tafB.timestamp) && tafA.location.toUpperCase() === tafB.location.toUpperCase();
};

/**
 * Create a function that determines the selectability of TAFs
 * @param {array} locations The locations that should be selectable
 * @param {object} timestamps The timestamps that should be selectable
 * @returns {func} A function to determine to check whether or not a TAF should be listed as selectable
 */
const isTafSelectable = (locations, timestamps) => (taf) =>
  taf && taf.metadata && typeof taf.metadata.validityStart === 'string' && typeof taf.metadata.location === 'string' &&
  (timestamps.current.isSame(moment.utc(taf.metadata.validityStart)) || timestamps.next.isSame(moment.utc(taf.metadata.validityStart))) &&
  locations.includes(taf.metadata.location.toUpperCase());

/**
 * Callback to handle succesfull receiving of TAFs
 * @param {Element} container The container as context to pass through
 * @param {object} data The response data with received TAFs
 */
const receivedTafsCallback = (container, data) => {
  if (data && data.ntafs && !isNaN(data.ntafs) &&
    Number.isInteger(data.ntafs) && data.ntafs > 0 &&
    data.tafs && Array.isArray(data.tafs)) {
    updateSelectableTafs(container, data.tafs);
  }
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
  if (!hasSelectableTafs) {
    return true;
  }

  if (!hasTimestamps || !hasLocations) {
    return false;
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

  /* TODO: This is a fix in case no TAFS are present on the backend and when examples are not provided,
    the list with selectable tags is otherwise never populated
  */
  updateSelectableTafs(container, [{
    metadata:{
      'status': 'concept',
      'type': 'normal',
      'location': 'EHAM'
    }
  }]);

  const tafResources = [
    { url: `${urls.BACKEND_SERVER_URL}/tafs?active=true`, status: STATUSES.PUBLISHED },
    { url: `${urls.BACKEND_SERVER_URL}/tafs?active=false&status=concept`, status: STATUSES.CONCEPT }
  ];
  tafResources.forEach((tafResource) => {
    axios({
      method: 'get',
      url: tafResource.url,
      withCredentials: true,
      responseType: 'json'
    }).then(response => {
      if (!Array.isArray(response.data.tafs)) {
        response.data.tafs = [];
      }
      // const additionalResponse = tafResource.status === STATUSES.PUBLISHED
      //  ? getExample(container.state.timestamps.current, container.state.locations[0], tafResource.status)
      //  : getExample(container.state.timestamps.next, container.state.locations[2], tafResource.status);
      // response.data.ntafs += additionalResponse.data.ntafs;
      // response.data.tafs.push(...additionalResponse.data.tafs);
      receivedTafsCallback(container, response.data);
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
  let data = produce(state, draftState => {
    draftState.timestamps.current = currentTafTimestamp;
    draftState.timestamps.next = currentTafTimestamp.clone().add(6, 'hour');
    draftState.timestamps.modified = now;
  });
  container.setState(data, () => {
    if (shouldSync(container)) {
      synchronizeSelectableTafs(container);
    }
  });
};

/**
 * Update the feedback
 * @param {string} title The title for the feedback
 * @param {string} status The status for the feedback
 * @param {string} subTitle The subtitle for the feedback
 * @param {array} list The list of messages
 */
const updateFeedback = (title, status, subTitle, list, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    draftState.feedback = {
      title: title,
      status: status,
      subTitle: subTitle,
      list: list
    };
  }));
};

/**
 * Once loaded, this method processes the existing TAFs into the selectable TAFs list
 * @param {Element} container The container to update the selectable TAFs for
 * @param {*} tafs
 */
const updateSelectableTafs = (container, tafs) => {
  const { state } = container;
  // currently TAFs are retrieved in several calls, by status
  const statusUpdatableTafs = tafs[0].metadata.status.toUpperCase();
  container.setState(produce(state, draftState => {
    const persistingTafs = draftState.selectableTafs.filter((selectable) => selectable.tafData.metadata.status.toUpperCase() !== statusUpdatableTafs);
    draftState.selectableTafs.length = 0; // TODO: Why not set to [] ?
    const { locations, timestamps } = draftState;
    tafs.filter(isTafSelectable(locations, timestamps)).forEach((incomingTaf) => {
      const selectableTaf = produce(TAF_TEMPLATES.SELECTABLE_TAF, (draftSelectable) => {
        draftSelectable.location = incomingTaf.metadata.location.toUpperCase();
        draftSelectable.uuid = incomingTaf.metadata.uuid;
        draftSelectable.status = incomingTaf.metadata.status + ' / ' + incomingTaf.metadata.type;
        draftSelectable.timestamp = moment.utc(incomingTaf.metadata.validityStart);
        draftSelectable.label.time = draftSelectable.timestamp.format(TIMELABEL_FORMAT);
        draftSelectable.label.text = `${draftSelectable.location} ${draftSelectable.label.time}`;
        let iconName = 'folder-open-o';
        if (incomingTaf.metadata.status && typeof incomingTaf.metadata.status === 'string') {
          const tafStatus = incomingTaf.metadata.status.toUpperCase();
          switch (tafStatus) {
            case STATUSES.PUBLISHED:
              iconName = 'folder-open';
              break;
            case STATUSES.CONCEPT:
              break;
            default:
              break;
          }
        }
        draftSelectable.label.icon = iconName;
        Object.entries(draftSelectable.tafData.metadata).forEach((entry) => {
          if (incomingTaf.metadata.hasOwnProperty(entry[0])) {
            draftSelectable.tafData.metadata[entry[0]] = incomingTaf.metadata[entry[0]];
          }
        });
        draftSelectable.tafData.forecast = incomingTaf.forecast;
        draftSelectable.tafData.changegroups.length = 0;
        draftSelectable.tafData.changegroups.push(...incomingTaf.changegroups);
      });
      draftState.selectableTafs.push(selectableTaf);
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
          draftSelectable.label.text = `${combination.location} ${draftSelectable.label.time}`;
          draftSelectable.label.icon = 'star-o';
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
  }));
};

/**
 * Select a TAF
 * @param {array} selection The list of TAF(s) to be selected
 * @param {Element} container The container to select the TAF(s) in
 */
const selectTaf = (selection, container) => {
  const { state } = container;
  const { selectedTaf } = state;
  if (!selection || !Array.isArray(selection)) {
    return;
  }
  const hasPreviousSelection = selectedTaf && Array.isArray(selectedTaf) && selectedTaf.length > 0;
  if (selection.length === 0) {
    if (!hasPreviousSelection) {
      return;
    } else {
      container.setState(produce(state, draftState => {
        if (Array.isArray(draftState.selectedTaf)) {
          draftState.selectedTaf.length = 0;
        } else {
          draftState.selectedTaf = [];
        }
        draftState.mode = MODES.READ;
      }));
      return;
    }
  }

  if (isSameSelectableTaf(selection[0], state.selectedTaf)) {
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
  }));
};

const discardTaf = (event, container) => {
  const { state } = container;
  container.setState(produce(state, draftState => {
    draftState.mode = MODES.READ;
    draftState.selectedTaf.length = 0;
  }));
};

/**
 * Saving TAF to backend
 * @param {object} event The event that triggered saving
 * @param {Element} container The container in which the save action was triggered
 */
const saveTaf = (event, container) => {
  const { state, props } = container;
  const { selectedTaf } = state;
  const { BACKEND_SERVER_URL } = props.urls;
  if (!selectedTaf || !Array.isArray(selectedTaf) || selectedTaf.length !== 1 || !BACKEND_SERVER_URL) {
    return;
  }
  const newTafState = produce(selectedTaf[0].tafData, draftTaf => {
    clearNullPointersAndAncestors(draftTaf);
    if (!getNestedProperty(draftTaf, ['changegroups'])) {
      setNestedProperty(draftTaf, ['changegroups'], []);
    }
    if (draftTaf.metadata.status === STATUSES.NEW) {
      draftTaf.metadata.status = STATUSES.CONCEPT;
    }
    draftTaf.metadata.status = draftTaf.metadata.status.toLowerCase();
    draftTaf.metadata.type = draftTaf.metadata.type.toLowerCase();
  });
  axios({
    method: 'post',
    url: `${BACKEND_SERVER_URL}/tafs`,
    withCredentials: true,
    data: JSON.stringify(newTafState),
    headers: { 'Content-Type': 'application/json' }
  }).then(response => {
    updateFeedback(response.data.message, response.data.succeeded ? 'success' : 'danger', null, null, container);

    container.setState(produce(state, draftState => {
      draftState.mode = MODES.READ;
    }), () => {
      synchronizeSelectableTafs(container);
      /* TODO: I want to set the metadata status from NEW to CONCEPT.
          or even better ,replace the current taf selection with the returned tafJSON */
      try {
        if (selectedTaf[0].tafData.metadata.status === STATUSES.NEW) {
          container.setState(produce(state, draftState => {
            draftState.selectedTaf[0].tafData.metadata.status = STATUSES.CONCEPT;
            draftState.mode = MODES.READ;
          }));
        }
      } catch (e) {
        console.error('Unable to change selected tag status from new to concept', e);
      }
    });
  }).catch(error => {
    console.error('Couldn\'t save TAF', error);
    updateFeedback('Couldn\'t save TAF: an error occured while trying to save.',
      'danger', null, null, container);
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
  axios({
    method: 'delete',
    url: `${BACKEND_SERVER_URL}/tafs/${uuid}`,
    withCredentials: true,
    responseType: 'json'
  }).then(response => {
    updateFeedback(response.data, 'success', null, null, container);
    container.setState(produce(state, draftState => {
      draftState.mode = MODES.READ;
      draftState.selectedTaf.length = 0;
    }), () => {
      synchronizeSelectableTafs(container);
    });
  }).catch(error => {
    console.error('Couldn\'t delete TAF', error);
    updateFeedback('Couldn\'t delete TAF: an error occured while trying to delete.',
      'danger', null, null, container);
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
  let data = produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.status = STATUSES.PUBLISHED;
    draftState.mode = MODES.READ;
  });
  container.setState(data, () => {
    saveTaf(event, container);
  });
};

/**
 * Amend TAF
 * @param {object} event The event that triggered creating a amendation
 * @param {Element} container The container in which the create amendation action was triggered
 */
const amendTaf = (event, container) => {
  const { state } = container;
  const correctionUuid = uuidv4();
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.previousUuid = draftState.selectedTaf[0].tafData.metadata.uuid;
    draftState.selectedTaf[0].tafData.metadata.uuid = correctionUuid;
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
  const correctionUuid = uuidv4();
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.previousUuid = draftState.selectedTaf[0].tafData.metadata.uuid;
    draftState.selectedTaf[0].tafData.metadata.uuid = correctionUuid;
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
  const correctionUuid = uuidv4();
  container.setState(produce(state, draftState => {
    draftState.selectedTaf[0].tafData.metadata.previousUuid = draftState.selectedTaf[0].tafData.metadata.uuid;
    draftState.selectedTaf[0].tafData.metadata.uuid = correctionUuid;
    draftState.selectedTaf[0].tafData.metadata.status = STATUSES.CONCEPT;
    draftState.selectedTaf[0].tafData.metadata.type = LIFECYCLE_STAGE_NAMES.CANCELED;
    draftState.mode = MODES.EDIT;
  }));
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
    // if (draftState.selectedTaf[0].tafData.changegroups.length === 0) {
    //   draftState.selectedTaf[0].tafData.changegroups.push(produce(TAF_TEMPLATES.CHANGE_GROUP, draftChangegroup => { }));
    // }
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
  // console.log('rTR', affectedIndex, newIndexValue);
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

          // removeNestedProperty on an array leaves an empty array element
          // Therefore, the array needs to be cleaned by this one neat trick

          // If the last element is a number, then it is an index in an array, so we know we are dealing with an array
          const lastPathElem = entry.propertyPath.pop();
          if (!isNaN(lastPathElem)) {
            // Retrieve the array and leave all items that evaluate truthy.
            // this filters everything as null, undefined, 0, {}, false, "", etc...
            const theArr = getNestedProperty(draftTafData, entry.propertyPath);
            setNestedProperty(draftTafData, entry.propertyPath, theArr.filter(n => n));
          }
        } else {
          setNestedProperty(draftTafData, entry.propertyPath, entry.propertyValue);
        }
        draftState.selectedTaf[0].hasEdits = true;
      }
    });
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
    case LOCAL_ACTION_TYPES.UPDATE_FEEDBACK:
      updateFeedback(localAction.title, localAction.status, localAction.subTitle, localAction.list, container);
      break;
    case LOCAL_ACTION_TYPES.SELECT_TAF:
      selectTaf(localAction.selection, container);
      break;
    case LOCAL_ACTION_TYPES.DISCARD_TAF:
      discardTaf(localAction.event, container);
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
  }
};
