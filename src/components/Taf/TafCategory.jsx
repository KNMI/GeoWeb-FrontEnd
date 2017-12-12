import React, { Component } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import Enum from 'es6-enum';
import TimeSchedule from '../TimeSchedule';
import { TAF_TEMPLATES, TAF_TYPES, CHANGE_TYPES, CHANGE_TYPES_ORDER, CHANGE_TYPES_SHORTHAND, getChangeType, PHENOMENON_TYPES, PHENOMENON_TYPES_ORDER, getPhenomenonType } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';
import setNestedProperty from 'lodash.set';
// import isEqual from 'lodash.isequal';
import moment from 'moment';
import { Button, Row, Col } from 'reactstrap';
import { jsonToTacForWind, jsonToTacForWeather, jsonToTacForClouds } from './TafFieldsConverter';
import TafTable from './TafTable';
// import TACTable from './TACTable';
import axios from 'axios';
const TMP = '_temp';

const MOVE_DIRECTION = Enum(
  'UP',
  'RIGHT',
  'DOWN',
  'LEFT'
);

const generateDefaultValues = () => {
  const now = moment().utc();
  let TAFStartHour = now.hour();
  TAFStartHour = TAFStartHour - TAFStartHour % 6 + 6;
  return {
    start: now.hour(TAFStartHour).minutes(0).seconds(0).format('YYYY-MM-DDTHH:mm:ss') + 'Z',
    end: now.hour(TAFStartHour).minutes(0).seconds(0).add(30, 'hour').format('YYYY-MM-DDTHH:mm:ss') + 'Z',
    issue: 'not yet issued',
    location: 'EHAM'
  };
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
    this.decoratePhenomenonValue = this.decoratePhenomenonValue.bind(this);
    this.decorateStringValue = this.decorateStringValue.bind(this);
    this.decorateWindObjectValue = this.decorateWindObjectValue.bind(this);
    this.decorateCloudsArray = this.decorateCloudsArray.bind(this);
    this.decorateWeatherArray = this.decorateWeatherArray.bind(this);
    this.byPhenomenonType = this.byPhenomenonType.bind(this);
    this.byStartAndChangeType = this.byStartAndChangeType.bind(this);
    this.validateTaf = this.validateTaf.bind(this);
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
      initialState.tafAsObject.metadata.location = defaults.location;
    }

    this.state = initialState;
    this.register = [];
  };

  validateTaf (tafAsObject) {
    // Validate typed settings
    // let taf = removeInputPropsFromTafJSON(cloneObjectAndSkipNullProps(tafJSON));
    // let taf = tafAsObject;

    // axios({
    //   method: 'post',
    //   url: this.props.urls.BACKEND_SERVER_URL + '/tafs/verify',
    //   withCredentials: true,
    //   data: JSON.stringify(taf),
    //   headers: { 'Content-Type': 'application/json' }
    // }).then(
    //   response => {
    //     if (response.data) {
    //       this.setState({
    //         validationReport:response.data
    //       });
    //     } else {
    //       this.setState({
    //         validationReport:null
    //       });
    //     }
    //   }
    // ).catch(error => {
    //   console.log(error);
    //   this.setState({
    //     validationReport:{ message: 'Invalid response from TAF verify servlet [/tafs/verify].' }
    //   });
    // });
  }

  saveTaf (tafDATAJSON) {
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/tafs',
      withCredentials: true,
      data: JSON.stringify(tafDATAJSON),
      headers: { 'Content-Type': 'application/json' }
    }).then(src => {
      this.setState({ validationReport:src.data });
      // this.props.updateParent();
    }).catch(error => {
      this.setState({ validationReport:{ message: 'Unable to save: error occured while saving TAF.' } });
      try {
        console.log('Error occured', error);
        if (error.response.data.message) {
          this.setState({ validationReport:{ message: error.response.data.message } });
        }
      } catch (e) {
        console.log(e);
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
   * Maps the string value into a presentable form
   * @param {string} value The text to present
   * @param {string} prefix The text to prepend
   * @return {React.Component} A component with a readable presentation of the phenomenon value
   */
  decorateStringValue (value, prefix) {
    return <div className='col-auto' title={value}>
      {prefix
        ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
          {prefix}:&nbsp;
        </div>
        : null}
      {value}
    </div>;
  }

  /**
   * Maps the wind object value into a presentable form
   * @param {string} value The wind object to present
   * @param {string} prefix The text to prepend
   * @return {React.Component} A component with a readable presentation of the phenomenon value
   */
  decorateWindObjectValue (value, prefix) {
    if (value.hasOwnProperty('direction') && (typeof value.direction === 'number' || (typeof value.direction === 'string' && value.direction === 'VRB')) &&
        value.hasOwnProperty('speed') && typeof value.speed === 'number') {
      const title = (prefix ? prefix + ': ' : '') + jsonToTacForWind(value);
      return <div className='col-auto' title={title}>
        {prefix
          ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
            {prefix}:&nbsp;
          </div>
          : null
        }
        {!isNaN(value.direction)
          ? <div className='col-auto'>
            <i className='fa fa-location-arrow' style={{ transform: 'rotate(' + (value.direction + 135) + 'deg)' }} aria-hidden='true' />
          </div>
          : null
        }
        <div className='col-auto'>{jsonToTacForWind(value)}</div>
      </div>;
    } else {
      return null;
    }
  }

  /**
   * Maps the clouds array value into a presentable form
   * @param {array} value The clouds array to present
   * @param {string} prefix The text to prepend
   * @return {React.Component} A component with a readable presentation of the phenomenon value
   */
  decorateCloudsArray (value, prefix) {
    if (value.length && value.length > 0 && value[0] && value[0].hasOwnProperty('amount') && typeof value[0].amount === 'string') {
      const title = (prefix ? prefix + ': ' : '') + value.map((cloud, index) => {
        return jsonToTacForClouds(cloud);
      });
      return <div className='col-auto' title={title}>
        {prefix
          ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
            {prefix}:&nbsp;
          </div>
          : null}
        {value.map((cloud, index) => {
          return <div className='col-auto'>
            {jsonToTacForClouds(cloud)}
            {index < value.length - 1 ? <div className='col-auto'>,&nbsp;</div> : null}
          </div>;
        })}
      </div>;
    } else {
      return null;
    }
  }

  /**
   * Maps the weather array value into a presentable form
   * @param {array} value The weather array to present
   * @param {string} prefix The text to prepend
   * @return {React.Component} A component with a readable presentation of the phenomenon value
   */
  decorateWeatherArray (value, prefix) {
    if (value.length && value.length > 0 && value[0] && value[0].hasOwnProperty('phenomena') && value[0].phenomena.length > 0) {
      const title = (prefix ? prefix + ': ' : '') + value.map((weather, index) => {
        return jsonToTacForWeather(weather);
      });
      return <div className='col-auto' title={title}>
        {prefix
          ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
            {prefix}:&nbsp;
          </div>
          : null}
        {value.map((weather, index) => {
          return <div className='col-auto'>
            {jsonToTacForWeather(weather)}
            {index < value.length - 1 ? <div className='col-auto'>,&nbsp;</div> : null}
          </div>;
        })}
      </div>;
    } else {
      return null;
    }
  }

  /**
   * Maps the data in the phenomenon-value object into a presentable form
   * @param {string} phenomenonType The type of the phenomenon
   * @param {object} phenomenonValueObject The phenomenon-value object to map (i.e. to serialize)
   * @param {string} prefix The text to prepend
   * @return {React.Component} A component with a readable presentation of the phenomenon value
   */
  decoratePhenomenonValue (phenomenonType, phenomenonValueObject, prefix) {
    switch (getPhenomenonType(phenomenonType)) {
      case PHENOMENON_TYPES.WIND:
        if (typeof phenomenonValueObject === 'object') {
          return this.decorateWindObjectValue(phenomenonValueObject, prefix);
        }
        return null;
      case PHENOMENON_TYPES.VISIBILITY:
        if (typeof phenomenonValueObject === 'object' && phenomenonValueObject.hasOwnProperty('value') &&
          typeof phenomenonValueObject.value === 'number' &&
          !isNaN(phenomenonValueObject.value)) {
          return this.decorateStringValue(phenomenonValueObject.value.toString().padStart(4, '0'), prefix);
        }
        return null;
      case PHENOMENON_TYPES.WEATHER:
        if (typeof phenomenonValueObject === 'string') {
          return this.decorateStringValue(phenomenonValueObject, prefix);
        } else if (typeof phenomenonValueObject === 'object') {
          return this.decorateWeatherArray(phenomenonValueObject, prefix);
        }
        return null;
      case PHENOMENON_TYPES.CLOUDS:
        if (typeof phenomenonValueObject === 'string') {
          return this.decorateStringValue(phenomenonValueObject, prefix);
        } else if (typeof phenomenonValueObject === 'object') {
          return this.decorateCloudsArray(phenomenonValueObject, prefix);
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
    Object.entries(tafDataAsJson.forecast).map((entry) => {
      const value = this.decoratePhenomenonValue(entry[0], entry[1], null);
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

      Object.entries(change.forecast).map((entry) => {
        const value = this.decoratePhenomenonValue(entry[0], entry[1], CHANGE_TYPES_SHORTHAND[changeType]);
        if (value !== null) {
          const labelSuffix = (changeType !== CHANGE_TYPES.FM && changeType !== CHANGE_TYPES.BECMG) ? TMP : '';
          const label = entry[0] + labelSuffix;
          let seriesIndex = scheduleSeries.findIndex(serie => serie.label === label);
          if (seriesIndex !== -1) {
            // for persisting changes, correct overlapping
            if (changeType === CHANGE_TYPES.FM || changeType === CHANGE_TYPES.BECMG) {
              scheduleSeries[seriesIndex].ranges.forEach(range => {
                if (start.isBefore(range.end) && end.isAfter(range.start)) {
                  // it does overlap!
                  if (!start.isAfter(range.start)) {
                    if (!end.isBefore(range.end)) {
                      // fully includes / overrides previous range => set duration to 0
                      range.end = range.start;
                    } else {
                      // there's a remainder at the end
                      range.start = end;
                    }
                  } else {
                    // there's a remainder at the start
                    range.end = start;
                  }
                }
              });
            }
            scheduleSeries[seriesIndex].ranges.push({
              start: start,
              end: end,
              value: value,
              styles: [ changeType === CHANGE_TYPES.BECMG ? 'striped' : changeType === CHANGE_TYPES.PROB30 || changeType === CHANGE_TYPES.PROB40 ? 'split' : null ]
            });
          } else {
            seriesIndex = scheduleSeries.push({
              label: label,
              isLabelVisible: labelSuffix.length === 0 || scheduleSeries.findIndex(serie => serie.label === entry[0]) === -1,
              ranges: [ {
                start: start,
                end: end,
                value: value,
                styles: [ changeType === CHANGE_TYPES.BECMG ? 'striped' : changeType === CHANGE_TYPES.PROB30 || changeType === CHANGE_TYPES.PROB40 ? 'split' : null ]
              } ]
            }) - 1; // push returns the length, but the last index is needed
          }
          if (changeType === CHANGE_TYPES.BECMG) {
            scheduleSeries[seriesIndex].ranges.push({
              start: end,
              end: scopeEnd,
              value: this.decoratePhenomenonValue(entry[0], entry[1], null),
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
          console.log('No action for event ', event.type, ' on ', event.target);
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
          console.log('No action for event ', event.type, ' on ', event.target);
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
        if (nameParts.length > 1 && nameParts[1] > 0) {
          this.removeRow(parseInt(nameParts[1]));
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (event.target.name.endsWith('sortable')) {
        console.log('Sortable clicked', event.target.name);
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
          setNestedProperty(newTafState, entry.propertyPath, entry.propertyValue);
          hasUpdates = true;
        }
      });
      if (hasUpdates) {
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
        const currentItemIndex = this.register.findIndex((item) => item.name === focusedFieldName);
        if (currentItemIndex < this.register.length - 1) {
          this.setFocus(this.register[currentItemIndex + 1].name);
        }
      }
      if (direction === MOVE_DIRECTION.LEFT) {
        const currentItemIndex = this.register.findIndex((item) => item.name === focusedFieldName);
        if (currentItemIndex > 0) {
          this.setFocus(this.register[currentItemIndex - 1].name);
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
    }
  }

  /**
   * This function adds a new changegroup to the TAF.
   */
  addRow () {
    const newTafState = cloneDeep(this.state.tafAsObject);
    // console.log('nwSt', cloneDeep(newTafState));
    newTafState.changegroups.push(cloneDeep(TAF_TEMPLATES.CHANGE_GROUP));
    // console.log('nwSt2', cloneDeep(newTafState));
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
    this.setState({
      tafAsObject: newTafState,
      hasEdits: true
    });
  };

  // shouldComponentUpdate (nextProps, nextState) {
  //   if (isEqual(nextProps, this.props) && isEqual(nextState, this.state)) {
  //     return false;
  //   };
  //   this.validateTaf(nextState.tafAsObject);
  //   return true;
  // }

  componentWillReceiveProps (nextProps) {
    const nextP = cloneDeep(nextProps);
    if ('taf' in nextProps && nextProps.taf) {
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
        nextP.taf.metadata.location = defaults.location;
      }
    }
    if (!this.state.hasEdits) {
      this.setState({ tafAsObject: nextP.taf });
    }
  }

  render () {
    console.log('Rendering TafCategory', cloneDeep(this.state.tafAsObject));
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );
    let validationErrors = null;
    let validationSucceeded = false;
    if (this.state.validationReport && this.state.validationReport.errors) {
      validationErrors = JSON.parse(this.state.validationReport.errors);
      console.log('Errors', validationErrors);
    }
    if (this.state.validationReport && this.state.validationReport.succeeded === true) {
      validationSucceeded = true;
    }
    const series = this.extractScheduleInformation(cloneDeep(this.state.tafAsObject));
    return (
      <Row className='TafCategory' style={{ flex: 1 }}>
        <Col style={{ flexDirection: 'column' }}>
          <Row style={{ margin: '0', padding:'4px', backgroundColor:'#EEE', flex: 'auto' }}>
            <Col>{this.state.tafAsObject.metadata.uuid}</Col>
          </Row>
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
            ? <Row className={validationSucceeded ? 'TAFValidationReportSuccess' : 'TAFValidationReportError'} style={{ flex: 'none' }}>
              <Col xs='12'><b>{this.state.validationReport.message}</b></Col>
              { validationErrors ? (flatten(Object.values(validationErrors).filter(v => Array.isArray(v)))).map((value, index) => {
                return (<Col xs='12' key={'errmessageno' + index}>{(index + 1)} - {value}</Col>);
              }) : null}
            </Row> : null
          }
          { this.state.validationReport && this.state.validationReport.tac
            ? <Row className='TACReport'> <Col style={{ flexDirection: 'column' }}>{this.state.validationReport.tac}</Col></Row> : null }
          <Row style={{ margin: '0', padding:'4px', backgroundColor:'#EEE', flex: 'none' }}>
            <Col />
            <Col xs='auto'>
              <Button style={{ marginRight: '0.33rem' }} color='primary' onClick={() => {
                this.saveTaf(this.state.tafAsObject);
              }} >Save</Button>
              <Button disabled={!validationSucceeded} onClick={() => { alert('Sending a TAF out is not yet implemented'); }} color='primary'>Send</Button>
            </Col>
          </Row>
          {/* <Row style={{ flex: 'auto', width: '100%' }}>
            <Col>
              <TACTable tafAsObject={tafJson} onChange={this.onTACChange} />
            </Col>
          </Row> */}
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
  editable: false
};

TafCategory.propTypes = {
  taf: TAF_TYPES.TAF.isRequired,
  editable: PropTypes.bool,
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export default TafCategory;
