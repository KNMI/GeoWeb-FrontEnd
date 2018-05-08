import produce from 'immer';
import moment from 'moment';
import { SIGMET_TEMPLATES } from '../../components/Sigmet/SigmetTemplates';
import { SIGMET_MODES, LOCAL_ACTION_TYPES, CATEGORY_REFS } from './SigmetActions';

const WARN_MSG = {
  PREREQUISITES_NOT_MET: 'Not all prerequisites are met yet:'
};

/**
* Generate a 'next-half-hour-rounded now Moment object
* @return {moment} Moment-object with the current now in UTC rounded to the next half hour
*/
const getRoundedNow = () => {
  return moment().utc().minutes() < 30 ? moment().utc().startOf('hour').minutes(30) : moment().utc().startOf('hour').add(1, 'hour');
};

const toggleContainer = (evt, container) => {
  evt.preventDefault();
  container.setState(produce(container.state, draftState => {
    draftState.isContainerOpen = !draftState.isContainerOpen;
  }));
};

const toggleCategory = (evt, ref, container) => {
  evt.preventDefault();
  container.setState(produce(container.state, draftState => {
    if (ref === CATEGORY_REFS.ADD_SIGMET && ref !== draftState.focussedCategoryRef) {
      draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
    }
    draftState.focussedCategoryRef = (draftState.focussedCategoryRef === ref)
      ? ''
      : ref;
  }));
};

const updateCategory = (ref, sigmets, container) => {
  container.setState(produce(container.state, draftState => {
    const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
    if (!isNaN(categoryIndex) && categoryIndex > 0) {
      draftState.categories[categoryIndex].sigmets.length = 0;
      draftState.categories[categoryIndex].sigmets.push(...sigmets);
    }
  }));
};

const updateParameters = (parameters, container) => {
  container.setState(produce(container.state, draftState => {
    Object.assign(draftState.parameters, parameters);
  }));
};

const updatePhenomena = (phenomena, container) => {
  const SEPARATOR = '_';

  container.setState(produce(container.state, draftState => {
    if (Array.isArray(phenomena)) {
      draftState.phenomena.length = 0;
      phenomena.forEach((item) => {
        if (item.variants.length === 0) {
          const res = {
            name: item.phenomenon.name,
            code: item.phenomenon.code,
            layerpreset: item.phenomenon.layerpreset
          };
          item.additions.forEach((addition) => {
            draftState.phenomena.push({
              name: res.name + ' ' + addition.name,
              code: res.code + SEPARATOR + addition.code,
              layerpreset: item.phenomenon.layerpreset
            });
          });
          draftState.phenomena.push(res);
        } else {
          item.variants.forEach((variant) => {
            const res = {
              name: variant.name + ' ' + item.phenomenon.name.toLowerCase(),
              code: variant.code + SEPARATOR + item.phenomenon.code,
              layerpreset: item.phenomenon.layerpreset
            };
            item.additions.forEach((addition) => {
              draftState.phenomena.push({
                name: res.name + ' ' + addition.name,
                code: res.code + addition.code,
                layerpreset: item.phenomenon.layerpreset
              });
            });
            draftState.phenomena.push(res);
          });
        }
      });
    }
  }));
};

const focusSigmet = (evt, uuid, container) => {
  evt.preventDefault();
  container.setState(produce(container.state, draftState => {
    if (draftState.focussedSigmet.mode === SIGMET_MODES.EDIT) {
      console.warn('focusSigmet: switching the focus while in edit mode is not yet implemented (otherwise it will unintentionally discard changes)');
    } else {
      draftState.focussedSigmet.uuid = uuid;
      draftState.focussedSigmet.mode = SIGMET_MODES.READ;
    }
  }));
};

