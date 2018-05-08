export const LOCAL_ACTION_TYPES = {
  TOGGLE_CONTAINER: 'TOGGLE_CONTAINER',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  UPDATE_PARAMETERS: 'UPDATE_PARAMETERS',
  UPDATE_PHENOMENA: 'UPDATE_PHENOMENA',
  ADD_SIGMET: 'ADD_SIGMET',
  EDIT_SIGMET: 'EDIT_SIGMET',
  DELETE_SIGMET: 'DELETE_SIGMET',
  COPY_SIGMET: 'COPY_SIGMET',
  PUBLISH_SIGMET: 'PUBLISH_SIGMET',
  CANCEL_SIGMET: 'CANCEL_SIGMET'
};

export const LOCAL_ACTIONS = {
  toggleContainerAction: (evt) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CONTAINER, event: evt }),
  toggleCategoryAction: (evt, ref) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CATEGORY, event: evt, ref: ref }),
  updateCategoryAction: (ref, sigmets) => ({ type: LOCAL_ACTION_TYPES.UPDATE_CATEGORY, ref: ref, sigmets: sigmets }),
  updateParametersAction: (parameters) => ({ type: LOCAL_ACTION_TYPES.UPDATE_PARAMETERS, parameters: parameters }),
  updatePhenomenaAction: (phenomena) => ({ type: LOCAL_ACTION_TYPES.UPDATE_PHENOMENA, phenomena: phenomena }),
  addSigmetAction: (ref) => ({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: ref }),
  editSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.EDIT_SIGMET, event: evt, uuid: uuid }),
  deleteSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.DELETE_SIGMET, event: evt, uuid: uuid }),
  copySigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.COPY_SIGMET, event: evt, uuid: uuid }),
  publishSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.PUBLISH_SIGMET, event: evt, uuid: uuid }),
  cancelSigmetAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.CANCEL_SIGMET, event: evt, uuid: uuid })
};

export const SIGMET_MODES = {
  EDIT: 'EDIT',
  READ: 'READ'
};

export const EDIT_ABILITIES = {
  CLEAR: {
    'dataField': 'clear',
    'check': 'isClearable'
  },
  SAVE: {
    'dataField': 'save',
    'check': 'isSavable'
  }
};

const EDIT_ABILITIES_ORDER = [
  EDIT_ABILITIES.CLEAR,
  EDIT_ABILITIES.SAVE
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
    'action': 'deleteSigmetAction'
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
    'action': 'publishSigmetAction'
  },
  CANCEL: {
    'dataField': 'cancel',
    'label': 'Cancel',
    'check': 'isCancelable',
    'action': 'cancelSigmetAction'
  }
};

const READ_ABILITIES_ORDER = [
  READ_ABILITIES.CANCEL['dataField'],
  READ_ABILITIES.DELETE['dataField'],
  READ_ABILITIES.EDIT['dataField'],
  READ_ABILITIES.COPY['dataField'],
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
  parameters: {},
  focussedCategoryRef: null,
  focussedSigmet: {
    uuid: null,
    mode: SIGMET_MODES.READ
  },
  isContainerOpen: true
};

// active-sigmets
STATE.categories[0].ref = CATEGORY_REFS.ACTIVE_SIGMETS;
STATE.categories[0].abilities[READ_ABILITIES.CANCEL.check] = true;
STATE.categories[0].abilities[READ_ABILITIES.DELETE.check] = false;
STATE.categories[0].abilities[READ_ABILITIES.EDIT.check] = false;
STATE.categories[0].abilities[READ_ABILITIES.COPY.check] = true;
STATE.categories[0].abilities[READ_ABILITIES.PUBLISH.check] = false;

// concept-sigmets
STATE.categories[1].ref = CATEGORY_REFS.CONCEPT_SIGMETS;
STATE.categories[1].abilities[READ_ABILITIES.CANCEL.check] = false;
STATE.categories[1].abilities[READ_ABILITIES.DELETE.check] = true;
STATE.categories[1].abilities[READ_ABILITIES.EDIT.check] = true;
STATE.categories[1].abilities[READ_ABILITIES.COPY.check] = true;
STATE.categories[1].abilities[READ_ABILITIES.PUBLISH.check] = true;

// add-sigmets
STATE.categories[2].ref = CATEGORY_REFS.ADD_SIGMET;
STATE.categories[2].abilities[READ_ABILITIES.CANCEL.check] = false;
STATE.categories[2].abilities[READ_ABILITIES.DELETE.check] = false;
STATE.categories[2].abilities[READ_ABILITIES.EDIT.check] = true;
STATE.categories[2].abilities[READ_ABILITIES.COPY.check] = false;
STATE.categories[2].abilities[READ_ABILITIES.PUBLISH.check] = false;

// archived-sigmets
STATE.categories[3].ref = CATEGORY_REFS.ARCHIVED_SIGMETS;
STATE.categories[3].abilities[READ_ABILITIES.CANCEL.check] = false;
STATE.categories[3].abilities[READ_ABILITIES.DELETE.check] = false;
STATE.categories[3].abilities[READ_ABILITIES.EDIT.check] = false;
STATE.categories[3].abilities[READ_ABILITIES.COPY.check] = true;
STATE.categories[3].abilities[READ_ABILITIES.PUBLISH.check] = false;

export const INITIAL_STATE = STATE;
