import { windUnitMap, windUnitInverseMap, windUnknownMap, windUnknownInverseMap } from './TafWindMaps';
import { visibilityUnitMap, visibilityUnitInverseMap } from './TafVisibilityMaps';
import { qualifierMap, qualifierInverseMap, descriptorMap, descriptorInverseMap, phenomenaMap, phenomenaInverseMap } from './TafWeatherMaps';
import { amountMap, amountInverseMap, modMap, modInverseMap } from './TafCloudsMaps';
import { probabilityMap, probabilityInverseMap, typeMap, typeInverseMap } from './TafChangeTypeMaps';
import { TAF_TEMPLATES } from './TafTemplates';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import escapeRegExp from 'lodash.escaperegexp';
import isEqual from 'lodash.isequal';

/**
 * Regular expressions for TAC strings
 */
const convertMapToRegExpOptions = (map) => {
  return Object.keys(map).map(elmt => escapeRegExp(elmt)).join('|');
};

const convertMapToString = (map) => {
  return Object.keys(map).filter(elmt => !!elmt).join(', ');
};

const probabilityAndChangeTypeRegEx = new RegExp('^(' + convertMapToRegExpOptions(probabilityInverseMap) + ')?' +
  '\\s?(' + convertMapToRegExpOptions(typeInverseMap) + ')?$', 'i');

const probabilityRegEx = new RegExp('^(' + convertMapToRegExpOptions(probabilityInverseMap) + ')$', 'i');

const changeTypeRegEx = new RegExp('^(' + convertMapToRegExpOptions(typeInverseMap) + ')$', 'i');

const timestampRegEx = /^(\d{2})(\d{2})$/i;

const periodRegEx = /^(\d{4})\/(\d{4})$/i;

const windRegEx = new RegExp('^(\\d{3}|' + convertMapToRegExpOptions(windUnknownInverseMap) + ')' +
  '(P?\\d{2})' +
  '(?:G(\\d{2}))?' +
  '(?:(' + convertMapToRegExpOptions(windUnitInverseMap) + '))?$', 'i');

const visibilityRegEx = new RegExp('^(\\d{4})(?:(' + convertMapToRegExpOptions(visibilityUnitInverseMap) + '))?$', 'i');

const cavokRegEx = /^CAVOK$/i;

const weatherRegEx = new RegExp('^(' + convertMapToRegExpOptions(qualifierInverseMap) + ')' +
    '(?:(' + convertMapToRegExpOptions(descriptorInverseMap) + ')?)' +
    '((?:' + convertMapToRegExpOptions(phenomenaInverseMap) + '){0,6})$', 'i');

const cloudsRegEx = new RegExp('^(?:(' + convertMapToRegExpOptions(amountInverseMap) + ')' +
    '(\\d{3}))?' +
    '(' + convertMapToRegExpOptions(modInverseMap) + ')?$', 'i');

const verticalVisibilityRegEx = /^VV(\d{3})$/i;

const weatherPhenomenaRegEx = new RegExp('(' + convertMapToRegExpOptions(phenomenaInverseMap) + ')', 'ig');

/**
 * Utility methods to shorten / reuse notation
 */
const getMapValue = (name, mapToUse, allCaps = false) => {
  if (name !== null && typeof name === 'string') {
    return mapToUse.hasOwnProperty(allCaps ? name.toUpperCase() : name) ? mapToUse[allCaps ? name.toUpperCase() : name] : null;
  }
  return null;
};

/**
 * JSON to TAC converters
 */
const jsonToTacForProbability = (probabilityAsJson, useFallback = false) => {
  let result = null;
  if (probabilityAsJson && typeof probabilityAsJson === 'string') {
    const matchResult = probabilityAsJson.match(probabilityAndChangeTypeRegEx);
    if (matchResult) {
      result = getMapValue(matchResult[1], probabilityMap, true);
    }
  }
  if (useFallback && !result && probabilityAsJson && probabilityAsJson.hasOwnProperty('fallback')) {
    if (probabilityAsJson.fallback && probabilityAsJson.fallback.hasOwnProperty('value') && probabilityAsJson.fallback.value.hasOwnProperty('probability')) {
      result = probabilityAsJson.fallback.value.probability;
    }
  }
  return result;
};

