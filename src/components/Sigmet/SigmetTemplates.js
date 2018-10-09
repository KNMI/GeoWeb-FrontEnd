import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

/**
 * TEMPLATES
 */
const TEMPLATES = {
  OBS_OR_FORECAST: {
    obs: true, // boolean
    obsFcTime: null // string
  },
  FEATURE: {
    type: 'Feature',
    id: null, // string
    properties: {
      selectionType: null, // string
      featureFunction: null, // string
      relatesTo: null, // string
      stroke: null, // string
      'stroke-width': null, // number
      'stroke-opacity': null, // number
      fill: null, // string
      'fill-opacity': null // number
    },
    geometry: {
      type: null, // string
      coordinates: [[[null]]] // array (polygons) of array (lines) of array (coordinates) of number values
    }
  },
  LEVEL: {
    value: null, // number
    unit: null // string
  },
  MOVEMENT: {
    dir: null, // string
    speed: null // number
  },
  VOLCANO: {
    name: null, // string
    position: [null] // number values, [lat, lon]
  },
  MOVE_TO: [null], // string values, one or more adjacent_firs identifiers, only applicable for Cancel-SIGMET
  TROPICAL_CYCLONE: {
    name: null // string
  }
};

TEMPLATES.GEOJSON = {
  type: 'FeatureCollection', // string
  features: [cloneDeep(TEMPLATES.FEATURE)]
};
TEMPLATES.LEVELINFO = {
  mode: null, // string, one of AT, ABV, BETW, BETW_SFC, TOPS, TOPS_ABV, TOPS_BLW
  levels: [cloneDeep(TEMPLATES.LEVEL)]
};
TEMPLATES.VA_EXTRA_FIELDS = {
  volcano: cloneDeep(TEMPLATES.VOLCANO),
  no_va_expected: false,
  move_to: cloneDeep(TEMPLATES.MOVE_TO)
};
TEMPLATES.TC_EXTRA_FIELDS = {
  tropical_cyclone: cloneDeep(TEMPLATES.TROPICAL_CYCLONE)
};
TEMPLATES.SIGMET = {
  /* What */
  phenomenon: null, // string
  obs_or_forecast: cloneDeep(TEMPLATES.OBS_OR_FORECAST),
  va_extra_fields: cloneDeep(TEMPLATES.VA_EXTRA_FIELDS),
  tc_extra_fields: cloneDeep(TEMPLATES.TC_EXTRA_FIELDS),
  /* Where */
  geojson: cloneDeep(TEMPLATES.GEOJSON),
  levelinfo: cloneDeep(TEMPLATES.LEVELINFO),
  firname: null, // string
  /* When */
  validdate: null, // string
  validdate_end: null, // string
  /* Development */
  change: null, // string
  movement_type: null, // string
  movement: cloneDeep(TEMPLATES.MOVEMENT),
  forecast_position_time: null, // string
  /* Identification */
  issuedate: null, // string
  uuid: null, // string
  sequence: null, // number
  status: null, // string
  cancels: null, // number
  /* Metadata */
  location_indicator_icao: null, // string
  location_indicator_mwo: null // string
};

/**
 * TYPES
 */
