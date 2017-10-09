import React, { Component } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button } from 'reactstrap';

/* ----- The following functions transform TAC Codes to TAF JSON codes */
let fromTACToWind = (value) => {
  if (value === null) return {};
  let obj = {
    direction: value.substring(0, 3) === 'VRB' ? 'VRB' : parseInt(value.substring(0, 3)),
    speed: parseInt(value.substring(3, 5)),
    gusts: value.indexOf('G') !== -1 ? parseInt(value.substring(6, 8)) : null,
    unit: 'KT'
  };
  return obj;
};

let fromTACToValidStart = (value) => {
  if (value && value.length > 3) {
    let issueTime = moment().utc().date(parseInt(value.substring(0, 2))).hour(parseInt(value.substring(2, 4))).format('YYYY-MM-DDTHH:00:00');
    return issueTime + 'Z';
  }
  return null;
};

let fromTACToValidEnd = (value) => {
  if (value && value.length > 8) {
    let issueTime = moment().utc().date(parseInt(value.substring(5, 7))).hour(parseInt(value.substring(7, 9))).format('YYYY-MM-DDTHH:00:00');
    return issueTime + 'Z';
  }
  return null;
};

let fromTACToVisibility = (value) => {
  if (value === null || value === undefined) {
    return null;
  }
  if (value === '9999') {
    return {
      value:9999,
      unit: null
    };
  } else {
    if (value.indexOf('KM') !== -1) {
      return {
        value: parseInt(value.substring(0, 2)),
        unit: 'KM'
      };
    } else if (value.indexOf('SM') !== -1) {
      return {
        value: parseInt(value.substring(0, 1)),
        unit: 'SM'
      };
    } else {
      return {
        value: parseInt(value.substring(0, 4)),
        unit: 'M'
      };
    }
  }
};

let fromTACToWeather = (_value) => {
  let value = _value;
  if (!value || value === 'NSW' || value === '') {
    return null;
  }
  let qualifier = 'moderate';
  if (value.startsWith('+')) {
    qualifier = 'heavy';
    value = _value.substring(1);
  } else if (value.startsWith('-')) {
    qualifier = 'light';
    value = _value.substring(1);
  } else if (value.startsWith('VC')) {
    qualifier = 'vicinity';
    value = _value.substring(2);
  }

  let tacDescriptor = value.substring(0, 2);
  let descriptor = null; for (let key in descriptorMap) if (tacDescriptor === descriptorMap[key]) { descriptor = key; break; }

  let phenomenas = [];
  for (let p = descriptor ? 2 : 0; p < value.length; p = p + 2) {
    let tacPhenomena = value.substring(p, p + 2);
    for (let key in phenomenaMap) if (tacPhenomena === phenomenaMap[key]) { phenomenas.push(key); break; }
  }
  let obj = {
    descriptor:descriptor,
    phenomena: phenomenas,
    qualifier: qualifier
  };
  return obj;
};

let fromTACToClouds = (value) => {
  let ret = null;
  if (!value || value === 'NSC' || value === '') {
    return ret;
  }

  if (value.startsWith('VV')) {
    // Two letter cloud codes, like VV001
    ret = {
      amount:value.substring(0, 2),
      height:parseInt(value.substring(2, 5)),
      mod: value.length > 5 ? value.slice(5 - value.length) : null
    };
  } else {
    // All three letter cloud codes
    ret = {
      amount:value.substring(0, 3),
      height:parseInt(value.substring(3, 6)),
      mod: value.length > 6 ? value.slice(6 - value.length) : null
    };
  }
  return ret;
};

let getTACWeatherArray = (cg) => {
  let weatherObj = [];
  for (let w = 0; w < 3; w++) {
    let weatherInput = fromTACToWeather(cg.input['weather' + w]);
    if (weatherInput !== null) {
      if (w === 0 && (weatherInput === 'NSW' || weatherInput === '' || weatherInput === null)) {
        return 'NSW';
      }
      weatherObj.push(weatherInput);
    }
  }
  if (weatherObj.length === 0) {
    weatherObj = 'NSW';
  }
  return weatherObj;
};

let getTACCloudsArray = (cg) => {
  let cloudsObj = [];
  for (let c = 0; c < 4; c++) {
    let cloudsInput = fromTACToClouds(cg.input['clouds' + c]);
    if (cloudsInput !== null) {
      if (c === 0 && (cloudsInput === 'isNSC' || cloudsInput === '' || cloudsInput === null)) {
        return 'NSC';
      }
      cloudsObj.push(cloudsInput);
    }
  }
  if (cloudsObj.length === 0) {
    cloudsObj = 'NSC';
  }
  return cloudsObj;
};

