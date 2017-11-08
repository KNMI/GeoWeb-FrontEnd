import moment from 'moment';
import { qualifierMap, descriptorMap, phenomenaMap } from './TafWeatherMaps';

/*
  Get TAC Code from baseforecast or changegroupforecast by column index.
  Input is:
   - forecastGroup: The baseforecast or changegroupforecast object (from TAFJSON)
   - colIndex the TAC column index
  Returns an object with:
   1) inputValue : This is the input string the user has previousely entered, visible in the input field.
   2) tacValue : This is the TAC string that is composed from the TAF json baseforecast or changegroupforecast item.

   These two values can be compared to check if the createTAFJSONFromInput algorithm succesfully converted TAC to JSON.
*/
export const getInputValueAndTACValueFromForecast = (forecastGroup, colIndex) => {
  let v = { inputValue: '', tacValue:null };
  if (!forecastGroup) {
    return v;
  }
  switch (colIndex) {
    case 1:
      v = getProbTAC(forecastGroup); break;
    case 2:
      v = getChangeTAC(forecastGroup); break;
    case 3:
      v = getValidPeriodTAC(forecastGroup); break;
    case 4:
      v = getWindTAC(forecastGroup); break;
    case 5:
      v = getVisibilityTAC(forecastGroup); break;
    case 6: case 7: case 8:
      v = getWeatherTAC(forecastGroup, colIndex - 6); break;
    case 9: case 10: case 11: case 12:
      v = getCloudsTAC(forecastGroup, colIndex - 9); break;
  }
  return v;
};

/* ------ Helper function for setting and remembering input values ----- */

let returnTACCodeAndInputValue = (taf, columnName, value) => {
  let getInputItem = (taf, columnName) => {
    if (!taf) return null;
    if (!taf.input) taf.input = {};
    /*
      If input is not set, put the tac code in there.
      This allows for reading and displaying existing taf objects
    */
    if (taf.input[columnName] === undefined) {
      taf.input[columnName] = value;
    }
    return taf.input[columnName];
  };
  if (!taf) return { inputValue: getInputItem(taf, columnName), tacValue: null };
  if (value === '') value = null;
  return { inputValue: getInputItem(taf, columnName), tacValue: value };
};

/* ----- The following functions transforms a TAF JSON forecast or changegroup to TAC code ------ */

export const getWindTAC = (taf) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'wind', value);
  if (taf.forecast && taf.forecast.wind) {
    if (!taf.forecast.wind.direction) return returnTACCodeAndInputValue(taf, 'wind', null);
    value = ('00' + taf.forecast.wind.direction).slice(-3) + '' + (('0' + (!taf.forecast.wind.speed ? 0 : taf.forecast.wind.speed))).slice(-2);
    if (taf.forecast.wind.gusts) {
      value += 'G' + ('0' + taf.forecast.wind.gusts).slice(-2);
    }
    // value += taf.forecast.wind.unit; <---- Not common practice to show KT in input field
  }
  return returnTACCodeAndInputValue(taf, 'wind', value);
};

export const getChangeTAC = (taf) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'change', value);

  if (taf.changeType && taf.changeType.length > 1) {
    if (taf.changeType.startsWith('P') === false) {
      return returnTACCodeAndInputValue(taf, 'change', taf.changeType);
    } else {
      if (taf.changeType.indexOf(' ') !== -1) {
        let rightValue = taf.changeType.split(' ')[1];
        if (rightValue.startsWith('P') === false) {
          return returnTACCodeAndInputValue(taf, 'change', rightValue);
        }
      }
    }
  }
  return returnTACCodeAndInputValue(taf, 'change', null);
};

export const getProbTAC = (taf) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'prob', value);
  if (taf) {
    if (taf.changeType) {
      if (taf.changeType.indexOf('PROB') !== -1) {
        if (taf.changeType.indexOf(' ') !== -1) {
          return returnTACCodeAndInputValue(taf, 'prob', taf.changeType.split(' ')[0]);
        } else {
          return returnTACCodeAndInputValue(taf, 'prob', taf.changeType);
        }
      }
    }
  }
  return returnTACCodeAndInputValue(taf, 'prob', null);
};

