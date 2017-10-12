import moment from 'moment';
import { descriptorMap, phenomenaMap } from './TafWeatherMaps';

/* ----- The following functions transform TAC Codes to TAF JSON codes */
const fromTACToWind = (value) => {
  if (value === null) return {};
  let obj = {
    direction: value.substring(0, 3) === 'VRB' ? 'VRB' : parseInt(value.substring(0, 3)),
    speed: parseInt(value.substring(3, 5)),
    gusts: value.indexOf('G') !== -1 ? parseInt(value.substring(6, 8)) : null,
    unit: 'KT'
  };
  return obj;
};

const fromTACToValidStart = (value) => {
  if (value && value.length > 3) {
    let issueTime = moment().utc().date(parseInt(value.substring(0, 2))).hour(parseInt(value.substring(2, 4))).format('YYYY-MM-DDTHH:00:00');
    return issueTime + 'Z';
  }
  return null;
};

const fromTACToValidEnd = (value) => {
  if (value && value.length > 8) {
    let issueTime = moment().utc().date(parseInt(value.substring(5, 7))).hour(parseInt(value.substring(7, 9))).format('YYYY-MM-DDTHH:00:00');
    return issueTime + 'Z';
  }
  return null;
};

const fromTACToVisibility = (value) => {
  if (value === null || value === undefined) {
    return null;
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
        value: parseInt(value.substring(0, 4)),
        unit: 'M'
      };
    }
  }
};

const fromTACToWeather = (_value) => {
  let value = _value;
  if (!value || value === 'NSW' || value === '') {
    return null;
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
  if (!value || value === 'NSC' || value === '') {
    return ret;
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

const removeAllNullProps = (_taf) => {
  let iterate = (obj, stack) => {
    for (var property in obj) {
      if (obj.hasOwnProperty(property)) {
        if (obj[property] === null) {
          delete obj[property];
        } else {
          if (typeof obj[property] === 'object') {
            iterate(obj[property], stack + '.' + property);
          } else {
            // console.log(stack + '->' + property + '   ' + obj[property]);
          }
        }
      }
    }
  };
  iterate(_taf, '');
  return _taf;
};

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

export const createTAFJSONFromInput = (_taf) => {
  let taf = Object.assign({}, _taf);
  if (!taf.forecast) taf.forecast = {};
  if (!taf.metadata) taf.metadata = {};

  taf.metadata.status = 'concept';
  taf.metadata.type = 'normal';

  taf.forecast.wind = fromTACToWind(taf.input.wind);
  taf.forecast.visibility = fromTACToVisibility(taf.input.visibility);
  taf.forecast.weather = getTACWeatherArray(taf);
  taf.forecast.clouds = getTACCloudsArray(taf);

  if (!taf.forecast.visibility && taf.forecast.weather === 'NSW' && taf.forecast.clouds === 'NSC') {
    taf.forecast.weather = null;
    taf.forecast.clouds = null;
    taf.forecast.caVOK = true;
  }

  delete taf.input;
  for (let j = 0; j < taf.changegroups.length; j++) {
    if (!taf.changegroups[j].forecast) taf.changegroups[j].forecast = {};
    // PROB and CHANGE are one string in json
    taf.changegroups[j].changeType =
      (taf.changegroups[j].input.prob ? taf.changegroups[j].input.prob : '') +
      (taf.changegroups[j].input.change && taf.changegroups[j].input.prob ? ' ' : '') +
      (taf.changegroups[j].input.change ? taf.changegroups[j].input.change : '');
    taf.changegroups[j].changeStart = fromTACToValidStart(taf.changegroups[j].input.valid);
    taf.changegroups[j].changeEnd = fromTACToValidEnd(taf.changegroups[j].input.valid);
    taf.changegroups[j].forecast.wind = fromTACToWind(taf.changegroups[j].input.wind);
    taf.changegroups[j].forecast.visibility = fromTACToVisibility(taf.changegroups[j].input.visibility);
    taf.changegroups[j].forecast.weather = getTACWeatherArray(taf.changegroups[j]);
    taf.changegroups[j].forecast.clouds = getTACCloudsArray(taf.changegroups[j]);

    if (!taf.changegroups[j].visibility && taf.changegroups[j].weather === 'NSW' && taf.changegroups[j].clouds === 'NSC') {
      taf.changegroups[j].weather = null;
      taf.changegroups[j].clouds = null;
      taf.changegroups[j].caVOK = true;
    }

    delete taf.changegroups[j].input;
  }
  return removeAllNullProps(taf);
};
