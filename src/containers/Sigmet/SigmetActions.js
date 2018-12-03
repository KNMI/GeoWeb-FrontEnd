import produce from 'immer';
import { SIGMET_TEMPLATES } from '../../components/Sigmet/SigmetTemplates';

export const LOCAL_ACTION_TYPES = {
  TOGGLE_CONTAINER: 'TOGGLE_CONTAINER',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  RETRIEVE_PARAMETERS: 'RETRIEVE_PARAMETERS',
  RETRIEVE_PHENOMENA: 'RETRIEVE_PHENOMENA',
  RETRIEVE_SIGMETS: 'RETRIEVE_SIGMETS',
  FOCUS_SIGMET: 'FOCUS_SIGMET',
  ADD_SIGMET: 'ADD_SIGMET',
  UPDATE_SIGMET: 'UPDATE_SIGMET',
  UPDATE_SIGMET_LEVEL: 'UPDATE_SIGMET_LEVEL',
  CLEAR_SIGMET: 'CLEAR_SIGMET',
  DISCARD_SIGMET: 'DISCARD_SIGMET',
  SAVE_SIGMET: 'SAVE_SIGMET',
  EDIT_SIGMET: 'EDIT_SIGMET',
  DELETE_SIGMET: 'DELETE_SIGMET',
  COPY_SIGMET: 'COPY_SIGMET',
  PASTE_SIGMET: 'PASTE_SIGMET',
  PUBLISH_SIGMET: 'PUBLISH_SIGMET',
  CANCEL_SIGMET: 'CANCEL_SIGMET',
  DRAW_SIGMET: 'DRAW_SIGMET',
  UPDATE_FIR: 'UPDATE_FIR',
  CREATE_FIR_INTERSECTION: 'CREATE_FIR_INTERSECTION',
  VERIFY_SIGMET: 'VERIFY_SIGMET'
};

export const LOCAL_ACTIONS = {
  toggleContainerAction: (evt) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CONTAINER, event: evt }),
  toggleCategoryAction: (evt, ref) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CATEGORY, event: evt, ref: ref }),
  retrieveParametersAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_PARAMETERS }),
  retrievePhenomenaAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_PHENOMENA }),
  retrieveSigmetsAction: () => ({ type: LOCAL_ACTION_TYPES.RETRIEVE_SIGMETS }),
  focusSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.FOCUS_SIGMET, event: evt, uuid: uuid }),
  addSigmetAction: (ref) => ({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: ref }),
  updateSigmetAction: (uuid, dataField, value) => ({ type: LOCAL_ACTION_TYPES.UPDATE_SIGMET, uuid: uuid, dataField: dataField, value: value }),
  clearSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.CLEAR_SIGMET, event: evt, uuid: uuid }),
  discardSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.DISCARD_SIGMET, event: evt, uuid: uuid }),
  saveSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.SAVE_SIGMET, event: evt, uuid: uuid }),
  editSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.EDIT_SIGMET, event: evt, uuid: uuid }),
  deleteSigmetAction: (evt) => ({ type: LOCAL_ACTION_TYPES.DELETE_SIGMET, event: evt }),
  copySigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.COPY_SIGMET, event: evt, uuid: uuid }),
  pasteSigmetAction: (evt) => ({ type: LOCAL_ACTION_TYPES.PASTE_SIGMET, event: evt }),
  publishSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.PUBLISH_SIGMET, event: evt, uuid: uuid }),
  cancelSigmetAction: (evt) => ({ type: LOCAL_ACTION_TYPES.CANCEL_SIGMET, event: evt }),
  drawAction: (evt, uuid, action, featureFunction) => ({ type: LOCAL_ACTION_TYPES.DRAW_SIGMET, uuid: uuid, event: evt, action: action, featureFunction: featureFunction }),
  updateFir: (firName) => ({ type: LOCAL_ACTION_TYPES.UPDATE_FIR, firName: firName }),
  createFirIntersectionAction: (featureId, geoJson) => ({ type: LOCAL_ACTION_TYPES.CREATE_FIR_INTERSECTION, featureId: featureId, geoJson: geoJson }),
  verifySigmetAction: (sigmetObject) => ({ type: LOCAL_ACTION_TYPES.VERIFY_SIGMET, sigmetObject: sigmetObject }),
  toggleSigmetModalAction: (evt, uuid, type) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_SIGMET_MODAL, event: evt, uuid: uuid, modalType: type })
};

export const SIGMET_MODES = {
  EDIT: 'EDIT',
  READ: 'READ'
};

export const MODAL_TYPES = {
  TYPE_CONFIRM_DELETE: 'confirm delete',
  TYPE_CONFIRM_CANCEL: 'confirm cancel',
  TYPE_CONFIRM_PUBLISH: 'confirm publish'
};

