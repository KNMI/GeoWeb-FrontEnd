import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { getValidPeriodTAC } from './TafjsonToTacFields';
import TACColumn from './TACColumn';

/*
  BaseForecast of TAF editor, it is the top row visible in the UI.
*/
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

export default BaseForecast;
