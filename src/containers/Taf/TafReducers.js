// import produce from 'immer';
import axios from 'axios';
import { ReadLocations } from '../../utils/admin';
import { LOCAL_ACTION_TYPES, STATUSES, getExample } from './TafActions'; // TAF_MODES

const updateExistingTafs = (event, container) => {
  const { urls } = container.props;
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
        ? getExample(container.state.selectableTafs[0].timestamp, container.state.selectableTafs[0].location, tafResource.status)
        : getExample(container.state.selectableTafs[2].timestamp, container.state.selectableTafs[2].location, tafResource.status);
      receivedExistingTafsCallback(response, tafResource.status);
    }).catch(error => {
      console.error('Couldn\'t retrieve existing TAFs', error);
    });
  });
  console.warn('updateLocations is not yet fully implemented');
};

const receivedExistingTafsCallback = (response, status) => {

};

const updateLocations = (container) => {
  if (!container.props.hasOwnProperty('urls') || !container.props.urls ||
    !container.props.urls.hasOwnProperty('BACKEND_SERVER_URL') || typeof container.props.urls.BACKEND_SERVER_URL !== 'string') {
    return;
  }
  ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (tafLocationsData) => {
    if (tafLocationsData && typeof tafLocationsData === 'object') {
      const locationNames = [];
      tafLocationsData.forEach((location) => {
        if (location.hasOwnProperty('name') && typeof location.name === 'string' &&
          location.hasOwnProperty('availability') && Array.isArray(location.availability) && location.availability.includes('taf')) {
          locationNames.push(location.name);
        }
      });
      this.setSpaceTimeTafs(locationNames);
      this.retrieveExistingTafs();
    } else {
      console.error('Couldn\'t retrieve TAF locations');
    }
  });
  updateExistingTafs();
};

const updateTimestamps = (event, container) => {
  console.warn('updateTimestamps is not yet fully implemented');
};

const selectTaf = (event, container) => {
  console.warn('selectTaf is not yet fully implemented');
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
export const localDispatch = (localAction, container) => {
  switch (localAction.type) {
    case LOCAL_ACTION_TYPES.UPDATE_LOCATIONS:
      updateLocations(container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_TIMESTAMPS:
      updateTimestamps(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.SELECT_TAF:
      selectTaf(localAction.event, container);
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