export const MODALS = {
  CONFIRM_DELETE: {
    type: MODAL_TYPES.TYPE_CONFIRM_DELETE,
    title: 'Delete SIGMET?',
    message: (identifier) => `Are you sure you want to delete ${identifier}?`,
    button: {
      label: 'Delete',
      icon: 'trash',
      action: 'deleteSigmetAction',
      arguments: null // We use uuid here, which is passed to action
    },
    toggleAction: 'toggleSigmetModalAction'
  },
  CONFIRM_CANCEL: {
    type: MODAL_TYPES.TYPE_CONFIRM_CANCEL,
    title: 'Cancel SIGMET?',
    message: (identifier) => `Are you sure you want to cancel ${identifier}?`,
    button: {
      label: 'Cancel this SIGMET',
      icon: 'times-circle',
      action: 'cancelSigmetAction',
      arguments: null // We use uuid here, which is passed to action
    },
    optional: {
      message: 'Optionally, you can indicate which adjacent FIR the Volcanic Ash is moving to:',
      options: [],
      selectedOption: null,
      action: 'updateSigmetAction',
      parameters: []
    },
    toggleAction: 'toggleSigmetModalAction'
  },
  CONFIRM_PUBLISH: {
    type: MODAL_TYPES.TYPE_CONFIRM_PUBLISH,
    title: 'Publish SIGMET?',
    message: (identifier) => `Are you sure you want to publish ${identifier}?`,
    button: {
      label: 'Publish',
      icon: 'send',
      action: 'publishSigmetAction',
      arguments: null // We use uuid here, which is passed to action
    },
    toggleAction: 'toggleSigmetModalAction'
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
    'action': 'clearSigmetAction'
  },
  DISCARD: {
    'dataField': 'discard',
    'label': 'Discard changes',
    'check': 'isDiscardable',
    'action': 'discardSigmetAction'
  },
  PASTE: {
    'dataField': 'paste',
    'label': 'Paste',
    'check': 'isPastable',
    'action': 'pasteSigmetAction'
  },
  SAVE: {
    'dataField': 'save',
    'label': 'Save',
    'check': 'isSavable',
    'action': 'saveSigmetAction'
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
    'action': 'editSigmetAction'
  },
  DELETE: {
    'dataField': 'delete',
    'label': 'Delete',
    'check': 'isDeletable',
    'action': 'toggleSigmetModalAction',
    'parameter': MODALS.CONFIRM_DELETE.type
  },
  COPY: {
    'dataField': 'copy',
    'label': 'Copy',
    'check': 'isCopyable',
    'action': 'copySigmetAction'
  },
  PUBLISH: {
    'dataField': 'publish',
    'label': 'Publish',
    'check': 'isPublishable',
    'action': 'toggleSigmetModalAction',
    'parameter': MODALS.CONFIRM_PUBLISH.type
  },
  CANCEL: {
    'dataField': 'cancel',
    'label': 'Cancel',
    'check': 'isCancelable',
    'action': 'toggleSigmetModalAction',
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
  ACTIVE_SIGMETS: 'ACTIVE_SIGMETS',
  CONCEPT_SIGMETS: 'CONCEPT_SIGMETS',
  ADD_SIGMET: 'ADD_SIGMET',
  ARCHIVED_SIGMETS: 'ARCHIVED_SIGMETS'
};

const STATE = {
  categories: [
    {
      title: 'Open active SIGMETs',
      icon: 'folder-open',
      sigmets: [],
      abilities: {}
    },
    {
      title: 'Open concept SIGMETs',
      icon: 'folder-open-o',
      sigmets: [],
      abilities: {}
    },
    {
      title: 'Create new SIGMET',
      icon: 'star-o',
      sigmets: [],
      abilities: {}
    },
    {
      title: 'Open archived SIGMETs',
      icon: 'archive',
      sigmets: [],
      abilities: {}
    }
  ],
  phenomena: [],
  parameters: {
    active_firs: [null], // string values
    firareas: {
      'pattern_^[A-Z]{4}$': {
        adjacent_firs: produce(SIGMET_TEMPLATES.ADJACENT_FIRS, () => { }),
        areapreset: null, // string
        firname: null, // string
        location_indicator_icao: null, // string
        hoursbeforevalidity: null, // number
        maxhoursofvalidity: null, // number
        tc_hoursbeforevalidity: null, // number
        tc_maxhoursofvalidity: null, // number
        va_hoursbeforevalidity: null, // number
        va_maxhoursofvalidity: null // number
      }
    },
    location_indicator_wmo: null // string
  },
  firs: {
    'pattern_^[A-Z]+[ ](FIR|UIR|CTA)$': produce(SIGMET_TEMPLATES.FEATURE, () => {})
  },
  focussedCategoryRef: null,
  selectedSigmet: [],
  selectedAuxiliaryInfo: {
    mode: SIGMET_MODES.READ,
    drawModeStart: null,
    drawModeEnd: null,
    feedbackStart: null,
    feedbackEnd: null,
    hasEdits: false,
    tacRepresentation: null // FIXME: tac is also stored in sigmet
  },
  copiedSigmetRef: null,
  isContainerOpen: true,
  displayModal: null
};

// active-sigmets
STATE.categories[0].ref = CATEGORY_REFS.ACTIVE_SIGMETS;
STATE.categories[0].abilities[SIGMET_MODES.READ] = {};
STATE.categories[0].abilities[SIGMET_MODES.READ][READ_ABILITIES.CANCEL.check] = true;
STATE.categories[0].abilities[SIGMET_MODES.READ][READ_ABILITIES.DELETE.check] = false;
STATE.categories[0].abilities[SIGMET_MODES.READ][READ_ABILITIES.EDIT.check] = false;
STATE.categories[0].abilities[SIGMET_MODES.READ][READ_ABILITIES.COPY.check] = true;
STATE.categories[0].abilities[SIGMET_MODES.READ][READ_ABILITIES.PUBLISH.check] = false;
STATE.categories[0].abilities[SIGMET_MODES.EDIT] = {};

// concept-sigmets
STATE.categories[1].ref = CATEGORY_REFS.CONCEPT_SIGMETS;
STATE.categories[1].abilities[SIGMET_MODES.READ] = {};
STATE.categories[1].abilities[SIGMET_MODES.READ][READ_ABILITIES.CANCEL.check] = false;
STATE.categories[1].abilities[SIGMET_MODES.READ][READ_ABILITIES.DELETE.check] = true;
STATE.categories[1].abilities[SIGMET_MODES.READ][READ_ABILITIES.EDIT.check] = true;
STATE.categories[1].abilities[SIGMET_MODES.READ][READ_ABILITIES.COPY.check] = true;
STATE.categories[1].abilities[SIGMET_MODES.READ][READ_ABILITIES.PUBLISH.check] = true;
STATE.categories[1].abilities[SIGMET_MODES.EDIT] = {};
STATE.categories[1].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.CLEAR.check] = false;
STATE.categories[1].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.DISCARD.check] = true;
STATE.categories[1].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.SAVE.check] = true;

