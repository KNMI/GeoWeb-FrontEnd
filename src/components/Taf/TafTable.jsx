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
class TafTable extends SortableContainer(() => {}) {
  constructor (props) {
    super(props);
    this.getBaseLabelLine = this.getBaseLabelLine.bind(this);
    this.getBaseForecastLine = this.getBaseForecastLine.bind(this);
    this.getChangeGroupLabelLine = this.getChangeGroupLabelLine.bind(this);
    this.getChangeGroupForecastLine = this.getChangeGroupForecastLine.bind(this);
  }

  getBaseLabelLine () {
    return <thead>
      <tr>
        <th>&nbsp;</th>
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
    </thead>;
  }

  getBaseForecastLine (tafJSON) {
    return <tbody>
      <BaseForecast ref={'baseforecast'} tafMetadata={tafJSON.metadata} tafForecast={tafJSON.forecast} editable validationReport={this.props.validationReport} />
    </tbody>;
  }

  getChangeGroupLabelLine () {
    return <thead>
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
    </thead>;
  }

  getChangeGroupForecastLine (editable, value, index, tafJSON, onChange, onKeyUp, onFocusOut, onDeleteRow) {
    return editable
      ? <SortableChangeGroup
        ref={'changegroup_' + index}
        key={`item-${index}`}
        index={index}
        rowIndex={index}
        value={value}
        onChange={onChange}
        onKeyUp={onKeyUp}
        onDeleteRow={onDeleteRow}
        onFocusOut={onFocusOut} validationReport={this.props.validationReport} />
      : <ChangeGroup key={`item-${index}`} index={index} rowIndex={index} value={value} onChange={onChange} onKeyUp={onKeyUp} onDeleteRow={onDeleteRow}
        onFocusOut={onFocusOut} />;
  }

  render () {
    let { tafJSON, onChange, onKeyUp, onAddRow, onDeleteRow, editable, onFocusOut } = this.props;
    if (!tafJSON || !tafJSON.changegroups) {
      tafJSON = {
        forecast:{},
        changegroups:[]
      };
    }
    return (
      <table className='TafStyle TafStyleTable' onChange={onChange} onKeyUp={onKeyUp}>
        {this.getBaseLabelLine()}
        {this.getBaseForecastLine(tafJSON)}
        {this.getChangeGroupLabelLine()}

        <tbody>
          {tafJSON.changegroups.map((value, index) => {
            return this.getChangeGroupForecastLine(editable, value, index, tafJSON, onChange, onKeyUp, onFocusOut, onDeleteRow);
          })}
          { editable
            ? <tr>
              <td colSpan={13}>&nbsp;</td>
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
