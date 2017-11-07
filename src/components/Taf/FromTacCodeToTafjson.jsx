import moment from 'moment';
import { descriptorMap, phenomenaMap } from './TafWeatherMaps';

/* ----- The following functions transform TAC Codes to TAF JSON codes */
const fromTACToWind = (value) => {
  if (!value) return {};
  let obj = {
    direction: value.substring(0, 3) === 'VRB' ? 'VRB' : parseInt(value.substring(0, 3)),
    speed: parseInt(value.substring(3, 5)),
    gusts: value.indexOf('G') !== -1 ? parseInt(value.substring(6, 8)) : null,
    unit: 'KT'
  };
  return obj;
};

const valueAsString = (dateValue) => {
  return dateValue.toString().padStart(2, '0');
};

const fromTACToValid = (scopeStart, scopeEnd, value, indexOffset) => {
  const scopeStartMoment = moment.utc(scopeStart);
  const scopeEndMoment = moment.utc(scopeEnd);
  if (!scopeStartMoment.isBefore(scopeEndMoment)) {
    return null;
  }

  if (!value || typeof value !== 'string' || value.length < (indexOffset + 4)) {
    return null;
  }

  const dateValue = parseInt(value.substring(indexOffset, indexOffset + 2));
  let monthValue = scopeStartMoment.month() + 1;
  let yearValue = scopeStartMoment.year();
  if (scopeEndMoment.month() !== scopeStartMoment.month() && dateValue < 15) {
    monthValue += 1;
    if (monthValue > 12) {
      monthValue = 1;
      yearValue += 1;
    }
  }
  return yearValue.toString() + '-' + valueAsString(monthValue) + '-' + valueAsString(dateValue) + 'T' +
    valueAsString(parseInt(value.substring(indexOffset + 2, indexOffset + 4))) + ':00:00Z';
};

const fromTACToVisibility = (value) => {
  if (value === null || value === undefined) {
    return {
      value: null,
      unit: null
    };
  }
  if (value === 'CAVOK') {
    return {
      value:'CAVOK',
      unit: null
    };
  }
  if (value === '9999') {
    return {
      value:9999,
      unit: null
    };
  } else {
    if (value.indexOf('KM') !== -1) {
      return {
        value: parseInt(value.substring(0, 2)),
        unit: 'KM'
      };
    } else if (value.indexOf('SM') !== -1) {
      return {
        value: parseInt(value.substring(0, 1)),
        unit: 'SM'
      };
    } else {
      return {
        value: parseInt(value.substring(0, 4))
      };
    }
  }
};

const fromTACToWeather = (_value) => {
  let value = _value;
  if (!value || value === '') {
    return null;
  }
  if (value === 'NSW') {
    return 'NSW';
  }
  let qualifier = 'moderate';
  if (value.startsWith('+')) {
    qualifier = 'heavy';
    value = _value.substring(1);
  } else if (value.startsWith('-')) {
    qualifier = 'light';
    value = _value.substring(1);
  } else if (value.startsWith('VC')) {
    qualifier = 'vicinity';
    value = _value.substring(2);
  }

  let tacDescriptor = value.substring(0, 2);
  let descriptor = null; for (let key in descriptorMap) if (tacDescriptor === descriptorMap[key]) { descriptor = key; break; }

  let phenomenas = [];
  for (let p = descriptor ? 2 : 0; p < value.length; p = p + 2) {
    let tacPhenomena = value.substring(p, p + 2);
    for (let key in phenomenaMap) if (tacPhenomena === phenomenaMap[key]) { phenomenas.push(key); break; }
  }
  let obj = {
    descriptor:descriptor,
    phenomena: phenomenas,
    qualifier: qualifier
  };
  return obj;
};

