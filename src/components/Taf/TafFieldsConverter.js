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
const probabilityAndChangeTypeRegEx = new RegExp('(' + Object.keys(probabilityInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')?' +
  '\\s?(' + Object.keys(typeInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')?', 'i');

const probabilityRegEx = new RegExp('(' + Object.keys(probabilityInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')', 'i');

const changeTypeRegEx = new RegExp('(' + Object.keys(typeInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')', 'i');

const timestampRegEx = /(\d{2})(\d{2})/i;

const periodRegEx = /(\d{4})\/(\d{4})/i;

const windRegEx = /(\d{3}|VRB)(\d{2})(?:G(\d{2}))?/i;

const cavokRegEx = /CAVOK/i;

const weatherRegEx = new RegExp('(' + Object.keys(qualifierInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')' +
    '(' + Object.keys(descriptorInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')' +
    '((?:' + Object.keys(phenomenaInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')+)', 'i');

const cloudsRegEx = new RegExp('(' + Object.keys(amountInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')' +
    '(\\d{3})' +
    '(' + Object.keys(modInverseMap).join('|') + ')?', 'i');

const verticalVisibilityRegEx = /VV(\d{3})/i;

const weatherPhenomenaRegEx = new RegExp('(' + Object.keys(phenomenaInverseMap).map(elmt => escapeRegExp(elmt)).join('|') + ')', 'ig');

/**
 * Utility methods to shorten / reuse notation
 */
const mapProbabilityToString = (probability) => {
  if (probability && typeof probability === 'string') {
    return probabilityMap.hasOwnProperty(probability.toUpperCase()) ? probabilityMap[probability.toUpperCase()] : null;
  }
  return null;
};

const mapChangeTypeToString = (changetype) => {
  if (changetype && typeof changetype === 'string') {
    return typeMap.hasOwnProperty(changetype.toUpperCase()) ? typeMap[changetype.toUpperCase()] : null;
  }
  return null;
};

const numberAsTwoCharacterString = (numberAsNumber) => {
  return numberAsNumber.toString().padStart(2, '0');
};

const mapWeatherQualifierToTac = (qualifier) => {
  return qualifierMap.hasOwnProperty(qualifier) ? qualifierMap[qualifier] : null;
};

const mapWeatherQualifierToJson = (qualifierAsTac) => {
  if (qualifierAsTac !== null && typeof qualifierAsTac === 'string') {
    return qualifierInverseMap.hasOwnProperty(qualifierAsTac.toUpperCase()) ? qualifierInverseMap[qualifierAsTac.toUpperCase()] : null;
  }
  return null;
};

const mapWeatherDescriptorToTac = (descriptor) => {
  return descriptorMap.hasOwnProperty(descriptor) ? descriptorMap[descriptor] : null;
};

const mapWeatherDescriptorToJson = (descriptorAsTac) => {
  if (descriptorAsTac && typeof descriptorAsTac === 'string') {
    return descriptorInverseMap.hasOwnProperty(descriptorAsTac.toUpperCase()) ? descriptorInverseMap[descriptorAsTac.toUpperCase()] : null;
  }
  return null;
};

const mapWeatherPhenomenonToTac = (phenomenon) => {
  return phenomenaMap.hasOwnProperty(phenomenon) ? phenomenaMap[phenomenon] : null;
};

const mapWeatherPhenomenonToJson = (phenomenonAsTac) => {
  if (phenomenonAsTac && typeof phenomenonAsTac === 'string') {
    return phenomenaInverseMap.hasOwnProperty(phenomenonAsTac.toUpperCase()) ? phenomenaInverseMap[phenomenonAsTac.toUpperCase()] : null;
  }
  return null;
};

const mapCloudsAmountToTac = (amount) => {
  return amountMap.hasOwnProperty(amount) ? amountMap[amount] : null;
};

const mapCloudsAmountToJson = (amountAsTac) => {
  if (amountAsTac && typeof amountAsTac === 'string') {
    return amountInverseMap.hasOwnProperty(amountAsTac.toUpperCase()) ? amountInverseMap[amountAsTac.toUpperCase()] : null;
  }
  return null;
};

const mapCloudsModToTac = (mod) => {
  return modMap.hasOwnProperty(mod) ? modMap[mod] : null;
};

const mapCloudsModToJson = (modAsTac) => {
  if (modAsTac && typeof modAsTac === 'string') {
    return modInverseMap.hasOwnProperty(modAsTac.toUpperCase()) ? modInverseMap[modAsTac.toUpperCase()] : null;
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
      result = mapProbabilityToString(matchResult[1]);
    }
  }
  if (useFallback && !result && probabilityAsJson && probabilityAsJson.hasOwnProperty('fallback')) {
    if (probabilityAsJson.fallback && probabilityAsJson.fallback.hasOwnProperty('probability')) {
      result = probabilityAsJson.fallback.probability;
    }
  }
  return result;
};

const jsonToTacForChangeType = (changeTypeAsJson, useFallback = false) => {
  let result = null;
  if (changeTypeAsJson && typeof changeTypeAsJson === 'string') {
    const matchResult = changeTypeAsJson.match(probabilityAndChangeTypeRegEx);
    if (matchResult) {
      result = mapChangeTypeToString(matchResult[2]);
    }
  }
  if (useFallback && !result && changeTypeAsJson && changeTypeAsJson.hasOwnProperty('fallback')) {
    if (changeTypeAsJson.fallback && changeTypeAsJson.fallback.hasOwnProperty('change')) {
      result = changeTypeAsJson.fallback.change;
    }
  }
  return result;
};

const jsonToTacForTimestamp = (timestampAsJson, useFallback = false) => {
  let result = null;
  if (timestampAsJson && typeof timestampAsJson === 'string' && moment(timestampAsJson).isValid()) {
    result = moment.utc(timestampAsJson).format('DDHH');
  } else if (useFallback && timestampAsJson.hasOwnProperty('fallback')) {
    result = timestampAsJson.fallback;
  }
  return result;
};

const jsonToTacForPeriod = (startTimestampAsJson, endTimestampAsJson, useFallback = false) => {
  let result = null;
  const periodStart = jsonToTacForTimestamp(startTimestampAsJson);
  const periodEnd = jsonToTacForTimestamp(endTimestampAsJson);
  if (periodStart && periodEnd) {
    result = periodStart + '/' + periodEnd;
  } else if (useFallback && startTimestampAsJson.hasOwnProperty('fallback')) {
    result = startTimestampAsJson.fallback;
  }
  return result;
};

const jsonToTacForWind = (windAsJson, useFallback = false) => {
  let result = null;
  if (windAsJson && windAsJson.hasOwnProperty('direction')) {
    if (typeof windAsJson.direction === 'number') {
      result = windAsJson.direction.toString().padStart(3, '0');
    } else {
      if (typeof windAsJson.direction === 'string' && windAsJson.direction === 'VRB') {
        result = 'VRB';
      } else {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback : null;
      }
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback : null;
  }
  if (windAsJson && windAsJson.hasOwnProperty('speed')) {
    if (typeof windAsJson.speed === 'number') {
      result += windAsJson.speed.toString().padStart(2, '0');
    } else {
      return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback : null;
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback : null;
  }
  if (windAsJson && windAsJson.hasOwnProperty('gusts')) {
    if (typeof windAsJson.gusts === 'number') {
      result += 'G' + windAsJson.gusts.toString().padStart(2, '0');
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback : null;
  }
  return result;
};

const jsonToTacForVisibility = (visibilityAsJson, useFallback = false) => {
  let result = null;
  if (visibilityAsJson && visibilityAsJson.hasOwnProperty('value') && typeof visibilityAsJson.value === 'number') {
    result = visibilityAsJson.value.toString().padStart(4, '0');
  } else if (useFallback && visibilityAsJson.hasOwnProperty('fallback')) {
    result = visibilityAsJson.fallback;
  }
  return result;
};

const jsonToTacForCavok = (cavokAsJson) => {
  return (cavokAsJson !== null && typeof cavokAsJson === 'boolean' && cavokAsJson ? 'CAVOK' : null);
};

const jsonToTacForWeather = (weatherAsJson, useFallback = false) => {
  let result = null;
  if (weatherAsJson) {
    if (typeof weatherAsJson === 'string' && weatherAsJson === 'NSW') {
      result = 'NSW';
    } else if (typeof weatherAsJson === 'object') {
      if (weatherAsJson.hasOwnProperty('qualifier') && typeof weatherAsJson.qualifier === 'string') {
        result = mapWeatherQualifierToTac(weatherAsJson.qualifier);
      } else {
        return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback : null;
      }
      if (weatherAsJson.hasOwnProperty('descriptor') && typeof weatherAsJson.descriptor === 'string') {
        result += mapWeatherDescriptorToTac(weatherAsJson.descriptor);
      } else {
        return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback : null;
      }
      if (weatherAsJson.hasOwnProperty('phenomena') && Array.isArray(weatherAsJson.phenomena)) {
        result += weatherAsJson.phenomena.reduce((cumm, current) => {
          cumm += mapWeatherPhenomenonToTac(current);
          return cumm;
        }, '');
      } else {
        return useFallback && weatherAsJson.hasOwnProperty('fallback') ? weatherAsJson.fallback : null;
      }
    }
  }
  return result;
};

const jsonToTacForClouds = (cloudsAsJson, useFallback = false) => {
  let result = null;
  if (cloudsAsJson) {
    if (typeof cloudsAsJson === 'string' && cloudsAsJson === 'NSC') {
      result = 'NSC';
    } else if (typeof cloudsAsJson === 'object') {
      if (cloudsAsJson.hasOwnProperty('amount') && typeof cloudsAsJson.amount === 'string') {
        result = mapCloudsAmountToTac(cloudsAsJson.amount);
      } else {
        return useFallback && cloudsAsJson.hasOwnProperty('fallback') ? cloudsAsJson.fallback : null;
      }
      if (cloudsAsJson.hasOwnProperty('height') && typeof cloudsAsJson.height === 'number') {
        result += cloudsAsJson.height.toString().padStart(3, '0');
      } else {
        return useFallback && cloudsAsJson.hasOwnProperty('fallback') ? cloudsAsJson.fallback : null;
      }
      if (cloudsAsJson.hasOwnProperty('mod') && typeof cloudsAsJson.mod === 'string') {
        result += mapCloudsModToTac(cloudsAsJson.mod);
      }
    }
  }
  return result;
};

const jsonToTacForVerticalVisibility = (verticalVisibilityAsJson, useFallback = false) => {
  let result = null;
  if (verticalVisibilityAsJson && typeof verticalVisibilityAsJson === 'number') {
    result = 'VV' + verticalVisibilityAsJson.toString().padStart(3, '0');
  } else if (useFallback && verticalVisibilityAsJson && verticalVisibilityAsJson.hasOwnProperty('fallback')) {
    result = verticalVisibilityAsJson.fallback;
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
      result = mapProbabilityToString(matchResult[1]);
    }
  }
  if (useFallback && !result && typeof probabilityAsTac === 'string') {
    result = { fallback: probabilityAsTac };
  }
  return result;
};

const tacToJsonForChangeType = (changeTypeAsTac, useFallback = false) => {
  let result = null;
  if (changeTypeAsTac && typeof changeTypeAsTac === 'string') {
    let matchResult = changeTypeAsTac.match(changeTypeRegEx);
    if (matchResult) {
      result = mapChangeTypeToString(matchResult[1]);
    }
  }
  if (useFallback && !result && changeTypeAsTac && typeof changeTypeAsTac === 'string') {
    result = { fallback: changeTypeAsTac };
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
    const fallback = {};
    if (probResult && probResult.hasOwnProperty('fallback') && probResult.fallback) {
      fallback.probability = probResult.fallback;
      if (result) {
        fallback.change = result;
      }
    }
    if (changeResult && changeResult.hasOwnProperty('fallback') && changeResult.fallback) {
      fallback.change = changeResult.fallback;
      if (result) {
        fallback.probability = result;
      }
    }
    if (!isEqual(fallback, {})) {
      result = { fallback: fallback };
    }
  }
  return result;
};

const tacToJsonForTimestamp = (timestampAsTac, scopeStart, scopeEnd, useFallback = false) => {
  let result = null;
  const scopeStartMoment = moment.utc(scopeStart);
  const scopeEndMoment = moment.utc(scopeEnd);
  if (scopeStartMoment.isValid() && scopeEndMoment.isValid() && scopeStartMoment.isBefore(scopeEndMoment) &&
      timestampAsTac && typeof timestampAsTac === 'string') {
    const matchResult = timestampAsTac.match(timestampRegEx);
    if (matchResult) {
      const dateValue = parseInt(matchResult[1]);
      let monthValue = scopeStartMoment.month() + 1;
      let yearValue = scopeStartMoment.year();
      if (scopeEndMoment.month() !== scopeStartMoment.month() && dateValue < 15) {
        monthValue += 1;
        if (monthValue > 12) {
          monthValue = 1;
          yearValue += 1;
        }
      }
      result = yearValue.toString() + '-' + numberAsTwoCharacterString(monthValue) + '-' + numberAsTwoCharacterString(dateValue) +
        'T' + matchResult[2] + ':00:00Z';
    }
  }
  if (useFallback && typeof result === 'undefined') {
    result = { fallback: timestampAsTac };
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
      result.start = tacToJsonForTimestamp(matchResult[1], scopeStart, scopeEnd);
      result.end = tacToJsonForTimestamp(matchResult[2], scopeStart, scopeEnd);
    }
  }
  if (useFallback && isEqual(result, { start: null, end: null })) {
    result.fallback = periodAsTac;
  }
  return result;
};

const tacToJsonForWind = (windAsTac, useFallback = false) => {
  const result = cloneDeep(TAF_TEMPLATES.WIND);
  if (windAsTac && typeof windAsTac === 'string') {
    const matchResult = windAsTac.match(windRegEx);
    if (matchResult) {
      const direction = parseInt(matchResult[1]);
      result.direction = isNaN(direction) ? 'VRB' : direction;
      result.speed = parseInt(matchResult[2]);
      if (matchResult[3]) {
        result.gusts = parseInt(matchResult[3]);
      }
      result.unit = 'KT';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.WIND)) {
    result.fallback = windAsTac;
  }
  return result;
};

const tacToJsonForVisibility = (visibilityAsTac, useFallback = false) => {
  const visibilityRegEx = /^(\d{4})$/i;
  const result = cloneDeep(TAF_TEMPLATES.VISIBILITY);
  if (visibilityAsTac && typeof visibilityAsTac === 'string') {
    const matchResult = visibilityAsTac.match(visibilityRegEx);
    if (matchResult) {
      result.value = parseInt(matchResult[1]);
      result.unit = 'M';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.VISIBILITY)) {
    result.fallback = visibilityAsTac;
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
      result.qualifier = mapWeatherQualifierToJson(matchResult[1]);
      result.descriptor = mapWeatherDescriptorToJson(matchResult[2]);
      result.phenomena = matchResult[3].match(weatherPhenomenaRegEx).map(elmt => mapWeatherPhenomenonToJson(elmt));
    } else if (weatherAsTac.toUpperCase() === 'NSW') {
      result = 'NSW';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.WEATHER[0])) {
    result.fallback = weatherAsTac;
  }
  return result;
};

const tacToJsonForClouds = (cloudsAsTac, useFallback = false) => {
  let result = cloneDeep(TAF_TEMPLATES.CLOUDS[0]);
  if (cloudsAsTac && typeof cloudsAsTac === 'string') {
    const matchResult = cloudsAsTac.match(cloudsRegEx);
    if (matchResult) {
      result.amount = mapCloudsAmountToJson(matchResult[1]);
      result.height = parseInt(matchResult[2]);
      if (matchResult[3]) {
        result.mod = mapCloudsModToJson(matchResult[3]);
      }
    } else if (cloudsAsTac.toUpperCase() === 'NSC') {
      result = 'NSC';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.CLOUDS[0])) {
    result.fallback = cloudsAsTac;
  }
  return result;
};

const tacToJsonForVerticalVisibility = (verticalVisibilityAsTac) => {
  let result = null;
  if (verticalVisibilityAsTac && typeof verticalVisibilityAsTac === 'string') {
    const matchResult = verticalVisibilityAsTac.match(verticalVisibilityRegEx);
    if (matchResult) {
      result = parseInt(matchResult[1]);
    }
  }
  return result;
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
