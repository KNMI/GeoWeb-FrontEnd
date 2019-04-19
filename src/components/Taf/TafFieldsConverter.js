import { windUnitMap, windUnitInverseMap, windDirectionMap, windDirectionInverseMap } from './TafWindMaps';
import { visibilityUnitMap, visibilityUnitInverseMap } from './TafVisibilityMaps';
import { qualifierMap, qualifierInverseMap, descriptorMap, descriptorInverseMap, phenomenaMap, phenomenaInverseMap } from './TafWeatherMaps';
import { amountMap, amountInverseMap, modMap, modInverseMap } from './TafCloudsMaps';
import { probabilityMap, probabilityInverseMap, typeMap, typeInverseMap } from './TafChangeTypeMaps';
import { TAF_TEMPLATES } from './TafTemplates';
import { LIFECYCLE_STAGES } from '../../containers/Taf/TafActions';
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

const extendedTimestampRegEx = /^(\d{2})(\d{2})(\d{2})$/i;

const periodRegEx = /^(\d{4})\/(\d{4})$/i;

const windRegEx = new RegExp('^(\\d{3}|' + convertMapToRegExpOptions(windDirectionInverseMap) + ')' +
  '(P?)(\\d{2})' +
  '(?:G(P?)(\\d{2}))?' +
  '(?:(' + convertMapToRegExpOptions(windUnitInverseMap) + '))?$', 'i');
const windDirectionRegEx = new RegExp('^(\\d{3}|' + convertMapToRegExpOptions(windDirectionInverseMap) + ')', 'i');
const windSpeedRegEx = /.*(P?)(\d{2})/i;
const windGustsRegEx = /.*G(P?)(\d{2})/i;
const windUnitRegEx = new RegExp('.*(' + convertMapToRegExpOptions(windUnitInverseMap) + ')$', 'i');

const visibilityRegEx = new RegExp('^(\\d{4})(?:(' + convertMapToRegExpOptions(visibilityUnitInverseMap) + '))?$', 'i');
const visibilityUnitRegEx = new RegExp('.*(' + convertMapToRegExpOptions(visibilityUnitInverseMap) + ')$', 'i');

const cavokRegEx = /^CAVOK$/i;

const weatherRegEx = new RegExp('^(' + convertMapToRegExpOptions(qualifierInverseMap) + ')' +
    '(?:(' + convertMapToRegExpOptions(descriptorInverseMap) + ')?)' +
    '((?:' + convertMapToRegExpOptions(phenomenaInverseMap) + '){0,6})$', 'i');

const cloudsRegEx = new RegExp('^(?:(' + convertMapToRegExpOptions(amountInverseMap) + ')' +
    '(\\d{3}))?' +
    '(' + convertMapToRegExpOptions(modInverseMap) + ')?$', 'i');
const cloudsAmountRegEx = new RegExp('^(' + convertMapToRegExpOptions(amountInverseMap) + ')', 'i');
const cloudsHeightRegEx = /\D+\d{3}/;
const cloudsModifierRegEx = new RegExp('.+(' + convertMapToRegExpOptions(modInverseMap) + ')$', 'i');

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
const jsonToTacForType = (typeAsJson, useFallback = false) => {
  let result = null;
  if (typeAsJson && typeof typeAsJson === 'string') {
    const matchedOption = LIFECYCLE_STAGES.find((option) => option.stage === typeAsJson.toLowerCase());
    if (matchedOption) {
      result = matchedOption.label;
    }
  }
  return result;
};

const jsonToTacForIssue = (issueAsJson, useFallback = false) => {
  let result = null;
  const NOT_YET = 'not yet issued';
  if (issueAsJson && typeof issueAsJson === 'string') {
    if (moment(issueAsJson).isValid()) {
      result = moment.utc(issueAsJson).format('DDHHmm[Z]');
    } else if (issueAsJson.toLowerCase() === NOT_YET) {
      result = NOT_YET;
    }
  } else {
    result = NOT_YET;
  }
  return result;
};

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

const jsonToTacForTimestamp = (timestampAsJson, useFallback = false, isPeriodEnd = false, useExtendedNotation = false) => {
  let result = null;
  const timestampFormat = useExtendedNotation ? 'DDHHmm' : 'DDHH';
  if (timestampAsJson && typeof timestampAsJson === 'string' && moment(timestampAsJson).isValid()) {
    const timestampMoment = moment.utc(timestampAsJson);
    if (isPeriodEnd && timestampMoment.hours() === 0) {
      result = timestampMoment.add(-1, 'days').format('DD') + '24';
    } else {
      result = timestampMoment.format(timestampFormat);
    }
  } else if (useFallback && timestampAsJson && timestampAsJson.hasOwnProperty('fallback')) {
    result = timestampAsJson.fallback.value;
  }
  return result;
};