const fromTACToClouds = (value) => {
  let ret = null;
  if (!value || value === '') {
    return null;
  }
  if (value === 'NSC') {
    return 'NSC';
  }

  if (value.startsWith('VV')) {
    // Two letter cloud codes, like VV001
    ret = {
      amount:value.substring(0, 2),
      height:parseInt(value.substring(2, 5)),
      mod: value.length > 5 ? value.slice(5 - value.length) : null
    };
  } else {
    // All three letter cloud codes
    ret = {
      amount:value.substring(0, 3),
      height:parseInt(value.substring(3, 6)),
      mod: value.length > 6 ? value.slice(6 - value.length) : null
    };
  }
  return ret;
};

const getTACWeatherArray = (cg) => {
  let weatherObj = [];
  for (let w = 0; w < 3; w++) {
    let weatherInput = fromTACToWeather(cg.input['weather' + w]);
    if (weatherInput !== null) {
      if (w === 0 && (weatherInput === 'NSW' || weatherInput === '' || weatherInput === null)) {
        return 'NSW';
      }
      weatherObj.push(weatherInput);
    }
  }
  if (weatherObj.length === 0) {
    weatherObj = 'NSW';
  }
  return weatherObj;
};

const getTACCloudsArray = (cg) => {
  let cloudsObj = [];
  for (let c = 0; c < 4; c++) {
    let cloudsInput = fromTACToClouds(cg.input['clouds' + c]);
    if (cloudsInput !== null) {
      if (c === 0 && (cloudsInput === 'isNSC' || cloudsInput === '' || cloudsInput === null)) {
        return 'NSC';
      }
      cloudsObj.push(cloudsInput);
    }
  }
  if (cloudsObj.length === 0) {
    cloudsObj = 'NSC';
  }
  return cloudsObj;
};

export const cloneObjectAndSkipNullProps = (_taf) => {
  let newTaf = {};
  let iterate = (obj, newObj) => {
    for (let property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (obj[property] !== null) {
          if (typeof obj[property] === 'object') {
            if (Object.prototype.toString.call(obj[property]) === '[object Array]') {
              newObj[property] = [];
            } else {
              newObj[property] = {};
            }
            iterate(obj[property], newObj[property]);
          } else {
            if (Object.prototype.toString.call(obj[property]) === '[object Array]') {
              for (let j = 0; j < obj.obj[property].length; j++) {
                newObj[property].push(cloneObjectAndSkipNullProps(obj[property][j]));
              }
            } else {
              newObj[property] = obj[property];
            }
          }
        }
      }
    }
  };
  iterate(_taf, newTaf);
  return newTaf;
};

/*
  Onchange handler from input fields. Adds and sets input properties in TAFJSON object.
*/
export const setTACColumnInput = (value, rowIndex, colIndex, tafRow) => {
  if (!tafRow) {
    console.log('returning because tafRow missing');
    return tafRow;
  }
  if (!tafRow.forecast) {
    tafRow.forecast = {};
  }
  if (!tafRow.input) tafRow.input = {};
  switch (colIndex) {
    case 1:
      tafRow.input.prob = value; break;
    case 2:
      tafRow.input.change = value; break;
    case 3:
      tafRow.input.valid = value; break;
    case 4:
      tafRow.input.wind = value; break;
    case 5:
      tafRow.input.visibility = value; break;
    case 6: case 7: case 8:
      tafRow.input['weather' + (colIndex - 6)] = value; break;
    case 9: case 10: case 11: case 12:
      tafRow.input['clouds' + (colIndex - 9)] = value; break;
  }
  return tafRow;
};

/*
  Removes input properties from baseforecast and changegroups
*/
export const removeInputPropsFromTafJSON = (_taf) => {
  let taf = cloneObjectAndSkipNullProps(_taf);
  if (taf) {
    if (taf.input) {
      delete taf.input;
    }
    if (taf.changegroups) {
      for (let j = 0; j < taf.changegroups.length; j++) {
        if (taf.changegroups[j].input) {
          delete taf.changegroups[j].input;
        }
      }
    }
  }
  return taf;
};

