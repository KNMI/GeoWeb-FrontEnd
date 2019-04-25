import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Enum from 'es6-enum';
import TimeSchedule from '../TimeSchedule';
import ActionSection from './ActionSection';
import FeedbackSection from './FeedbackSection';
import {
  TAF_TEMPLATES, TAF_TYPES, CHANGE_TYPES, CHANGE_TYPES_ORDER, CHANGE_TYPES_SHORTHAND, getChangeType,
  PHENOMENON_TYPES, PHENOMENON_TYPES_ORDER, getPhenomenonType, getPhenomenonLabel
} from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import { Button, Row, Col } from 'reactstrap';
import { jsonToTacForWind, jsonToTacForWeather, jsonToTacForClouds } from './TafFieldsConverter';
import TafTable from './TafTable';
import TacView from './TacView';
import { debounce } from '../../utils/debounce';
import {
  MODES, READ_ABILITIES, EDIT_ABILITIES, byEditAbilities, byReadAbilities, LIFECYCLE_STAGE_NAMES,
  FEEDBACK_STATUSES, FEEDBACK_CATEGORIES
} from '../../containers/Taf/TafActions';
const TMP = '◷';

const MOVE_DIRECTION = Enum(
  'UP',
  'RIGHT',
  'DOWN',
  'LEFT',
  'DOWN_BEGINNING'
);

/**
 * Taf is the component which renders an editable and sortable TAF table.
 * The UI is generated from a TAF JSON and it can generate/update TAF JSON from user input
 *
 * The component hierarchy is structured as follows:
 *
 *                                 BaseForecast -> \
 *                                                   --> TafTable -> Taf -> TafContainer
 *     ChangeGroup(s) -> SortableChangeGroup(s) -> /
 *
 */
class Taf extends Component {
  constructor (props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.registerElement = this.registerElement.bind(this);
    this.getDisabledFlag = this.getDisabledFlag.bind(this);
    this.reduceAbilities = this.reduceAbilities.bind(this);
    this.setFocus = this.setFocus.bind(this);
    this.moveFocus = this.moveFocus.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.extractScheduleInformation = this.extractScheduleInformation.bind(this);
    this.serializePhenomenonValue = this.serializePhenomenonValue.bind(this);
    this.serializeWindObjectValue = this.serializeWindObjectValue.bind(this);
    this.serializeCloudsArray = this.serializeCloudsArray.bind(this);
    this.serializeWeatherArray = this.serializeWeatherArray.bind(this);
    this.byPhenomenonType = this.byPhenomenonType.bind(this);
    this.byStartAndChangeType = this.byStartAndChangeType.bind(this);
    this.validateTafDebounced = debounce(this.validateTafDebounced.bind(this), 250, false);

    const initialState = {
      focusedFieldName: 'forecast-wind',
      preset: {
        forPhenomenon: null,
        inWindow: null
      }
    };
    this.state = initialState;
    this.register = [];
  };

  validateTafDebounced (tafAsObject) {
    const { dispatch, actions } = this.props;
    if (!actions) return;
    dispatch(actions.validateTafAction(tafAsObject));
  }

  /**
   * Comparator: Compares series by phenomenon type, in ascending order
   * @param {object} seriesA An series with a string as label property
   * @param {object} seriesB Another series with a string as label property
   * @return {number} The order of the entries
   */
  byPhenomenonType (seriesA, seriesB) {
    let labelA = seriesA.label;
    const tmpIndexA = labelA.indexOf(TMP);
    labelA = labelA.substring(0, tmpIndexA !== -1 ? tmpIndexA : labelA.length);
    let labelB = seriesB.label;
    const tmpIndexB = labelB.indexOf(TMP);
    labelB = labelB.substring(0, tmpIndexB !== -1 ? tmpIndexB : labelB.length);
    const typeAindex = PHENOMENON_TYPES_ORDER.indexOf(getPhenomenonType(labelA));
    const typeBindex = PHENOMENON_TYPES_ORDER.indexOf(getPhenomenonType(labelB));
    return typeBindex < typeAindex
      ? 1
      : typeBindex > typeAindex
        ? -1
        : 0;
  }

