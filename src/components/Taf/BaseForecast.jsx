import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { jsonToTacForPeriod, jsonToTacForWind, jsonToTacForCavok, jsonToTacForVerticalVisibility, jsonToTacForVisibility, jsonToTacForWeather, jsonToTacForClouds } from './TafFieldsConverter';

/*
  BaseForecast of TAF editor, it is the top row visible in the UI.
*/
class BaseForecast extends Component {
  render () {
    let { tafMetadata, tafForecast, editable } = this.props;

    const columns = [
      {
        name: 'sortable',
        value: '',
        disabled: true,
        autoFocus: false,
        classes: [ 'noselect' ]
      },
      {
        name: 'metadata-location',
        value: tafMetadata.hasOwnProperty('location') ? tafMetadata.location || '' : '',
        disabled: true,
        autoFocus: false,
        classes: [ 'TACnotEditable' ]
      },
      {
        name: 'metadata-issueTime',
        value: tafMetadata.hasOwnProperty('issueTime') ? tafMetadata.issueTime || '' : '',
        disabled: true,
        autoFocus: false,
        classes: [ 'TACnotEditable' ]
      },
      {
        name: 'metadata-validity',
        value: tafMetadata.hasOwnProperty('validityStart') && tafMetadata.hasOwnProperty('validityEnd') ? jsonToTacForPeriod(tafMetadata.validityStart, tafMetadata.validityEnd) || '' : '',
        disabled: true,
        autoFocus: false,
        classes: [ 'TACnotEditable' ]
      },
      {
        name: 'forecast-wind',
        value: tafForecast.hasOwnProperty('wind') ? jsonToTacForWind(tafForecast.wind) || '' : '',
        disabled: !editable,
        autoFocus: true,
        classes: []
      },
      {
        name: 'forecast-visibility',
        value: (tafForecast.hasOwnProperty('caVOK') || tafForecast.hasOwnProperty('visibility'))
          ? jsonToTacForCavok(tafForecast.caVOK) || (jsonToTacForVisibility(tafForecast.visibility) || '')
          : '',
        disabled: !editable,
        autoFocus: false,
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
        autoFocus: false,
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
        autoFocus: false,
        classes: []
      });
    }
    columns.push(
      {
        name: 'removable',
        value: '',
        disabled: true,
        autoFocus: false,
        classes: [ 'noselect' ]
      }
    );

    return <tr>
      {columns.map((col) => <td className={classNames(col.classes)} key={col.name}>
        <input name={col.name} type='text' value={col.value} disabled={col.disabled} autoFocus={col.autoFocus} />
      </td>
      )}
    </tr>;
  }
};

BaseForecast.propTypes = {
  tafMetadata: PropTypes.object.isRequired,
  tafForecast: PropTypes.object.isRequired,
  editable : PropTypes.bool,
  validationReport: PropTypes.object
};

export default BaseForecast;
