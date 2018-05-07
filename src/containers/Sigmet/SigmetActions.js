export const LOCAL_ACTION_TYPES = {
  TOGGLE_CONTAINER: 'TOGGLE_CONTAINER',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY',
  ADD_SIGMET: 'ADD_SIGMET',
  EDIT_SIGMET: 'EDIT_SIGMET'
};

export const LOCAL_ACTIONS = {
  toggleContainerAction: (evt) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CONTAINER, event: evt }),
  toggleCategoryAction: (evt, ref) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CATEGORY, event: evt, ref: ref }),
  addSigmetAction: (ref) => ({ type: LOCAL_ACTION_TYPES.ADD_SIGMET, ref: ref }),
  editSigmetAction: (uuid) => ({ type: LOCAL_ACTION_TYPES.EDIT_SIGMET, uuid: uuid })
};

export const SIGMET_STATES = {
  EDIT: 'EDIT',
  READ: 'READ',
  CANCEL: 'CANCEL'
};

export const INITIAL_STATE = {
  categories: [
    {
      title: 'Open active SIGMETs',
      ref: 'active-sigmets',
      icon: 'folder-open',
      sigmets: [],
      stageActions: {
        isEditable: false,
        isPublishable: false,
        isCancelable: true,
        isDeletable: false
      }
    },
    {
      title: 'Open concept SIGMETs',
      ref: 'concept-sigmets',
      icon: 'folder-open-o',
      sigmets: [],
      stageActions: {
        isEditable: true,
        isPublishable: true,
        isCancelable: false,
        isDeletable: true
      }
    },
    {
      title: 'Create new SIGMET',
      ref: 'add-sigmet',
      icon: 'star-o',
      sigmets: [],
      stageActions: {
        isEditable: true,
        isPublishable: false,
        isCancelable: false,
        isDeletable: true
      }
    },
    {
      title: 'Open archived SIGMETs',
      ref: 'archived-sigmets',
      icon: 'archive',
      sigmets: [],
      stageActions: {
        isEditable: false,
        isPublishable: false,
        isCancelable: false,
        isDeletable: false,
        isCloneable: false
      }
    }
  ],
  phenomena: [],
  parameters: {},
  focussedCategoryRef: null,
  focussedSigmet: {
    uuid: null,
    state: SIGMET_STATES.READ
  },
  isContainerOpen: true
};
