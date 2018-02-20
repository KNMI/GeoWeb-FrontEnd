import React, { Component } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import Enum from 'es6-enum';
import TimeSchedule from '../TimeSchedule';
import { TAF_TEMPLATES, TAF_TYPES, CHANGE_TYPES, CHANGE_TYPES_ORDER, CHANGE_TYPES_SHORTHAND, getChangeType,
  PHENOMENON_TYPES, PHENOMENON_TYPES_ORDER, getPhenomenonType, getPhenomenonLabel } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';
import setNestedProperty from 'lodash.set';
import getNestedProperty from 'lodash.get';
import removeNestedProperty from 'lodash.unset';
import moment from 'moment';
import { Button, Row, Col, Alert, ListGroup, ListGroupItem } from 'reactstrap';
import { jsonToTacForWind, jsonToTacForWeather, jsonToTacForClouds } from './TafFieldsConverter';
import TafTable from './TafTable';
import axios from 'axios';
import { debounce } from '../../utils/debounce';

const TMP = '◷';

const MOVE_DIRECTION = Enum(
  'UP',
  'RIGHT',
  'DOWN',
  'LEFT'
);

/**
 * Generate fallback / default values for tafObject
 * @return {object} Object containing default values for start timestamp, end timestamp, issue timestamp and location
 */
const generateDefaultValues = () => {
  const now = moment().utc();
  let TAFStartHour = now.hour();
  TAFStartHour = TAFStartHour - TAFStartHour % 6 + 6;
  return {
    start: now.hour(TAFStartHour).minutes(0).seconds(0).format('YYYY-MM-DDTHH:mm:ss') + 'Z',
    end: now.hour(TAFStartHour).minutes(0).seconds(0).add(30, 'hour').format('YYYY-MM-DDTHH:mm:ss') + 'Z',
    issue: 'not yet issued'
  };
};

/**
 * Upwards recursively remove empty properties
 * @param  {Object} objectToClear The object to cleanse
 * @param  {Array} pathParts Array of JSON-path-elements
 */
