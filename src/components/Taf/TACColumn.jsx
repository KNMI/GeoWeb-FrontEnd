import React, { Component } from 'react';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import { getProbTAC, getChangeTAC, getValidPeriodTAC, getWindTAC, getVisibilityTAC, getWeatherTAC, getCloudsTAC } from './TafjsonToTacFields';

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

export default TACColumn;
