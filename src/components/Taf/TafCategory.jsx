import React, { Component } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import Enum from 'es6-enum';
import TimeSchedule from '../TimeSchedule';
import moment from 'moment';
import { Button, Row, Col } from 'reactstrap';
import { createTAFJSONFromInput, setTACColumnInput, removeInputPropsFromTafJSON, cloneObjectAndSkipNullProps } from './FromTacCodeToTafjson';
import TafTable from './TafTable';
import { TAFS_URL } from '../../constants/backend';
import axios from 'axios';

const TMP = '_temp';

const CHANGE_TYPES = Enum(
  'FM', // from - instant, persisting change
  'BECMG', // becoming - gradual / fluctuating change, after which the change is persistent
  'PROB30', // probability of 30% for a temporary steady change
  'PROB40', // probability of 40% for a temporary steady change
  'TEMPO', // temporary fluctuating change
  'PROB30_TEMPO', // probability of 30% for a temporary fluctating change
  'PROP40_TEMPO' // probability of 40% for a temporary fluctating change
);

const CHANGE_TYPES_ORDER = [
  CHANGE_TYPES.FM,
  CHANGE_TYPES.BECMG,
  CHANGE_TYPES.PROB30,
  CHANGE_TYPES.PROB40,
  CHANGE_TYPES.TEMPO,
  CHANGE_TYPES.PROB30_TEMPO,
  CHANGE_TYPES.PROP40_TEMPO
];

const CHANGE_TYPES_SHORTHAND = {};
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.FM] = 'F';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.BECMG] = 'B';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB30] = 'P30';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB40] = 'P40';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.TEMPO] = 'T';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB30_TEMPO] = 'P30T';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB40_TEMPO] = 'P40T';

const PHENOMENON_TYPES = Enum(
  'WIND',
  'VISIBILITY',
  'WEATHER',
  'CLOUDS'
);

const PHENOMENON_TYPES_ORDER = [
  PHENOMENON_TYPES.WIND,
  PHENOMENON_TYPES.VISIBILITY,
  PHENOMENON_TYPES.WEATHER,
  PHENOMENON_TYPES.CLOUDS
];

/**
 * TafCategory is the component which renders an editable and sortable TAF table.
 * The UI is generated from a TAF JSON and it can generate/update TAF JSON from user input
 *
 * The component hierarchy is structured as follows:
 *
 *                                 TACColumn(s) -> BaseForecast -> \
 *                                                                   --> TafTable -> TafCategory -> Taf
 *     TACColumn(s) -> ChangeGroup(s) -> SortableChangeGroup(s) -> /
 *
 */
class TafCategory extends Component {
  constructor (props) {
    super(props);
    this.onSortEnd = this.onSortEnd.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
    this.updateTACtoTAFJSONtoTac = this.updateTACtoTAFJSONtoTac.bind(this);
    this.getChangeType = this.getChangeType.bind(this);
    this.getPhenomenonType = this.getPhenomenonType.bind(this);
    this.extractScheduleInformation = this.extractScheduleInformation.bind(this);
    this.decoratePhenomenonValue = this.decoratePhenomenonValue.bind(this);
    this.decorateStringValue = this.decorateStringValue.bind(this);
    this.decorateWindObjectValue = this.decorateWindObjectValue.bind(this);
    this.decorateCloudsArray = this.decorateCloudsArray.bind(this);
    this.decorateWeatherArray = this.decorateWeatherArray.bind(this);
    this.byPhenomenonType = this.byPhenomenonType.bind(this);
    this.byStartAndChangeType = this.byStartAndChangeType.bind(this);
    this.validateTAF = this.validateTAF.bind(this);
    this.saveTaf = this.saveTaf.bind(this);

    let TAFStartHour = moment().utc().hour();
    TAFStartHour = TAFStartHour + 6;
    TAFStartHour = parseInt(TAFStartHour / 6);
    TAFStartHour = TAFStartHour * (6);
    this.state = {
      tafJSON: {
        forecast:{},
        metadata:{
          validityStart: moment().utc().hour(TAFStartHour).add(0, 'hour').format('YYYY-MM-DDTHH:00:00') + 'Z',
          validityEnd: moment().utc().hour(TAFStartHour).add(30, 'hour').format('YYYY-MM-DDTHH:00:00') + 'Z'
        },
        changegroups:[]
      }
    };
  };