  /**
   * Comparator: Compares items by start and change type, in ascending order
   * @param {object} itemA An item with a string as property 'changeStart' and a string as property 'changeType'
   * @param {object} itemB Another item with a string as property 'changeStart' and a string as property 'changeType'
   * @return {number} The result of the comparison
   */
  byStartAndChangeType (itemA, itemB) {
    const startA = moment.utc(itemA.changeStart);
    const startB = moment.utc(itemB.changeStart);
    // Checks for startA/B.isValid()
    const typeAindex = CHANGE_TYPES_ORDER.indexOf(getChangeType(itemA.changeType));
    const typeBindex = CHANGE_TYPES_ORDER.indexOf(getChangeType(itemB.changeType));
    return startB.isBefore(startA)
      ? 1
      : startB.isAfter(startA)
        ? -1
        : typeBindex < typeAindex
          ? 1
          : typeBindex > typeAindex
            ? -1
            : 0;
  }

  /**
   * Maps the wind object value into a presentable form
   * @param {object} value The wind object to present
   * @return {string} A readable presentation of the phenomenon value
   */
  serializeWindObjectValue (value) {
    if (value && typeof value === 'object' && value.hasOwnProperty('direction') &&
      (typeof value.direction === 'number' || (typeof value.direction === 'string' && value.direction === 'VRB')) &&
      value.hasOwnProperty('speed') && typeof value.speed === 'number') {
      return jsonToTacForWind(value);
    } else {
      return null;
    }
  }