const jsonToTacForChangeType = (changeTypeAsJson, useFallback = false) => {
  let result = null;
  if (changeTypeAsJson && typeof changeTypeAsJson === 'string') {
    const matchResult = changeTypeAsJson.match(probabilityAndChangeTypeRegEx);
    if (matchResult) {
      result = getMapValue(matchResult[2], typeMap, true);
    }
  }
  if (useFallback && !result && changeTypeAsJson && changeTypeAsJson.hasOwnProperty('fallback')) {
    if (changeTypeAsJson.fallback && changeTypeAsJson.fallback.hasOwnProperty('value') && changeTypeAsJson.fallback.value.hasOwnProperty('change')) {
      result = changeTypeAsJson.fallback.value.change;
    }
  }
  return result;
};

const jsonToTacForTimestamp = (timestampAsJson, useFallback = false) => {
  let result = null;
  if (timestampAsJson && typeof timestampAsJson === 'string' && moment(timestampAsJson).isValid()) {
    result = moment.utc(timestampAsJson).format('DDHH');
  } else if (useFallback && timestampAsJson && timestampAsJson.hasOwnProperty('fallback')) {
    result = timestampAsJson.fallback.value;
  }
  return result;
};

const jsonToTacForPeriod = (startTimestampAsJson, endTimestampAsJson, useFallback = false) => {
  let result = null;
  const periodStart = jsonToTacForTimestamp(startTimestampAsJson, useFallback);
  const periodEnd = jsonToTacForTimestamp(endTimestampAsJson, useFallback);
  if (periodStart && periodEnd) {
    result = periodStart + '/' + periodEnd;
  } else if (periodStart) {
    result = periodStart;
  }
  return result;
};

