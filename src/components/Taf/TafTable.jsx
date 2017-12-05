import React from 'react';
import { Button } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import ChangeGroup from './ChangeGroup';
import BaseForecast from './BaseForecast';
import SortableChangeGroup from './SortableChangeGroup';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';

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

  getBaseForecastLine (tafJSON, focusedFieldName, inputRef, editable) {
    return <tbody>
      <BaseForecast tafMetadata={tafJSON.metadata} tafForecast={tafJSON.forecast}
        focusedFieldName={focusedFieldName} inputRef={inputRef} editable={editable} validationReport={this.props.validationReport} />
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

  getChangeGroupForecastLine (tafChangeGroup, focusedFieldName, inputRef, editable, index) {
    return editable
      ? <SortableChangeGroup
        key={`changegroups-${index}`}
        tafChangeGroup={tafChangeGroup}
        inputRef={inputRef}
        focusedFieldName={focusedFieldName}
        index={index}
        validationReport={this.props.validationReport} />
      : <ChangeGroup key={`changegroups-${index}`} tafChangeGroup={tafChangeGroup} inputRef={inputRef} focusedFieldName={focusedFieldName} index={index} />;
  }

  getAddChangeGroupLine (editable) {
    return editable
      ? <tr>
        <td colSpan={13}>&nbsp;</td>
        <td className='noselect'>
          <Button size='sm' color='secondary' name={'addible'}>{'\uf067' /* plus icon */}</Button>
        </td>
      </tr>
      : null;
  }

  render () {
    let { tafJSON, focusedFieldName, inputRef, editable, onChange, onKeyUp, onKeyDown, onClick, onFocus } = this.props;
    return (
      <table className='TafStyle TafStyleTable' onChange={onChange} onKeyUp={onKeyUp} onKeyDown={onKeyDown} onClick={onClick} onFocus={onFocus}>
        {this.getBaseLabelLine()}
        {this.getBaseForecastLine(tafJSON, focusedFieldName, inputRef, editable)}
        {this.getChangeGroupLabelLine()}

        <tbody>
          {tafJSON.changegroups.map((tafChangeGroup, index) => {
            return this.getChangeGroupForecastLine(tafChangeGroup, focusedFieldName, inputRef, editable, index);
          })}
          {this.getAddChangeGroupLine(editable)}
        </tbody>
      </table>
    );
  }
};

TafTable.defaultProps = {
  taf: cloneDeep(TAF_TEMPLATES.TAF),
  editable: false,
  inputRef: () => {},
  focusedFieldName: null,
  onKeyUp: () => {},
  onKeyDown: () => {},
  shouldCancelStart: function (e) {
    // Cancel sorting if the event target is an `input`, `textarea`, `select` or `option`
    const disabledElements = ['input', 'textarea', 'select', 'option'];

    if (disabledElements.indexOf(e.target.tagName.toLowerCase()) !== -1) {
      return true; // Return true to cancel sorting
    }
  }
};

TafTable.propTypes = {
  tafJSON: TAF_TYPES.TAF,
  focusedFieldName: PropTypes.string,
  editable : PropTypes.bool,
  inputRef: PropTypes.func,
  onChange: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  validationReport:PropTypes.object
};

export default TafTable;
