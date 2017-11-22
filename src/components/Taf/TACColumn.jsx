import React, { Component } from 'react';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getInputValueAndTACValueFromForecast } from './TafjsonToTacFields';

/*
  Input columns to compose a BaseForecast or ChangeGroup
*/
class TACColumn extends Component {
  render () {
    let { value, rowIndex, colIndex, onChange, onKeyUp, editable, onFocusOut, onFocus } = this.props;

    if (colIndex === 0) {
      return (<td className='noselect' >{ editable ? <Icon style={{ cursor:'pointer' }} name='bars' /> : null } </td>);
    }

    let valueObject = getInputValueAndTACValueFromForecast(value, colIndex);
    let v = valueObject.inputValue === null ? valueObject.tacValue : valueObject.inputValue;
    let TACColumnOK = false;
    let TACColumnError = false;
    let TACColumnWarning = false;
    if (valueObject.inputValue) {
      if (valueObject.inputValue === valueObject.tacValue) {
        TACColumnOK = true;
      } else {
        TACColumnWarning = true;
      }
    }
    let validationReport = null;
    if (this.props.validationReport && this.props.validationReport.errors) validationReport = JSON.parse(this.props.validationReport.errors);
    if (validationReport) {
      let line = null;
      if (rowIndex === -1) {
        line = '/forecast';
      } else {
        line = '/changegroups/' + rowIndex + '/forecast';
      }
      let type = null;
      switch (colIndex) {
        case 1: type = '/changegroup'; break;
        case 2: type = '/changegroup'; break;
        case 3: type = '/validity'; break;
        case 4: type = '/wind'; break;
        case 5: type = '/visibility'; break;
        case 6: case 7: case 8: type = '/weather/' + (colIndex - 6); break;
        case 9: case 10: case 11: case 12: type = '/clouds/' + (colIndex - 9); break;
      }

      if (line && type) {
        let key = line + type;
        for (let errorKey in validationReport) {
          if (errorKey.startsWith(key)) {
            TACColumnError = true;
          }
        }
      }
    }
    const values = [null, null, null, null, 'wind', 'visibility', 'weather', 'weather', 'weather', 'cloud', 'cloud', 'cloud', 'cloud'];
    if (editable) {
      return (<td>
        <input
          className={classNames({ TACColumnEmpty:true, TACColumnOK: TACColumnOK, TACColumnError: TACColumnError, TACColumnWarning: TACColumnWarning })}
          ref='inputfield'
          value={!v ? '' : v}
          onKeyUp={(evt) => { onKeyUp(evt, rowIndex, colIndex, v); }}
          onBlur={() => { onFocusOut(); }}
          onFocus={() => { onFocus(values[colIndex]); }}
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
  validationReport: PropTypes.object
};

export default TACColumn;