  /*
    Event handler which handles change events from all input (TAC) fields.
    - colIndex is the corresponding TACColumn
    - rowIndex -1 means BaseForecast, other values (>= 0) are ChangeGroups
  */
  onChange (event, rowIndex, colIndex) {
    let fieldVal = event.target.value;
    if (fieldVal === undefined || fieldVal === null) fieldVal = '';
    fieldVal = fieldVal.toUpperCase();
    let clonedTafState = cloneObjectAndSkipNullProps(this.state.tafJSON);
    setTACColumnInput(fieldVal, rowIndex, colIndex, rowIndex >= 0 ? clonedTafState.changegroups[rowIndex] : clonedTafState);
    let newTaf = createTAFJSONFromInput(clonedTafState);
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  }

  validateTAF (tafJSON) {
    // Validate typed settings
    let taf = removeInputPropsFromTafJSON(cloneObjectAndSkipNullProps(tafJSON));

    axios({
      method: 'post',
      url: TAFS_URL + '/tafs/verify',
      withCredentials: true,
      data: JSON.stringify(taf),
      headers: { 'Content-Type': 'application/json' }
    }).then(
      response => {
        if (response.data) {
          this.setState({
            validationReport:response.data
          });
        } else {
          this.setState({
            validationReport:null
          });
        }
      }
    ).catch(error => {
      console.log(error);
      this.setState({
        validationReport:{ message: 'Invalid response from TAF verify servlet [/tafs/verify].' }
      });
    });
  }

  saveTaf (tafDATAJSON) {
    axios({
      method: 'post',
      url: TAFS_URL + '/tafs',
      withCredentials: true,
      data: JSON.stringify(tafDATAJSON),
      headers: { 'Content-Type': 'application/json' }
    }).then(src => {
      this.setState({ validationReport:src.data });
      // this.props.updateParent();
    }).catch(error => {
      this.setState({ validationReport:{ message: 'Unable to save: error occured while saving TAF.' } });
      try {
        console.log('Error occured', error.response.data);
        if (error.response.data.message) {
          this.setState({ validationReport:{ message: error.response.data.message } });
        }
      } catch (e) {
        console.log(e);
        this.setState({ validationReport:{ message: JSON.stringify(error.response) } });
      }
    });
  }

  /*
    Function to update whole UI, roundtrip from TAC->JSON->TAC
    - First TAC fields are converted to TAF json object.
    - Second, TAC fields are rendered from TAF json (by setState)
  */
  updateTACtoTAFJSONtoTac () {
    /* First from form inputs to TAF JSON */
    let newTAFJSON = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
    if (!newTAFJSON) {
      console.log('error newTAFJSON is null');
      return;
    }
    /* Then update state and inputs will be rendered from JSON */
    this.setState({
      tafJSON: newTAFJSON
    });
    return newTAFJSON;
  }

  /**
   * Gets the phenomenon type by typeName
   * @param {string} typeName The name of the type
   * @return {symbol} The phenomenon type
   */
  getPhenomenonType (typeName) {
    if (typeof typeName === 'string' && typeName.toUpperCase() in PHENOMENON_TYPES) {
      return PHENOMENON_TYPES[typeName.toUpperCase()];
    } else {
      return null;
    }
  }