// add-sigmets
STATE.categories[2].ref = CATEGORY_REFS.ADD_SIGMET;
STATE.categories[2].abilities[SIGMET_MODES.READ] = {};
STATE.categories[2].abilities[SIGMET_MODES.READ][READ_ABILITIES.CANCEL.check] = false;
STATE.categories[2].abilities[SIGMET_MODES.READ][READ_ABILITIES.DELETE.check] = false;
STATE.categories[2].abilities[SIGMET_MODES.READ][READ_ABILITIES.EDIT.check] = true;
STATE.categories[2].abilities[SIGMET_MODES.READ][READ_ABILITIES.COPY.check] = false;
STATE.categories[2].abilities[SIGMET_MODES.READ][READ_ABILITIES.PUBLISH.check] = false;
STATE.categories[2].abilities[SIGMET_MODES.EDIT] = {};
STATE.categories[2].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.CLEAR.check] = true;
STATE.categories[2].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.DISCARD.check] = false;
STATE.categories[2].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.PASTE.check] = true;
STATE.categories[2].abilities[SIGMET_MODES.EDIT][EDIT_ABILITIES.SAVE.check] = true;

// archived-sigmets
STATE.categories[3].ref = CATEGORY_REFS.ARCHIVED_SIGMETS;
STATE.categories[3].abilities[SIGMET_MODES.READ] = {};
STATE.categories[3].abilities[SIGMET_MODES.READ][READ_ABILITIES.CANCEL.check] = false;
STATE.categories[3].abilities[SIGMET_MODES.READ][READ_ABILITIES.DELETE.check] = false;
STATE.categories[3].abilities[SIGMET_MODES.READ][READ_ABILITIES.EDIT.check] = false;
STATE.categories[3].abilities[SIGMET_MODES.READ][READ_ABILITIES.COPY.check] = true;
STATE.categories[3].abilities[SIGMET_MODES.READ][READ_ABILITIES.PUBLISH.check] = false;
STATE.categories[3].abilities[SIGMET_MODES.EDIT] = {};

export const INITIAL_STATE = STATE;