const jsonToTacForWind = (windAsJson, useFallback = false) => {
  let result = null;
  if (!windAsJson) {
    return result;
  }
  if (windAsJson.hasOwnProperty('direction')) {
    if (typeof windAsJson.direction === 'number') {
      result = windAsJson.direction.toString().padStart(3, '0');
    } else if (typeof windAsJson.direction === 'string') {
      result = getMapValue(windAsJson.direction, windUnknownMap);
      if (!result) {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
      }
    } else {
      return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('speed')) {
    if (typeof windAsJson.speed === 'number') {
      result += windAsJson.speed.toString().padStart(2, '0');
    } else if (typeof windAsJson.speed === 'string' && /^P\d9$/i.test(windAsJson.speed)) {
      result += windAsJson.speed;
    } else {
      return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('gusts')) {
    if (typeof windAsJson.gusts === 'number') {
      result += 'G' + windAsJson.gusts.toString().padStart(2, '0');
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('unit')) {
    if (typeof windAsJson.unit === 'string') {
      const unit = getMapValue(windAsJson.unit, windUnitMap);
      if (!unit) {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
      } else if (!(unit === windUnitMap.KT)) { // Skip default unit
        result += unit;
      }
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  return result;
};

const jsonToTacForVisibility = (visibilityAsJson, useFallback = false) => {
  let result = null;
  if (!visibilityAsJson) {
    return result;
  }
  if (visibilityAsJson.hasOwnProperty('value') && typeof visibilityAsJson.value === 'number') {
    result = visibilityAsJson.value.toString().padStart(4, '0');
  } else if (useFallback && visibilityAsJson.hasOwnProperty('fallback')) {
    result = visibilityAsJson.fallback.value;
  }
  if (visibilityAsJson.hasOwnProperty('unit')) {
    const unit = getMapValue(visibilityAsJson.unit, visibilityUnitMap);
    if (!unit) {
      return useFallback && visibilityAsJson.hasOwnProperty('fallback') ? visibilityAsJson.fallback.value : null;
    } else if (!(unit === visibilityUnitMap.M)) { // Skip default unit
      result += unit;
    }
  } else {
    return useFallback && visibilityAsJson.hasOwnProperty('fallback') ? visibilityAsJson.fallback.value : null;
  }
  return result;
};

const jsonToTacForCavok = (cavokAsJson) => {
  return (cavokAsJson !== null && typeof cavokAsJson === 'boolean' && cavokAsJson ? 'CAVOK' : null);
};

const jsonToTacForWeather = (weatherAsJson, useFallback = false) => {
  let result = null;
  if (!weatherAsJson) {
    return result;
  }
  if (typeof weatherAsJson === 'string' && weatherAsJson === 'NSW') {
    result = 'NSW';
  } else if (typeof weatherAsJson === 'object') {
    if (weatherAsJson.hasOwnProperty('qualifier')) {
      const qualifier = getMapValue(weatherAsJson.qualifier, qualifierMap);
      if (qualifier === null) {
        return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback.value : null;
      } else {
        result = qualifier;
      }
    } else {
      return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback.value : null;
    }
    if (weatherAsJson.hasOwnProperty('descriptor')) {
      const descriptor = getMapValue(weatherAsJson.descriptor, descriptorMap);
      if (descriptor !== null) {
        result += descriptor;
      }
    } else {
      return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback.value : null;
    }
    if (weatherAsJson.hasOwnProperty('phenomena') && Array.isArray(weatherAsJson.phenomena)) {
      result += weatherAsJson.phenomena.reduce((cumm, current) => {
        const phenomenon = getMapValue(current, phenomenaMap);
        if (phenomenon !== null) {
          cumm += phenomenon;
        }
        return cumm;
      }, '');
    } else {
      return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback.value : null;
    }
  }
  return result;
};

const jsonToTacForClouds = (cloudsAsJson, useFallback = false) => {
  let result = null;
  if (!cloudsAsJson) {
    return result;
  }
  if (typeof cloudsAsJson === 'string' && cloudsAsJson === 'NSC') {
    result = 'NSC';
  } else if (typeof cloudsAsJson === 'object') {
    let hasAmount = false;
    let hasHeight = false;
    if (cloudsAsJson.hasOwnProperty('amount')) {
      result = getMapValue(cloudsAsJson.amount, amountMap);
      hasAmount = result !== null;
    } else {
      return useFallback && cloudsAsJson.hasOwnProperty('fallback') ? cloudsAsJson.fallback.value : null;
    }
    if (cloudsAsJson.hasOwnProperty('height')) {
      if (typeof cloudsAsJson.height === 'number') {
        hasHeight = true;
        if (hasAmount) {
          result += cloudsAsJson.height.toString().padStart(3, '0');
        }
      } else {
        result = null;
      }
    } else {
      return useFallback && cloudsAsJson.hasOwnProperty('fallback') ? cloudsAsJson.fallback.value : null;
    }
    if (cloudsAsJson.hasOwnProperty('mod')) {
      const mod = getMapValue(cloudsAsJson.mod, modMap);
      if (mod !== null) {
        if (result) {
          result += mod;
        } else if (!hasAmount && !hasHeight) {
          result = mod;
        }
      }
    } else {
      return useFallback && cloudsAsJson.hasOwnProperty('fallback') ? cloudsAsJson.fallback.value : null;
    }
    if (result === null && useFallback) {
      return cloudsAsJson.hasOwnProperty('fallback') ? cloudsAsJson.fallback.value : null;
    }
  }
  return result;
};

const jsonToTacForVerticalVisibility = (verticalVisibilityAsJson, useFallback = false) => {
  let result = null;
  if (verticalVisibilityAsJson && typeof verticalVisibilityAsJson === 'number') {
    result = 'VV' + verticalVisibilityAsJson.toString().padStart(3, '0');
  } else if (useFallback && verticalVisibilityAsJson && verticalVisibilityAsJson.hasOwnProperty('fallback')) {
    result = verticalVisibilityAsJson.fallback.value;
  }
  return result;
};

/**
 * TAC to JSON converters
 */
const tacToJsonForProbability = (probabilityAsTac, useFallback = false) => {
  let result = null;
  if (probabilityAsTac && typeof probabilityAsTac === 'string') {
    let matchResult = probabilityAsTac.match(probabilityRegEx);
    if (matchResult) {
      result = getMapValue(matchResult[1], probabilityInverseMap, true);
    }
  }
  if (useFallback && !result && probabilityAsTac && typeof probabilityAsTac === 'string') {
    result = { fallback: { value: probabilityAsTac, message: converterMessagesMap.prefix + 'Probability is not one of the allowed values (' + convertMapToString(probabilityInverseMap) + ').' } };
  }
  return result;
};

const tacToJsonForChangeType = (changeTypeAsTac, useFallback = false) => {
  let result = null;
  if (changeTypeAsTac && typeof changeTypeAsTac === 'string') {
    let matchResult = changeTypeAsTac.match(changeTypeRegEx);
    if (matchResult) {
      result = getMapValue(matchResult[1], typeInverseMap, true);
    }
  }
  if (useFallback && !result && changeTypeAsTac && typeof changeTypeAsTac === 'string') {
    result = { fallback: { value: changeTypeAsTac, message: converterMessagesMap.prefix + 'Change type is not one of the allowed values (' + convertMapToString(typeInverseMap) + ').' } };
  }
  return result;
};

const tacToJsonForProbabilityAndChangeType = (probabilityAsTac, changeTypeAsTac, useFallback = false) => {
  let result = null;
  const probResult = tacToJsonForProbability(probabilityAsTac, useFallback);
  const changeResult = tacToJsonForChangeType(changeTypeAsTac, useFallback);
  if (probResult && typeof probResult === 'string') {
    result = probResult;
  }
  if (changeResult && typeof changeResult === 'string') {
    result = result ? result + ' ' + changeResult : changeResult;
  }
  if (useFallback &&
    ((probResult && probResult.hasOwnProperty('fallback') && probResult.fallback) ||
    (changeResult && changeResult.hasOwnProperty('fallback') && changeResult.fallback))) { // one of the values has fallbacked, and so should the entire field
    const fallbackValue = {};
    const fallbackMessages = [];
    if (probResult && probResult.hasOwnProperty('fallback') && probResult.fallback) {
      fallbackValue.probability = probResult.fallback.value;
      fallbackMessages.push(probResult.fallback.message);
      if (result) {
        fallbackValue.change = result;
      }
    }
    if (changeResult && changeResult.hasOwnProperty('fallback') && changeResult.fallback) {
      fallbackValue.change = changeResult.fallback.value;
      fallbackMessages.push(changeResult.fallback.message);
      if (result) {
        fallbackValue.probability = result;
      }
    }
    if (!isEqual(fallbackValue, {})) {
      result = { fallback: { value: fallbackValue, message: fallbackMessages.join(' ') } };
    }
  }
  return result;
};

const tacToJsonForTimestamp = (timestampAsTac, scopeStart, scopeEnd, useFallback = false, prefix = true) => {
  let result = null;
  const scopeStartMoment = moment.utc(scopeStart);
  const scopeEndMoment = moment.utc(scopeEnd);
  let matchResult;
  let dateValue;
  let hourValue;
  if (scopeStartMoment.isValid() && scopeEndMoment.isValid() && scopeStartMoment.isBefore(scopeEndMoment) &&
      timestampAsTac && typeof timestampAsTac === 'string') {
    matchResult = timestampAsTac.match(timestampRegEx);
    if (matchResult) {
      const resultMoment = scopeStartMoment.clone();
      dateValue = parseInt(matchResult[1]);
      hourValue = parseInt(matchResult[2]);
      resultMoment.date(dateValue).hours(hourValue).minutes(0).seconds(0).milliseconds(0);
      // Only proceed if moment has not bubbled dates overflow to months and not bubbled hours overflow to days
      if (resultMoment.date() === dateValue && resultMoment.hours() === hourValue) {
        if (scopeEndMoment.month() !== scopeStartMoment.month() && dateValue < 15) {
          resultMoment.add(1, 'months');
        }
        result = resultMoment.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      }
    }
  }
  if (useFallback && !result && timestampAsTac && typeof timestampAsTac === 'string') {
    const fallbackMessages = [];
    const prefixMessage = prefix ? converterMessagesMap.prefix + 'Valid period Start ' : '';
    if (!matchResult) {
      fallbackMessages.push(prefixMessage + 'is expected to equal 4 digits');
    } else {
      if (dateValue < 1 || dateValue > 31) {
        fallbackMessages.push(prefixMessage + 'should have a date value between 01 and 31.');
      } else if (hourValue < 0 || hourValue > 23) {
        fallbackMessages.push(prefixMessage + 'should have an hour value between 00 and 23.');
      } else {
        fallbackMessages.push(prefixMessage + 'should equal <date><hour>, with <date> a valid, 2 digit date and <hour> a valid, 2 digit hour');
      }
    }
    result = { fallback: { value: timestampAsTac, message: fallbackMessages } };
  }
  return result;
};

const tacToJsonForPeriod = (periodAsTac, scopeStart, scopeEnd, useFallback = false) => {
  const result = {
    start: null,
    end: null
  };
  if (periodAsTac && typeof periodAsTac === 'string') {
    const matchResult = periodAsTac.match(periodRegEx);
    if (matchResult) {
      result.start = tacToJsonForTimestamp(matchResult[1], scopeStart, scopeEnd, useFallback, false);
      result.end = tacToJsonForTimestamp(matchResult[2], scopeStart, scopeEnd, useFallback, false);
    }
  }
  if (result.start && result.start.hasOwnProperty('fallback')) {
    if (useFallback) {
      const startFallbackMessages = [];
      result.start.fallback.message.map((message) => {
        startFallbackMessages.push(converterMessagesMap.prefix + 'Valid period Start ' + message);
      });
      result.start.fallback.message = startFallbackMessages.join(' ');
    } else {
      result.start = null;
    }
  }
  if (result.end && result.end.hasOwnProperty('fallback')) {
    if (useFallback) {
      const endFallbackMessages = [];
      result.end.fallback.message.map((message) => {
        endFallbackMessages.push(converterMessagesMap.prefix + 'Valid period End ' + message);
      });
      result.end.fallback.message = endFallbackMessages.join(' ');
    } else {
      result.end = null;
    }
  }
  if (useFallback && isEqual(result, { start: null, end: null }) && periodAsTac && typeof periodAsTac === 'string') {
    result.start = { fallback: { value: periodAsTac, message: converterMessagesMap.prefix + converterMessagesMap.period } };
    result.end = null;
  }
  return result;
};

const tacToJsonForWind = (windAsTac, useFallback = false) => {
  const result = cloneDeep(TAF_TEMPLATES.WIND);
  if (windAsTac && typeof windAsTac === 'string') {
    const matchResult = windAsTac.match(windRegEx);
    if (matchResult) {
      const direction = parseInt(matchResult[1]);
      result.direction = isNaN(direction)
        ? getMapValue(matchResult[1], windUnknownInverseMap, true)
        : direction;
      const speed = parseInt(matchResult[2]);
      result.speed = isNaN(speed)
        ? matchResult[2].toUpperCase()
        : speed;
      if (matchResult[3]) {
        result.gusts = parseInt(matchResult[3]);
      }
      result.unit = getMapValue(matchResult[4], windUnitInverseMap, true) || 'KT';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.WIND) && windAsTac && typeof windAsTac === 'string') {
    result.fallback = { value: windAsTac, message: converterMessagesMap.wind };
  }
  return result;
};

const tacToJsonForVisibility = (visibilityAsTac, useFallback = false) => {
  const result = cloneDeep(TAF_TEMPLATES.VISIBILITY);
  if (visibilityAsTac && typeof visibilityAsTac === 'string') {
    const matchResult = visibilityAsTac.match(visibilityRegEx);
    if (matchResult) {
      result.value = parseInt(matchResult[1]);
      result.unit = getMapValue(matchResult[2], visibilityUnitInverseMap, true) || 'M';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.VISIBILITY) && visibilityAsTac && typeof visibilityAsTac === 'string') {
    result.fallback = { value: visibilityAsTac, message: converterMessagesMap.visibility };
  }
  return result;
};

const tacToJsonForCavok = (cavokAsTac) => {
  let result = false;
  if (cavokAsTac && typeof cavokAsTac === 'string') {
    const matchResult = cavokAsTac.match(cavokRegEx);
    if (matchResult) {
      result = true;
    }
  }
  return result;
};

const tacToJsonForWeather = (weatherAsTac, useFallback = false) => {
  let result = cloneDeep(TAF_TEMPLATES.WEATHER[0]);
  if (weatherAsTac && typeof weatherAsTac === 'string') {
    const matchResult = weatherAsTac.match(weatherRegEx);
    if (matchResult) {
      result.qualifier = getMapValue(matchResult[1], qualifierInverseMap, true);
      result.descriptor = getMapValue(matchResult[2], descriptorInverseMap, true);
      const phenomena = matchResult[3].match(weatherPhenomenaRegEx);
      if (Array.isArray(phenomena)) {
        result.phenomena = phenomena.map(elmt => getMapValue(elmt, phenomenaInverseMap, true));
      }
    } else if (weatherAsTac.toUpperCase() === 'NSW') {
      result = 'NSW';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.WEATHER[0]) && weatherAsTac && typeof weatherAsTac === 'string') {
    result.fallback = { value: weatherAsTac, message: converterMessagesMap.weather };
  }
  return result;
};

const tacToJsonForClouds = (cloudsAsTac, useFallback = false) => {
  let result = cloneDeep(TAF_TEMPLATES.CLOUDS[0]);
  if (cloudsAsTac && typeof cloudsAsTac === 'string') {
    const matchResult = cloudsAsTac.match(cloudsRegEx);
    if (matchResult) {
      if (matchResult[1] && matchResult[2]) {
        result.amount = getMapValue(matchResult[1], amountInverseMap, true);
        result.height = parseInt(matchResult[2]);
      }
      if (matchResult[3]) {
        result.mod = getMapValue(matchResult[3], modInverseMap, true);
      }
    } else if (cloudsAsTac.toUpperCase() === 'NSC') {
      result = 'NSC';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.CLOUDS[0]) && cloudsAsTac && typeof cloudsAsTac === 'string') {
    result.fallback = { value: cloudsAsTac, message: converterMessagesMap.clouds };
  }
  return result;
};

const tacToJsonForVerticalVisibility = (verticalVisibilityAsTac, useFallback = false) => {
  let result = null;
  if (verticalVisibilityAsTac && typeof verticalVisibilityAsTac === 'string') {
    const matchResult = verticalVisibilityAsTac.match(verticalVisibilityRegEx);
    if (matchResult) {
      result = parseInt(matchResult[1]);
    }
  }
  if (useFallback && result === null && verticalVisibilityAsTac && typeof verticalVisibilityAsTac === 'string') {
    result.fallback = { value: verticalVisibilityAsTac, message: converterMessagesMap.clouds };
  }
  return result;
};

const converterMessagesMap = {
  prefix: 'The input value for ',
  period: 'Valid period was not recognized. Expected either <timestamp> or <timestamp>/<timestamp>, with <timestamp> equal to 4 digits',
  wind: 'Wind was not recognized. Expected either <3 digits for direction><2 digits for speed>, optionally appended with \'G\'<2 digits for gust speed>, optionally followed by \'KT\' or \'MPS\'',
  visibility: 'Visibility was not recognized. Expected either <4 digits for range>, optionally followed by \'M\' or \'KM\', or \'CAVOK\'',
  weather: 'Weather was not recognized. Expected either an optionally prefix with <1 or 2 character(s) for qualifier>, ' +
    'followed by an optional <2 characters for descriptor>, optionally followed by <1 or more times repeated group of 2 characters for phenomena> or \'NSW\'',
  clouds: 'Cloud was not recognized. Expected one of <3 characters for amount><3 digits for height> optionally followed by <2 or 3 characters for modifier>,' +
    '\'VV\'<3 digits for height of vertical visibility> or \'NSC\''
};

module.exports = {
  jsonToTacForProbability: jsonToTacForProbability,
  jsonToTacForChangeType: jsonToTacForChangeType,
  jsonToTacForTimestamp: jsonToTacForTimestamp,
  jsonToTacForPeriod: jsonToTacForPeriod,
  jsonToTacForWind: jsonToTacForWind,
  jsonToTacForVisibility: jsonToTacForVisibility,
  jsonToTacForCavok: jsonToTacForCavok,
  jsonToTacForWeather: jsonToTacForWeather,
  jsonToTacForClouds: jsonToTacForClouds,
  jsonToTacForVerticalVisibility: jsonToTacForVerticalVisibility,
  tacToJsonForProbabilityAndChangeType: tacToJsonForProbabilityAndChangeType,
  tacToJsonForProbability: tacToJsonForProbability,
  tacToJsonForChangeType: tacToJsonForChangeType,
  tacToJsonForTimestamp: tacToJsonForTimestamp,
  tacToJsonForPeriod: tacToJsonForPeriod,
  tacToJsonForWind: tacToJsonForWind,
  tacToJsonForVisibility: tacToJsonForVisibility,
  tacToJsonForCavok: tacToJsonForCavok,
  tacToJsonForWeather: tacToJsonForWeather,
  tacToJsonForClouds: tacToJsonForClouds,
  tacToJsonForVerticalVisibility: tacToJsonForVerticalVisibility
};
