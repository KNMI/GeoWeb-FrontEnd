import React, { Component, PureComponent } from 'react';
import { Button } from 'reactstrap';
import { SortableContainer } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import ChangeGroup from './ChangeGroup';
import BaseForecast from './BaseForecast';
import SortableChangeGroup from './SortableChangeGroup';
import { TAF_TEMPLATES, TAF_TYPES, PHENOMENON_TYPES, getPhenomenonType } from './TafTemplates';
import getNestedProperty from 'lodash.get';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { tacToJsonForWind, tacToJsonForCavok, tacToJsonForVisibility, tacToJsonForWeather, tacToJsonForVerticalVisibility, tacToJsonForClouds,
  jsonToTacForChangeType, tacToJsonForProbabilityAndChangeType, jsonToTacForProbability, tacToJsonForTimestamp, tacToJsonForPeriod } from './TafFieldsConverter';

const SortableTBody = SortableContainer(({ tafChangeGroups, inputRef, focusedFieldName, invalidFields }) => {
  return <tbody>
    {tafChangeGroups.map((tafChangeGroup, index) => {
      return <SortableChangeGroup
        key={`changegroups-${index}`}
        tafChangeGroup={tafChangeGroup}
        inputRef={inputRef}
        focusedFieldName={focusedFieldName}
        index={index}
        changeGroupIndex={index}
        invalidFields={invalidFields[index] || []} />;
    })}
  </tbody>;
});

class BaseHeaders extends PureComponent {
  render () {
    return <thead>
      <tr>
        <th>&nbsp;</th>
        <th>Type</th>
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
}

class ChangeGroupHeaders extends PureComponent {
  render () {
    return <thead>
      <tr>
        <th>&nbsp;</th>
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
}

class AddChangeGroupLine extends PureComponent {
  render () {
    const { editable } = this.props;
    return editable
      ? <tr>
        <td colSpan={14}>&nbsp;</td>
        <td className='noselect'>
          <Button size='sm' color='secondary' name={'addible'}>{'\uf067' /* plus icon */}</Button>
        </td>
      </tr>
      : null;
  }
}

AddChangeGroupLine.propTypes = {
  editable : PropTypes.bool
};

/*
  TafTable uses BaseForecast and ChangeGroup with table headers to render an well aligned and editable TAC UI.
*/
class TafTable extends Component {
  constructor (props) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.updateValue = this.updateValue.bind(this);
    this.getBaseForecastLine = this.getBaseForecastLine.bind(this);
    this.processValidation = this.processValidation.bind(this);
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
      default:
        break;
    }
  }