let removeAllNullProps = (_taf) => {
  let iterate = (obj, stack) => {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (obj[property] === null) {
          delete obj[property];
        } else {
          if (typeof obj[property] === 'object') {
            iterate(obj[property], stack + '.' + property);
          } else {
            // console.log(stack + '->' + property + '   ' + obj[property]);
          }
        }
      }
    }
  };
  iterate(_taf, '');
  return _taf;
};

let createTAFJSONFromInput = (_taf) => {
  let taf = Object.assign({}, _taf);
  if (!taf.forecast) taf.forecast = {};
  if (!taf.metadata) taf.metadata = {};

  taf.metadata.status = 'concept';
  taf.metadata.type = 'normal';

  taf.forecast.wind = fromTACToWind(taf.input.wind);
  taf.forecast.visibility = fromTACToVisibility(taf.input.visibility);
  taf.forecast.weather = getTACWeatherArray(taf);
  taf.forecast.clouds = getTACCloudsArray(taf);

  delete taf.input;
  for (let j = 0; j < taf.changegroups.length; j++) {
    if (!taf.changegroups[j].forecast) taf.changegroups[j].forecast = {};
    // PROB and CHANGE are one string in json
    taf.changegroups[j].changeType =
      (taf.changegroups[j].input.prob ? taf.changegroups[j].input.prob : '') +
      (taf.changegroups[j].input.change && taf.changegroups[j].input.prob ? ' ' : '') +
      (taf.changegroups[j].input.change ? taf.changegroups[j].input.change : '');
    taf.changegroups[j].changeStart = fromTACToValidStart(taf.changegroups[j].input.valid);
    taf.changegroups[j].changeEnd = fromTACToValidEnd(taf.changegroups[j].input.valid);
    taf.changegroups[j].forecast.wind = fromTACToWind(taf.changegroups[j].input.wind);
    taf.changegroups[j].forecast.visibility = fromTACToVisibility(taf.changegroups[j].input.visibility);
    taf.changegroups[j].forecast.weather = getTACWeatherArray(taf.changegroups[j]);
    taf.changegroups[j].forecast.clouds = getTACCloudsArray(taf.changegroups[j]);
    delete taf.changegroups[j].input;
  }
  return removeAllNullProps(taf);
};

/* ------ Helper functions for setting and remembering local state ----- */

let setInputItem = (taf, name, value) => {
  if (!taf) return value;
  if (!taf.input) taf.input = {};
  taf.input[name] = value === null ? '' : '' + value;
  return value;
};

let getInputItem = (taf, name) => {
  if (taf && taf.input && taf.input[name] !== undefined) return taf.input[name];
  return null;
};

/* ----- The following functions TAF JSON codes to TAC codes used in input fields ------ */
let getWindTAC = (taf) => {
  let value = getInputItem(taf, 'wind'); if (value !== null) return value;
  if (!taf) return null;
  if (taf.forecast && taf.forecast.wind) {
    if (!taf.forecast.wind.direction) return setInputItem(taf, 'wind', '');
    value = ('00' + taf.forecast.wind.direction).slice(-3) + '' + (('0' + (!taf.forecast.wind.speed ? 0 : taf.forecast.wind.speed))).slice(-2);
    if (taf.forecast.wind.gusts) {
      value += 'G' + ('0' + taf.forecast.wind.gusts).slice(-2);
    }
    // value += taf.forecast.wind.unit; <---- Not common practice to show KT in input field
  }
  return setInputItem(taf, 'wind', value);
};

let getChangeTAC = (taf) => {
  let value = getInputItem(taf, 'change'); if (value !== null) return value;

  if (!taf) return null;

  if (taf.changeType) {
    if (taf.changeType.indexOf('PROB') === -1) {
      return setInputItem(taf, 'change', taf.changeType);
    } else {
      if (taf.changeType.indexOf(' ') !== -1) {
        return setInputItem(taf, 'change', taf.changeType.split(' ')[1]);
      }
    }
  }

  return null;
};