  /**
   * Gets the change type by typeName
   * @param {string} typeName The name of the type
   * @return {symbol} The change type
   */
  getChangeType (typeName) {
    if (typeof typeName === 'string') {
      const normalizedTypeName = typeName.toUpperCase().replace(/\s/g, '_');
      if (normalizedTypeName in CHANGE_TYPES) {
        return CHANGE_TYPES[normalizedTypeName];
      } else {
        return null;
      }
    } else {
      return null;
    }
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
    const typeAindex = PHENOMENON_TYPES_ORDER.indexOf(this.getPhenomenonType(labelA));
    const typeBindex = PHENOMENON_TYPES_ORDER.indexOf(this.getPhenomenonType(labelB));
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
    const typeAindex = CHANGE_TYPES_ORDER.indexOf(this.getChangeType(itemA.changeType));
    const typeBindex = CHANGE_TYPES_ORDER.indexOf(this.getChangeType(itemB.changeType));
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
    if (value.hasOwnProperty('direction') && typeof value.direction === 'number' &&
        value.hasOwnProperty('speed') && typeof value.speed === 'number') {
      const title = (prefix ? prefix + ': ' : '') + (value.direction ? value.direction + ' ' : '') +
        (value.speed ? value.speed + ' ' : '') + (value.gusts ? 'gusts ' + value.gusts : '');
      return <div className='col-auto' title={title}>
        {prefix
          ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
            {prefix}:&nbsp;
          </div>
          : null}
        {!isNaN(value.direction)
          ? <div className='col-auto'>
            {value.direction}
            <i className='fa fa-location-arrow' style={{ transform: 'rotate(' + (value.direction + 135) + 'deg)' }} aria-hidden='true' />
          </div>
          : null}
        {!isNaN(value.speed)
          ? <div className='col-auto'>{value.speed}</div>
          : null}
        {value.hasOwnProperty('gusts') && typeof value.gusts === 'number' && !isNaN(value.gusts)
          ? <div className='col-auto' style={{ marginLeft: '0.2rem' }}>gusts {value.gusts}</div>
          : null}
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
    if (value.length && value.length > 0 && value[0].hasOwnProperty('amount') && typeof value[0].amount === 'string') {
      const title = value.reduce((cumText, current, index) => {
        cumText += (current.amount ? current.amount : '') + (current.height ? current.height : '');
        if (index < value.length - 1) {
          cumText += ', ';
        }
        return cumText;
      }, ' ');
      return <div className='col-auto' title={title}>
        {prefix
          ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
            {prefix}:&nbsp;
          </div>
          : null}
        {value.map((cloud, index) => {
          return <div className='col-auto'>
            {cloud.hasOwnProperty('amount') && typeof cloud.amount === 'string'
              ? <div className='col-auto'>{cloud.amount}</div>
              : null}
            {cloud.hasOwnProperty('height') && typeof cloud.height === 'number' && !isNaN(cloud.height)
              ? <div className='col-auto'>{cloud.height}</div>
              : null}
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
    if (value.length && value.length > 0 && value[0].hasOwnProperty('phenomena') && value[0].phenomena.length > 0) {
      const title = value.reduce((cumText, current, index) => {
        cumText += (current.qualifier ? current.qualifier + ' ' : '') + (current.descriptor ? current.descriptor + ' ' : '');
        cumText += (current.phenomena
          ? current.phenomena.reduce((cumPhenText, current, index) =>
            cumPhenText + current, '')
          : '');
        if (index < value.length - 1) {
          cumText += ', ';
        }
        return cumText;
      }, ' ');
      return <div className='col-auto' title={title}>
        {prefix
          ? <div className='col-auto' style={{ fontWeight: 'bolder' }}>
            {prefix}:&nbsp;
          </div>
          : null}
        {value.map((weather, index) => {
          return <div className='col-auto' key={'weather' + index}>
            {weather.hasOwnProperty('qualifier') && typeof weather.qualifier === 'string'
              ? <div className='col-auto'>{weather.qualifier}</div>
              : null}
            {weather.hasOwnProperty('descriptor') && typeof weather.descriptor === 'string'
              ? <div className='col-auto' style={{ marginLeft: '0.2rem' }}>{weather.descriptor}</div>
              : null}
            {weather.hasOwnProperty('phenomena') && typeof weather.phenomena === 'object'
              ? <div className='col-auto' style={{ marginLeft: '0.2rem' }}>{weather.phenomena.join(', ')}</div>
              : null}
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
    switch (this.getPhenomenonType(phenomenonType)) {
      case PHENOMENON_TYPES.WIND:
        if (typeof phenomenonValueObject === 'object') {
          return this.decorateWindObjectValue(phenomenonValueObject, prefix);
        }
        return null;
      case PHENOMENON_TYPES.VISIBILITY:
        if (typeof phenomenonValueObject === 'object' && phenomenonValueObject.hasOwnProperty('value') &&
          typeof phenomenonValueObject.value === 'number' &&
          !isNaN(phenomenonValueObject.value)) {
          return this.decorateStringValue(phenomenonValueObject.value.toString(), prefix);
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
            value: value
          } ]
        });
      }
    });

    tafDataAsJson.changegroups.sort(this.byStartAndChangeType).map(change => {
      const changeType = this.getChangeType(change.changeType);

      const start = change.changeStart ? moment.utc(change.changeStart) : scopeStart;

      // FM only has a change start, and persists until scope end
      const end = changeType === CHANGE_TYPES.FM ? scopeEnd : (change.changeEnd ? moment.utc(change.changeEnd) : scopeStart);
      if (end.isBefore(start)) {
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
              value: this.decoratePhenomenonValue(entry[0], entry[1], null)
            });
          }
        }
      });
    });
    scheduleSeries.sort(this.byPhenomenonType);
    return scheduleSeries;
  }

  /*
    Event handler which handles keyUp events from input fields. E.g. arrow keys, Enter key, Esc key, etc...
  */
  onKeyUp (event, row, col, inputValue) {
    if (event.key === 'Enter') {
      this.onAddRow();
    }
    if (event.key === 'Escape') {
      this.updateTACtoTAFJSONtoTac();
      this.validateTAF(this.state.tafJSON);
    }
    if (this.state.tafJSON.changegroups.length > 0) {
      if (event.key === 'ArrowUp') { // KEY ARROW UP
        if (row === 0) { // Up from changegroup to baseforecast
          this.refs['taftable'].refs['baseforecast'].refs['column_' + col].refs['inputfield'].focus();
        } else if (row > 0) { // Up from changegroup to changegroup
          this.refs['taftable'].refs['changegroup_' + (row - 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        }
      }
      if (event.key === 'ArrowDown') { // KEY ARROW DOWN
        if (row === -1) { // Down from baseforecast to changegroup
          this.refs['taftable'].refs['changegroup_' + (row + 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        } else if (row >= 0 && row < (this.state.tafJSON.changegroups.length - 1)) { // Down from changegroup to changegroup
          this.refs['taftable'].refs['changegroup_' + (row + 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        }
      }
    }
  }

  /*
    Event handler that is called upon jumping out of an input field.
  */
  onFocusOut () {
    this.updateTACtoTAFJSONtoTac();
    this.validateTAF(this.state.tafJSON);
  }

  /*
    This function adds a new changegroup to the TAF.
    This method is for example fired upon clicking the 'Add row button' next to changegroups.
  */
  onAddRow () {
    let newTaf = cloneObjectAndSkipNullProps(this.state.tafJSON);
    newTaf.changegroups.push({});
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  }

  /*
    This function removes a changeGroup by given rowIndex.
  */
  onDeleteRow (rowIndex) {
    let newTaf = cloneObjectAndSkipNullProps(this.state.tafJSON);
    newTaf.changegroups.splice(rowIndex, 1);
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  };

  /*
    Callback function called by SortableElement and SortableContainer when changegroups are sorted by Drag and Drop
  */
  onSortEnd ({ oldIndex, newIndex }) {
    let newTaf = cloneObjectAndSkipNullProps(this.state.tafJSON);
    newTaf.changegroups = arrayMove(newTaf.changegroups, oldIndex, newIndex);
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  };

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    let tafJSON = null;
    if (nextProps.taf) {
      if (typeof nextProps.taf === 'string') {
        try {
          tafJSON = JSON.parse(nextProps.taf);
        } catch (e) {
          console.log(e);
        }
      } else {
        tafJSON = nextProps.taf;
      }
      if (tafJSON !== null) {
        if (tafJSON.changegroups) {
          let uuid = null;
          if (tafJSON.metadata && tafJSON.metadata.uuid) {
            uuid = tafJSON.metadata.uuid;
          }
          if (this.changegroupsSet === uuid) return;
          this.changegroupsSet = uuid;
          this.setState({
            tafJSON: cloneObjectAndSkipNullProps(tafJSON)
          });
          this.validateTAF(tafJSON);
        }
      }
    }
  }

  render () {
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );
    let validationErrors = null;
    let validationSucceeded = false;
    if (this.state.validationReport && this.state.validationReport.errors) {
      validationErrors = JSON.parse(this.state.validationReport.errors);
    }
    if (this.state.validationReport && this.state.validationReport.succeeded === true) {
      validationSucceeded = true;
    }
    const tafJson = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
    const series = this.extractScheduleInformation(tafJson);

    return (
      <Row className='TafCategory'>
        <Row style={{ flex: 'auto' }}>
          <Col style={{ margin: '0px', padding:'4px', backgroundColor:'#EEE', flexDirection:'column', flex: 1 }}>
            <Row style={{ flex: 'unset' }}>
              <Col>{this.state.tafJSON.metadata.uuid}</Col>
            </Row>
            <Row style={{ flex: 'unset' }}>
              <Col>
                <TafTable
                  ref={'taftable'}
                  validationReport={this.state.validationReport}
                  tafJSON={this.state.tafJSON}
                  onSortEnd={this.onSortEnd}
                  onChange={this.onChange}
                  onKeyUp={this.onKeyUp}
                  onAddRow={this.onAddRow}
                  onDeleteRow={this.onDeleteRow}
                  editable={this.props.editable}
                  onFocusOut={this.onFocusOut} />
              </Col>
            </Row>
            { this.state.validationReport
              ? <Row className={validationSucceeded ? 'TAFValidationReportSuccess' : 'TAFValidationReportError'} style={{ flex: 'unset' }} >
                <Col style={{ flexDirection: 'column' }}>
                  <div><b>{this.state.validationReport.message}</b></div>
                  { validationErrors ? (flatten(Object.values(validationErrors).filter(v => Array.isArray(v)))).map((value, index) => {
                    return (<div key={'errmessageno' + index}>{(index + 1)} - {value}</div>);
                  }) : null}
                </Col>
              </Row> : null
            }
            { this.state.validationReport && this.state.validationReport.tac
              ? <Row className='TACReport'> <Col style={{ flexDirection: 'column' }}>{this.state.validationReport.tac}</Col></Row> : null }
            <Row style={{ flex: 'unset' }}>
              <Col />
              <Col xs='auto'>
                <Button style={{ marginRight: '0.33rem' }} color='primary' onClick={() => {
                  let taf = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
                  this.saveTaf(taf);
                }} >Save</Button>
                <Button disabled={!validationSucceeded} onClick={() => { alert('Sending a TAF out is not yet implemented'); }} color='primary'>Send</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row style={{ flex: 'auto' }}>
          <Col>
            <TimeSchedule startMoment={moment.utc(tafJson.metadata.validityStart)} endMoment={moment.utc(tafJson.metadata.validityEnd)} series={series} />
          </Col>
        </Row>
      </Row>
    );
  }
}

TafCategory.propTypes = {
  taf: PropTypes.object,
  editable: PropTypes.bool
};

export default TafCategory;
