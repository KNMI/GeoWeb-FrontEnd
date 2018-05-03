export const LOCAL_ACTION_TYPES = {
  TOGGLE_CONTAINER: 'TOGGLE_CONTAINER',
  TOGGLE_CATEGORY: 'TOGGLE_CATEGORY'
};

export const LOCAL_ACTIONS = {
  toggleContainerAction: (evt) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CONTAINER, event: evt }),
  toggleCategoryAction: (evt, ref) => ({ type: LOCAL_ACTION_TYPES.TOGGLE_CATEGORY, event: evt, ref: ref })
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
      allowedActions: {
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
      allowedActions: {
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
      allowedActions: {
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
      allowedActions: {
        isEditable: false,
        isPublishable: false,
        isCancelable: false,
        isDeletable: false
      }
    }
  ],
  phenomena: [],
  parameters: {},
  focussedCategoryRef: 'add-sigmet',
  focussedSigmet: {
    uuid: '',
    state: SIGMET_STATES.READ
  },
  isContainerOpen: true
};
