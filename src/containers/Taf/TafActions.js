export const LOCAL_ACTION_TYPES = {
  UPDATE_LOCATIONS: 'UPDATE_LOCATIONS',
  UPDATE_TIMESTAMPS: 'UPDATE_TIMESTAMPS',
  UPDATE_TAFS: 'UPDATE_TAFS',
  UPDATE_FEEDBACK: 'UPDATE_FEEDBACK',
  SELECT_TAF: 'SELECT_TAF',
  DISCARD_TAF: 'DISCARD_TAF',
  SAVE_TAF: 'SAVE_TAF',
  EDIT_TAF: 'EDIT_TAF',
  DELETE_TAF: 'DELETE_TAF',
  COPY_TAF: 'COPY_TAF',
  PASTE_TAF: 'PASTE_TAF',
  PUBLISH_TAF: 'PUBLISH_TAF',
  AMEND_TAF: 'AMEND_TAF',
  CORRECT_TAF: 'CORRECT_TAF',
  CANCEL_TAF: 'CANCEL_TAF',
  ADD_TAF_ROW: 'ADD_TAF_ROW',
  REMOVE_TAF_ROW: 'REMOVE_TAF_ROW',
  REORDER_TAF_ROW: 'REORDER_TAF_ROW',
  UPDATE_TAF_FIELDS: 'UPDATE_TAF_FIELDS',
  UPDATE_TAC: 'UPDATE_TAC',
  VALIDATE_TAF: 'VALIDATE_TAF',
  TOGGLE_TAF_MODAL: 'TOGGLE_TAF_MODAL'
};

export const LOCAL_ACTIONS = {
  updateLocationsAction: () => ({ type: LOCAL_ACTION_TYPES.UPDATE_LOCATIONS }),
  updateTimestampsAction: () => ({ type: LOCAL_ACTION_TYPES.UPDATE_TIMESTAMPS }),
  updateTafsAction: () => ({ type: LOCAL_ACTION_TYPES.UPDATE_TAFS }),
  updateFeedbackAction: (title, status, category, subTitle, list) => ({ type: LOCAL_ACTION_TYPES.UPDATE_FEEDBACK, title: title, status: status, category: category, subTitle: subTitle, list: list }),
  selectTafAction: (tafSelection) => ({ type: LOCAL_ACTION_TYPES.SELECT_TAF, selection: tafSelection }),
  discardTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.DISCARD_TAF, event: evt }),
  switchTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.SWITCH_TAF, event: evt }),
  saveTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.SAVE_TAF, event: evt }),
  editTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.EDIT_TAF, event: evt }),
  deleteTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.DELETE_TAF, event: evt }),
  copyTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.COPY_TAF, event: evt }),
  pasteTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.PASTE_TAF, event: evt }),
  publishTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.PUBLISH_TAF, event: evt }),
  amendTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.AMEND_TAF, event: evt }),
  correctTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.CORRECT_TAF, event: evt }),
  cancelTafAction: (evt) => ({ type: LOCAL_ACTION_TYPES.CANCEL_TAF, event: evt }),
  addTafRowAction: (rowIndex) => ({ type: LOCAL_ACTION_TYPES.ADD_TAF_ROW, rowIndex: rowIndex }),
  removeTafRowAction: (rowIndex) => ({ type: LOCAL_ACTION_TYPES.REMOVE_TAF_ROW, rowIndex: rowIndex }),
  reorderTafRowAction: (affectedIndex, newIndexValue) => ({ type: LOCAL_ACTION_TYPES.REORDER_TAF_ROW, affectedIndex: affectedIndex, newIndexValue: newIndexValue }),
  updateTafFieldsAction: (valuesAtPaths) => ({ type: LOCAL_ACTION_TYPES.UPDATE_TAF_FIELDS, valuesAtPaths: valuesAtPaths }),
  updateTACAction: (TAC) => ({ type: LOCAL_ACTION_TYPES.UPDATE_TAC, TAC: TAC }),
  validateTafAction: (tafObject) => ({ type: LOCAL_ACTION_TYPES.VALIDATE_TAF, tafObject: tafObject }),
  toggleTafModalAction: (evt, type) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_TAF_MODAL, event: evt, modalType: type })
};

