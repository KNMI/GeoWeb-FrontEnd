import { safeMerge } from '../../utils/json';
import { AIRMET_MODES, AIRMET_TEMPLATES } from '../../components/Airmet/AirmetTemplates';

export const LOCAL_ACTION_TYPES = {
  TOGGLE_CONTAINER: 'TOGGLE_CONTAINER',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  RETRIEVE_PARAMETERS: 'RETRIEVE_PARAMETERS',
  RETRIEVE_PHENOMENA: 'RETRIEVE_PHENOMENA',
  RETRIEVE_AIRMETS: 'RETRIEVE_AIRMETS',
  FOCUS_AIRMET: 'FOCUS_AIRMET',
  ADD_AIRMET: 'ADD_AIRMET',
  UPDATE_AIRMET: 'UPDATE_AIRMET',
  UPDATE_AIRMET_LEVEL: 'UPDATE_AIRMET_LEVEL',
  CLEAR_AIRMET: 'CLEAR_AIRMET',
  DISCARD_AIRMET: 'DISCARD_AIRMET',
  SAVE_AIRMET: 'SAVE_AIRMET',
  EDIT_AIRMET: 'EDIT_AIRMET',
  DELETE_AIRMET: 'DELETE_AIRMET',
  COPY_AIRMET: 'COPY_AIRMET',
  PASTE_AIRMET: 'PASTE_AIRMET',
  PUBLISH_AIRMET: 'PUBLISH_AIRMET',
  CANCEL_AIRMET: 'CANCEL_AIRMET',
  DRAW_AIRMET: 'DRAW_AIRMET',
  UPDATE_FIR: 'UPDATE_FIR',
  CREATE_FIR_INTERSECTION: 'CREATE_FIR_INTERSECTION',
  VERIFY_AIRMET: 'VERIFY_AIRMET',
  TOGGLE_HAS_EDITS: 'TOGGLE_HAS_EDITS',
  RETRIEVE_OBSCURING_PHENOMENA: 'RETRIEVE_OBSCURING_PHENOMENA',
  TOGGLE_AIRMET_MODAL: 'TOGGLE_AIRMET_MODAL',
  CLEANUP: 'CLEANUP'
};

export const LOCAL_ACTIONS = {
  toggleContainerAction: (evt) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CONTAINER, event: evt }),
  toggleCategoryAction: (evt, ref) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CATEGORY, event: evt, ref: ref }),
  retrieveParametersAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_PARAMETERS }),
  retrievePhenomenaAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_PHENOMENA }),
  retrieveObscuringPhenomenaAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_OBSCURING_PHENOMENA }),
  retrieveAirmetsAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_AIRMETS }),
  focusAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.FOCUS_AIRMET, event: evt, uuid: uuid }),
  addAirmetAction: (ref) => ({ type: LOCAL_ACTION_TYPES.ADD_AIRMET, ref: ref }),
  updateAirmetAction: (uuid, dataField, value) => ({ type: LOCAL_ACTION_TYPES.UPDATE_AIRMET, uuid: uuid, dataField: dataField, value: value }),
  clearAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.CLEAR_AIRMET, event: evt, uuid: uuid }),
  discardAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.DISCARD_AIRMET, event: evt, uuid: uuid }),
  saveAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.SAVE_AIRMET, event: evt, uuid: uuid }),
  editAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.EDIT_AIRMET, event: evt, uuid: uuid }),
  deleteAirmetAction: (evt) => ({ type: LOCAL_ACTION_TYPES.DELETE_AIRMET, event: evt }),
  copyAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.COPY_AIRMET, event: evt, uuid: uuid }),
  pasteAirmetAction: (evt) => ({ type: LOCAL_ACTION_TYPES.PASTE_AIRMET, event: evt }),
  publishAirmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.PUBLISH_AIRMET, event: evt, uuid: uuid }),
  cancelAirmetAction: (evt) => ({ type: LOCAL_ACTION_TYPES.CANCEL_AIRMET, event: evt }),
  drawAction: (evt, uuid, action, featureFunction) => ({ type: LOCAL_ACTION_TYPES.DRAW_AIRMET, uuid: uuid, event: evt, action: action, featureFunction: featureFunction }),
  updateFir: (firName) => ({ type: LOCAL_ACTION_TYPES.UPDATE_FIR, firName: firName }),
  createFirIntersectionAction: (featureId, geoJson) => ({ type: LOCAL_ACTION_TYPES.CREATE_FIR_INTERSECTION, featureId: featureId, geoJson: geoJson }),
  verifyAirmetAction: (airmetObject) => ({ type: LOCAL_ACTION_TYPES.VERIFY_AIRMET, airmetObject: airmetObject }),
  toggleAirmetModalAction: (evt, uuid, type) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_AIRMET_MODAL, event: evt, uuid: uuid, modalType: type }),
  toggleHasEdits: (evt, val) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_HAS_EDITS, event: evt, value: val }),
  cleanupAction: () => ({ type: LOCAL_ACTION_TYPES.CLEANUP })
};

