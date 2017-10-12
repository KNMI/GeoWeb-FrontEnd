import React, { Component } from 'react';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { getProbTAC, getChangeTAC, getValidPeriodTAC, getWindTAC, getVisibilityTAC, getWeatherTAC, getCloudsTAC } from './TafjsonToTacFields';

/*
  Get TAC from forecast by column index
*/
let getTACFromForecast = (forecastGroup, colIndex, editable) => {
  let v = '';
  switch (colIndex) {
    case 0:
      return (<td className='noselect' >{ editable ? <Icon style={{ cursor:'pointer' }} name='bars' /> : null } </td>);
    case 1:
      v = getProbTAC(forecastGroup); break;
    case 2:
      v = getChangeTAC(forecastGroup); break;
    case 3:
      v = getValidPeriodTAC(forecastGroup); break;
    case 4:
      v = getWindTAC(forecastGroup); break;
    case 5:
      v = getVisibilityTAC(forecastGroup); break;
    case 6: case 7: case 8:
      v = getWeatherTAC(forecastGroup, colIndex - 6); break;
    case 9: case 10: case 11: case 12:
      v = getCloudsTAC(forecastGroup, colIndex - 9); break;
  }
  return v;
};

/*
  Input columns to compose a BaseForecast or ChangeGroup
*/
class TACColumn extends Component {
  render () {
    let { value, rowIndex, colIndex, onChange, onKeyUp, editable, onFocusOut } = this.props;
    let v = getTACFromForecast(value, colIndex, editable);

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
  onFocusOut: PropTypes.func
};

export default TACColumn;