const clearRecursive = (objectToClear, pathParts) => {
  pathParts.pop();
  const parent = getNestedProperty(objectToClear, pathParts);
  // Check for empty sibling arrays / objects
  if (Array.isArray(parent) && parent.length === 0) {
    const length = parent.length;
    for (let index = 0; index < length; index++) {
      if (!parent[index] ||
          (Array.isArray(parent[index]) && parent[index].length === 0) ||
          (typeof parent[index] === 'object' && Object.indexs(parent[index]).length === 0)) {
        pathParts.push(index);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    }
  } else if (parent && typeof parent === 'object') {
    Object.entries(parent).forEach(([key, value]) => {
      if ((!value && value !== 0) ||
          (Array.isArray(value) && value.length === 0) ||
          (value && typeof value === 'object' && Object.keys(value).length === 0)) {
        pathParts.push(key);
        removeNestedProperty(objectToClear, pathParts);
        pathParts.pop();
      }
    });
  }
  if ((Array.isArray(parent) && parent.length === 0) || (parent && typeof parent === 'object' && Object.keys(parent).length === 0)) {
    removeNestedProperty(objectToClear, pathParts);
    clearRecursive(objectToClear, pathParts);
  };
};

/**
 * Collect JSON pointers for all (nested) properties which are matched
 * @param  {Object|Array|String} collection A Collection or property to descend
 * @param  {Function} predicate The test to apply to each property
 * @param  {Array} accumulator The array to store the (intermediate) results
 * @param  {String, optional} parentName The parent pointer
 * @return {Array|Boolean} The result of the test, XOR an array with (intermediate) results
 */
const getJsonPointers = (collection, predicate, accumulator, parentName = '') => {
  accumulator = accumulator || [];
  const propertyList = [];
  if (Array.isArray(collection)) {
    const length = collection.length;
    for (let arrIndex = 0; arrIndex < length; arrIndex++) {
      propertyList.push(arrIndex);
    }
  } else if (collection && typeof collection === 'object') {
    for (let property in collection) {
      propertyList.push(property);
    }
  }
  const listLength = propertyList.length;
  for (let listIndex = 0; listIndex < listLength; listIndex++) {
    const property = propertyList[listIndex];
    const myAccum = [];
    if (getJsonPointers(collection[property], predicate, myAccum, property) === true) {
      myAccum.push(property);
    }
    const length = myAccum.length;
    for (let accumIndex = 0; accumIndex < length; accumIndex++) {
      accumulator.push(parentName + '/' + myAccum[accumIndex]);
    }
  }
  return predicate(collection) || accumulator;
};

/**
 * TafCategory is the component which renders an editable and sortable TAF table.
 * The UI is generated from a TAF JSON and it can generate/update TAF JSON from user input
 *
 * The component hierarchy is structured as follows:
 *
 *                                 BaseForecast -> \
 *                                                   --> TafTable -> TafCategory -> Taf
 *     ChangeGroup(s) -> SortableChangeGroup(s) -> /
 *
 */
class TafCategory extends Component {
  constructor (props) {
    super(props);
    this.onSortEnd = this.onSortEnd.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.registerElement = this.registerElement.bind(this);
    this.setTafValues = this.setTafValues.bind(this);
    this.addRow = this.addRow.bind(this);
    this.removeRow = this.removeRow.bind(this);
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
    this.validateTaf = debounce(this.validateTaf.bind(this), 1250, false);
    this.saveTaf = this.saveTaf.bind(this);

    const initialState = {
      tafAsObject: props.taf,
      focusedFieldName: 'forecast-wind',
      hasEdits: false,
      preset: {
        forPhenomenon: null,
        inWindow: null
      }
    };

    // TODO: should we include defaults?
    const defaults = generateDefaultValues();
    if (!props.taf.metadata.validityStart) {
      initialState.tafAsObject.metadata.validityStart = defaults.start;
    }
    if (!props.taf.metadata.validityEnd) {
      initialState.tafAsObject.metadata.validityEnd = defaults.end;
    }
    if (!props.taf.metadata.issueTime) {
      initialState.tafAsObject.metadata.issueTime = defaults.issue;
    }
    if (!props.taf.metadata.location) {
      initialState.tafAsObject.metadata.location = props.location;
    }

    this.state = initialState;
    this.register = [];
  };

  /**
   * Validates TAF input in two steps:
   * 1) Check for fallback values
   * 2) Server side validation
   * @param  {object} tafAsObject The TAF JSON to validate
   * @return {object} A report of the validation
   */
  validateTaf (tafAsObject) {
    const taf = cloneDeep(tafAsObject);
    const fallbackPointers = [];
    getJsonPointers(taf, (field) => field && field.hasOwnProperty('fallback'), fallbackPointers);

    const inputParsingReport = {};
    const fallbackPointersLength = fallbackPointers.length;
    if (fallbackPointersLength > 0) {
      inputParsingReport.message = 'TAF is not valid';
      inputParsingReport.succeeded = false;
      for (let pointerIndex = 0; pointerIndex < fallbackPointersLength; pointerIndex++) {
        if (!inputParsingReport.hasOwnProperty('errors')) {
          inputParsingReport.errors = {};
        }
        if (!inputParsingReport.errors.hasOwnProperty(fallbackPointers[pointerIndex])) {
          inputParsingReport.errors[fallbackPointers[pointerIndex]] = [];
        }
        const pointerParts = fallbackPointers[pointerIndex].split('/');
        pointerParts.shift();
        let message = 'The pattern of the input was not recognized.';
        const fallbackedProperty = getNestedProperty(taf, pointerParts);
        if (fallbackedProperty.hasOwnProperty('fallback') && fallbackedProperty.fallback.hasOwnProperty('message')) {
          message = fallbackedProperty.fallback.message;
        }
        inputParsingReport.errors[fallbackPointers[pointerIndex]].push(message);
        removeNestedProperty(taf, pointerParts);
      }
    } else {
      inputParsingReport.message = 'TAF input is verified';
      inputParsingReport.succeeded = true;
    }

    const nullPointers = [];
    getJsonPointers(taf, (field) => field === null, nullPointers);
    // TODO: Should this be really necessary?
    // Remove null's and empty fields -- BackEnd doesn't handle them nicely
    const nullPointersLength = nullPointers.length;
    for (let pointerIndex = 0; pointerIndex < nullPointersLength; pointerIndex++) {
      const pathParts = nullPointers[pointerIndex].split('/');
      pathParts.shift();
      removeNestedProperty(taf, pathParts);
      clearRecursive(taf, pathParts);
    }
    if (!getNestedProperty(taf, ['changegroups'])) {
      setNestedProperty(taf, ['changegroups'], []);
    }
    if (getNestedProperty(taf, ['metadata', 'issueTime']) === 'not yet issued') {
      setNestedProperty(taf, ['metadata', 'issueTime'], moment.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z');
    }

    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/tafs/verify',
      withCredentials: true,
      data: JSON.stringify(taf),
      headers: { 'Content-Type': 'application/json' }
    }).then(
      response => {
        if (response.data) {
          let responseJson = response.data;
          if (responseJson.hasOwnProperty('errors') && typeof responseJson.errors === 'string') {
            try {
              responseJson.errors = JSON.parse(responseJson.errors);
            } catch (exception) {
              console.error('Unparseable errors data from response', exception);
            }
          }
          const aggregateReport = {
            message: inputParsingReport.succeeded && responseJson.succeeded ? 'TAF input is verified' : 'TAF input is not valid',
            succeeded: inputParsingReport.succeeded && responseJson.succeeded,
            errors: Object.assign({}, inputParsingReport.errors, responseJson.errors)
          };
          this.setState({
            validationReport: aggregateReport
          });
        } else {
          this.setState({
            validationReport: inputParsingReport
          });
        }
      }
    ).catch(error => {
      console.error(error);
      const aggregateReport = {
        message: 'TAF input is not valid',
        subheading: '(Couldn\'t retrieve all validation details.)',
        succeeded: false,
        errors: inputParsingReport.errors
      };
      this.setState({
        validationReport: aggregateReport
      });
    });
  }

  saveTaf (tafAsObject) {
    const taf = cloneDeep(tafAsObject);
    const nullPointers = [];
    getJsonPointers(taf, (field) => field === null, nullPointers);
    // TODO: Should this be really necessary?
    // Remove null's and empty fields -- BackEnd doesn't handle them nicely
    const nullPointersLength = nullPointers.length;
    for (let pointerIndex = 0; pointerIndex < nullPointersLength; pointerIndex++) {
      const pathParts = nullPointers[pointerIndex].split('/');
      pathParts.shift();
      removeNestedProperty(taf, pathParts);
      clearRecursive(taf, pathParts);
    }
    if (!getNestedProperty(taf, ['changegroups'])) {
      setNestedProperty(taf, ['changegroups'], []);
    }
    if (getNestedProperty(taf, ['metadata', 'issueTime']) === 'not yet issued') {
      setNestedProperty(taf, ['metadata', 'issueTime'], moment.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z');
    }

    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/tafs',
      withCredentials: true,
      data: JSON.stringify(taf),
      headers: { 'Content-Type': 'application/json' }
    }).then(src => {
      this.setState({ validationReport:src.data });
      // this.props.updateParent();
    }).catch(error => {
      this.setState({ validationReport:{ message: 'Unable to save: error occured while saving TAF.' } });
      try {
        console.error('Error occured', error);
        if (error.response.data.message) {
          this.setState({ validationReport:{ message: error.response.data.message } });
        }
      } catch (e) {
        console.error(e);
        this.setState({ validationReport:{ message: JSON.stringify(error.response) } });
      }
    });
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
        value[0].hasOwnProperty('phenomena') && Array.isArray(value[0].phenomena) && value[0].phenomena.length > 0) {
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
   * @param {object} tafDataAsJson The object containing the TAF data
   * @return {array} The schedule information as an array of schedule items
   */
  extractScheduleInformation (tafDataAsJson) {
    const scheduleSeries = [];
    const scopeStart = moment.utc(tafDataAsJson.metadata.validityStart);
    const scopeEnd = moment.utc(tafDataAsJson.metadata.validityEnd);
    Object.entries(tafDataAsJson.forecast || {}).map((entry) => {
      const value = this.serializePhenomenonValue(entry[0], entry[1], null);
      if (value !== null) {
        scheduleSeries.push({
          label: entry[0],
          isLabelVisible: true,
          ranges: [ {
            start: scopeStart,
            end: scopeEnd,
            value: value,
            styles: []
          } ]
        });
      }
    });

    tafDataAsJson.changegroups.sort(this.byStartAndChangeType).map(change => {
      const changeType = getChangeType(change.changeType);
      const fallbackValue = cloneDeep(scopeStart).subtract(1, 'hour');

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

      Object.entries(change.forecast).map((entry) => {
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
                scheduleSeries[exclusiveSeriesIndex].ranges.map(range => {
                  if (start.isSameOrBefore(range.end) && end.isSameOrAfter(range.start)) {
                    // it does overlap!
                    if (start.isSameOrBefore(range.start)) {
                      if (end.isSameOrAfter(range.end)) {
                        // fully includes / overrides previous range => set duration to 0
                        range.end = range.start;
                      } else {
                        // there's a remainder at the end, but FM and BECMG changes are persistent => set duration to 0
                        range.end = range.start;
                      }
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
              styles: [ changeType === CHANGE_TYPES.BECMG ? 'striped' : (changeType === CHANGE_TYPES.PROB30 || changeType === CHANGE_TYPES.PROB40) ? 'split' : null ]
            });
          } else { // Create a new series
            seriesIndex = scheduleSeries.push({
              label: label,
              isLabelVisible: labelSuffix.length === 0 || scheduleSeries.findIndex(serie => serie.label === entry[0]) === -1,
              ranges: [ {
                start: start,
                end: end,
                value: value,
                prefix: CHANGE_TYPES_SHORTHAND[changeType],
                styles: [ changeType === CHANGE_TYPES.BECMG ? 'striped' : changeType === CHANGE_TYPES.PROB30 || changeType === CHANGE_TYPES.PROB40 ? 'split' : null ]
              } ]
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
    if (keyboardEvent.type === 'keyup') {
      switch (keyboardEvent.key) {
        case 'Enter':
          this.addRow();
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
    if (keyboardEvent.type === 'keydown') {
      switch (keyboardEvent.key) {
        case 'ArrowUp':
          this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.UP);
          break;
        case 'ArrowRight':
          if (!keyboardEvent.target.value || (keyboardEvent.target.selectionStart === keyboardEvent.target.value.length)) {
            this.moveFocus(keyboardEvent.target.name, MOVE_DIRECTION.RIGHT);
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
    if (event.type === 'click' && 'name' in event.target && typeof event.target.name === 'string') { // hasOwnPropery seems not working properly on HTMLElement-objects
      if (event.target.name === 'addible') {
        this.addRow();
        return;
      }
      if (event.target.name.endsWith('removable')) {
        const nameParts = event.target.name.split('-');
        if (nameParts.length > 1 && nameParts[1] >= 0) {
          this.removeRow(parseInt(nameParts[1]));
        }
        event.preventDefault();
        event.stopPropagation();
      }
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
      // TODO Check if resulting phenomenon name is a known phenomenon
      if (!isNaN(nameParts[nameParts.length - 1])) {
        phenomenonName = nameParts[nameParts.length - 2];
      } else {
        phenomenonName = nameParts[nameParts.length - 1];
      }

      if (!getPhenomenonType(phenomenonName)) {
        return;
      }

      const getPhenomenonPresetUrl = (phenomenon) => {
        // TODO: More presets per phenomenon
        // TODO: This should be done in a better way
        return window.location.origin + window.location.pathname + '?presetid=06c0a5b4-1e98-4d19-8e8e-39a66fc4e10b&location=EHAM#/';
      };

      if (phenomenonName !== this.state.preset.forPhenomenon) {
        if (!this.state.preset.inWindow || this.state.preset.inWindow.closed) {
          this.setState({
            preset: {
              forPhenomenon: phenomenonName,
              inWindow: window.open(getPhenomenonPresetUrl(phenomenonName), 'TafPresetWindow')
            }
          });
        } else {
          this.setState({
            preset: {
              forPhenomenon: phenomenonName,
              inWindow: this.state.preset.inWindow.open(getPhenomenonPresetUrl(phenomenonName), 'TafPresetWindow')
            }
          });
        }
      }
    }
  }

  /**
   * Updates the value(s) in the state
   * @param {Array} values An array with objects, each containing a propertyPath and propertyValue
   */
  setTafValues (values) {
    if (values && Array.isArray(values) && values.length > 0) {
      const newTafState = cloneDeep(this.state.tafAsObject);
      let hasUpdates = false;
      values.map((entry) => {
        if (entry && typeof entry === 'object' && entry.hasOwnProperty('propertyPath') && entry.hasOwnProperty('propertyValue')) {
          if (entry.deleteProperty === true) {
            // removeNestedProperty on an array leaves an empty array element
            // Therefore, the array needs to be cleaned by this one neat trick
            removeNestedProperty(newTafState, entry.propertyPath);

            // If the last element is a number, then it is an index in an array, so we know we are dealing with an array
            const lastPathElem = entry.propertyPath.pop();
            if (!isNaN(lastPathElem)) {
              // Retrieve the array and leave all items that evaluate truthy.
              // this filters everything as null, undefined, 0, {}, false, "", etc...
              const theArr = getNestedProperty(newTafState, entry.propertyPath);
              setNestedProperty(newTafState, entry.propertyPath, theArr.filter(n => n));
            }
          } else {
            setNestedProperty(newTafState, entry.propertyPath, entry.propertyValue);
          }
          hasUpdates = true;
        }
      });
      if (hasUpdates) {
        this.validateTaf(newTafState);
        this.setState({
          tafAsObject: newTafState,
          hasEdits: true
        });
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
    if (name && hasFocusMethod) {
      this.register.push({ name: name, element: element });
    }
  }

  /**
   * Set the focus to a named and registered field
   * @param {string} fieldNameToFocus The field name to set to focus to
   */
  setFocus (fieldNameToFocus) {
    const foundItem = this.register.find((item) => item.name === fieldNameToFocus);
    if (foundItem && this.state.focusedFieldName !== fieldNameToFocus) {
      foundItem.element.focus();
      this.setState({ focusedFieldName: fieldNameToFocus });
    }
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
      }
      this.validateTaf(this.state.tafAsObject);
    }
  }

  /**
   * This function adds a new changegroup to the TAF.
   */
  addRow () {
    const newTafState = cloneDeep(this.state.tafAsObject);
    newTafState.changegroups.push(cloneDeep(TAF_TEMPLATES.CHANGE_GROUP));
    this.validateTaf(newTafState);
    this.setState({
      tafAsObject: newTafState,
      hasEdits: true
    });
  }

  /**
   * This function removes a changegroup from the TAF.
   * @param  {number} rowIndex The rowIndex is the index of the changegroup row to delete
   */
  removeRow (rowIndex) {
    if (rowIndex !== null && typeof rowIndex === 'number') {
      const newTafState = cloneDeep(this.state.tafAsObject);
      newTafState.changegroups.splice(rowIndex, 1);
      if (newTafState.changegroups.length === 0) {
        // Prepend empty TAF row as to clear it rather than deleting
        newTafState.changegroups.unshift(TAF_TEMPLATES.CHANGE_GROUP);
      }
      this.validateTaf(newTafState);
      this.setState({
        tafAsObject: newTafState,
        hasEdits: true
      });
    }
  }

  /*
    Callback function called by SortableElement and SortableContainer when changegroups are sorted by Drag and Drop
  */
  onSortEnd ({ oldIndex, newIndex }) {
    const newTafState = cloneDeep(this.state.tafAsObject);
    newTafState.changegroups = arrayMove(newTafState.changegroups, oldIndex, newIndex);
    this.validateTaf(newTafState);
    this.setState({
      tafAsObject: newTafState,
      hasEdits: true
    });
  };

  componentWillReceiveProps (nextProps) {
    if (!this.state.hasEdits) {
      let nextP = cloneDeep(nextProps);
      if ('taf' in nextP && nextP.taf) {
        const defaults = generateDefaultValues();
        if (!nextP.taf.metadata.validityStart) {
          nextP.taf.metadata.validityStart = defaults.start;
        }
        if (!nextP.taf.metadata.validityEnd) {
          nextP.taf.metadata.validityEnd = defaults.end;
        }
        if (!nextP.taf.metadata.issueTime) {
          nextP.taf.metadata.issueTime = defaults.issue;
        }
        if (!nextP.taf.metadata.location) {
          nextP.taf.metadata.location = nextP.location;
        }
      } else if ('location' in nextP && nextP.location) {
        const loc = nextP.location;
        nextP = { taf: cloneDeep(this.state.tafAsObject) };
        nextP.taf.metadata.location = loc;
      }
      this.validateTaf(nextP.taf);
      this.setState({ tafAsObject: nextP.taf });
    }
  }

  render () {
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );
    let validationErrors = null;
    let validationSucceeded = false;
    if (this.state.validationReport) {
      if (this.state.validationReport.errors) {
        validationErrors = this.state.validationReport.errors;
      }
      if (this.state.validationReport.succeeded === true) {
        validationSucceeded = true;
      }
    }

    const series = this.extractScheduleInformation(cloneDeep(this.state.tafAsObject));
    return (
      <Row className='TafCategory' style={{ flex: 1 }}>
        <Col style={{ flexDirection: 'column' }}>
          {this.state.tafAsObject.metadata.uuid
            ? <Row style={{ margin: '0', padding:'0.5rem', flex: 'auto' }}>
              <Col style={{ fontSize: '0.9rem' }}>{'id: ' + this.state.tafAsObject.metadata.uuid}</Col>
            </Row>
            : null
          }
          <Row style={{ margin: '0', padding:'4px', backgroundColor:'#EEE', flex: 'none' }}>
            <Col>
              <TafTable
                validationReport={this.state.validationReport}
                taf={this.state.tafAsObject}
                focusedFieldName={this.state.focusedFieldName}
                inputRef={this.registerElement}
                onSortEnd={this.onSortEnd}
                setTafValues={this.setTafValues}
                onClick={this.onClick}
                onKeyUp={this.onKeyUp}
                onKeyDown={this.onKeyDown}
                onFocus={this.onFocus}
                editable={this.props.editable} />
            </Col>
          </Row>
          { this.state.validationReport
            ? <Row style={{ flex: 'none' }}>
              <Col style={{ padding: '0.5rem' }}>
                <Alert color={validationSucceeded ? 'success' : 'danger'} style={{ width: '100%', display: 'block', margin: '0' }}>
                  <h4 className='alert-heading' style={{ fontSize: '1.2rem' }}>{this.state.validationReport.message}</h4>
                  {this.state.validationReport.subheading
                    ? <h6>{this.state.validationReport.subheading}</h6>
                    : null
                  }
                  { validationErrors
                    ? <ListGroup>
                      {(flatten(Object.values(validationErrors).filter(v => Array.isArray(v)))).map((value, index) => {
                        return (<ListGroupItem key={'errmessageno' + index} color={validationSucceeded ? 'success' : 'danger'}
                          style={{ borderColor: '#a94442' }}>{(index + 1)} - {value}</ListGroupItem>);
                      })}
                    </ListGroup>
                    : null
                  }
                </Alert>
              </Col>
            </Row>
            : null
          }
          <Row style={{ padding:'0 0.5rem 0.5rem 0.5rem', flex: 'none' }}>
            <Col />
            <Col xs='auto'>
              <Button style={{ marginRight: '0.33rem' }} color='primary' onClick={() => {
                this.saveTaf(this.state.tafAsObject);
              }} >Save</Button>
              <Button disabled={!validationSucceeded} onClick={() => { alert('Sending a TAF out is not yet implemented'); }} color='primary'>Send</Button>
            </Col>
          </Row>
          <Row style={{ flex: 'auto' }}>
            <Col>
              <TimeSchedule startMoment={moment.utc(this.state.tafAsObject.metadata.validityStart)} endMoment={moment.utc(this.state.tafAsObject.metadata.validityEnd)} series={series} />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

TafCategory.defaultProps = {
  taf: cloneDeep(TAF_TEMPLATES.TAF),
  editable: false,
  location: 'EHAM'
};

TafCategory.propTypes = {
  taf: TAF_TYPES.TAF.isRequired,
  editable: PropTypes.bool,
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  }),
  location: PropTypes.string
};

export default TafCategory;
