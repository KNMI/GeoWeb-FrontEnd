import React from 'react';
import { Button } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import ChangeGroup from './ChangeGroup';
import BaseForecast from './BaseForecast';
import SortableChangeGroup from './SortableChangeGroup';

/*
  TafTable uses BaseForecast and ChangeGroup with table headers to render an well aligned and editable TAC UI.
*/
class TafTable extends SortableContainer(() => {}) { // =
  render () {
    let { tafJSON, onChange, onKeyUp, onAddRow, onDeleteRow, editable, onFocusOut, onFocus } = this.props;
    if (!tafJSON || !tafJSON.changegroups) {
      tafJSON = {
        forecast:{},
        changegroups:[]
      };
    }
    return (
      <table className='TafStyle TafStyleTable'>
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
            onFocusOut={onFocusOut} onFocus={onFocus} editable validationReport={this.props.validationReport} />
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
                onChange={onChange}
                onKeyUp={onKeyUp}
                onFocus={onFocus}
                onDeleteRow={onDeleteRow}
                onFocusOut={onFocusOut} validationReport={this.props.validationReport} />);
            } else {
              return (<ChangeGroup key={`item-${index}`} index={index} rowIndex={index} value={value} onChange={onChange} onKeyUp={onKeyUp} onDeleteRow={onDeleteRow}
                onFocusOut={onFocusOut} onFocus={onFocus} />);
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
  validationReport:PropTypes.object
};

export default TafTable;