export const MODES = {
  EDIT: 'EDIT',
  READ: 'READ'
};

export const MODALS = {
  CONFIRM_DELETE: {
    type: 'confirm delete',
    title: 'Delete TAF?',
    message: (identifier) => `Are you sure you want to delete ${identifier}?`,
    button: {
      label: 'Delete',
      icon: 'trash',
      action: 'deleteTafAction'
    },
    toggleAction: 'toggleTafModalAction'
  },
  CONFIRM_CANCEL: {
    type: 'confirm cancel',
    title: 'Cancel TAF?',
    message: (identifier) => `Are you sure you want to cancel ${identifier}?`,
    button: {
      label: 'Cancel this TAF',
      icon: 'times-circle',
      action: 'cancelTafAction'
    },
    toggleAction: 'toggleTafModalAction'
  },
  CONFIRM_DISCARD: {
    type: 'confirm discard',
    title: 'Discard TAF?',
    message: (identifier) => `Are you sure you want to discard ${identifier}?`,
    button: {
      label: 'Discard',
      icon: 'ban',
      action: 'discardTafAction'
    },
    toggleAction: 'toggleTafModalAction'
  },
  CONFIRM_SWITCH: {
    type: 'confirm switch',
    title: 'Switch to another TAF?',
    message: (identifier) => `Switching to another TAF will discard unsaved changes. Are you sure you want to switch?`,
    button: {
      label: 'Switch',
      icon: 'exchange',
      action: 'switchTafAction'
    },
    toggleAction: 'toggleTafModalAction'
  }
};

export const EDIT_ABILITIES = {
  DISCARD: {
    'dataField': 'discard',
    'label': 'Discard',
    'check': 'isDiscardable',
    'action': 'toggleTafModalAction',
    'parameter': MODALS.CONFIRM_DISCARD.type
  },
  PASTE: {
    'dataField': 'paste',
    'label': 'Paste',
    'check': 'isPastable',
    'action': 'pasteTafAction'
  },
  SAVE: {
    'dataField': 'save',
    'label': 'Save',
    'check': 'isSavable',
    'action': 'saveTafAction'
  }
};

const EDIT_ABILITIES_ORDER = [
  EDIT_ABILITIES.PASTE['dataField'],
  EDIT_ABILITIES.DISCARD['dataField'],
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
    'action': 'editTafAction'
  },
  DELETE: {
    'dataField': 'delete',
    'label': 'Delete',
    'check': 'isDeletable',
    'action': 'toggleTafModalAction',
    'parameter': MODALS.CONFIRM_DELETE.type
  },
  COPY: {
    'dataField': 'copy',
    'label': 'Copy',
    'check': 'isCopyable',
    'action': 'copyTafAction'
  },
  PUBLISH: {
    'dataField': 'publish',
    'label': 'Publish',
    'check': 'isPublishable',
    'action': 'publishTafAction'
  },
  AMEND: {
    'dataField': 'amend',
    'label': 'Amend',
    'check': 'isAmendable',
    'action': 'amendTafAction'
  },
  CORRECT: {
    'dataField': 'correct',
    'label': 'Correct',
    'check': 'isCorrectable',
    'action': 'correctTafAction'
  },
  CANCEL: {
    'dataField': 'cancel',
    'label': 'Cancel',
    'check': 'isCancelable',
    'action': 'toggleTafModalAction',
    'parameter': MODALS.CONFIRM_CANCEL.type
  }
};

const READ_ABILITIES_ORDER = [
  READ_ABILITIES.DELETE['dataField'],
  READ_ABILITIES.COPY['dataField'],
  READ_ABILITIES.EDIT['dataField'],
  READ_ABILITIES.CANCEL['dataField'],
  READ_ABILITIES.CORRECT['dataField'],
  READ_ABILITIES.AMEND['dataField'],
  READ_ABILITIES.PUBLISH['dataField']
];

export const byReadAbilities = (abilityA, abilityB) => {
  return READ_ABILITIES_ORDER.indexOf(abilityA.dataField) - READ_ABILITIES_ORDER.indexOf(abilityB.dataField);
};

export const STATUSES = {
  PUBLISHED: 'published',
  CONCEPT: 'concept',
  NEW: 'new'
};

