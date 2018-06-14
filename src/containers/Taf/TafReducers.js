import produce from 'immer';
import axios from 'axios';
import moment from 'moment';
import { ReadLocations } from '../../utils/admin';
import { LOCAL_ACTION_TYPES, STATUSES, LIFECYCLE_STAGE_NAMES, getExample, MODES } from './TafActions'; // MODES
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
      response = tafResource.status === STATUSES.PUBLISHED
        ? getExample(container.state.timestamps.current, container.state.locations[0], tafResource.status)
        : getExample(container.state.timestamps.next, container.state.locations[2], tafResource.status);
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
      }));
      if (shouldSync(container)) {
        synchronizeSelectableTafs(container);
      }
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
  TAFStartHour = TAFStartHour - TAFStartHour % 6 + 6;
  const currentTafTimestamp = now.clone().hour(TAFStartHour).startOf('hour');
  container.setState(produce(state, draftState => {
    draftState.timestamps.current = currentTafTimestamp;
    draftState.timestamps.next = currentTafTimestamp.clone().add(6, 'hour');
    draftState.timestamps.modified = now;
  }));
  if (shouldSync(container)) {
    synchronizeSelectableTafs(container);
  }
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
    const persistingTafs = draftState.selectableTafs.filter((selectable) => selectable.taf.metadata.status.toUpperCase() !== statusUpdatableTafs);
    draftState.selectableTafs.length = 0;
    const { locations, timestamps } = draftState;
    tafs.filter(isTafSelectable(locations, timestamps)).forEach((incomingTaf) => {
      const selectableTaf = produce(TAF_TEMPLATES.SELECTABLE_TAF, (draftSelectable) => {
        draftSelectable.location = incomingTaf.metadata.location.toUpperCase();
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
        draftSelectable.taf.metadata.location = draftSelectable.location;
        draftSelectable.taf.metadata.validityStart = incomingTaf.metadata.validityStart;
        draftSelectable.taf.metadata.validityEnd = incomingTaf.metadata.validityEnd;
        draftSelectable.taf.metadata.issueTime = incomingTaf.metadata.issueTime;
        draftSelectable.taf.metadata.status = incomingTaf.metadata.status;
        draftSelectable.taf.metadata.type = incomingTaf.metadata.type;
        draftSelectable.taf.metadata.uuid = incomingTaf.metadata.uuid;
        draftSelectable.taf.metadata.modified = incomingTaf.metadata.modified;
        draftSelectable.taf.metadata.author = incomingTaf.metadata.author;
        draftSelectable.taf.forecast = incomingTaf.forecast;
        draftSelectable.taf.changegroups.length = 0;
        draftSelectable.taf.changegroups.push(...incomingTaf.changegroups);
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
          draftSelectable.taf.metadata.location = combination.location;
          draftSelectable.taf.metadata.validityStart = combination.timestamp.format(TIMESTAMP_FORMAT);
          draftSelectable.taf.metadata.validityEnd = combination.timestamp.clone().add(30, 'hour').format(TIMESTAMP_FORMAT);
          draftSelectable.taf.metadata.status = STATUSES.CONCEPT;
          draftSelectable.taf.metadata.type = LIFECYCLE_STAGE_NAMES.NORMAL;
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
  }));
};

const discardTaf = (event, container) => {
  console.warn('discardTaf is not yet fully implemented');
};

const saveTaf = (event, container) => {
  console.warn('saveTaf is not yet fully implemented');
};

const editTaf = (event, container) => {
  console.warn('editTaf is not yet fully implemented');
};

const deleteTaf = (event, container) => {
  console.warn('deleteTaf is not yet fully implemented');
};

const copyTaf = (event, container) => {
  console.warn('copyTaf is not yet fully implemented');
};

const publishTaf = (event, container) => {
  console.warn('publishTaf is not yet fully implemented');
};

const amendTaf = (event, container) => {
  console.warn('amendTaf is not yet fully implemented');
};

const correctTaf = (event, container) => {
  console.warn('correctTaf is not yet fully implemented');
};

const cancelTaf = (event, container) => {
  console.warn('cancelTaf is not yet fully implemented');
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
  }
};