const jsonToTacForPeriod = (startTimestampAsJson, endTimestampAsJson, useFallback = false, useExtendedNotation = false) => {
  let result = null;
  const periodStart = jsonToTacForTimestamp(startTimestampAsJson, useFallback, false, useExtendedNotation);
  const periodEnd = jsonToTacForTimestamp(endTimestampAsJson, useFallback, true, useExtendedNotation);
  if (periodStart && periodEnd) {
    result = periodStart + '/' + periodEnd;
  } else if (periodStart) {
    result = periodStart;
  }
  return result;
};

const jsonToTacForWind = (windAsJson, useFallback = false, showDefaultUnit = false) => {
  let result = null;
  if (!windAsJson) {
    return result;
  }
  if (windAsJson.hasOwnProperty('direction')) {
    if (typeof windAsJson.direction === 'number') {
      result = windAsJson.direction.toString().padStart(3, '0');
    } else if (typeof windAsJson.direction === 'string') {
      result = getMapValue(windAsJson.direction, windDirectionMap);
      if (!result) {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
      }
    } else {
      return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('speedOperator')) {
    if (typeof windAsJson.speedOperator === 'string') {
      const speedOperator = windAsJson.speedOperator.toLowerCase() === 'above' ? 'P' : null;
      if (!speedOperator) {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
      } else {
        result += speedOperator;
      }
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('speed')) {
    if (typeof windAsJson.speed === 'number') {
      result += windAsJson.speed.toString().padStart(2, '0');
    } else {
      return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('gusts')) {
    if (typeof windAsJson.gusts === 'number') {
      result += 'G';
      if (windAsJson.hasOwnProperty('gustsOperator')) {
        if (typeof windAsJson.gustsOperator === 'string') {
          const gustsOperator = windAsJson.gustsOperator.toLowerCase() === 'above' ? 'P' : null;
          if (!gustsOperator) {
            return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
          } else {
            result += gustsOperator;
          }
        }
      } else {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
      }
      result += windAsJson.gusts.toString().padStart(2, '0');
    }
  } else {
    return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
  }
  if (windAsJson.hasOwnProperty('unit')) {
    if (typeof windAsJson.unit === 'string') {
      const unit = getMapValue(windAsJson.unit, windUnitMap);
      if (!unit) {
        return useFallback && windAsJson.hasOwnProperty('fallback') ? windAsJson.fallback.value : null;
      } else if (showDefaultUnit || unit !== windUnitMap.KT) { // Skip default unit
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
    } else if (unit !== visibilityUnitMap.M) { // Skip default unit
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
  } else if (weatherAsJson && typeof weatherAsJson === 'object') {
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
  } else if (cloudsAsJson && typeof cloudsAsJson === 'object') {
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
  if (verticalVisibilityAsJson !== null && typeof verticalVisibilityAsJson === 'number') {
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

const tacToJsonForTimestamp = (timestampAsTac, scopeStart, scopeEnd, useFallback = false, prefix = true, useExtendedNotation = false) => {
  let result = null;
  const scopeStartMoment = moment.utc(scopeStart);
  const scopeEndMoment = moment.utc(scopeEnd);
  let matchResult;
  let dateValue;
  let hourValue;
  let minuteValue = 0;
  if (scopeStartMoment.isValid() && scopeEndMoment.isValid() && scopeStartMoment.isBefore(scopeEndMoment) &&
      timestampAsTac && typeof timestampAsTac === 'string') {
    matchResult = timestampAsTac.match(useExtendedNotation ? extendedTimestampRegEx : timestampRegEx);
    if (matchResult) {
      const resultMoment = scopeStartMoment.clone();
      dateValue = parseInt(matchResult[1]);
      hourValue = parseInt(matchResult[2]);
      if (useExtendedNotation) {
        minuteValue = parseInt(matchResult[3]);
      }
      resultMoment.date(dateValue).hours(hourValue).minutes(minuteValue).seconds(0).milliseconds(0);
      // Only proceed if moment has not bubbled dates overflow to months and not bubbled hours overflow to days
      if ((resultMoment.date() === dateValue && resultMoment.hours() === hourValue && resultMoment.minutes() === minuteValue) ||
          (resultMoment.date() === dateValue + 1 && hourValue === 24 && minuteValue === 0)) {
        if (scopeEndMoment.month() !== scopeStartMoment.month() && dateValue < 15) {
          resultMoment.add(1, 'months');
        }
        result = resultMoment.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
      }
    }
  }
  if (useFallback && !result && timestampAsTac && typeof timestampAsTac === 'string') {
    const fallbackMessages = [];
    let prefixMessage = prefix ? converterMessagesMap.prefix + 'Valid period Start ' : '';
    if (!matchResult) {
      fallbackMessages.push(`${prefixMessage} is expected to equal ${useExtendedNotation ? '6' : '4'} digits`);
    } else {
      if (dateValue < 1 || dateValue > 31) {
        fallbackMessages.push(prefixMessage + 'should have a date value between 01 and 31.');
      }
      if (hourValue < 0 || hourValue > 24) {
        if (prefixMessage && fallbackMessages.length > 0) {
          prefixMessage = 'And also, it ';
        }
        fallbackMessages.push(prefixMessage + 'should have an hour value between 00 and 24.');
      }
      if (minuteValue < 0 || minuteValue > 59) {
        if (prefixMessage && fallbackMessages.length > 0) {
          prefixMessage = 'And also, it ';
        }
        fallbackMessages.push(prefixMessage + 'should have a minute value between 00 and 59.');
      }
      if (fallbackMessages.length === 0) {
        fallbackMessages.push(`${prefixMessage} ${useExtendedNotation
          ? 'should equal <date><hour><minute>, with <date> a valid, 2 digit date, ' +
              '<hour> a valid, 2 digit hour and <minute> a valid, 2 digit minute'
          : 'should equal <date><hour>, with <date> a valid, 2 digit date and <hour> a valid, 2 digit hour'}`);
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
      result.start.fallback.message.forEach((message) => {
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
      result.end.fallback.message.forEach((message) => {
        endFallbackMessages.push(converterMessagesMap.prefix + 'Valid period End ' + message);
      });
      result.end.fallback.message = endFallbackMessages.join(' ');
    } else {
      result.end = null;
    }
  }
  if (useFallback && isEqual(result, { start: null, end: null }) && periodAsTac && typeof periodAsTac === 'string') {
    result.fallback = { value: periodAsTac, message: converterMessagesMap.prefix + converterMessagesMap.period };
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
        ? getMapValue(matchResult[1], windDirectionInverseMap, true)
        : direction;
      if (matchResult[2]) {
        result.speedOperator = 'above';
      }
      if (matchResult[3]) {
        result.speed = parseInt(matchResult[3]);
      }
      if (matchResult[4]) {
        result.gustsOperator = 'above';
      }
      if (matchResult[5]) {
        result.gusts = parseInt(matchResult[5]);
      }
      result.unit = getMapValue(matchResult[6], windUnitInverseMap, true) || 'KT';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.WIND) && windAsTac && typeof windAsTac === 'string') {
    const prefixMessage = converterMessagesMap.prefix + 'Wind ';
    const fallbackMessages = [];
    if (!windAsTac.match(windDirectionRegEx)) {
      fallbackMessages.push(prefixMessage + 'Direction was not recognized. It is required and should equal 3 digits or (' + convertMapToString(windDirectionInverseMap) + ').');
    }
    if (!windAsTac.match(windSpeedRegEx)) {
      fallbackMessages.push(prefixMessage + 'Speed was not recognized. It is required and should equal 2 digits or (P) followed by 2 digits.');
    }
    if (fallbackMessages.length === 0) {
      if (!windAsTac.match(windGustsRegEx) && windAsTac.toUpperCase().indexOf('G') !== -1) {
        fallbackMessages.push(prefixMessage + 'Gusts should equal (G) followed by 2 digits.');
      }
      if (!windAsTac.match(windUnitRegEx) && windAsTac.match(/.+[A-FH-Z]/i)) {
        fallbackMessages.push(prefixMessage + 'Unit is not one of the allowed values (' + convertMapToString(windUnitInverseMap) + ') or it is not the last token.');
      }
    }

    if (fallbackMessages.length === 0) {
      fallbackMessages.push(prefixMessage + converterMessagesMap.wind);
    }
    result.fallback = { value: windAsTac, message: fallbackMessages.join(' ') };
  }
  return result;
};

const tacToJsonForVisibility = (visibilityAsTac, useFallback = false) => {
  const result = cloneDeep(TAF_TEMPLATES.VISIBILITY);
  if (visibilityAsTac && typeof visibilityAsTac === 'string') {
    // if (parseInt(visibilityAsTac) > 9999) visibilityAsTac = '9999'; TODO: Discuss if auto changing input is desired or not
    const matchResult = visibilityAsTac.match(visibilityRegEx);
    if (matchResult) {
      result.value = parseInt(matchResult[1]);
      result.unit = getMapValue(matchResult[2], visibilityUnitInverseMap, true) || 'M';
    }
  }
  if (useFallback && isEqual(result, TAF_TEMPLATES.VISIBILITY) && visibilityAsTac && typeof visibilityAsTac === 'string') {
    const prefixMessage = converterMessagesMap.prefix + 'Visibility ';
    const fallbackMessages = [];
    if (visibilityAsTac.match(/^\d/) && !visibilityAsTac.match(/^\d{4}/)) {
      fallbackMessages.push(prefixMessage + 'Value is expected to equal 4 digits.');
    }
    if (!visibilityAsTac.match(visibilityUnitRegEx) && visibilityAsTac.match(/\d+\D/)) {
      fallbackMessages.push(prefixMessage + 'Unit is not one of the allowed values (' + convertMapToString(visibilityUnitInverseMap) + ').');
    }
    if (fallbackMessages.length === 0) {
      fallbackMessages.push(prefixMessage + converterMessagesMap.visibility);
    }
    result.fallback = { value: visibilityAsTac, message: fallbackMessages.join(' ') };
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
    result.fallback = { value: weatherAsTac, message: converterMessagesMap.prefix + converterMessagesMap.weather };
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
    const prefixMessage = converterMessagesMap.prefix + 'Cloud ';
    const fallbackMessages = [];
    if (!cloudsAsTac.match(cloudsAmountRegEx) && cloudsAsTac.match(/^(F|S|B|O)/i)) {
      fallbackMessages.push(prefixMessage + 'Amount is not one of the allowed values (' + convertMapToString(amountInverseMap) + ').');
    }
    if (!cloudsAsTac.match(cloudsHeightRegEx) && cloudsAsTac.match(/[^0-9V]+\d{1,2}/i)) {
      fallbackMessages.push(prefixMessage + 'Height is expected to equal 3 digits.');
    }
    if (!cloudsAsTac.match(cloudsModifierRegEx) && fallbackMessages.length === 0 && cloudsAsTac.toUpperCase().includes('C')) {
      fallbackMessages.push(prefixMessage + 'Modifier is not one of the allowed values (' + convertMapToString(modInverseMap) + ').');
    }
    if (fallbackMessages.length === 0) {
      fallbackMessages.push(converterMessagesMap.clouds);
    }
    result.fallback = { value: cloudsAsTac, message: fallbackMessages.join(' ') };
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
    result = { fallback: { value: verticalVisibilityAsTac, message: converterMessagesMap.vertical_visibility } };
  }
  return result;
};

const converterMessagesMap = {
  prefix: 'The input value for ',
  period: 'Valid period was not recognized. Expected either <timestamp>, <extended_timestamp> or <timestamp>/<timestamp>,' +
      'with <timestamp> equal to 4 digits and <extended_timestamp> equal to 6 digits.',
  wind: 'was not recognized. Expected at least <direction><speed>, with <direction> to equal either 3 digits or VRB and <speed> equal to 2 digits',
  visibility: 'was not recognized. Expected either <value>, <value><unit> or (CAVOK), with <value> equal to 4 digits and <unit> ' +
    'one of (' + convertMapToString(visibilityUnitInverseMap) + ').',
  weather: 'Weather was not recognized. Expected either <descriptor>, <qualifier><descriptor>, <phenomena>, <descriptor><phenomena> ' +
    'or <qualifier><descriptor><phenomena> or (NSW), ' +
    'with <qualifier> one of (' + convertMapToString(qualifierInverseMap) + '), <descriptor> one of (' + convertMapToString(descriptorInverseMap) + '), ' +
    '<phenomena> any of (' + convertMapToString(phenomenaInverseMap) + ').',
  clouds: 'Cloud was not recognized. Expected at least one of <amount><height>, <modifier>, <vertical_visibility> or (NSC), ' +
    'with <amount> one of (' + convertMapToString(amountInverseMap) + '), <height> equal to 3 digits and <modifier> one of ' +
    '(' + convertMapToString(modInverseMap) + ')',
  vertical_visibility: 'Vertical visibility was not recognized. Expected <vertical_visibility> equal to (VV) followed by 3 digits.'
};

module.exports = {
  jsonToTacForIssue: jsonToTacForIssue,
  jsonToTacForType: jsonToTacForType,
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