const addSigmet = (ref, container) => {
  if (container.state.parameters && Array.isArray(container.state.phenomena) && container.state.phenomena.length > 0) {
    const newSigmet = produce(SIGMET_TEMPLATES.SIGMET, draftState => {
      draftState.validdate = getRoundedNow().format();
      draftState.validdate_end = getRoundedNow().add(container.state.parameters.maxhoursofvalidity, 'hour').format();
      draftState.location_indicator_mwo = container.state.parameters.location_indicator_mwo;
      if (Array.isArray(container.state.parameters.firareas)) {
        draftState.location_indicator_icao = container.state.parameters.firareas[0].location_indicator_icao;
        draftState.firname = container.state.parameters.firareas[0].firname;
      }
      draftState.change = container.state.parameters.change;
    });
    container.setState(produce(container.state, draftState => {
      const categoryIndex = draftState.categories.findIndex((category) => category.ref === ref);
      if (!isNaN(categoryIndex) && categoryIndex > 0) {
        if (ref === CATEGORY_REFS.ADD_SIGMET) {
          draftState.categories[categoryIndex].sigmets.length = 0; // ensures always just one new sigmet
        }
        draftState.categories[categoryIndex].sigmets.push(newSigmet);
      }
    }));
  } else {
    !container.state.parameters
      ? console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'parameters:', container.state.parameters)
      : console.warn(WARN_MSG.PREREQUISITES_NOT_MET, 'phenomena:', container.state.phenomena);
  }
};

const updateSigmet = (uuid, dataField, value, container) => {
  container.setState(produce(container.state, draftState => {
    if (dataField) {
      let sigmetIndex = -1;
      const categoryIndex = draftState.categories.findIndex((category) => {
        sigmetIndex = category.sigmets.findIndex((sigmet) => sigmet.uuid === uuid);
        return sigmetIndex !== -1;
      });
      if (categoryIndex !== -1 && sigmetIndex !== -1) {
        if (dataField === 'phenomenon' && Array.isArray(value)) {
          if (value.length === 0) {
            value = '';
          } else {
            value = value[0].code;
          }
        }
        draftState.categories[categoryIndex].sigmets[sigmetIndex][dataField] = value;
      }
    }
  }));
  console.warn('updateSigmet is not yet implemented');
};

const clearSigmet = (event, uuid, container) => {
  console.warn('clearSigmet is not yet implemented');
};

const discardSigmet = (event, uuid, container) => {
  console.warn('discardSigmet is not yet implemented');
};

const saveSigmet = (event, uuid, container) => {
  console.warn('saveSigmet is not yet implemented');
};

const editSigmet = (event, uuid, container) => {
  container.setState(produce(container.state, draftState => {
    draftState.focussedSigmet.uuid = uuid;
    draftState.focussedSigmet.mode = SIGMET_MODES.EDIT;
  }));
};

const deleteSigmet = (event, uuid, container) => {
  console.warn('deleteSigmet is not yet implemented');
};

const copySigmet = (event, uuid, container) => {
  console.warn('copySigmet is not yet implemented');
};

const publishSigmet = (event, uuid, container) => {
  console.warn('publishSigmet is not yet implemented');
};

const cancelSigmet = (event, uuid, container) => {
  console.warn('cancelSigmet is not yet implemented');
};

/**
 * SigmetsContainer has its own state, this is the dispatch for updating the state
 * @param {object} localAction Action-object containing the type and additional, action specific, parameters
 * @param {object} state Object reference for the actual state
 * @param {component} container The component to update the state
 }}
 */
export const localDispatch = (localAction, container) => {
  switch (localAction.type) {
    case LOCAL_ACTION_TYPES.TOGGLE_CONTAINER:
      toggleContainer(localAction.event, container);
      break;
    case LOCAL_ACTION_TYPES.TOGGLE_CATEGORY:
      toggleCategory(localAction.event, localAction.ref, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_CATEGORY:
      updateCategory(localAction.ref, localAction.sigmets, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_PARAMETERS:
      updateParameters(localAction.parameters, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_PHENOMENA:
      updatePhenomena(localAction.phenomena, container);
      break;
    case LOCAL_ACTION_TYPES.FOCUS_SIGMET:
      focusSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.ADD_SIGMET:
      addSigmet(localAction.ref, container);
      break;
    case LOCAL_ACTION_TYPES.UPDATE_SIGMET:
      updateSigmet(localAction.uuid, localAction.dataField, localAction.value, container);
      break;
    case LOCAL_ACTION_TYPES.CLEAR_SIGMET:
      clearSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DISCARD_SIGMET:
      discardSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.SAVE_SIGMET:
      saveSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.EDIT_SIGMET:
      editSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.DELETE_SIGMET:
      deleteSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.COPY_SIGMET:
      copySigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.PUBLISH_SIGMET:
      publishSigmet(localAction.event, localAction.uuid, container);
      break;
    case LOCAL_ACTION_TYPES.CANCEL_SIGMET:
      cancelSigmet(localAction.event, localAction.uuid, container);
      break;
  }
};