let getProbTAC = (taf) => {
  let value = getInputItem(taf, 'prob'); if (value !== null) return value;
  if (taf) {
    if (taf.changeType) {
      if (taf.changeType.indexOf('PROB') !== -1) {
        if (taf.changeType.indexOf(' ') !== -1) {
          return setInputItem(taf, 'prob', taf.changeType.split(' ')[0]);
        } else {
          return setInputItem(taf, 'prob', taf.changeType);
        }
      }
    }
  }
  return null;
};

// Save en Send ipv Submit
// Meerdere concepten open

const qualifierMap = {
  light:'-',
  moderate:'',
  heavy:'+',
  vicinity:'VC'
};

const descriptorMap = {
  shallow: 'MI',
  patches: 'BC',
  partial: 'PR',
  'low drifting': 'DR',
  blowing: 'BL',
  showers: 'SH',
  thunderstorm: 'TS',
  freezing: 'FZ'
};

const phenomenaMap = {
  'drizzle': 'DZ',
  'rain': 'RA',
  'snow': 'SN',
  'snow grains': 'SG',
  'ice pellets': 'PL',
  'hail': 'GR',
  'small hail': 'GS',
  'unknown precipitation': 'UP',
  'mist': 'BR',
  'fog': 'FG',
  'smoke': 'FU',
  'volcanic ash': 'VA',
  'widespread dust': 'DU',
  'sand': 'SA',
  'haze': 'HZ',
  'dust': 'PO',
  'squalls': 'SQ',
  'funnel clouds': 'FC',
  'sandstorm': 'SS',
  'duststorm': 'DS'
};

let getVisibilityTAC = (taf) => {
  let value = getInputItem(taf, 'visibility'); if (value !== null) return value;
  if (taf && taf.forecast && taf.forecast.visibility && taf.forecast.visibility.value) {
    if (taf.forecast.visibility.unit) {
      if (taf.forecast.visibility.unit === 'KM') {
        return setInputItem(taf, 'visibility', ('0' + taf.forecast.visibility.value).slice(-2) + taf.forecast.visibility.unit);
      } else {
        return setInputItem(taf, 'visibility', ('000' + taf.forecast.visibility.value).slice(-4));
      }
    } else {
      return setInputItem(taf, 'visibility', taf.forecast.visibility.value);
    }
  }
  return null;
};

let getWeatherTAC = (taf, index) => {
  let value = getInputItem(taf, 'weather' + index); if (value !== null) return value;
  if (taf && taf.forecast && taf.forecast.weather) {
    if (typeof taf.forecast.weather === 'string') {
      if (index === 0) {
        return '';
      }
      // NSW
      return null;
    }
    if (index >= taf.forecast.weather.length) return null;
    let weather = taf.forecast.weather[index];
    let TACString = '';
    if (weather.qualifier) {
      TACString += qualifierMap[weather.qualifier];
    }
    if (weather.descriptor) {
      TACString += descriptorMap[weather.descriptor];
    }
    if (weather.phenomena) {
      if (typeof taf.forecast.weather === 'string') {
        TACString += phenomenaMap[weather.phenomena];
      } else {
        for (let p = 0; p < weather.phenomena.length; p++) {
          TACString += phenomenaMap[weather.phenomena[p]];
        }
      }
    }
    return setInputItem(taf, 'weather' + index, TACString);
  }
  return null;
};

let getCloudsTAC = (taf, index) => {
  let value = getInputItem(taf, 'clouds' + index); if (value !== null) return value;
  if (taf && taf.forecast && taf.forecast.clouds) {
    if (typeof taf.forecast.clouds === 'string') {
      if (index === 0) {
        return ''; // taf.forecast.clouds;
      }
      return null;
    }
    if (index >= taf.forecast.clouds.length) return null;
    let clouds = taf.forecast.clouds[index];
    if (clouds.amount && clouds.height) {
      return setInputItem(taf, 'clouds' + index, clouds.amount + ('00' + clouds.height).slice(-3) + (clouds.mod ? clouds.mod : ''));
    }
  }
  return null;
};

let getValidPeriodTAC = (taf) => {
  let value = getInputItem(taf, 'valid'); if (value !== null) return value;
  let dateToDDHH = (dateString) => {
    var day = moment(dateString);
    day.utc();
    return ('0' + day.date()).slice(-2) + '' + ('0' + day.hour()).slice(-2);
  };
  let validityStart = null;
  let validityEnd = null;
  if (taf) {
    if (taf.metadata) {
      validityStart = taf.metadata.validityStart;
      validityEnd = taf.metadata.validityEnd;
    } else {
      validityStart = taf.changeStart;
      validityEnd = taf.changeEnd;
    }
  }
  if (!validityStart || !validityEnd) return setInputItem(taf, 'valid', '');
  let validityStartTAC = dateToDDHH(validityStart);
  let validityEndTAC;
  if (validityEnd) {
    validityEndTAC = '/' + dateToDDHH(validityEnd);
  }
  return setInputItem(taf, 'valid', validityStartTAC + validityEndTAC);
};