export const MODAL_TYPES = {
  TYPE_CONFIRM_DELETE: 'confirm delete',
  TYPE_CONFIRM_CANCEL: 'confirm cancel',
  TYPE_CONFIRM_PUBLISH: 'confirm publish'
};

export const MODALS = {
  CONFIRM_DELETE: {
    type: MODAL_TYPES.TYPE_CONFIRM_DELETE,
    title: 'Delete AIRMET?',
    message: (identifier) => `Are you sure you want to delete ${identifier}?`,
    button: {
      label: 'Delete',
      icon: 'trash',
      action: 'deleteAirmetAction',
      arguments: null // We use uuid here, which is passed to action
    },
    toggleAction: 'toggleAirmetModalAction'
  },
  CONFIRM_CANCEL: {
    type: MODAL_TYPES.TYPE_CONFIRM_CANCEL,
    title: 'Cancel AIRMET?',
    message: (identifier) => `Are you sure you want to cancel ${identifier}?`,
    button: {
      label: 'Cancel this AIRMET',
      icon: 'times-circle',
      action: 'cancelAirmetAction',
      arguments: null // We use uuid here, which is passed to action
    },
    optional: {
      message: 'Optionally, you can indicate which adjacent FIR the Volcanic Ash is moving to:',
      options: [],
      selectedOption: null,
      action: 'updateAirmetAction',
      parameters: []
    },
    toggleAction: 'toggleAirmetModalAction'
  },
  CONFIRM_PUBLISH: {
    type: MODAL_TYPES.TYPE_CONFIRM_PUBLISH,
    title: 'Publish AIRMET?',
    message: (identifier) => `Are you sure you want to publish ${identifier}?`,
    button: {
      label: 'Publish',
      icon: 'send',
      action: 'publishAirmetAction',
      arguments: null // We use uuid here, which is passed to action
    },
    toggleAction: 'toggleAirmetModalAction'
  }
};

export const STATUSES = {
  PUBLISHED: 'published',
  CONCEPT: 'concept',
  CANCELED: 'canceled'
};

export const EDIT_ABILITIES = {
  CLEAR: {
    'dataField': 'clear',
    'label': 'Clear',
    'check': 'isClearable',
    'action': 'clearAirmetAction'
  },
  DISCARD: {
    'dataField': 'discard',
    'label': 'Discard changes',
    'check': 'isDiscardable',
    'action': 'discardAirmetAction'
  },
  PASTE: {
    'dataField': 'paste',
    'label': 'Paste',
    'check': 'isPastable',
    'action': 'pasteAirmetAction'
  },
  SAVE: {
    'dataField': 'save',
    'label': 'Save',
    'check': 'isSavable',
    'action': 'saveAirmetAction'
  }
};

const EDIT_ABILITIES_ORDER = [
  EDIT_ABILITIES.CLEAR['dataField'],
  EDIT_ABILITIES.DISCARD['dataField'],
  EDIT_ABILITIES.PASTE['dataField'],
  EDIT_ABILITIES.SAVE['dataField']
];

export const byEditAbilities = (abilityA, abilityB) => {
  return EDIT_ABILITIES_ORDER.indexOf(abilityA.dataField) - EDIT_ABILITIES_ORDER.indexOf(abilityB.dataField);
};

export const READ_ABILITIES = {
  EDIT: {
    'dataField': 'edit',
    'label': 'Edit',
    'check': 'isEditable',
    'action': 'editAirmetAction'
  },
  DELETE: {
    'dataField': 'delete',
    'label': 'Delete',
    'check': 'isDeletable',
    'action': 'toggleAirmetModalAction',
    'parameter': MODALS.CONFIRM_DELETE.type
  },
  COPY: {
    'dataField': 'copy',
    'label': 'Copy',
    'check': 'isCopyable',
    'action': 'copyAirmetAction'
  },
  PUBLISH: {
    'dataField': 'publish',
    'label': 'Publish',
    'check': 'isPublishable',
    'action': 'toggleAirmetModalAction',
    'parameter': MODALS.CONFIRM_PUBLISH.type
  },
  CANCEL: {
    'dataField': 'cancel',
    'label': 'Cancel',
    'check': 'isCancelable',
    'action': 'toggleAirmetModalAction',
    'parameter': MODALS.CONFIRM_CANCEL.type
  }
};

