import React, { Component } from 'react';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { Tooltip } from 'reactstrap';
import { getInputValueAndTACValueFromForecast } from './TafjsonToTacFields';

/*
  Input columns to compose a BaseForecast or ChangeGroup
*/
class TACColumn extends Component {
  render () {
    let { value, rowIndex, colIndex, onChange, onKeyUp, editable, onFocusOut } = this.props;

    if (colIndex === 0) {
      return (<td className='noselect' >{ editable ? <Icon style={{ cursor:'pointer' }} name='bars' /> : null } </td>);
    }

    let valueObject = getInputValueAndTACValueFromForecast(value, colIndex);
    let v = valueObject.inputValue === null ? valueObject.tacValue : valueObject.inputValue;
    let className = 'TACColumnEmpty';
    if (valueObject.inputValue) {
      if (valueObject.inputValue === valueObject.tacValue) {
        className = 'TACColumnOK';
      } else {
        className = 'TACColumnWarning';
      }
    }
    let validationReport = null;
    let hasError = false;
    let errorMessage = '';
    if (this.props.validation) validationReport = this.props.validation;
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
        case 5: type = '/visibilty'; break;
        case 6: case 7: case 8: type = '/weather/' + (colIndex - 6); break;
        case 9: case 10: case 11: case 12: type = '/clouds/' + (colIndex - 9); break;
      }

      if (line && type) {
        let key = line + type;
        for (let errorKey in validationReport) {
          if (errorKey.startsWith(key)) {
            className = 'TACColumnError';
            errorMessage = validationReport[errorKey];
            hasError = true;
          }
        }
      }
    }
    if (editable) {
      return (<td>
        <input
          className={className}
          id={'taccol' + colIndex + '_' + rowIndex} // TODO ID's are UGLY! NEEDED FOR REACTSTRAP TOOLTIP!!! HORRIBLE!!
          ref='inputfield'
          value={!v ? '' : v}
          onKeyUp={(evt) => { onKeyUp(evt, rowIndex, colIndex, v); }}
          onBlur={() => { onFocusOut(); }}
          onChange={(evt) => { onChange(evt, rowIndex, colIndex); }} />
        { /* <Tooltip isOpen={hasError} target={'taccol' + colIndex + '_' + rowIndex} >{errorMessage}</Tooltip> */ }
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
  validation: PropTypes.object
};

export default TACColumn;