class TACColumn extends Component {
  componentDidMount () {
    let { focusRefId } = this.props;
    if (focusRefId) {
      this.refs[focusRefId].focus();
    }
  }
  render () {
    let { value, rowIndex, colIndex, onChange, onKeyUp, editable, onFocusOut } = this.props;
    let v = '';
    switch (colIndex) {
      case 0:
        return (<td className='noselect' >{ editable ? <Icon style={{ cursor:'pointer' }} name='bars' /> : null } </td>);
      case 1:
        v = getProbTAC(value); break;
      case 2:
        v = getChangeTAC(value); break;
      case 3:
        v = getValidPeriodTAC(value); break;
      case 4:
        v = getWindTAC(value); break;
      case 5:
        v = getVisibilityTAC(value); break;
      case 6: case 7: case 8:
        v = getWeatherTAC(value, colIndex - 6); break;
      case 9: case 10: case 11: case 12:
        v = getCloudsTAC(value, colIndex - 9); break;
    }
    if (editable) {
      return (<td><input
        ref='inputfield'
        value={!v ? '' : v}
        onKeyUp={(evt) => { onKeyUp(evt, rowIndex, colIndex, v); }}
        onBlur={() => { onFocusOut(); }}
        onChange={(evt) => { onChange(evt, rowIndex, colIndex); }} />
      </td>);
    } else {
      return (<td><input value={!v ? '' : v} disabled /></td>);
    }
  }
};

TACColumn.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  rowIndex: PropTypes.number,
  colIndex: PropTypes.number,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func,
  focusRefId: PropTypes.string
};

class ChangeGroup extends Component {
  render () {
    let { value, onChange, onKeyUp, rowIndex, onDeleteRow, editable, onFocusOut, focusRefId } = this.props;
    let cols = [];
    for (let colIndex = 0; colIndex < 13; colIndex++) {
      cols.push((<TACColumn
        ref={'column_' + colIndex}
        key={cols.length}
        value={value}
        rowIndex={rowIndex}
        colIndex={colIndex}
        onChange={onChange}
        onKeyUp={onKeyUp}
        editable={editable}
        onFocusOut={onFocusOut}
        focusRefId={focusRefId} />));
    }
    if (editable) {
      cols.push(
        <td key='removerow' style={{ cursor:'pointer' }}>
          <Button size='sm' color='secondary' onClick={() => { onDeleteRow(rowIndex); }}><Icon style={{ cursor:'pointer' }} name={'remove'} /></Button>
        </td>);
    }
    return (
      <tr>
        {cols}
      </tr>
    );
  }
};

ChangeGroup.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  rowIndex: PropTypes.number,
  onDeleteRow: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func,
  focusRefId: PropTypes.string
};

class SortableChangeGroup extends SortableElement(() => {}) { // { value, onChange, onKeyUp, rowIndex, onDeleteRow, onFocusOut, focusRefId }) => {
  render () {
    let { value, onChange, onKeyUp, rowIndex, onDeleteRow, onFocusOut, focusRefId } = this.props;
    return (<ChangeGroup
      ref='sortablechangegroup'
      value={value}
      onChange={onChange}
      onKeyUp={onKeyUp}
      rowIndex={rowIndex}
      onDeleteRow={onDeleteRow}
      editable
      onFocusOut={onFocusOut}
      focusRefId={focusRefId} />);
  }
};

SortableChangeGroup.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  rowIndex: PropTypes.number,
  onDeleteRow: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func,
  focusRefId: PropTypes.string
};

