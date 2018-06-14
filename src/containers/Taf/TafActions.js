import { TIMESTAMP_FORMAT } from '../../components/Taf/TafTemplates';

export const LOCAL_ACTION_TYPES = {
  UPDATE_LOCATIONS: 'UPDATE_LOCATIONS',
  UPDATE_TIMESTAMPS: 'UPDATE_TIMESTAMPS',
  SELECT_TAF: 'SELECT_TAF',
  DISCARD_TAF: 'DISCARD_TAF',
  SAVE_TAF: 'SAVE_TAF',
  EDIT_TAF: 'EDIT_TAF',
  DELETE_TAF: 'DELETE_TAF',
  COPY_TAF: 'COPY_TAF',
  PUBLISH_TAF: 'PUBLISH_TAF',
  AMEND_TAF: 'AMEND_TAF',
  CORRECT_TAF: 'CORRECT_TAF',
  CANCEL_TAF: 'CANCEL_TAF'
};

export const LOCAL_ACTIONS = {
  updateLocationsAction: () => ({ type: LOCAL_ACTION_TYPES.UPDATE_LOCATIONS }),
  updateTimestampsAction: () => ({ type: LOCAL_ACTION_TYPES.UPDATE_TIMESTAMPS }),
  selectTafAction: (tafSelection) => ({ type: LOCAL_ACTION_TYPES.SELECT_TAF, selection: tafSelection }),
  discardTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.DISCARD_TAF, event: evt, uuid: uuid }),
  saveTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.SAVE_TAF, event: evt, uuid: uuid }),
  editTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.EDIT_TAF, event: evt, uuid: uuid }),
  deleteTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.DELETE_TAF, event: evt, uuid: uuid }),
  copyTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.COPY_TAF, event: evt, uuid: uuid }),
  publishTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.PUBLISH_TAF, event: evt, uuid: uuid }),
  amendTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.AMEND_TAF, event: evt, uuid: uuid }),
  correctTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.CORRECT_TAF, event: evt, uuid: uuid }),
  cancelTafAction: (evt, uuid) => ({ type: LOCAL_ACTION_TYPES.CANCEL_TAF, event: evt, uuid: uuid })
};

export const MODES = {
  EDIT: 'EDIT',
  READ: 'READ'
};

export const EDIT_ABILITIES = {
  DISCARD: {
    'dataField': 'discard',
    'label': 'Discard changes',
    'check': 'isDiscardable',
    'action': 'discardTafAction'
  },
  SAVE: {
    'dataField': 'save',
    'label': 'Save',
    'check': 'isSavable',
    'action': 'saveTafAction'
  }
};

const EDIT_ABILITIES_ORDER = [
  EDIT_ABILITIES.DISCARD,
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
    'action': 'editTafAction'
  },
  DELETE: {
    'dataField': 'delete',
    'label': 'Delete',
    'check': 'isDeletable',
    'action': 'deleteTafAction'
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
    'action': 'cancelTafAction'
  }
};

const READ_ABILITIES_ORDER = [
  READ_ABILITIES.DELETE['dataField'],
  READ_ABILITIES.EDIT['dataField'],
  READ_ABILITIES.COPY['dataField'],
  READ_ABILITIES.CANCEL['dataField'],
  READ_ABILITIES.CORRECT['dataField'],
  READ_ABILITIES.AMEND['dataField'],
  READ_ABILITIES.PUBLISH['dataField']
];

export const byReadAbilities = (abilityA, abilityB) => {
  return READ_ABILITIES_ORDER.indexOf(abilityA.dataField) - READ_ABILITIES_ORDER.indexOf(abilityB.dataField);
};

export const STATUSES = {
  PUBLISHED: 'PUBLISHED',
  CONCEPT: 'CONCEPT'
};