export const LIFECYCLE_STAGE_NAMES = {
  NORMAL: 'normal',
  AMENDMENT: 'amendment',
  CORRECTION: 'correction',
  RETARDED: 'retarded',
  CANCELED: 'canceled',
  MISSING: 'missing'
};

export const LIFECYCLE_STAGES = [
  { stage: LIFECYCLE_STAGE_NAMES.NORMAL, label: 'ORG' },
  { stage: LIFECYCLE_STAGE_NAMES.AMENDMENT, label: 'AMD' },
  { stage: LIFECYCLE_STAGE_NAMES.CORRECTION, label: 'COR' },
  { stage: LIFECYCLE_STAGE_NAMES.RETARDED, label: 'RTD' },
  { stage: LIFECYCLE_STAGE_NAMES.CANCELED, label: 'CNL' },
  { stage: LIFECYCLE_STAGE_NAMES.MISSING, label: 'NIL' }
];

export const FEEDBACK_STATUSES = {
  INFO: 'info',
  SUCCESS: 'success',
  ERROR: 'danger'
};

export const FEEDBACK_CATEGORIES = {
  VALIDATION: 'validation',
  LIFECYCLE: 'lifecycle'
};

const STATE = {
  locations: [],
  timestamps: {},
  selectableTafs: [],
  selectedTaf: null,
  copiedTafRef: null,
  feedback: {},
  mode: MODES.READ,
  abilitiesPerStatus: [
    {
      ref: STATUSES.NEW,
      abilities: {}
    },
    {
      ref: STATUSES.CONCEPT,
      abilities: {}
    },
    {
      ref: STATUSES.PUBLISHED,
      abilities: {}
    }
  ],
  displayModal: null
};
STATE.feedback[FEEDBACK_CATEGORIES.VALIDATION] = null;
STATE.feedback[FEEDBACK_CATEGORIES.LIFECYCLE] = null;

// New TAFs
STATE.abilitiesPerStatus[0].abilities[MODES.READ] = {};
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.DELETE.check] = false;
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.EDIT.check] = true;
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.COPY.check] = false;
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.CANCEL.check] = false;
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.CORRECT.check] = false;
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.AMEND.check] = false;
STATE.abilitiesPerStatus[0].abilities[MODES.READ][READ_ABILITIES.PUBLISH.check] = false;
STATE.abilitiesPerStatus[0].abilities[MODES.EDIT] = {};
STATE.abilitiesPerStatus[0].abilities[MODES.EDIT][EDIT_ABILITIES.DISCARD.check] = true;
STATE.abilitiesPerStatus[0].abilities[MODES.EDIT][EDIT_ABILITIES.PASTE.check] = true;
STATE.abilitiesPerStatus[0].abilities[MODES.EDIT][EDIT_ABILITIES.SAVE.check] = true;

// Concept TAFs
STATE.abilitiesPerStatus[1].abilities[MODES.READ] = {};
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.DELETE.check] = true;
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.EDIT.check] = true;
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.COPY.check] = true;
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.CANCEL.check] = false;
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.CORRECT.check] = false;
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.AMEND.check] = false;
STATE.abilitiesPerStatus[1].abilities[MODES.READ][READ_ABILITIES.PUBLISH.check] = true;
STATE.abilitiesPerStatus[1].abilities[MODES.EDIT] = {};
STATE.abilitiesPerStatus[1].abilities[MODES.EDIT][EDIT_ABILITIES.DISCARD.check] = true;
STATE.abilitiesPerStatus[1].abilities[MODES.EDIT][EDIT_ABILITIES.PASTE.check] = false;
STATE.abilitiesPerStatus[1].abilities[MODES.EDIT][EDIT_ABILITIES.SAVE.check] = true;

// Published TAFs
STATE.abilitiesPerStatus[2].abilities[MODES.READ] = {};
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.DELETE.check] = false;
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.EDIT.check] = false;
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.COPY.check] = true;
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.CANCEL.check] = true;
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.CORRECT.check] = true;
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.AMEND.check] = true;
STATE.abilitiesPerStatus[2].abilities[MODES.READ][READ_ABILITIES.PUBLISH.check] = false;
STATE.abilitiesPerStatus[2].abilities[MODES.EDIT] = {};

export const INITIAL_STATE = STATE;
