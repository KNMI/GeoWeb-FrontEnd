import moment from 'moment';
import { qualifierMap, descriptorMap, phenomenaMap } from './TafWeatherMaps';

/* ------ Helper functions for setting and remembering input values ----- */

let setTACItem = (taf, name, value) => {
  if (!taf) return value;
  if (!taf.tac) taf.tac = {};
  taf.tac[name] = value === null ? '' : '' + value;
  if (!taf.input) taf.input = {};
  if (!taf.input[name]) taf.input[name] = '';

  return getInputItem(taf, name);
};

let getInputItem = (taf, name) => {
  if (taf && taf.input && taf.input[name] !== undefined) return taf.input[name];
  return null;
};

/* ----- The following functions transforms a TAF JSON forecast or changegroup to TAC code ------ */

export const getWindTAC = (taf) => {
  let value = getInputItem(taf, 'wind'); if (value !== null) return value;
  if (!taf) return null;
  if (taf.forecast && taf.forecast.wind) {
    if (!taf.forecast.wind.direction) return setTACItem(taf, 'wind', '');
    value = ('00' + taf.forecast.wind.direction).slice(-3) + '' + (('0' + (!taf.forecast.wind.speed ? 0 : taf.forecast.wind.speed))).slice(-2);
    if (taf.forecast.wind.gusts) {
      value += 'G' + ('0' + taf.forecast.wind.gusts).slice(-2);
    }
    // value += taf.forecast.wind.unit; <---- Not common practice to show KT in input field
  }
  return setTACItem(taf, 'wind', value);
};

export const getChangeTAC = (taf) => {
  let value = getInputItem(taf, 'change'); if (value !== null) return value;

  if (!taf) return null;

  if (taf.changeType) {
    if (taf.changeType.indexOf('PROB') === -1) {
      return setTACItem(taf, 'change', taf.changeType);
    } else {
      if (taf.changeType.indexOf(' ') !== -1) {
        return setTACItem(taf, 'change', taf.changeType.split(' ')[1]);
      }
    }
  }

  return null;
};

export const getProbTAC = (taf) => {
  let value = getInputItem(taf, 'prob'); if (value !== null) return value;
  if (taf) {
    if (taf.changeType) {
      if (taf.changeType.indexOf('PROB') !== -1) {
        if (taf.changeType.indexOf(' ') !== -1) {
          return setTACItem(taf, 'prob', taf.changeType.split(' ')[0]);
        } else {
          return setTACItem(taf, 'prob', taf.changeType);
        }
      }
    }
  }
  return null;
};

export const getVisibilityTAC = (taf) => {
  let value = getInputItem(taf, 'visibility'); if (value !== null) return value;
  if (taf && taf.forecast && taf.forecast.visibility && taf.forecast.visibility.value) {
    if (taf.forecast.visibility.unit) {
      if (taf.forecast.visibility.unit === 'KM') {
        return setTACItem(taf, 'visibility', ('0' + taf.forecast.visibility.value).slice(-2) + taf.forecast.visibility.unit);
      } else {
        return setTACItem(taf, 'visibility', ('000' + taf.forecast.visibility.value).slice(-4));
      }
    } else {
      return setTACItem(taf, 'visibility', taf.forecast.visibility.value);
    }
  }
  return null;
};

export const getWeatherTAC = (taf, index) => {
  let value = getInputItem(taf, 'weather' + index); if (value !== null) return value;
  if (taf && taf.forecast && taf.forecast.weather) {
    if (typeof taf.forecast.weather === 'string') {
      if (index === 0) {
        return '';
      }
      // NSW
      return null;
    }
    if (index >= taf.forecast.weather.length) return null;
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
    return setTACItem(taf, 'weather' + index, TACString);
  }
  return null;
};

export const getCloudsTAC = (taf, index) => {
  let value = getInputItem(taf, 'clouds' + index); if (value !== null) return value;
  if (taf && taf.forecast && taf.forecast.clouds) {
    if (typeof taf.forecast.clouds === 'string') {
      if (index === 0) {
        return ''; // taf.forecast.clouds;
      }
      return null;
    }
    if (index >= taf.forecast.clouds.length) return null;
    let clouds = taf.forecast.clouds[index];
    if (clouds.amount && clouds.height) {
      return setTACItem(taf, 'clouds' + index, clouds.amount + ('00' + clouds.height).slice(-3) + (clouds.mod ? clouds.mod : ''));
    }
  }
  return null;
};

export const getValidPeriodTAC = (taf) => {
  let value = getInputItem(taf, 'valid'); if (value !== null) return value;
  let dateToDDHH = (dateString) => {
    var day = moment(dateString);
    day.utc();
    return ('0' + day.date()).slice(-2) + '' + ('0' + day.hour()).slice(-2);
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
  if (!validityStart || !validityEnd) return setTACItem(taf, 'valid', '');
  let validityStartTAC = dateToDDHH(validityStart);
  let validityEndTAC;
  if (validityEnd) {
    validityEndTAC = '/' + dateToDDHH(validityEnd);
  }
  return setTACItem(taf, 'valid', validityStartTAC + validityEndTAC);
};
