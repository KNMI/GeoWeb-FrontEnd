import React from 'react';
import { Button } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import ChangeGroup from './ChangeGroup';
import BaseForecast from './BaseForecast';
import SortableChangeGroup from './SortableChangeGroup';
import { TAF_TEMPLATES, TAF_TYPES, PHENOMENON_TYPES, getPhenomenonType } from './TafTemplates';
import getNestedProperty from 'lodash.get';
import { tacToJsonForWind, tacToJsonForCavok, tacToJsonForVisibility, tacToJsonForWeather, tacToJsonForVerticalVisibility, tacToJsonForClouds,
  jsonToTacForChangeType, tacToJsonForProbabilityAndChangeType, jsonToTacForProbability, tacToJsonForTimestamp, tacToJsonForPeriod } from './TafFieldsConverter';

import cloneDeep from 'lodash.clonedeep';

/*
  TafTable uses BaseForecast and ChangeGroup with table headers to render an well aligned and editable TAC UI.
*/
class TafTable extends SortableContainer(() => {}) {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.getBaseLabelLine = this.getBaseLabelLine.bind(this);
    this.getBaseForecastLine = this.getBaseForecastLine.bind(this);
    this.getChangeGroupLabelLine = this.getChangeGroupLabelLine.bind(this);
    this.getChangeGroupForecastLine = this.getChangeGroupForecastLine.bind(this);
  }

  /**
   * Responds to the TAC input change
   * @param {object} event The event that has been fired
   */
  onChange (event) {
    switch (event.type) {
      case 'input':
      case 'change':
        this.updateValue(event.target);
        break;
      case 'blur':
        console.log('Event ', event.type, 'fired on', event.target);
        break;
      default:
        console.log('No action for event ', event.type, ' on ', event.target);
        break;
    }
  }

  /**
   * Updates the value in the state, according to the element value
   * @param  {HTMLElement} element The (input-)element to update the value from
   */
  updateValue (element) {
    let name = element ? (element.name || element.props.name) : null;
    if (name && typeof name === 'string') {
      const propertiesToUpdate = [];
      propertiesToUpdate.push({
        propertyPath: name.split('-'),
        propertyValue: null
      });
      const propertyTypeName = isNaN(propertiesToUpdate[0].propertyPath[propertiesToUpdate[0].propertyPath.length - 1])
        ? propertiesToUpdate[0].propertyPath[propertiesToUpdate[0].propertyPath.length - 1]
        : propertiesToUpdate[0].propertyPath[propertiesToUpdate[0].propertyPath.length - 2];
      const phenomenonType = getPhenomenonType(propertyTypeName);
      switch (phenomenonType) {
        case PHENOMENON_TYPES.WIND:
          propertiesToUpdate[0].propertyValue = tacToJsonForWind(element.value, true);
          break;
        case PHENOMENON_TYPES.VISIBILITY:
          propertiesToUpdate.push({
            propertyPath: cloneDeep(propertiesToUpdate[0].propertyPath),
            propertyValue: tacToJsonForVisibility(element.value, true)
          });
          propertiesToUpdate[0].propertyValue = tacToJsonForCavok(element.value);
          propertiesToUpdate[0].propertyPath.pop();
          propertiesToUpdate[0].propertyPath.push('caVOK');
          break;
        case PHENOMENON_TYPES.WEATHER:
          propertiesToUpdate[0].propertyValue = tacToJsonForWeather(element.value, true);
          if (propertiesToUpdate[0].propertyValue === 'NSW') {
            propertiesToUpdate[0].propertyPath.pop();
          }
          break;
        case PHENOMENON_TYPES.CLOUDS:
          propertiesToUpdate.push({
            propertyPath: cloneDeep(propertiesToUpdate[0].propertyPath),
            propertyValue: tacToJsonForClouds(element.value, true)
          });
          propertiesToUpdate[0].propertyValue = tacToJsonForVerticalVisibility(element.value);
          propertiesToUpdate[0].propertyPath.pop();
          propertiesToUpdate[0].propertyPath.pop();
          propertiesToUpdate[0].propertyPath.push('vertical_visibility');
          if (propertiesToUpdate[1].propertyValue === 'NSC') {
            propertiesToUpdate[1].propertyPath.pop();
          }
          break;
        default:
          break;
      }
      if (!propertiesToUpdate[0].propertyValue) {
        switch (propertyTypeName) {
          case 'probability':
            propertiesToUpdate[0].propertyPath.pop();
            propertiesToUpdate[0].propertyPath.push('changeType');
            const change = jsonToTacForChangeType(getNestedProperty(this.props.taf, propertiesToUpdate[0].propertyPath), true);
            propertiesToUpdate[0].propertyValue = tacToJsonForProbabilityAndChangeType(element.value, change, true);
            break;
          case 'change':
            propertiesToUpdate[0].propertyPath.pop();
            propertiesToUpdate[0].propertyPath.push('changeType');
            const probability = jsonToTacForProbability(getNestedProperty(this.props.taf, propertiesToUpdate[0].propertyPath), true);
            propertiesToUpdate[0].propertyValue = tacToJsonForProbabilityAndChangeType(probability, element.value, true);
            break;
          case 'validity':
            const scopeStart = this.props.taf.metadata.validityStart;
            const scopeEnd = this.props.taf.metadata.validityEnd;
            propertiesToUpdate[0].propertyPath.pop();
            propertiesToUpdate.push({
              propertyPath: cloneDeep(propertiesToUpdate[0].propertyPath),
              propertyValue: null
            });
            propertiesToUpdate[0].propertyPath.push('changeStart');
            propertiesToUpdate[1].propertyPath.push('changeEnd');
            let value = tacToJsonForTimestamp(element.value, scopeStart, scopeEnd);
            if (value) {
              value = { start: value, end: null };
            } else {
              value = tacToJsonForPeriod(element.value, scopeStart, scopeEnd, true);
            }
            propertiesToUpdate[0].propertyValue = value.start || { fallback: value.fallback };
            propertiesToUpdate[1].propertyValue = value.end;
            break;
          default:
            break;
        }
      }
      this.props.setTafValues(propertiesToUpdate);
    }
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
    let { taf, focusedFieldName, inputRef, editable, onKeyUp, onKeyDown, onClick, onFocus } = this.props;
    return (
      <table className='TafStyle TafStyleTable' onChange={this.onChange} onKeyUp={onKeyUp} onKeyDown={onKeyDown} onClick={onClick} onFocus={onFocus}>
        {this.getBaseLabelLine()}
        {this.getBaseForecastLine(taf, focusedFieldName, inputRef, editable)}
        {this.getChangeGroupLabelLine()}

        <tbody>
          {taf.changegroups.map((tafChangeGroup, index) => {
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
  setTafValues: () => {},
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
  taf: TAF_TYPES.TAF,
  focusedFieldName: PropTypes.string,
  editable : PropTypes.bool,
  inputRef: PropTypes.func,
  setTafValues: PropTypes.func,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  onClick: PropTypes.func,
  onFocus: PropTypes.func,
  onSortEnd: PropTypes.func,
  validationReport:PropTypes.object
};

export default TafTable;