  /**
   * Maps the clouds array value into a presentable form
   * @param {array} value The clouds array to present
   * @return {string} A readable presentation of the phenomenon value
   */
  serializeCloudsArray (value) {
    if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object' && value[0].hasOwnProperty('amount') && typeof value[0].amount === 'string') {
      return value.map((cloud, index) => {
        return jsonToTacForClouds(cloud);
      }).join(', ');
    } else {
      return null;
    }
  }

  /**
   * Maps the weather array value into a presentable string
   * @param {array} value The weather array to present
   * @return {string} A readable presentation of the phenomenon value
   */
  serializeWeatherArray (value) {
    if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === 'object' &&
      value[0].hasOwnProperty('phenomena') && Array.isArray(value[0].phenomena) && value[0].phenomena.length > 0 && value[0].phenomena[0] !== null) {
      return value.map((weather, index) => {
        return jsonToTacForWeather(weather);
      }).join(', ');
    } else {
      return null;
    }
  }

  /**
   * Maps the data in the phenomenon-value object into a presentable form
   * @param {string} phenomenonType The type of the phenomenon
   * @param {object} phenomenonValueObject The phenomenon-value object to map (i.e. to serialize)
   * @return {React.Component} A component with a readable presentation of the phenomenon value
   */
  serializePhenomenonValue (phenomenonType, phenomenonValueObject) {
    switch (getPhenomenonType(phenomenonType)) {
      case PHENOMENON_TYPES.WIND:
        if (phenomenonValueObject && typeof phenomenonValueObject === 'object') {
          return this.serializeWindObjectValue(phenomenonValueObject);
        }
        return null;
      case PHENOMENON_TYPES.CAVOK:
        if (typeof phenomenonValueObject === 'boolean' && phenomenonValueObject) {
          return 'CaVOK';
        }
        return null;
      case PHENOMENON_TYPES.VISIBILITY:
        if (phenomenonValueObject && typeof phenomenonValueObject === 'object' && phenomenonValueObject.hasOwnProperty('value') &&
          typeof phenomenonValueObject.value === 'number' &&
          !isNaN(phenomenonValueObject.value)) {
          return phenomenonValueObject.value.toString().padStart(4, '0');
        }
        return null;
      case PHENOMENON_TYPES.WEATHER:
        if (typeof phenomenonValueObject === 'string') {
          return phenomenonValueObject;
        } else if (Array.isArray(phenomenonValueObject)) {
          return this.serializeWeatherArray(phenomenonValueObject);
        }
        return null;
      case PHENOMENON_TYPES.CLOUDS:
        if (typeof phenomenonValueObject === 'string') {
          return phenomenonValueObject;
        } else if (Array.isArray(phenomenonValueObject)) {
          return this.serializeCloudsArray(phenomenonValueObject);
        }
        return null;
      case PHENOMENON_TYPES.VERTICAL_VISIBILITY:
        if (typeof phenomenonValueObject === 'number') {
          return phenomenonValueObject.toString().padStart(3, '0');
        }
        return null;
      default: return null;
    }
  }

  /**
   * Extract the schedule information from the TAF data
   * @param {object} tafData The object containing the TAF data
   * @return {array} The schedule information as an array of schedule items
   */
  extractScheduleInformation (tafData) {
    const scheduleSeries = [];
    const scopeStart = moment.utc(tafData.metadata.validityStart);
    const scopeEnd = moment.utc(tafData.metadata.validityEnd);
    Object.entries(tafData.forecast || {}).forEach((entry) => {
      const value = this.serializePhenomenonValue(entry[0], entry[1], null);
      if (value !== null) {
        scheduleSeries.push({
          label: entry[0],
          isLabelVisible: true,
          ranges: [{
            start: scopeStart,
            end: scopeEnd,
            value: value,
            styles: []
          }]
        });
      }
    });

    tafData.changegroups.slice(0).sort(this.byStartAndChangeType).map(change => {
      const changeType = getChangeType(change.changeType);
      const fallbackValue = scopeStart.clone().subtract(1, 'hour');

      const start = change.changeStart && !change.changeStart.hasOwnProperty('fallback')
        ? moment.utc(change.changeStart)
        : fallbackValue;

      // FM only has a change start, and persists until scope end
      const end = changeType === CHANGE_TYPES.FM
        ? (start !== fallbackValue
          ? scopeEnd
          : fallbackValue)
        : (change.changeEnd && !change.changeEnd.hasOwnProperty('fallback')
          ? moment.utc(change.changeEnd)
          : fallbackValue);
      if (!end.isAfter(start)) {
        return;
      }

      // What to do in this case?
      if (!change.forecast) {
        return;
      }

      Object.entries(change.forecast).forEach((entry) => {
        let value = this.serializePhenomenonValue(entry[0], entry[1]);
        if (value !== null) {
          const type = getPhenomenonType(entry[0]);
          const labelSuffix = (changeType !== CHANGE_TYPES.FM && changeType !== CHANGE_TYPES.BECMG) ? TMP : '';
          const label = getPhenomenonLabel(type) + labelSuffix;

          // Correct overlappings
          if (changeType === CHANGE_TYPES.FM || changeType === CHANGE_TYPES.BECMG) {
            const exclusiveTypes = [type];
            if (type === PHENOMENON_TYPES.CAVOK) {
              exclusiveTypes.push(
                PHENOMENON_TYPES.VISIBILITY,
                PHENOMENON_TYPES.VERTICAL_VISIBILITY,
                PHENOMENON_TYPES.CLOUDS
              );
            } else if (type === PHENOMENON_TYPES.VISIBILITY || type === PHENOMENON_TYPES.VERTICAL_VISIBILITY || type === PHENOMENON_TYPES.CLOUDS) {
              exclusiveTypes.push(
                PHENOMENON_TYPES.CAVOK
              );
            }

            exclusiveTypes.forEach((exclusiveType) => {
              const exclusiveSeriesIndex = scheduleSeries.findIndex(serie => serie.label === getPhenomenonLabel(exclusiveType));
              if (exclusiveSeriesIndex !== -1) {
                scheduleSeries[exclusiveSeriesIndex].ranges.forEach(range => {
                  if (start.isSameOrBefore(range.end) && end.isSameOrAfter(range.start)) {
                    // it does overlap!
                    if (start.isSameOrBefore(range.start)) {
                      // two options:
                      //   * end >= range.end: fully includes / overrides previous range => set duration to 0
                      //   * end < range.end: there's a remainder at the end, but FM and BECMG changes are persistent => set duration to 0
                      range.end = range.start;
                      if (changeType === CHANGE_TYPES.BECMG && start.isSame(range.start)) {
                        const prevValue = type === PHENOMENON_TYPES.CAVOK ? '-' : range.value;
                        value = `${prevValue}\u2026 ${this.serializePhenomenonValue(entry[0], entry[1])}`; // \u2026 horizontal ellipsis
                      }
                    } else {
                      // there's a remainder at the start
                      range.end = moment.max(start, range.start);
                    }
                  }
                });
              }
            });
          }

          let seriesIndex = scheduleSeries.findIndex(serie => serie.label === label);
          // Append to the series
          if (seriesIndex !== -1) {
            scheduleSeries[seriesIndex].ranges.push({
              start: start,
              end: end,
              value: value,
              prefix: CHANGE_TYPES_SHORTHAND[changeType],
              styles: [changeType === CHANGE_TYPES.BECMG ? 'striped' : (changeType === CHANGE_TYPES.PROB30 || changeType === CHANGE_TYPES.PROB40) ? 'split' : null]
            });
          } else { // Create a new series
            seriesIndex = scheduleSeries.push({
              label: label,
              isLabelVisible: labelSuffix.length === 0 || scheduleSeries.findIndex(serie => serie.label === entry[0]) === -1,
              ranges: [{
                start: start,
                end: end,
                value: value,
                prefix: CHANGE_TYPES_SHORTHAND[changeType],
                styles: [changeType === CHANGE_TYPES.BECMG ? 'striped' : changeType === CHANGE_TYPES.PROB30 || changeType === CHANGE_TYPES.PROB40 ? 'split' : null]
              }]
            }) - 1; // push returns the length, but the last index is needed
          }
          // For BECMG after the changing period, the value is persistent
          if (changeType === CHANGE_TYPES.BECMG) {
            scheduleSeries[seriesIndex].ranges.push({
              start: end,
              end: scopeEnd,
              value: this.serializePhenomenonValue(entry[0], entry[1]),
              styles: []
            });
          }
        }
      });
    });
    scheduleSeries.sort(this.byPhenomenonType);
    return scheduleSeries;
  }

  /**
   * Responds to key releases when TafTable is in focus
   * @param {KeyboardEvent} keyboardEvent The KeyboardEvent that has been fired
   */
  onKeyUp (keyboardEvent) {
    const { dispatch, actions } = this.props;
    if (keyboardEvent.type === 'keyup') {
      switch (keyboardEvent.key) {
        case 'Enter':
          if (keyboardEvent.target && typeof keyboardEvent.target.name === 'string') { // hasOwnPropery seems not working properly on HTMLElement-objects
            const nameParts = keyboardEvent.target.name.split('-');
            if (nameParts[0] === 'changegroups' && !isNaN(nameParts[1])) {
              const rowIndex = parseInt(nameParts[1]) + 1;
              dispatch(actions.addTafRowAction(rowIndex));
            } else {
              dispatch(actions.addTafRowAction());
            }
            this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.DOWN_BEGINNING);
          }
          break;
        case 'Escape':
          keyboardEvent.target.blur();
          break;
        default:
          break;
      }
    }
  }

  /**
   * Responds to key presses when TafTable is in focus
   * @param {KeyboardEvent} keyboardEvent The KeyboardEvent that has been fired
   */
  onKeyDown (keyboardEvent) {
    const { dispatch, actions } = this.props;
    if (keyboardEvent.type === 'keydown') {
      switch (keyboardEvent.key) {
        case 'ArrowUp':
          this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.UP);
          break;
        case 'ArrowRight':
        case 'Tab':
          if (!keyboardEvent.target.value || (keyboardEvent.target.selectionStart === keyboardEvent.target.value.length)) {
            if (keyboardEvent.shiftKey) {
              this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.LEFT);
            } else {
              this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.RIGHT);
            }
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
          }
          break;
        case 'ArrowDown':
          this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.DOWN);
          break;
        case 'ArrowLeft':
          if (!keyboardEvent.target.value || (keyboardEvent.target.selectionStart === 0)) {
            this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.LEFT);
            keyboardEvent.preventDefault();
            keyboardEvent.stopPropagation();
          }
          break;
        case 'Delete':
          /* When pressing shift delete, the current changegroup will be deleted */
          if (keyboardEvent.shiftKey) {
            const currentField = this.state.fieldToFocusOn ? this.state.fieldToFocusOn : this.state.focusedFieldName;
            if (currentField) {
              if (currentField.startsWith('changegroups-')) {
                let nameParts = currentField.split('-');
                const currentChangeGroupIndex = parseInt(nameParts[1]);
                if (currentChangeGroupIndex >= 0) {
                  dispatch(actions.removeTafRowAction(currentChangeGroupIndex));
                  nameParts[1] = parseInt(nameParts[1]) - 1; if (nameParts[1] < 0) nameParts[1] = 0;
                  this.setFocus(nameParts.join('-'));
                  keyboardEvent.preventDefault();
                  keyboardEvent.stopPropagation();
                }
              }
            }
          }
          break;
        default:
          break;
      }
    }
  }

  /**
   * Event handler which handles click events
   * @param  {ClickEvent} event The click event which occurred
   */
  onClick (event) {
    const { dispatch, actions } = this.props;
    const { focusedFieldName } = this.state;
    if (event.type === 'click' && 'name' in event.target && typeof event.target.name === 'string') { // hasOwnPropery seems not working properly on HTMLElement-objects
      if (event.target.name === 'addible') {
        const nameParts = focusedFieldName.split('-');
        if (nameParts[0] === 'changegroups' && !isNaN(nameParts[1])) {
          const rowIndex = parseInt(nameParts[1]) + 1;
          dispatch(actions.addTafRowAction(rowIndex));
        } else {
          dispatch(actions.addTafRowAction());
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.target.name.endsWith('removable')) {
        const nameParts = event.target.name.split('-');
        if (nameParts.length > 1 && nameParts[1] >= 0) {
          const rowIndex = parseInt(nameParts[1]);
          dispatch(actions.removeTafRowAction(rowIndex));
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      this.setFocus(event.target.name);
    }
  }

  /**
   * Event handler to handle focus events
   * @param  {FocusEvent} focusEvent The focus event which occurred
   */
  onFocus (focusEvent) {
    if (focusEvent.type === 'focus' && 'name' in focusEvent.target && typeof focusEvent.target.name === 'string') {
      const nameParts = focusEvent.target.name.split('-');
      let phenomenonName = '';
      // TODO: Check if resulting phenomenon name is a known phenomenon
      if (!isNaN(nameParts[nameParts.length - 1])) {
        phenomenonName = nameParts[nameParts.length - 2];
      } else {
        phenomenonName = nameParts[nameParts.length - 1];
      }

      if (!getPhenomenonType(phenomenonName)) {
        return;
      }

      // const getPhenomenonPresetUrl = (phenomenon) => {
      //   // TODO: More presets per phenomenon
      //   // TODO: This should be done in a better way
      //   return window.location.origin + window.location.pathname + '?presetid=06c0a5b4-1e98-4d19-8e8e-39a66fc4e10b&location=EHAM#/';
      // };
      if (phenomenonName !== this.state.preset.forPhenomenon) {
        if (!this.state.preset.inWindow || this.state.preset.inWindow.closed) {
          // Only do this if it isnt already opened
          /* if ((this.props.browserLocation && !this.props.browserLocation.query.opened)) {
            const newWindow = window.open(window.location.href + '?opened=true', 'TafPresetWindow', 'width=1250,height=750', '_blank');
            const origWindow = window.open(getPhenomenonPresetUrl(phenomenonName), '_self');
            this.setState({
              preset: {
                forPhenomenon: phenomenonName,
                inWindow: newWindow,
                origWindow: origWindow
              }
            });
          } */
        }
      }
    }
  }

  /**
   * Registers the category child DOM elements, as it's necessary to interact with them
   * @param {HTMLElement} element The element to register
   */
  registerElement (element) {
    const name = element ? (element.name || element.props.name) : null;
    const hasFocusMethod = element ? 'focus' in element : false;

    /* Splice all elements with same id */
    let currentItemIndex = -1;
    do {
      currentItemIndex = this.register.findIndex((item) => item.name === name);
      if (currentItemIndex !== -1) this.register.splice(currentItemIndex, 1);
    } while (currentItemIndex !== -1);

    if (name && hasFocusMethod) {
      this.register.push({ name: name, element: element });

      /* A focus was requested on an element which was not yet rendered (e.g. add taf row), now its is rendered we can focus it. */
      if (this.state.fieldToFocusOn === name) {
        this.setFocus(this.state.fieldToFocusOn);
      }
    }
  }

  /**
   * Set the focus to a named and registered field
   * @param {string} fieldNameToFocus The field name to set to focus to
   * @returns {boolean} true on succesful focus
   */
  setFocus (fieldNameToFocus) {
    const foundItem = this.register.find((item) => item.name === fieldNameToFocus);
    if (foundItem && this.state.focusedFieldName !== fieldNameToFocus) {
      foundItem.element.focus();
      this.setState({ focusedFieldName: fieldNameToFocus, fieldToFocusOn: null });
      return true;
    }
    /* The element was not found, maybe it was not rendered yet, we going to retry this in registerElement */
    this.setState({ fieldToFocusOn: fieldNameToFocus, focusedFieldName: '' });
    return false;
  }

  /**
   * This function sets the focus to an adjacent field
   * @param {string} foccusedFieldName The name of the field which is currently focussed
   */
  moveFocus (focusedFieldName, direction) {
    if (focusedFieldName && typeof focusedFieldName === 'string') {
      if (direction === MOVE_DIRECTION.RIGHT) {
        const registerLength = this.register.length;
        const currentItemIndex = this.register.findIndex((item) => item.name === focusedFieldName);
        let nextItemIndex = -1;
        for (let nextIndex = currentItemIndex + 1; nextIndex < registerLength; nextIndex++) {
          if (!this.register[nextIndex].element.disabled) {
            nextItemIndex = nextIndex;
            break;
          }
        }
        if (nextItemIndex !== -1) {
          this.setFocus(this.register[nextItemIndex].name);
        }
      }
      if (direction === MOVE_DIRECTION.LEFT) {
        const currentItemIndex = this.register.findIndex((item) => item.name === focusedFieldName);
        let prevItemIndex = -1;
        for (let prevIndex = currentItemIndex - 1; prevIndex > -1; prevIndex--) {
          if (!this.register[prevIndex].element.disabled) {
            prevItemIndex = prevIndex;
            break;
          }
        }
        if (prevItemIndex !== -1) {
          this.setFocus(this.register[prevItemIndex].name);
        }
      }
      const nameParts = focusedFieldName.split('-');
      if (nameParts.length > 1) {
        const prevRowIndex = nameParts[0] === 'changegroups' ? parseInt(nameParts[1]) : -1; // -1 for Base Forecast
        if (direction === MOVE_DIRECTION.UP && prevRowIndex !== -1) {
          const nextRowIndex = parseInt(nameParts[1]) - 1;
          if (nextRowIndex === -1) {
            this.setFocus(nameParts.slice(2).join('-'));
          } else {
            nameParts[1] = nextRowIndex;
            this.setFocus(nameParts.join('-'));
          }
        }
        if (direction === MOVE_DIRECTION.DOWN) {
          if (prevRowIndex === -1) {
            this.setFocus(`changegroups-0-${focusedFieldName}`);
          } else {
            nameParts[1] = parseInt(nameParts[1]) + 1;
            this.setFocus(nameParts.join('-'));
          }
        }
        if (direction === MOVE_DIRECTION.DOWN_BEGINNING) {
          let currentRow = parseInt(nameParts[1]);
          if (Number.isNaN(currentRow)) currentRow = -1;
          this.setFocus(`changegroups-${currentRow + 1}-probability`);
        }
      }
      this.validateTafDebounced(this.props.selectedTaf.tafData);
    }
  }

  componentWillReceiveProps (nextProps) {
    /* Updates TAF and TAC based on key events */
    if (nextProps.selectedTaf && this.props.selectedTaf && nextProps.selectedTaf.tafData && this.props.selectedTaf.tafData) {
      if (nextProps.selectedTaf.tafData !== this.props.selectedTaf.tafData) {
        this.validateTafDebounced(nextProps.selectedTaf.tafData);
      }
    }
  }

  componentDidMount () {
    const { selectedTaf } = this.props;
    if (selectedTaf) {
      this.validateTafDebounced(selectedTaf.tafData);
    }
  }

  /**
   * Add disabled flag to abilities
   * @param {object} ability The ability to provide the flag for
   * @param {string} tafType The type of the TAF to provide a ability flag for
   * @param {boolean} isInValidityPeriod Whether or not the referred TAF is active
   * @returns {boolean} Whether or not is should be disabled
   */
  getDisabledFlag (abilityRef, tafType, isInValidityPeriod) {
    const { selectedTaf, copiedTafRef, feedback, hasFollowUp } = this.props;
    const validationFeedback = feedback && feedback[FEEDBACK_CATEGORIES.VALIDATION];
    if (!abilityRef || !selectedTaf) {
      return false;
    }
    switch (abilityRef) {
      case EDIT_ABILITIES.DISCARD['dataField']:
        return false;
      case EDIT_ABILITIES.SAVE['dataField']:
        return !selectedTaf.hasEdits;
      case EDIT_ABILITIES.PASTE['dataField']:
        return !copiedTafRef;
      case READ_ABILITIES.COPY['dataField']:
        return copiedTafRef === selectedTaf.tafData.metadata.uuid;
      case READ_ABILITIES.PUBLISH['dataField']:
        return !validationFeedback || validationFeedback.status === FEEDBACK_STATUSES.ERROR;
      case READ_ABILITIES.CORRECT['dataField']:
        return tafType === LIFECYCLE_STAGE_NAMES.CANCELED || hasFollowUp === true;
      case READ_ABILITIES.AMEND['dataField']:
        return !isInValidityPeriod || tafType === LIFECYCLE_STAGE_NAMES.CANCELED;
      case READ_ABILITIES.CANCEL['dataField']:
        return !isInValidityPeriod || tafType === LIFECYCLE_STAGE_NAMES.CANCELED || hasFollowUp === true;
      default:
        return false;
    }
  }

  /**
   * Reduce the available abilities for this specific TAF
   * @returns {array} The remaining abilities for this specific TAF
   */
  reduceAbilities () {
    const { selectedTaf, abilitiesPerStatus, mode } = this.props;
    const abilitiesCtAs = []; // CtA = Call To Action
    if (!selectedTaf || !selectedTaf.tafData || !selectedTaf.tafData.metadata ||
      !selectedTaf.tafData.metadata.status || !selectedTaf.tafData.metadata.type) {
      return abilitiesCtAs;
    }
    const selectedStatus = selectedTaf.tafData.metadata.status.toLowerCase();
    const selectedType = selectedTaf.tafData.metadata.type.toLowerCase();
    if (!selectedStatus || !selectedType || !mode) {
      return abilitiesCtAs;
    }
    const abilitiesForSelectedStatus = abilitiesPerStatus.find((status) => status.ref === selectedStatus).abilities;
    const modeAbilities = mode === MODES.EDIT ? cloneDeep(EDIT_ABILITIES) : cloneDeep(READ_ABILITIES);
    const byAbilities = mode === MODES.EDIT ? byEditAbilities : byReadAbilities;
    const now = moment.utc();
    const isInValidityPeriod = !now.isBefore(selectedTaf.timestamp) &&
      !now.isAfter(moment.utc(selectedTaf.tafData.metadata.validityEnd));
    if (!modeAbilities || !abilitiesForSelectedStatus || !byAbilities) {
      return abilitiesCtAs;
    }
    Object.values(modeAbilities).forEach((ability) => {
      if (abilitiesForSelectedStatus[mode][ability.check] === true) {
        ability.disabled = this.getDisabledFlag(ability.dataField, selectedType, isInValidityPeriod);
        abilitiesCtAs.push(ability);
      }
    });
    if (selectedType === LIFECYCLE_STAGE_NAMES.CANCELED) {
      abilitiesCtAs.length = 0;
      // abilitiesCtAs.push(EDIT_ABILITIES.DISCARD);
      // abilitiesCtAs.push(READ_ABILITIES.PUBLISH);
    }
    abilitiesCtAs.sort(byAbilities);
    return abilitiesCtAs;
  }

  render () {
    const { selectedTaf, mode, dispatch, actions, feedback } = this.props;
    if (!selectedTaf) {
      return null;
    }
    const { tafData, TAC } = selectedTaf;
    const validationFeedback = feedback && feedback[FEEDBACK_CATEGORIES.VALIDATION];
    const abilityCtAs = this.reduceAbilities(); // CtA = Call To Action
    const series = this.extractScheduleInformation(tafData);

    const isCancel = selectedTaf && selectedTaf.tafData && selectedTaf.tafData.metadata && selectedTaf.tafData.metadata.type &&
      selectedTaf.tafData.metadata.type.toLowerCase() === LIFECYCLE_STAGE_NAMES.CANCELED;
    return (
      <Row className='Taf'>
        <Col>
          <TacView TAC={TAC} />
          <Row className='TafTable'>
            <Col>
              <TafTable
                validationReport={validationFeedback && validationFeedback.list}
                taf={tafData}
                focusedFieldName={this.state.focusedFieldName}
                inputRef={this.registerElement}
                onSortEnd={({ oldIndex, newIndex }) => dispatch(actions.reorderTafRowAction(oldIndex, newIndex))}
                setTafValues={(valuesAtPaths) => dispatch(actions.updateTafFieldsAction(valuesAtPaths))}
                onClick={this.onClick}
                onKeyUp={this.onKeyUp}
                onKeyDown={this.onKeyDown}
                onFocus={this.onFocus}
                editable={mode === MODES.EDIT} />
            </Col>
          </Row>
          {!isCancel
            ? <TimeSchedule series={series}
              startMoment={moment.utc(tafData.metadata.validityStart)}
              endMoment={moment.utc(tafData.metadata.validityEnd)} />
            : null
          }
          {validationFeedback && mode === MODES.EDIT
            ? <FeedbackSection status={validationFeedback.status ? validationFeedback.status : FEEDBACK_STATUSES.INFO} category={FEEDBACK_CATEGORIES.VALIDATION}>
              {validationFeedback.title
                ? <span data-field='title'>{validationFeedback.title}</span>
                : null
              }
              {validationFeedback.subTitle
                ? <span data-field='subTitle'>{validationFeedback.subTitle}</span>
                : null
              }
              {validationFeedback.list
                ? <span data-field='list'>{validationFeedback.list}</span>
                : null
              }
            </FeedbackSection>
            : null
          }
          <ActionSection>
            {abilityCtAs.map((ability) =>
              <Button key={`action-${ability.dataField}`}
                data-field={ability.dataField}
                color='primary' disabled={ability.disabled}
                onClick={(evt) => dispatch(actions[ability.action](evt, ability.parameter))}>
                {ability.label}
              </Button>
            )}
          </ActionSection>
        </Col>
      </Row>
    );
  }
}

Taf.defaultProps = {
  selectedTaf: cloneDeep(TAF_TEMPLATES.SELECTABLE_TAF),
  mode: MODES.READ
};

Taf.propTypes = {
  selectedTaf: TAF_TYPES.SELECTABLE_TAF,
  mode: PropTypes.string,
  abilitiesPerStatus: PropTypes.arrayOf(PropTypes.shape({
    ref: PropTypes.string,
    abilities: PropTypes.object
  })),
  copiedTafRef: PropTypes.string,
  feedback: PropTypes.shape({
    message: PropTypes.string
  }),
  hasFollowUp: PropTypes.bool,
  dispatch: PropTypes.func,
  actions: PropTypes.objectOf(PropTypes.func)
};

export default Taf;