class BaseForecast extends Component {
  render () {
    let { value, onChange, onKeyUp, editable, onFocusOut } = this.props;
    let cols = [];
    let location = 'EHAM';
    if (value && value.metadata && value.metadata.location) {
      location = value.metadata.location;
    } else {
      if (!value.metadata) value.metadata = {};
      value.metadata.location = location;
    }
    let issueTime = moment().utc().add(1, 'hour').format('DD-MM-YYYY HH:00');
    if (value && value.metadata && value.metadata.issueTime) {
      issueTime = value.metadata.issueTime;
    } else {
      if (!value.metadata) value.metadata = {};
      value.metadata.issueTime = moment().utc().add(1, 'hour').format('YYYY-MM-DDTHH:00:00') + 'Z';
    }
    cols.push(<td key={cols.length} className='noselect' >&nbsp;</td>);
    cols.push(<td key={cols.length} className='TACnotEditable'>{location}</td>);
    cols.push(<td key={cols.length} className='TACnotEditable'>{issueTime}</td>);
    cols.push(<td key={cols.length} className='TACnotEditable'>{getValidPeriodTAC(value)}</td>);
    for (let j = 4; j < 13; j++) {
      cols.push(
        (<TACColumn
          ref={'column_' + j}
          key={cols.length}
          value={value}
          rowIndex={-1}
          colIndex={j}
          onChange={onChange}
          onKeyUp={onKeyUp}
          editable={editable}
          onFocusOut={onFocusOut} />));
    }
    return (
      <tr>
        {cols}
      </tr>
    );
  }
};

BaseForecast.propTypes = {
  value: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func
};

