import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { TAF_TEMPLATES, TAF_TYPES } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';
import { jsonToTacForPeriod, jsonToTacForWind, jsonToTacForCavok, jsonToTacForVerticalVisibility, jsonToTacForVisibility, jsonToTacForWeather, jsonToTacForClouds } from './TafFieldsConverter';

/*
  BaseForecast of TAF editor, it is the top row visible in the UI.
*/
class BaseForecast extends Component {
  render () {
    const { tafMetadata, tafForecast, focusedFieldName, inputRef, editable } = this.props;

    const columns = [
      {
        name: 'sortable',
        value: '',
        disabled: true,
        classes: [ 'noselect' ]
      },
      {
        name: 'metadata-location',
        value: tafMetadata.hasOwnProperty('location') ? tafMetadata.location || '' : '',
        disabled: true,
        classes: [ 'TACnotEditable' ]
      },
      {
        name: 'metadata-issueTime',
        value: tafMetadata.hasOwnProperty('issueTime') ? tafMetadata.issueTime || '' : '',
        disabled: true,
        classes: [ 'TACnotEditable' ]
      },
      {
        name: 'metadata-validity',
        value: tafMetadata.hasOwnProperty('validityStart') && tafMetadata.hasOwnProperty('validityEnd') ? jsonToTacForPeriod(tafMetadata.validityStart, tafMetadata.validityEnd) || '' : '',
        disabled: true,
        classes: [ 'TACnotEditable' ]
      },
      {
        name: 'forecast-wind',
        value: tafForecast.hasOwnProperty('wind') ? jsonToTacForWind(tafForecast.wind) || '' : '',
        disabled: !editable,
        classes: []
      },
      {
        name: 'forecast-visibility',
        value: (tafForecast.hasOwnProperty('caVOK') || tafForecast.hasOwnProperty('visibility'))
          ? jsonToTacForCavok(tafForecast.caVOK) || (jsonToTacForVisibility(tafForecast.visibility) || '')
          : '',
        disabled: !editable,
        classes: []
      }
    ];
    for (let weatherIndex = 0; weatherIndex < 3; weatherIndex++) {
      columns.push({
        name: 'forecast-weather-' + weatherIndex,
        value: tafForecast.hasOwnProperty('weather')
          ? (Array.isArray(tafForecast.weather) && tafForecast.weather.length > weatherIndex
            ? jsonToTacForWeather(tafForecast.weather[weatherIndex]) || ''
            : jsonToTacForWeather(tafForecast.weather)) || '' // NSW
          : '',
        disabled: !editable,
        classes: []
      });
    }
    for (let cloudsIndex = 0; cloudsIndex < 4; cloudsIndex++) {
      columns.push({
        name: 'forecast-clouds-' + cloudsIndex,
        value: tafForecast.hasOwnProperty('vertical-visibility') || tafForecast.hasOwnProperty('clouds')
          ? jsonToTacForVerticalVisibility(tafForecast['vertical-visibility']) ||
            (Array.isArray(tafForecast.clouds) && tafForecast.clouds.length > cloudsIndex
              ? jsonToTacForClouds(tafForecast.clouds[cloudsIndex]) || ''
              : jsonToTacForClouds(tafForecast.clouds) || '') // NSC
          : '',
        disabled: !editable,
        classes: []
      });
    }
    columns.push(
      {
        name: 'removable',
        value: '',
        disabled: true,
        classes: [ 'noselect' ]
      }
    );
    columns.forEach((column) => {
      column.autoFocus = column.name === focusedFieldName;
    });

    return <tr>
      {columns.map((col) => <td className={classNames(col.classes)} key={col.name}>
        <input ref={inputRef} name={col.name} type='text' value={col.value} disabled={col.disabled} autoFocus={col.autoFocus} />
      </td>
      )}
    </tr>;
  }
};

BaseForecast.defaultProps = {
  tafMetadata: cloneDeep(TAF_TEMPLATES.METADATA),
  tafForecast: cloneDeep(TAF_TEMPLATES.FORECAST),
  focusedFieldName: null,
  inputRef: () => {},
  editable: false,
  validationReport: null
};

BaseForecast.propTypes = {
  tafMetadata: TAF_TYPES.METADATA.isRequired,
  tafForecast: TAF_TYPES.FORECAST.isRequired,
  focusedFieldName: PropTypes.string,
  inputRef: PropTypes.func,
  editable : PropTypes.bool,
  validationReport: PropTypes.object
};

export default BaseForecast;