  /**
   * Updates the value in the state, according to the element value
   * @param  {HTMLElement} element The (input-)element to update the value from
   */
  updateValue (element) {
    const name = element ? (element.name || element.props.name) : null;
    const value = element && element.value && typeof element.value === 'string' ? element.value.trim().toUpperCase() : null;

    // Empty in this case means that val is an object which has keys, but for every key its value is null
    const isObjInArrayEmpty = (val, lastPathElem) => {
      const allValuesNull = (obj) => Object.values(obj).every((value) => value === null || (Array.isArray(value) && value.length === 0));
      const isFirstElem = parseInt(lastPathElem) === 0;
      return !isFirstElem && allValuesNull(val);
    };
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
          propertiesToUpdate[0].propertyValue = tacToJsonForWind(value, true);
          break;
        case PHENOMENON_TYPES.VISIBILITY:
          const matchCavok = tacToJsonForCavok(value);
          propertiesToUpdate.push({
            propertyPath: cloneDeep(propertiesToUpdate[0].propertyPath),
            propertyValue: tacToJsonForVisibility(value, matchCavok === false)
          });
          propertiesToUpdate[0].propertyValue = matchCavok;
          propertiesToUpdate[0].propertyPath.pop();
          propertiesToUpdate[0].propertyPath.push('caVOK');
          break;
        case PHENOMENON_TYPES.WEATHER:
          propertiesToUpdate[0].propertyValue = tacToJsonForWeather(value, true);
          if (propertiesToUpdate[0].propertyValue === 'NSW') {
            propertiesToUpdate[0].propertyPath.pop();
          }
          if (isObjInArrayEmpty(propertiesToUpdate[0].propertyValue, propertiesToUpdate[0].propertyPath[propertiesToUpdate[0].propertyPath.length - 1])) {
            propertiesToUpdate[0].deleteProperty = true;
          }
          break;
        case PHENOMENON_TYPES.VERTICAL_VISIBILITY:
          propertiesToUpdate[0].propertyValue = tacToJsonForVerticalVisibility(value, true);
          if (tacToJsonForVerticalVisibility(value) === null) {
            const valueAsCloud = tacToJsonForClouds(value);
            if (!isEqual(valueAsCloud, TAF_TEMPLATES.CLOUDS[0])) {
              /* Vertical vis does not match, directly erase this value and use clouds with their fallback instead */
              const newPath = cloneDeep(propertiesToUpdate[0].propertyPath);
              propertiesToUpdate.push({
                propertyPath: newPath,
                propertyValue: valueAsCloud
              });
              /* Clear vertical visibility */
              propertiesToUpdate[0].propertyValue = null;
              propertiesToUpdate[1].propertyPath.pop();
              propertiesToUpdate[1].propertyPath.push('clouds');
              propertiesToUpdate[1].propertyPath.push('0');
              if (propertiesToUpdate[1].propertyValue === 'NSC') {
                propertiesToUpdate[1].propertyPath.pop();
              }
              if (isObjInArrayEmpty(propertiesToUpdate[1].propertyValue, propertiesToUpdate[1].propertyPath[propertiesToUpdate[1].propertyPath.length - 1])) {
                propertiesToUpdate[1].deleteProperty = true;
              }
            }
          }
          break;
        case PHENOMENON_TYPES.CLOUDS:
          const matchVerticalVisibility = tacToJsonForVerticalVisibility(value);
          /* Check if this is the first cloud field (forecast-clouds-0), for vertical visibility */
          if (parseInt(propertiesToUpdate[0].propertyPath[propertiesToUpdate[0].propertyPath.length - 1]) === 0 && matchVerticalVisibility !== null) {
            /* We have to update both clouds and vertical visibility, clone path and adjust */
            const newPath = cloneDeep(propertiesToUpdate[0].propertyPath);
            propertiesToUpdate.push({
              propertyPath: newPath,
              propertyValue: null, /* Clear clouds */
              deleteProperty: true
            });
            /* Set vertical visibility by adjusting the json path forecast/clouds/0 to forecast/vertical_visibility */
            propertiesToUpdate[0].propertyValue = matchVerticalVisibility;
            propertiesToUpdate[0].propertyPath.pop();
            propertiesToUpdate[0].propertyPath.pop();
            propertiesToUpdate[0].propertyPath.push('vertical_visibility');
            break;
          }
          /* Handle clouds */
          propertiesToUpdate[0].propertyValue = tacToJsonForClouds(value, true);
          if (propertiesToUpdate[0].propertyValue === 'NSC') {
            propertiesToUpdate[0].propertyPath.pop();
          }
          if (isObjInArrayEmpty(propertiesToUpdate[0].propertyValue, propertiesToUpdate[0].propertyPath[propertiesToUpdate[0].propertyPath.length - 1])) {
            propertiesToUpdate[0].deleteProperty = true;
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
            propertiesToUpdate[0].propertyValue = tacToJsonForProbabilityAndChangeType(value, change, true);
            break;
          case 'change':
            propertiesToUpdate[0].propertyPath.pop();
            propertiesToUpdate[0].propertyPath.push('changeType');
            const probability = jsonToTacForProbability(getNestedProperty(this.props.taf, propertiesToUpdate[0].propertyPath), true);
            propertiesToUpdate[0].propertyValue = tacToJsonForProbabilityAndChangeType(probability, value, true);
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
            let changeValue;
            if (value && value.length === 6 && value.indexOf('/') === -1) {
              changeValue = { start: tacToJsonForTimestamp(value, scopeStart, scopeEnd, true, true, true), end: null };
            } else {
              changeValue = tacToJsonForPeriod(value, scopeStart, scopeEnd, true);
            }
            propertiesToUpdate[0].propertyValue = changeValue.start || (changeValue.hasOwnProperty('fallback') ? { fallback: changeValue.fallback } : null);
            propertiesToUpdate[1].propertyValue = changeValue.end;
            break;
          default:
            break;
        }
      }
      this.props.setTafValues(propertiesToUpdate);
    }
  }

  getBaseForecastLine (tafJSON, focusedFieldName, inputRef, editable, invalidFields) {
    return <tbody>
      <BaseForecast tafMetadata={tafJSON.metadata} tafForecast={tafJSON.forecast}
        focusedFieldName={focusedFieldName} inputRef={inputRef} editable={editable} invalidFields={invalidFields} />
    </tbody>;
  }

  /**
   * Processes the validationReport into arrays of names of invalid fields
   * @param  {object} validationReport The validation report with JSON-pointers and messages
   * @return {object} An object with arrays for base and changegroup field names
   */
  processValidation (validationReport) {
    const invalidFields = { base: [], changegroup: [] };
    if (validationReport && typeof validationReport === 'object') {
      Object.keys(validationReport).forEach((pointer) => {
        const pointerParts = pointer.split('/');
        pointerParts.shift();
        if (pointerParts[0] === 'forecast') {
          invalidFields.base.push(pointerParts.join('-'));
        } else if (pointerParts[0] === 'changegroups' && !isNaN(pointerParts[1])) {
          const groupIndex = parseInt(pointerParts[1]);
          if (!Array.isArray(invalidFields.changegroup[groupIndex])) {
            invalidFields.changegroup[groupIndex] = [];
          }
          invalidFields.changegroup[groupIndex].push(pointerParts.join('-'));
        }
      });
    }
    return invalidFields;
  }

  render () {
    const { taf, focusedFieldName, inputRef, editable, onKeyUp, onKeyDown, onClick, onFocus, onSortEnd, validationReport } = this.props;
    const invalidFields = this.processValidation(validationReport);
    return (
      <table className='TafStyle TafStyleTable' onChange={this.onChange} onKeyUp={onKeyUp} onKeyDown={onKeyDown} onClick={onClick} onFocus={onFocus}>
        <BaseHeaders />
        {this.getBaseForecastLine(taf, focusedFieldName, inputRef, editable, invalidFields.base)}
        <ChangeGroupHeaders />

        {editable
          ? <SortableTBody tafChangeGroups={taf.changegroups} inputRef={inputRef} focusedFieldName={focusedFieldName}
            onSortEnd={onSortEnd} invalidFields={invalidFields.changegroup} helperClass='TafStyle' />
          : <tbody>
            {taf.changegroups.map((tafChangeGroup, index) => {
              return <ChangeGroup key={`changegroups-${index}`} tafChangeGroup={tafChangeGroup} inputRef={inputRef}
                focusedFieldName={focusedFieldName} index={index} invalidFields={invalidFields.changegroup[index] || []} />;
            })}
          </tbody>
        }
        <tbody>
          <AddChangeGroupLine editable={editable} />
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
  onFocus: () => {},
  onSortEnd: () => {},
  validationReport: {}
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
  validationReport: PropTypes.object
};

export default TafTable;