const TYPES = {
  PHENOMENON: PropTypes.string,
  OBS_OR_FORECAST: PropTypes.shape({
    obs: PropTypes.bool,
    obsFcTime: PropTypes.string
  }),
  VA_EXTRA_FIELDS: PropTypes.shape({
    volcano: PropTypes.shape({
      name: PropTypes.string,
      position: PropTypes.arrayOf(PropTypes.number)
    }),
    no_va_expected: PropTypes.bool,
    move_to: PropTypes.arrayOf(PropTypes.string)
  }),
  TC_EXTRA_FIELDS: PropTypes.shape({
    tropical_cyclone: PropTypes.shape({
      name: PropTypes.string
    })
  }),
  FEATURE: PropTypes.shape({
    type: PropTypes.string,
    id: PropTypes.string,
    properties: PropTypes.shape({
      type: PropTypes.string,
      selectionType: PropTypes.string,
      featureFunction: PropTypes.string,
      relatesTo: PropTypes.string,
      stroke: PropTypes.string,
      'stroke-width': PropTypes.number,
      'stroke-opacity': PropTypes.number,
      fill: PropTypes.string,
      'fill-opacity': PropTypes.number
    }),
    geometry: PropTypes.shape({
      type: PropTypes.string,
      coordinates: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)))
    })
  }),
  LEVEL: PropTypes.shape({
    value: PropTypes.number,
    unit: PropTypes.string
  }),
  FIR_NAME: PropTypes.string,
  VALID_DATE: PropTypes.string,
  VALID_DATE_END: PropTypes.string,
  CHANGE: PropTypes.string,
  MOVEMENT_TYPE: PropTypes.string,
  MOVEMENT: PropTypes.shape({
    dir: PropTypes.string,
    speed: PropTypes.number
  }),
  FORECAST_POSITION_TIME: PropTypes.string,
  ISSUE_DATE: PropTypes.string,
  UUID: PropTypes.string,
  SEQUENCE: PropTypes.number,
  STATUS: PropTypes.string,
  CANCELS: PropTypes.number,
  LOCATION_INDICATOR_ICAO: PropTypes.string,
  LOCATION_INDICATOR_MWO: PropTypes.string
};
TYPES.GEOJSON = PropTypes.shape({
  type: PropTypes.string,
  features: PropTypes.arrayOf(TYPES.FEATURE)
});
TYPES.LEVELINFO = PropTypes.shape({
  mode: PropTypes.string,
  levels: PropTypes.arrayOf(TYPES.LEVEL)
});

/**
 * MISC
 */
// Movement types
const MOVEMENT_TYPES = {
  STATIONARY: 'STATIONARY',
  MOVEMENT: 'MOVEMENT',
  FORECAST_POSITION: 'FORECAST_POSITION'
};

const MOVEMENT_OPTIONS = [
  { optionId: MOVEMENT_TYPES.STATIONARY, label: 'Stationary', disabled: false },
  { optionId: MOVEMENT_TYPES.MOVEMENT, label: 'Movement', disabled: false },
  { optionId: MOVEMENT_TYPES.FORECAST_POSITION, label: 'End position', disabled: false }
];

// Cardinal, intercardinal and named points for directions of wind
const DIRECTIONS = [
  { shortName: 'N', longName: 'North' },
  { shortName: 'NNE', longName: 'North-Northeast' },
  { shortName: 'NE', longName: 'Northeast' },
  { shortName: 'ENE', longName: 'East-Northeast' },
  { shortName: 'E', longName: 'East' },
  { shortName: 'ESE', longName: 'East-Southeast' },
  { shortName: 'SE', longName: 'Southeast' },
  { shortName: 'SSE', longName: 'South-Southeast' },
  { shortName: 'S', longName: 'South' },
  { shortName: 'SSW', longName: 'South-Southwest' },
  { shortName: 'SW', longName: 'Southwest' },
  { shortName: 'WSW', longName: 'West-Southwest' },
  { shortName: 'W', longName: 'West' },
  { shortName: 'WNW', longName: 'West-Northwest' },
  { shortName: 'NW', longName: 'Northwest' },
  { shortName: 'NNW', longName: 'North-Northwest' }
];

// Change types
const CHANGES = [
  { shortName: 'WKN', longName: 'Weakening' },
  { shortName: 'NC', longName: 'No change' },
  { shortName: 'INTSF', longName: 'Intensifying' }
];

const UNITS = {
  FL: 'FL',
  FT: 'FT',
  M: 'M'
};

// Units for altitude
const UNITS_ALT = [
  { unit: UNITS.FL, label: 'FL' },
  { unit: UNITS.FT, label: 'ft' },
  { unit: UNITS.M, label: 'm' }
];

// Modes for levels
const MODES_LVL = {
  AT: 'AT',
  ABV: 'ABV',
  BETW: 'BETW',
  BETW_SFC: 'BETW_SFC',
  TOPS: 'TOPS',
  TOPS_ABV: 'TOPS_ABV',
  TOPS_BLW: 'TOPS_BLW'
};

