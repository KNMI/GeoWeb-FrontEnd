import { jsonToTacForTimestamp, jsonToTacForPeriod, jsonToTacForWind, jsonToTacForCavok, jsonToTacForVerticalVisibility,
  jsonToTacForVisibility, jsonToTacForWeather, jsonToTacForClouds,
  tacToJsonForPeriod, tacToJsonForTimestamp, tacToJsonForWind, tacToJsonForCavok, tacToJsonForVerticalVisibility,
  tacToJsonForVisibility, tacToJsonForWeather, tacToJsonForClouds,
  jsonToTacForProbability, jsonToTacForChangeType, tacToJsonForProbabilityAndChangeType, tacToJsonForProbability, tacToJsonForChangeType } from './TafFieldsConverter';

describe('(Functions) TafFieldsConverter', () => {
  /**
   * JSON to TAC
   */
  it('Converts probability data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForProbability('PROB30');
    expect(result).to.eql('PROB30');
    result = jsonToTacForProbability('PROB40');
    expect(result).to.eql('PROB40');
    // lowercase input
    result = jsonToTacForProbability('prob30');
    expect(result).to.eql('PROB30');
    // non sense input
    result = jsonToTacForProbability('blah');
    expect(result).to.eql(null);
  });

  it('Converts changeType data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForChangeType('BECMG');
    expect(result).to.eql('BECMG');
    result = jsonToTacForChangeType('FM');
    expect(result).to.eql('FM');
    // lowercase input
    result = jsonToTacForChangeType('tempo');
    expect(result).to.eql('TEMPO');
    // non sense input
    result = jsonToTacForChangeType('blah');
    expect(result).to.eql(null);
  });

  it('Converts timestamp data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForTimestamp('2017-11-21T13:11:43Z');
    expect(result).to.eql('2113');
    // Nonsense input
    result = jsonToTacForTimestamp('Blah');
    expect(result).to.eql(null);
  });

  it('Converts period data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForPeriod('2017-11-21T13:11:43Z', '2017-11-22T17:11:43Z');
    expect(result).to.eql('2113/2217');
    // Invalid start
    result = jsonToTacForPeriod('Blah', '2017-11-22T17:11:43Z');
    expect(result).to.eql(null);
    // Invalid end
    result = jsonToTacForPeriod('2017-11-22T17:11:43Z', 'Blah');
    expect(result).to.eql('2217');
  });

  it('Converts wind data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForWind({
      direction: 200,
      speed: 15,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('20015G25');
    // No gusts
    result = jsonToTacForWind({
      direction: 230,
      speed: 10,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('23010');
    // Variable direction
    result = jsonToTacForWind({
      direction: 'VRB',
      speed: 12,
      speedOperator: null,
      gusts: 10,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('VRB12G10');
    // Overflow speed
    result = jsonToTacForWind({
      direction: 230,
      speed: 99,
      speedOperator: 'above',
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('230P99');
    // 'Override' default unit
    result = jsonToTacForWind({
      direction: 235,
      speed: 15,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('23515');
    // Override default unit
    result = jsonToTacForWind({
      direction: 235,
      speed: 15,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'MPS'
    });
    expect(result).to.eql('23515MPS');
    // Direction with one prefix zero
    result = jsonToTacForWind({
      direction: 10,
      speed: 15,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('01015G25');
    // Direction with two prefix zeros
    result = jsonToTacForWind({
      direction: 4,
      speed: 15,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('00415G25');
    // speed with one prefix zero
    result = jsonToTacForWind({
      direction: 100,
      speed: 5,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('10005G25');
    // speed with one prefix zero
    result = jsonToTacForWind({
      direction: 100,
      speed: 15,
      speedOperator: null,
      gusts: 5,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql('10015G05');
    // invalid direction
    result = jsonToTacForWind({
      direction: 'test',
      speed: 15,
      speedOperator: null,
      gusts: 5,
      gustsOperator: null,
      unit: 'KT'
    });
    expect(result).to.eql(null);
  });

  it('Converts visibility data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForVisibility({
      value: 9999,
      unit: 'M'
    });
    expect(result).to.eql('9999');
    // value with one prefix zero
    result = jsonToTacForVisibility({
      value: 100,
      unit: 'M'
    });
    expect(result).to.eql('0100');
    // value with two prefix zeros
    result = jsonToTacForVisibility({
      value: 20,
      unit: 'M'
    });
    expect(result).to.eql('0020');
    // value with three prefix zeros
    result = jsonToTacForVisibility({
      value: 3,
      unit: 'M'
    });
    expect(result).to.eql('0003');
    // other unit
    result = jsonToTacForVisibility({
      value: 2000,
      unit: 'KM'
    });
    expect(result).to.eql('2000KM');
    // missing unit
    result = jsonToTacForVisibility({
      value: 2000
    });
    expect(result).to.eql(null);
  });

  it('Converts weather data from JSON to TAC', () => {
    // NSW
    let result = jsonToTacForWeather('NSW');
    expect(result).to.eql('NSW');
    // Full
    result = jsonToTacForWeather({
      qualifier: 'moderate',
      descriptor: 'showers',
      phenomena: [
        'rain'
      ]
    });
    expect(result).to.eql('SHRA');
    // Full
    result = jsonToTacForWeather({
      qualifier: 'heavy',
      descriptor: 'thunderstorm',
      phenomena: [
        'snow'
      ]
    });
    expect(result).to.eql('+TSSN');
    // Full
    result = jsonToTacForWeather({
      qualifier: 'light',
      descriptor: 'freezing',
      phenomena: [
        'drizzle'
      ]
    });
    expect(result).to.eql('-FZDZ');
    // Full
    result = jsonToTacForWeather({
      qualifier: 'light',
      descriptor: 'freezing',
      phenomena: [
        'drizzle', 'fog'
      ]
    });
    expect(result).to.eql('-FZDZFG');
    // Descriptor only
    result = jsonToTacForWeather({
      qualifier: 'moderate',
      descriptor: 'thunderstorm',
      phenomena: []
    });
    expect(result).to.eql('TS');
    // One phenomenon only
    result = jsonToTacForWeather({
      qualifier: 'moderate',
      descriptor: null,
      phenomena: [ 'snow' ]
    });
    expect(result).to.eql('SN');
  });

  it('Converts CAVOK data from JSON to TAC', () => {
    let result = jsonToTacForCavok(true);
    expect(result).to.eql('CAVOK');
    result = jsonToTacForCavok(false);
    expect(result).to.eql(null);
    result = jsonToTacForCavok('blah');
    expect(result).to.eql(null);
    result = jsonToTacForCavok(2);
    expect(result).to.eql(null);
    result = jsonToTacForCavok(null);
    expect(result).to.eql(null);
  });

  it('Converts Vertical Visibility data from JSON to TAC', () => {
    // Full
    let result = jsonToTacForVerticalVisibility(123);
    expect(result).to.eql('VV123');
    // One prefix zero
    result = jsonToTacForVerticalVisibility(45);
    expect(result).to.eql('VV045');
    // Two prefix zeros
    result = jsonToTacForVerticalVisibility(6);
    expect(result).to.eql('VV006');
    // null value
    result = jsonToTacForVerticalVisibility(null);
    expect(result).to.eql(null);
    result = jsonToTacForVerticalVisibility('blah');
    expect(result).to.eql(null);
  });

  it('Converts clouds data from JSON to TAC', () => {
    // NSW
    let result = jsonToTacForClouds('NSC');
    expect(result).to.eql('NSC');
    // Full
    result = jsonToTacForClouds({
      amount: 'FEW',
      height: 100,
      mod: 'TCU'
    });
    expect(result).to.eql('FEW100TCU');
    // Height with one prefix zero
    result = jsonToTacForClouds({
      amount: 'BKN',
      height: 90,
      mod: 'CB'
    });
    expect(result).to.eql('BKN090CB');
    // Height with two prefix zeros
    result = jsonToTacForClouds({
      amount: 'OVC',
      height: 5,
      mod: 'CB'
    });
    expect(result).to.eql('OVC005CB');
    // Missing modifier
    result = jsonToTacForClouds({
      amount: 'SCT',
      height: 30,
      mod: null
    });
    expect(result).to.eql('SCT030');
    // Missing height
    result = jsonToTacForClouds({
      amount: 'SCT',
      height: null,
      mod: 'CB'
    });
    expect(result).to.eql(null);
    // Missing amount
    result = jsonToTacForClouds({
      amount: null,
      height: 60,
      mod: 'CB'
    });
    expect(result).to.eql(null);
    // Mod only
    result = jsonToTacForClouds({
      amount: null,
      height: null,
      mod: 'CB'
    });
    expect(result).to.eql('CB');
  });

  /**
   * TAC to JSON
   */
  it('Converts probability data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForProbability('PROB30');
    expect(result).to.eql('PROB30');
    result = tacToJsonForProbability('PROB40');
    expect(result).to.eql('PROB40');
    // lowercase input
    result = tacToJsonForProbability('prob30');
    expect(result).to.eql('PROB30');
    // non sense input
    result = tacToJsonForProbability('blah');
    expect(result).to.eql(null);
  });

  it('Converts changeType data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForChangeType('BECMG');
    expect(result).to.eql('BECMG');
    result = tacToJsonForChangeType('FM');
    expect(result).to.eql('FM');
    // lowercase input
    result = tacToJsonForChangeType('tempo');
    expect(result).to.eql('TEMPO');
    // non sense input
    result = tacToJsonForChangeType('blah');
    expect(result).to.eql(null);
  });

  it('Converts probability and changeType data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForProbabilityAndChangeType('PROB30', 'TEMPO');
    expect(result).to.eql('PROB30 TEMPO');
    // Only probability
    result = tacToJsonForProbabilityAndChangeType('PROB40', '');
    expect(result).to.eql('PROB40');
    // Only changeType
    result = tacToJsonForProbabilityAndChangeType(null, 'FM');
    expect(result).to.eql('FM');
    // non sense input
    result = tacToJsonForProbabilityAndChangeType('blah', null);
    expect(result).to.eql(null);
  });

  it('Converts timestamp data from TAC to JSON', () => {
    // Simple
    let result = tacToJsonForTimestamp('2114', '2017-11-21T12:00:00Z', '2017-11-22T18:00:00Z');
    expect(result).to.eql('2017-11-21T14:00:00Z');
    // Month boundary
    result = tacToJsonForTimestamp('0116', '2017-10-31T12:00:00Z', '2017-11-01T18:00:00Z');
    expect(result).to.eql('2017-11-01T16:00:00Z');
    // Year boundary
    result = tacToJsonForTimestamp('0113', '2017-12-31T18:00:00Z', '2018-01-02T00:00:00Z');
    expect(result).to.eql('2018-01-01T13:00:00Z');
    // Invalid hours
    result = tacToJsonForTimestamp('2126', '2017-11-21T12:00:00Z', '2017-11-22T18:00:00Z');
    expect(result).to.eql(null);
    // Empty
    result = tacToJsonForTimestamp('', '2017-10-31T12:00:00Z', '2017-11-01T18:00:00Z');
    expect(result).to.eql(null);
  });

  it('Converts period data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForPeriod('2113/2217', '2017-11-21T13:11:43Z', '2017-11-22T17:11:43Z');
    expect(result).to.eql({
      start: '2017-11-21T13:00:00Z',
      end: '2017-11-22T17:00:00Z'
    });
    // Invalid period
    result = tacToJsonForPeriod('Blah', '2017-11-21T13:11:43Z', '2017-11-22T17:11:43Z');
    expect(result).to.eql({
      start: null,
      end: null
    });
    // Invalid start
    result = tacToJsonForPeriod('2113/2217', 'Blah', '2017-11-22T17:11:43Z');
    expect(result).to.eql({
      start: null,
      end: null
    });
    // Invalid start
    result = tacToJsonForPeriod('2113/2217', '2017-11-21T13:11:43Z', 'Blah');
    expect(result).to.eql({
      start: null,
      end: null
    });
    // Empty
    result = tacToJsonForPeriod('', '2017-11-21T13:11:43Z', '2017-11-22T17:11:43Z');
    expect(result).to.eql({
      start: null,
      end: null
    });
  });

  it('Converts wind data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForWind('20015G25');
    expect(result).to.eql({
      direction: 200,
      speed: 15,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    // No gusts
    result = tacToJsonForWind('23010');
    expect(result).to.eql({
      direction: 230,
      speed: 10,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    // Variable direction
    result = tacToJsonForWind('VRB12G10');
    expect(result).to.eql({
      direction: 'VRB',
      speed: 12,
      speedOperator: null,
      gusts: 10,
      gustsOperator: null,
      unit: 'KT'
    });
    // Variable direction, lowercase
    result = tacToJsonForWind('vrb12g10');
    expect(result).to.eql({
      direction: 'VRB',
      speed: 12,
      speedOperator: null,
      gusts: 10,
      gustsOperator: null,
      unit: 'KT'
    });
    // Overflow speed
    result = tacToJsonForWind('230P99');
    expect(result).to.eql({
      direction: 230,
      speed: 99,
      speedOperator: 'above',
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    // Overflow speed, lowercase
    result = tacToJsonForWind('230p49');
    expect(result).to.eql({
      direction: 230,
      speed: 49,
      speedOperator: 'above',
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    // 'Override' default unit
    result = tacToJsonForWind('23515KT');
    expect(result).to.eql({
      direction: 235,
      speed: 15,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'KT'
    });
    // Override default unit
    result = tacToJsonForWind('23515MPS');
    expect(result).to.eql({
      direction: 235,
      speed: 15,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'MPS'
    });
    // Override default unit, lowercase
    result = tacToJsonForWind('23515mps');
    expect(result).to.eql({
      direction: 235,
      speed: 15,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: 'MPS'
    });
    // Direction with one prefix zero
    result = tacToJsonForWind('01015G25');
    expect(result).to.eql({
      direction: 10,
      speed: 15,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    // Direction with two prefix zeros
    result = tacToJsonForWind('00415G25');
    expect(result).to.eql({
      direction: 4,
      speed: 15,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    // speed with one prefix zero
    result = tacToJsonForWind('10005G25');
    expect(result).to.eql({
      direction: 100,
      speed: 5,
      speedOperator: null,
      gusts: 25,
      gustsOperator: null,
      unit: 'KT'
    });
    // speed with one prefix zero
    result = tacToJsonForWind('10015G05');
    expect(result).to.eql({
      direction: 100,
      speed: 15,
      speedOperator: null,
      gusts: 5,
      gustsOperator: null,
      unit: 'KT'
    });
    // invalid direction
    result = tacToJsonForWind('TST15G05');
    expect(result).to.eql({
      direction: null,
      speed: null,
      speedOperator: null,
      gusts: null,
      gustsOperator: null,
      unit: null
    });
  });

  it('Converts visibility data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForVisibility('9999');
    expect(result).to.eql({
      value: 9999,
      unit: 'M'
    });
    // value with one prefix zero
    result = tacToJsonForVisibility('0100');
    expect(result).to.eql({
      value: 100,
      unit: 'M'
    });
    // value with two prefix zeros
    result = tacToJsonForVisibility('0020');
    expect(result).to.eql({
      value: 20,
      unit: 'M'
    });
    // value with three prefix zeros
    result = tacToJsonForVisibility('0003');
    expect(result).to.eql({
      value: 3,
      unit: 'M'
    });
    // invalid value
    result = tacToJsonForVisibility('TST');
    expect(result).to.eql({
      value: null,
      unit: null
    });
    // other unit
    result = tacToJsonForVisibility('2000KM');
    expect(result).to.eql({
      value: 2000,
      unit: 'KM'
    });
  });

  it('Converts CAVOK data from TAC to JSON', () => {
    let result = tacToJsonForCavok('CAVOK');
    expect(result).to.eql(true);
    result = tacToJsonForCavok('cavok');
    expect(result).to.eql(true);
    result = tacToJsonForCavok('');
    expect(result).to.eql(false);
    result = tacToJsonForCavok('blah');
    expect(result).to.eql(false);
    result = tacToJsonForCavok(3);
    expect(result).to.eql(false);
    result = tacToJsonForCavok(null);
    expect(result).to.eql(false);
  });

  it('Converts Vertical Visibility data from TAC to JSON', () => {
    // Full
    let result = tacToJsonForVerticalVisibility('VV123');
    expect(result).to.eql(123);
    // Full, lowercase
    result = tacToJsonForVerticalVisibility('vv123');
    expect(result).to.eql(123);
    // One prefix zero
    result = tacToJsonForVerticalVisibility('VV045');
    expect(result).to.eql(45);
    // Two prefix zeros
    result = tacToJsonForVerticalVisibility('VV006');
    expect(result).to.eql(6);
    // null value
    result = tacToJsonForVerticalVisibility(null);
    expect(result).to.eql(null);
    result = tacToJsonForVerticalVisibility('blah');
    expect(result).to.eql(null);
    result = tacToJsonForVerticalVisibility('VV3');
    expect(result).to.eql(null);
  });

  it('Converts weather data from TAC to JSON', () => {
    // NSW
    let result = tacToJsonForWeather('NSW');
    expect(result).to.eql('NSW');
    // NSW, lowercase
    result = tacToJsonForWeather('nsw');
    expect(result).to.eql('NSW');
    // Full
    result = tacToJsonForWeather('SHRA');
    expect(result).to.eql({
      qualifier: 'moderate',
      descriptor: 'showers',
      phenomena: [
        'rain'
      ]
    });
    // Full
    result = tacToJsonForWeather('+TSSN');
    expect(result).to.eql({
      qualifier: 'heavy',
      descriptor: 'thunderstorm',
      phenomena: [
        'snow'
      ]
    });
    // Full
    result = tacToJsonForWeather('-FZDZ');
    expect(result).to.eql({
      qualifier: 'light',
      descriptor: 'freezing',
      phenomena: [
        'drizzle'
      ]
    });
    // Full
    result = tacToJsonForWeather('-FZDZFG');
    expect(result).to.eql({
      qualifier: 'light',
      descriptor: 'freezing',
      phenomena: [
        'drizzle', 'fog'
      ]
    });
    // Full, lowercase
    result = tacToJsonForWeather('-fzdzfg');
    expect(result).to.eql({
      qualifier: 'light',
      descriptor: 'freezing',
      phenomena: [
        'drizzle', 'fog'
      ]
    });
    // Descriptor only
    result = tacToJsonForWeather('TS');
    expect(result).to.eql({
      qualifier: 'moderate',
      descriptor: 'thunderstorm',
      phenomena: []
    });
    // One phenomenon only
    result = tacToJsonForWeather('SN');
    expect(result).to.eql({
      qualifier: 'moderate',
      descriptor: null,
      phenomena: [ 'snow' ]
    });
  });

  it('Converts clouds data from TAC to JSON', () => {
    // NSW
    let result = tacToJsonForClouds('NSC');
    expect(result).to.eql('NSC');
    // Full
    result = tacToJsonForClouds('FEW100TCU');
    expect(result).to.eql({
      amount: 'FEW',
      height: 100,
      mod: 'TCU'
    });
    // Full, lowercase
    result = tacToJsonForClouds('few100tcu');
    expect(result).to.eql({
      amount: 'FEW',
      height: 100,
      mod: 'TCU'
    });
    // Height with one prefix zero
    result = tacToJsonForClouds('BKN090CB');
    expect(result).to.eql({
      amount: 'BKN',
      height: 90,
      mod: 'CB'
    });
    // Height with two prefix zeros
    result = tacToJsonForClouds('OVC005CB');
    expect(result).to.eql({
      amount: 'OVC',
      height: 5,
      mod: 'CB'
    });
    // Missing modifier
    result = tacToJsonForClouds('SCT030');
    expect(result).to.eql({
      amount: 'SCT',
      height: 30,
      mod: null
    });
    // Missing height
    result = tacToJsonForClouds('SCTCB');
    expect(result).to.eql({
      amount: null,
      height: null,
      mod: null
    });
    // Missing amount
    result = tacToJsonForClouds('060CB');
    expect(result).to.eql({
      amount: null,
      height: null,
      mod: null
    });
    // Mod only
    result = tacToJsonForClouds('CB');
    expect(result).to.eql({
      amount: null,
      height: null,
      mod: 'CB'
    });
    // Empty
    result = tacToJsonForClouds('');
    expect(result).to.eql({
      amount: null,
      height: null,
      mod: null
    });
  });
});