/*
  Updates TAFJSON objects from input properties, e.g. TAC Codes become TAFJSON objects.
  Input properties are kept, TAFJSON objects are updated.
  To post a valid TAFJSON to the server, input properties need to be removed from the TAFJSON;
   use removeInputPropsFromTafJSON afterwards.
*/
export const createTAFJSONFromInput = (inputTaf) => {
  if (!inputTaf.forecast) inputTaf.forecast = {};
  if (!inputTaf.metadata) inputTaf.metadata = {};
  if (!inputTaf.input) inputTaf.input = {};

  // console.log('createTAFJSONFromInput', JSON.stringify(inputTaf));
  let taf = {
    forecast:{},
    metadata:{
      status: 'concept',
      type: 'normal',
      location: inputTaf.metadata.location,
      validityStart: inputTaf.metadata.validityStart,
      validityEnd: inputTaf.metadata.validityEnd,
      issueTime: inputTaf.metadata.issueTime,
      uuid: inputTaf.metadata.uuid
    },
    changegroups:[],
    input:cloneObjectAndSkipNullProps(inputTaf.input)
  };

  taf.forecast.wind = fromTACToWind(taf.input.wind);
  taf.forecast.visibility = fromTACToVisibility(taf.input.visibility);
  taf.forecast.weather = getTACWeatherArray(taf);
  taf.forecast.clouds = getTACCloudsArray(taf);

  taf.forecast.caVOK = null;

  if (taf.forecast.visibility && taf.forecast.visibility.value === 'CAVOK') {
    taf.forecast.caVOK = true;
    taf.forecast.visibility = null;
    if (taf.forecast.weather === 'NSW') taf.forecast.weather = null;
    if (taf.forecast.clouds === 'NSC') taf.forecast.clouds = null;
  }

  // console.log('CAVOK=' + taf.forecast.caVOK);
  for (let j = 0; j < inputTaf.changegroups.length; j++) {
    if (!inputTaf.changegroups[j].forecast) inputTaf.changegroups[j].forecast = {};
    if (!inputTaf.changegroups[j].input) inputTaf.changegroups[j].input = {};
    taf.changegroups.push({ forecast: {}, input:cloneObjectAndSkipNullProps(inputTaf.changegroups[j].input) });
    // PROB and CHANGE are one string in json
    taf.changegroups[j].changeType =
      (taf.changegroups[j].input.prob ? taf.changegroups[j].input.prob : '') +
      (taf.changegroups[j].input.change && taf.changegroups[j].input.prob ? ' ' : '') +
      (taf.changegroups[j].input.change ? taf.changegroups[j].input.change : '');
    taf.changegroups[j].changeStart = fromTACToValid(taf.metadata.validityStart, taf.metadata.validityEnd, taf.changegroups[j].input.valid, 0);
    taf.changegroups[j].changeEnd = fromTACToValid(taf.metadata.validityStart, taf.metadata.validityEnd, taf.changegroups[j].input.valid, 5);
    taf.changegroups[j].forecast.wind = fromTACToWind(taf.changegroups[j].input.wind);
    taf.changegroups[j].forecast.visibility = fromTACToVisibility(taf.changegroups[j].input.visibility);
    taf.changegroups[j].forecast.weather = getTACWeatherArray(taf.changegroups[j]);
    taf.changegroups[j].forecast.clouds = getTACCloudsArray(taf.changegroups[j]);

    taf.changegroups[j].forecast.caVOK = null;
    if (taf.changegroups[j].forecast.visibility && taf.changegroups[j].forecast.visibility.value === 'CAVOK') {
      taf.changegroups[j].forecast.caVOK = true;
      taf.changegroups[j].forecast.visibility = null;
      if (taf.changegroups[j].forecast.weather === 'NSW') taf.changegroups[j].forecast.weather = null;
      if (taf.changegroups[j].forecast.clouds === 'NSC') taf.changegroups[j].forecast.clouds = null;
    }
  }
  let newTAF = cloneObjectAndSkipNullProps(taf);
  console.log('newTAFWithInput', newTAF);
  // console.log('newTAF', JSON.stringify(removeInputPropsFromTafJSON(newTAF)));
  return newTAF;
};