const MODES_LVL_OPTIONS = [
  { optionId: MODES_LVL.AT, label: 'At', disabled: false },
  { optionId: MODES_LVL.BETW, label: 'Between', disabled: false },
  { optionId: MODES_LVL.ABV, label: 'Above', disabled: false }
];

const DATE_LABEL_FORMAT = 'DD MMM YYYY';
const HOUR_LABEL_FORMAT = 'HH';
const MINUTE_LABEL_FORMAT = 'mm';
const UTC_LABEL_FORMAT = 'UTC';
const MINUTE_LABEL_FORMAT_UTC = `${MINUTE_LABEL_FORMAT} [${UTC_LABEL_FORMAT}]`;
const TIME_LABEL_FORMAT = `${HOUR_LABEL_FORMAT}:${MINUTE_LABEL_FORMAT}`;
const TIME_LABEL_FORMAT_UTC = `${HOUR_LABEL_FORMAT}:${MINUTE_LABEL_FORMAT_UTC}`;
const DATETIME_LABEL_FORMAT = `${DATE_LABEL_FORMAT} ${TIME_LABEL_FORMAT}`;
const DATETIME_LABEL_FORMAT_UTC = `${DATE_LABEL_FORMAT} ${TIME_LABEL_FORMAT_UTC}`;
const DATETIME_START_FORMAT = `${DATE_LABEL_FORMAT}, ${TIME_LABEL_FORMAT}`;
const DATETIME_FORMAT = 'YYYY-MM-DD[T]HH:mm:ss[Z]';
const CALENDAR_FORMAT = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: '[Next] dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: `${DATE_LABEL_FORMAT}`
};

const SIGMET_VARIANTS = {
  NORMAL: 'NORMAL',
  VOLCANIC_ASH: 'VOLCANIC_ASH',
  TROPICAL_CYCLONE: 'TROPICAL_CYCLONE'
};

const SIGMET_VARIANTS_PREFIXES = {};
SIGMET_VARIANTS_PREFIXES[SIGMET_VARIANTS.NORMAL] = '';
SIGMET_VARIANTS_PREFIXES[SIGMET_VARIANTS.VOLCANIC_ASH] = 'va_';
SIGMET_VARIANTS_PREFIXES[SIGMET_VARIANTS.TROPICAL_CYCLONE] = 'tc_';

module.exports = {
  SIGMET_TEMPLATES: TEMPLATES,
  SIGMET_TYPES: TYPES,
  MOVEMENT_TYPES: MOVEMENT_TYPES,
  MOVEMENT_OPTIONS: MOVEMENT_OPTIONS,
  DIRECTIONS: DIRECTIONS,
  CHANGES: CHANGES,
  UNITS_ALT: UNITS_ALT,
  UNITS: UNITS,
  MODES_LVL: MODES_LVL,
  MODES_LVL_OPTIONS: MODES_LVL_OPTIONS,
  DATE_LABEL_FORMAT: DATE_LABEL_FORMAT,
  HOUR_LABEL_FORMAT: HOUR_LABEL_FORMAT,
  MINUTE_LABEL_FORMAT: MINUTE_LABEL_FORMAT,
  MINUTE_LABEL_FORMAT_UTC: MINUTE_LABEL_FORMAT_UTC,
  TIME_LABEL_FORMAT: TIME_LABEL_FORMAT,
  TIME_LABEL_FORMAT_UTC: TIME_LABEL_FORMAT_UTC,
  DATETIME_LABEL_FORMAT: DATETIME_LABEL_FORMAT,
  DATETIME_LABEL_FORMAT_UTC: DATETIME_LABEL_FORMAT_UTC,
  DATETIME_START_FORMAT: DATETIME_START_FORMAT,
  DATETIME_FORMAT: DATETIME_FORMAT,
  CALENDAR_FORMAT: CALENDAR_FORMAT,
  SIGMET_VARIANTS_PREFIXES: SIGMET_VARIANTS_PREFIXES
};
