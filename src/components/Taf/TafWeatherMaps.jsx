/**
 * Maps to construct TAC from JSON Weather and vice versa.
 */

export const qualifierMap = {
  light:'-',
  moderate:'',
  heavy:'+',
  vicinity:'VC'
};

const qualifierInverse = {};
Object.entries(qualifierMap).forEach(entry => { qualifierInverse[entry[1]] = entry[0]; });
export const qualifierInverseMap = qualifierInverse;

export const descriptorMap = {
  shallow: 'MI',
  patches: 'BC',
  partial: 'PR',
  'low drifting': 'DR',
  blowing: 'BL',
  showers: 'SH',
  thunderstorm: 'TS',
  freezing: 'FZ'
};

const descriptorInverse = {};
Object.entries(descriptorMap).forEach(entry => { descriptorInverse[entry[1]] = entry[0]; });
export const descriptorInverseMap = descriptorInverse;

export const phenomenaMap = {
  'drizzle': 'DZ',
  'rain': 'RA',
  'snow': 'SN',
  'snow grains': 'SG',
  'ice pellets': 'PL',
  'hail': 'GR',
  'small hail': 'GS',
  'unknown precipitation': 'UP',
  'mist': 'BR',
  'fog': 'FG',
  'smoke': 'FU',
  'volcanic ash': 'VA',
  'widespread dust': 'DU',
  'sand': 'SA',
  'haze': 'HZ',
  'dust': 'PO',
  'squalls': 'SQ',
  'funnel clouds': 'FC',
  'sandstorm': 'SS',
  'duststorm': 'DS'
};

const phenomenaInverse = {};
Object.entries(phenomenaMap).forEach(entry => { phenomenaInverse[entry[1]] = entry[0]; });
export const phenomenaInverseMap = phenomenaInverse;