export const getVisibilityTAC = (taf) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'visibility', value);
  if (taf && taf.forecast && taf.forecast.caVOK === true) {
    return returnTACCodeAndInputValue(taf, 'visibility', 'CAVOK');
  }
  if (taf && taf.forecast && taf.forecast.weather === 'NSW' && taf.forecast.clouds === 'NSC' &&
    (taf.forecast.visibility === 9999)) {
    return returnTACCodeAndInputValue(taf, 'visibility', 'CAVOK');
  }
  if (taf && taf.forecast && taf.forecast.visibility && taf.forecast.visibility.value) {
    if (taf.forecast.visibility.unit) {
      if (taf.forecast.visibility.unit === 'KM') {
        return returnTACCodeAndInputValue(taf, 'visibility', ('0' + taf.forecast.visibility.value).slice(-2) + taf.forecast.visibility.unit);
      } else {
        return returnTACCodeAndInputValue(taf, 'visibility', ('000' + taf.forecast.visibility.value).slice(-4));
      }
    } else {
      return returnTACCodeAndInputValue(taf, 'visibility', ('000' + taf.forecast.visibility.value).slice(-4));
    }
  }
  return returnTACCodeAndInputValue(taf, 'visibility', null);
};

export const getWeatherTAC = (taf, index) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'weather' + index, value);
  if (taf && taf.forecast && taf.forecast.weather) {
    if (typeof taf.forecast.weather === 'string') {
      if (index === 0) {
        return returnTACCodeAndInputValue(taf, 'weather' + index, '');
      }
      // NSW
      return returnTACCodeAndInputValue(taf, 'weather' + index, null);
    }
    if (index >= taf.forecast.weather.length) return returnTACCodeAndInputValue(taf, 'weather' + index, null);
    let weather = taf.forecast.weather[index];
    let TACString = '';
    if (weather.qualifier) {
      TACString += qualifierMap[weather.qualifier];
    }
    if (weather.descriptor) {
      TACString += descriptorMap[weather.descriptor];
    }
    if (weather.phenomena) {
      if (typeof taf.forecast.weather === 'string') {
        TACString += phenomenaMap[weather.phenomena];
      } else {
        for (let p = 0; p < weather.phenomena.length; p++) {
          TACString += phenomenaMap[weather.phenomena[p]];
        }
      }
    }
    return returnTACCodeAndInputValue(taf, 'weather' + index, TACString);
  }
  return returnTACCodeAndInputValue(taf, 'weather' + index, null);
};

export const getCloudsTAC = (taf, index) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'clouds' + index, value);
  if (taf && taf.forecast && taf.forecast.clouds) {
    if (typeof taf.forecast.clouds === 'string') {
      if (index === 0) {
        return returnTACCodeAndInputValue(taf, 'clouds' + index, '');
      }
      return returnTACCodeAndInputValue(taf, 'clouds' + index, null);
    }
    if (index >= taf.forecast.clouds.length) return returnTACCodeAndInputValue(taf, 'clouds' + index, null);
    let clouds = taf.forecast.clouds[index];
    if (clouds.amount && clouds.height) {
      return returnTACCodeAndInputValue(taf, 'clouds' + index, clouds.amount + ('00' + clouds.height).slice(-3) + (clouds.mod ? clouds.mod : ''));
    }
  }
  return returnTACCodeAndInputValue(taf, 'clouds' + index, null);
};

export const getValidPeriodTAC = (taf) => {
  let value = null;
  if (!taf) return returnTACCodeAndInputValue(taf, 'valid', value);
  let dateToDDHH = (dateString) => {
    var day = moment.utc(dateString);
    return day.date().toString().padStart(2, '0') + day.hour().toString().padStart(2, '0');
  };
  let validityStart = null;
  let validityEnd = null;
  if (taf) {
    if (taf.metadata) {
      validityStart = taf.metadata.validityStart;
      validityEnd = taf.metadata.validityEnd;
    } else {
      validityStart = taf.changeStart;
      validityEnd = taf.changeEnd;
    }
  }
  if (!validityStart || !validityEnd) return returnTACCodeAndInputValue(taf, 'valid', '');
  let validityStartTAC = dateToDDHH(validityStart);
  let validityEndTAC;
  if (validityEnd) {
    validityEndTAC = '/' + dateToDDHH(validityEnd);
  }
  return returnTACCodeAndInputValue(taf, 'valid', validityStartTAC + validityEndTAC);
};