export const LIFECYCLE_STAGE_NAMES = {
  NORMAL: 'NORMAL',
  AMENDMENT: 'AMENDMENT',
  CORRECTION: 'CORRECTION',
  RETARDED: 'RETARDED',
  CANCEL: 'CANCEL',
  MISSING: 'MISSING'
};

export const LIFECYCLE_STAGES = [
  { stage: LIFECYCLE_STAGE_NAMES.NORMAL, label: 'ORG' },
  { stage: LIFECYCLE_STAGE_NAMES.AMENDMENT, label: 'AMD' },
  { stage: LIFECYCLE_STAGE_NAMES.CORRECTION, label: 'COR' },
  { stage: LIFECYCLE_STAGE_NAMES.RETARDED, label: 'RTD' },
  { stage: LIFECYCLE_STAGE_NAMES.CANCEL, label: 'CNL' },
  { stage: LIFECYCLE_STAGE_NAMES.MISSING, label: 'NIL' }
];

const STATE = {
  locations: [],
  timestamps: {},
  selectableTafs: [],
  selectedTaf: null,
  mode: null
};

export const INITIAL_STATE = STATE;

/** Gets example data
 * @param {moment} start The start of the validity
 * @param {string} location The location code
 * @param {string} status The status code
 * @returns Response data
 */
export const getExample = (start, location, status) => ({
  data: {
    ntafs: 1,
    tafs: [
      {
        'metadata': {
          'issueTime': status === STATUSES.PUBLISHED ? start.clone().subtract(1, 'hour').format(TIMESTAMP_FORMAT) : null,
          'validityStart': start.format(TIMESTAMP_FORMAT),
          'validityEnd': start.clone().add(30, 'hour').format(TIMESTAMP_FORMAT),
          'status': status,
          'type': 'normal',
          'location': location,
          'modified': start.clone().subtract(1, 'hour').format(TIMESTAMP_FORMAT),
          'author': 'Met1'
        },
        'forecast': {
          'wind': {
            'direction': 200,
            'speed': 15,
            'gusts': 25,
            'unit': 'KT'
          },
          'caVOK': true
        },
        'changegroups': [{
          'changeType': 'BECMG',
          'changeStart': start.clone().add(2, 'hour').format(TIMESTAMP_FORMAT),
          'changeEnd': start.clone().add(7, 'hour').format(TIMESTAMP_FORMAT),
          'forecast': {
            'weather': [],
            'clouds': [{
              'amount': 'SCT',
              'height': 20,
              'mod': null
            }],
            'visibility': {
              'value': 9000,
              'unit': 'M'
            },
            'wind': {
              'direction': 220,
              'speed': 17,
              'gusts': 27,
              'unit': 'KT'
            }
          }
        }, {
          'changeType': 'PROB30 TEMPO',
          'changeStart': start.clone().add(9, 'hour').format(TIMESTAMP_FORMAT),
          'changeEnd': start.clone().add(11, 'hour').format(TIMESTAMP_FORMAT),
          'forecast': {
            'weather': [{
              'qualifier': 'moderate',
              'descriptor': 'thunderstorm',
              'phenomena': ['rain']
            }],
            'clouds': [{
              'amount': 'BKN',
              'height': 15,
              'mod': 'CB'
            }, {
              'amount': 'OVC',
              'height': 20,
              'mod': null
            }],
            'visibility': {
              'value': 3000,
              'unit': 'M'
            },
            'wind': {
              'direction': 'VRB',
              'speed': 25,
              'gusts': 38,
              'unit': 'KT'
            }
          }
        }, {
          'changeType': 'TEMPO',
          'changeStart': start.clone().add(12, 'hour').format(TIMESTAMP_FORMAT),
          'changeEnd': start.clone().add(16, 'hour').format(TIMESTAMP_FORMAT),
          'forecast': {
            'weather': [{
              'qualifier': 'moderate',
              'descriptor': 'freezing',
              'phenomena': ['fog']
            }]
          }
        }]
      }
    ]
  }
});