class TafTable extends SortableContainer(() => {}) { // =
  render () {
    let { tafJSON, onChange, onKeyUp, onAddRow, onDeleteRow, editable, onFocusOut, focusRefId } = this.props;
    if (!tafJSON || !tafJSON.changegroups) {
      tafJSON = {
        forecast:{},
        changegroups:[]
      };
    }
    return (
      <table className='TafStyle'>
        <thead>
          <tr>
            <th style={{ padding:'0 1em 0 1em' }}>&nbsp;</th>
            <th>Location</th>
            <th>Issue time</th>
            <th>Valid period</th>
            <th>Wind</th>
            <th>Visibility</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          <BaseForecast ref={'baseforecast'} value={tafJSON} onChange={onChange} onKeyUp={onKeyUp} onDeleteRow={onDeleteRow}
            onFocusOut={onFocusOut} focusRefId={focusRefId} editable />
        </tbody>

        <thead>
          <tr>
            <th>&nbsp;</th>
            <th>Prob</th>
            <th>Change</th>
            <th>Valid period</th>
            <th>Wind</th>
            <th>Visibility</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Weather</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>Cloud</th>
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {tafJSON.changegroups.map((value, index) => {
            if (editable) {
              return (<SortableChangeGroup
                ref={'changegroup_' + index}
                key={`item-${index}`}
                index={index}
                rowIndex={index}
                value={value}
                onChange={onChange} onKeyUp={onKeyUp} onDeleteRow={onDeleteRow}
                onFocusOut={onFocusOut} focusRefId={focusRefId} />);
            } else {
              return (<ChangeGroup key={`item-${index}`} index={index} rowIndex={index} value={value} onChange={onChange} onKeyUp={onKeyUp} onDeleteRow={onDeleteRow}
                onFocusOut={onFocusOut} />);
            }
          })}
          { editable
            ? <tr>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((index, value) => { return (<td key={index} >&nbsp;</td>); })}
              <td key='addrow'><Button size='sm' color='secondary' onClick={() => { onAddRow(); }}><Icon style={{ cursor:'pointer' }} name={'plus'} /></Button></td>
            </tr> : null
          }
        </tbody>
      </table>
    );
  }
};
TafTable.propTypes = {
  tafJSON: PropTypes.object,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  onAddRow: PropTypes.func,
  onDeleteRow: PropTypes.func,
  editable : PropTypes.bool,
  onFocusOut: PropTypes.func,
  focusRefId: PropTypes.string
};

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

  onSortEnd ({ oldIndex, newIndex }) {
    // console.log('state from sort');
    this.state.tafJSON.changegroups = arrayMove(this.state.tafJSON.changegroups, oldIndex, newIndex);
    this.setState({
      tafJSON: this.state.tafJSON
    });
  };

  setTACColumnInput (value, rowIndex, colIndex, tafRow) {
    if (!tafRow) {
      console.log('returning because tafRow missing');
      return tafRow;
    }
    if (!tafRow.forecast) {
      tafRow.forecast = {};
    }
    if (!tafRow.input) tafRow.input = {};
    switch (colIndex) {
      case 1:
        tafRow.input.prob = value; break;
      case 2:
        tafRow.input.change = value; break;
      case 3:
        tafRow.input.valid = value; break;
      case 4:
        tafRow.input.wind = value; break;
      case 5:
        tafRow.input.visibility = value; break;
      case 6: case 7: case 8:
        tafRow.input['weather' + (colIndex - 6)] = value; break;
      case 9: case 10: case 11: case 12:
        tafRow.input['clouds' + (colIndex - 9)] = value; break;
    }
    return tafRow;
  }

  /*
    rowIndex -1 means forcast, others are changegroups
  */
  onChange (event, rowIndex, colIndex) {
    let fieldVal = event.target.value;
    if (fieldVal === undefined || fieldVal === null) fieldVal = '';
    fieldVal = fieldVal.toUpperCase();
    let newTaf = Object.assign({}, this.state.tafJSON);
    this.setTACColumnInput(fieldVal, rowIndex, colIndex, rowIndex >= 0 ? newTaf.changegroups[rowIndex] : newTaf);
    // console.log('state from input');
    this.setState({
      tafJSON: newTaf
    });
  }

  updateTACtoTAFJSONtoTac () {
    /* First from form inputs to TAF JSON */
    let newTAFJSON = createTAFJSONFromInput(this.state.tafJSON);
    if (!newTAFJSON) {
      console.log('error newTAFJSON is null');
      return;
    }
    newTAFJSON.metadata.uuid = null;
    /* Then update state and inputs will be rendered from JSON */
    this.setState({
      tafJSON: Object.assign({}, newTAFJSON)
    });
    return newTAFJSON;
  }

  onKeyUp (event, row, col, inputValue) {
    if (event.keyCode === 13) {
      this.onAddRow();
    }
    if (event.keyCode === 27) {
      this.updateTACtoTAFJSONtoTac();
    }
    if (this.state.tafJSON.changegroups.length > 0) {
      if (event.keyCode === 38) { // KEY ARROW UP
        if (row === 0) { // Up from changegroup to baseforecast
          this.refs['taftable'].refs['baseforecast'].refs['column_' + col].refs['inputfield'].focus();
        } else if (row > 0) { // Up from changegroup to changegroup
          this.refs['taftable'].refs['changegroup_' + (row - 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        }
      }
      if (event.keyCode === 40) { // KEY ARROW DOWN
        if (row === -1) { // Down from baseforecast to changegroup
          this.refs['taftable'].refs['changegroup_' + (row + 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        } else if (row >= 0 && row < (this.state.tafJSON.changegroups.length - 1)) { // Down from changegroup to changegroup
          this.refs['taftable'].refs['changegroup_' + (row + 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        }
      }
    }
  }

  onAddRow () {
    let changeGroups = this.state.tafJSON.changegroups;
    changeGroups.push({});
    this.setState({
      tafJSON: this.state.tafJSON
    });
  }

  onFocusOut () {
    this.updateTACtoTAFJSONtoTac();
  }

  onDeleteRow (rowIndex) {
    let changeGroups = this.state.tafJSON.changegroups;
    changeGroups.splice(rowIndex, 1);
    this.setState({
      tafJSON: this.state.tafJSON
    });
    console.log(rowIndex);
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
          // console.log('state from props');
          this.setState({
            tafJSON: Object.assign({}, tafJSON)
          });
        }
      }
    }
  }

  render () {
    return (
      <div style={{ margin: '0px', padding:'0px', overflow:'auto', display:'inline-block' }}>
        <div style={{ backgroundColor:'#EEE', padding:'5px' }}>
          <TafTable
            ref={'taftable'}
            tafJSON={this.state.tafJSON}
            onSortEnd={this.onSortEnd}
            onChange={this.onChange}
            onKeyUp={this.onKeyUp}
            onAddRow={this.onAddRow}
            onDeleteRow={this.onDeleteRow}
            editable={this.props.editable}
            onFocusOut={this.onFocusOut}
            focusRefId={''} />
        </div>
        <div style={{ float:'right' }}>
          <Button color='primary' onClick={() => { this.props.saveTaf(createTAFJSONFromInput(this.state.tafJSON)); }} >Save</Button>
          <Button onClick={() => { alert('Sending a TAF out is not yet implemented'); }} color='primary'>Send</Button>
        </div>
      </div>);
  }
}

TafCategory.propTypes = {
  taf: PropTypes.object,
  saveTaf :PropTypes.func,
  editable: PropTypes.bool
};

export default TafCategory;
