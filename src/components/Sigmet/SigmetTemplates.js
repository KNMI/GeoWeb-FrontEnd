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
    properties: {
      type: null, // string
      stroke: null, // string
      'stroke-width': null, // number
      'stroke-opacity': null, // number
      fill: null, // string
      'fill-opacity': null // number
    },
    geometry: {
      type: null, // string
      coordinates: [[[]]] // number values
    }
  },
  LEVEL: {
    value: null, // number
    unit: null // string
  },
  MOVEMENT: {
    stationary: true,
    dir: null, // string
    speed: null // number
  }
};

TEMPLATES.GEOJSON = {
  type: 'FeatureCollection', // string
  features: [cloneDeep(TEMPLATES.FEATURE)]
};
TEMPLATES.LEVELS = {
  lev1: cloneDeep(TEMPLATES.LEVEL),
  lev2: cloneDeep(TEMPLATES.LEVEL)
};
TEMPLATES.SIGMET = {
  /* What */
  phenomenon: null, // string
  obs_or_forecast: cloneDeep(TEMPLATES.OBS_OR_FORECAST),
  /* Where */
  geojson: cloneDeep(TEMPLATES.GEOJSON),
  level: cloneDeep(TEMPLATES.LEVELS),
  firname: null, // string
  /* When */
  validdate: null, // string
  validdate_end: null, // string
  /* Development */
  change: null, // string
  movement: cloneDeep(TEMPLATES.MOVEMENT),
  forecast_position_time: null, // string
  /* Identification */
  issuedate: null, // string
  uuid: null, // string
  sequence: null, // number
  status: null, // string
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
  FEATURE: PropTypes.shape({
    type: PropTypes.string,
    properties: PropTypes.shape({
      type: PropTypes.string,
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
  MOVEMENT: PropTypes.shape({
    stationary: PropTypes.bool,
    dir: PropTypes.string,
    speed: PropTypes.number
  }),
  FORECAST_POSITION_TIME: PropTypes.string,
  ISSUE_DATE: PropTypes.string,
  UUID: PropTypes.string,
  SEQUENCE: PropTypes.number,
  STATUS: PropTypes.string,
  LOCATION_INDICATOR_ICAO: PropTypes.string,
  LOCATION_INDICATOR_MWO: PropTypes.string
};
TYPES.GEOJSON = PropTypes.shape({
  type: PropTypes.string,
  features: PropTypes.arrayOf(TYPES.FEATURE)
});
TYPES.LEVELS = PropTypes.shape({
  lev1: TYPES.LEVEL,
  lev2: TYPES.LEVEL
});

/**
 * MISC
 */
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
  { shortName: 'WNW', longName: 'West-Northwest' }
];

// Change types
const CHANGES = [
  { shortName: 'WKN', longName: 'Weakening' },
  { shortName: 'NC', longName: 'No change' },
  { shortName: 'INTSF', longName: 'Intensifying' }
];

// Units for altitude
const UNITS_ALT = {
  M: 'm',
  FL: 'FL',
  FT: 'ft'
};

module.exports = {
  SIGMET_TEMPLATES: TEMPLATES,
  SIGMET_TYPES: TYPES,
  DIRECTIONS: DIRECTIONS,
  CHANGES: CHANGES,
  UNITS_ALT: UNITS_ALT
};