const READ_ABILITIES_ORDER = [
  READ_ABILITIES.DELETE['dataField'],
  READ_ABILITIES.EDIT['dataField'],
  READ_ABILITIES.COPY['dataField'],
  READ_ABILITIES.CANCEL['dataField'],
  READ_ABILITIES.PUBLISH['dataField']
];

export const byReadAbilities = (abilityA, abilityB) => {
  return READ_ABILITIES_ORDER.indexOf(abilityA.dataField) - READ_ABILITIES_ORDER.indexOf(abilityB.dataField);
};

export const CATEGORY_REFS = {
  ACTIVE_AIRMETS: 'ACTIVE_AIRMETS',
  CONCEPT_AIRMETS: 'CONCEPT_AIRMETS',
  ADD_AIRMET: 'ADD_AIRMET',
  ARCHIVED_AIRMETS: 'ARCHIVED_AIRMETS'
};

const initialStateProps = {
  categories: [
    {
      // active-airmets
      ref: CATEGORY_REFS.ACTIVE_AIRMETS,
      title: 'Open active AIRMETs',
      icon: 'folder-open',
      abilities: {
        [AIRMET_MODES.READ]: {
          [READ_ABILITIES.CANCEL.check]: true,
          [READ_ABILITIES.DELETE.check]: false,
          [READ_ABILITIES.EDIT.check]: false,
          [READ_ABILITIES.COPY.check]: true,
          [READ_ABILITIES.PUBLISH.check]: false
        }
      }
    },
    {
      // concept-airmets
      ref: CATEGORY_REFS.CONCEPT_AIRMETS,
      title: 'Open concept AIRMETs',
      icon: 'folder-open-o',
      abilities: {
        [AIRMET_MODES.READ]: {
          [READ_ABILITIES.CANCEL.check]: false,
          [READ_ABILITIES.DELETE.check]: true,
          [READ_ABILITIES.EDIT.check]: true,
          [READ_ABILITIES.COPY.check]: true,
          [READ_ABILITIES.PUBLISH.check]: true
        },
        [AIRMET_MODES.EDIT]: {
          [EDIT_ABILITIES.CLEAR.check]: false,
          [EDIT_ABILITIES.DISCARD.check]: true,
          [EDIT_ABILITIES.SAVE.check]: true
        }
      }
    },
    {
      // add-airmets
      ref: CATEGORY_REFS.ADD_AIRMET,
      title: 'Create new AIRMET',
      icon: 'star-o',
      abilities: {
        [AIRMET_MODES.READ]: {
          [READ_ABILITIES.CANCEL.check]: false,
          [READ_ABILITIES.DELETE.check]: false,
          [READ_ABILITIES.EDIT.check]: true,
          [READ_ABILITIES.COPY.check]: false,
          [READ_ABILITIES.PUBLISH.check]: false
        },
        [AIRMET_MODES.EDIT]: {
          [EDIT_ABILITIES.CLEAR.check]: true,
          [EDIT_ABILITIES.DISCARD.check]: false,
          [EDIT_ABILITIES.PASTE.check]: true,
          [EDIT_ABILITIES.SAVE.check]: true
        }
      }
    },
    {
      // archived-airmets
      ref: CATEGORY_REFS.ARCHIVED_AIRMETS,
      title: 'Open archived AIRMETs',
      icon: 'archive',
      abilities: {
        [AIRMET_MODES.READ]: {
          [READ_ABILITIES.CANCEL.check]: false,
          [READ_ABILITIES.DELETE.check]: false,
          [READ_ABILITIES.EDIT.check]: false,
          [READ_ABILITIES.COPY.check]: true,
          [READ_ABILITIES.PUBLISH.check]: false
        }
      }
    }
  ],
  selectedAuxiliaryInfo: {
    mode: AIRMET_MODES.READ
  }
};

const STATE = safeMerge(initialStateProps, AIRMET_TEMPLATES.CONTAINER);
export const INITIAL_STATE = STATE;
