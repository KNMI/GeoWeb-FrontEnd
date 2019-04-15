import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import moment from 'moment';
import { DATETIME_FORMAT } from '../../config/DayTimeConfig';

const SIGMET_MODES = {
  EDIT: 'EDIT',
  READ: 'READ'
};

/**
 * TEMPLATES
 */
const TEMPLATES = {
  OBS_OR_FORECAST: {
    obs: true, // boolean
    obsFcTime: null // string
  },
  POLYGON_COORDINATES: [[[null]]], // array (polygons) of array (lines) of array (coordinates) of number values
  POINT_COORDINATE: [null],
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
  },
  PHENOMENON: {
    code: null, // string
    name: null, // string
    layerpreset: null // string
  },
  ADJACENT_FIRS: [null] // string values
};

TEMPLATES.FEATURE = {
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
    type: null, // string,
    '{oneOf}_coordinates': [cloneDeep(TEMPLATES.POLYGON_COORDINATES), cloneDeep(TEMPLATES.POINT_COORDINATE)]
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
  type: null, // string
  cancels: null, // number
  cancelsStart: null, // string
  /* Metadata */
  location_indicator_icao: null, // string
  location_indicator_mwo: null, // string
  tac: null // string
};
TEMPLATES.ABILITIES = {
  [SIGMET_MODES.READ]: {
    isEditable: false,
    isDeletable: false,
    isCopyable: false,
    isPublishable: false,
    isCancelable: false
  },
  [SIGMET_MODES.EDIT]: {
    isClearable: false,
    isDiscardable: false,
    isPastable: false,
    isSavable: false
  }
};
TEMPLATES.CATEGORY = {
  ref: null, // string
  title: null, // string
  icon: null, // string
  sigmets: [cloneDeep(TEMPLATES.SIGMET)],
  abilities: cloneDeep(TEMPLATES.ABILITIES)
};
TEMPLATES.CONTAINER = {
  categories: [cloneDeep(TEMPLATES.CATEGORY)],
  phenomena: [cloneDeep(TEMPLATES.PHENOMENON)],
  parameters: {
    active_firs: [null], // string values
    firareas: {
      '{patternProperties}_^[A-Z]{4}$': {
        adjacent_firs: cloneDeep(TEMPLATES.ADJACENT_FIRS),
        areapreset: null, // string
        firname: null, // string
        location_indicator_icao: null, // string
        hoursbeforevalidity: null, // number
        maxhoursofvalidity: null, // number
        tc_hoursbeforevalidity: null, // number
        tc_maxhoursofvalidity: null, // number
        va_hoursbeforevalidity: null, // number
        va_maxhoursofvalidity: null // number
      }
    },
    location_indicator_wmo: null // string
  },
  firs: {
    '{patternProperties}_^[A-Z]+[ ](FIR|UIR|CTA)$': cloneDeep(TEMPLATES.FEATURE)
  },
  focussedCategoryRef: null, // string (uuid)
  selectedSigmet: [cloneDeep(TEMPLATES.SIGMET)],
  selectedAuxiliaryInfo: {
    mode: null, // string
    drawModeStart: null, // string
    drawModeEnd: null, // string
    feedbackStart: null, // string
    feedbackEnd: null, // string
    hasEdits: false // boolean
  },
  copiedSigmetRef: null, // string
  isContainerOpen: true, // boolean
  displayModal: null // string
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
      coordinates: PropTypes.arrayOf(PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
        PropTypes.number
      ]))
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
  TYPE: PropTypes.string,
  CANCELS: PropTypes.number,
  LOCATION_INDICATOR_ICAO: PropTypes.string,
  LOCATION_INDICATOR_MWO: PropTypes.string,
  TAC: PropTypes.string
};
TYPES.GEOJSON = PropTypes.shape({
  type: PropTypes.string,
  features: PropTypes.arrayOf(TYPES.FEATURE)
});
TYPES.LEVELINFO = PropTypes.shape({
  mode: PropTypes.string,
  levels: PropTypes.arrayOf(TYPES.LEVEL)
});
TYPES.SIGMET = PropTypes.shape({
  phenomenon: TYPES.PHENOMENON,
  va_extra_fields: TYPES.VA_EXTRA_FIELDS,
  tc_extra_fields: TYPES.TC_EXTRA_FIELDS,
  geojson: TYPES.GEOJSON,
  levelinfo: TYPES.LEVELINFO,
  firname: TYPES.FIR_NAME,
  validdate: TYPES.VALID_DATE,
  validdate_end: TYPES.VALID_DATE_END,
  change: TYPES.CHANGE,
  movement_type: TYPES.MOVEMENT_TYPE,
  movement: TYPES.MOVEMENT,
  forecast_position_time: TYPES.FORECAST_POSITION_TIME,
  issuedate: TYPES.ISSUE_DATE,
  uuid: TYPES.UUID,
  sequence: TYPES.SEQUENCE,
  status: TYPES.STATUS,
  type: TYPES.TYPE,
  cancels: TYPES.CANCELS,
  location_indicator_icao: TYPES.LOCATION_INDICATOR_ICAO,
  location_indicator_mwo: TYPES.LOCATION_INDICATOR_MWO,
  tac: TYPES.TAC
});

TYPES.AUXILIARY_INFO = PropTypes.shape({
  mode: PropTypes.string,
  drawModeStart: PropTypes.string,
  drawModeEnd: PropTypes.string,
  feedbackStart: PropTypes.string,
  feedbackEnd: PropTypes.string,
  hasEdits: PropTypes.bool
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
const CHANGE_TYPES = {
  WEAKENING: 'WKN',
  NO_CHANGE: 'NC',
  INTENSIFYING: 'INTSF'
};

const CHANGE_OPTIONS = [
  { optionId: CHANGE_TYPES.WEAKENING, label: 'Weakening', disabled: false },
  { optionId: CHANGE_TYPES.NO_CHANGE, label: 'No change', disabled: false },
  { optionId: CHANGE_TYPES.INTENSIFYING, label: 'Intensifying', disabled: false }
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

const SIGMET_VARIANTS = {
  NORMAL: 'NORMAL',
  VOLCANIC_ASH: 'VOLCANIC_ASH',
  TROPICAL_CYCLONE: 'TROPICAL_CYCLONE'
};

// Sigmet distribution types
const DISTRIBUTION_TYPES = {
  NORMAL: 'normal',
  EXERCISE: 'exercise',
  TEST: 'test'
};

const DISTRIBUTION_OPTIONS = [
  { optionId: DISTRIBUTION_TYPES.NORMAL, label: 'Normal', disabled: false },
  { optionId: DISTRIBUTION_TYPES.EXERCISE, label: 'Exercise', disabled: false },
  { optionId: DISTRIBUTION_TYPES.TEST, label: 'Test', disabled: false }
];

const PHENOMENON_CODE_VOLCANIC_ASH = 'VA_CLD';
const PHENOMENON_CODE_TROPICAL_CYCLONE = 'TC';

const SIGMET_VARIANTS_PREFIXES = {};
SIGMET_VARIANTS_PREFIXES[SIGMET_VARIANTS.NORMAL] = '';
SIGMET_VARIANTS_PREFIXES[SIGMET_VARIANTS.VOLCANIC_ASH] = 'va_';
SIGMET_VARIANTS_PREFIXES[SIGMET_VARIANTS.TROPICAL_CYCLONE] = 'tc_';

const dateRanges = (now, startTimestamp, endTimestamp, maxHoursInAdvance, maxHoursDuration) => ({
  obsFcTime: {
    min: now.clone().subtract(3, 'hour').startOf('hour'),
    max: endTimestamp !== null && moment(endTimestamp, DATETIME_FORMAT).isValid()
      ? moment.utc(endTimestamp, DATETIME_FORMAT).endOf('minute')
      : now.clone().add(maxHoursDuration + maxHoursInAdvance, 'hour').endOf('minute')
  },
  validDate: {
    min: now.clone().startOf('minute'),
    max: now.clone().add(maxHoursInAdvance, 'hour').endOf('minute')
  },
  validDateEnd: {
    min: startTimestamp !== null && moment(startTimestamp, DATETIME_FORMAT).isValid()
      ? moment.utc(startTimestamp, DATETIME_FORMAT).startOf('minute')
      : now.clone().startOf('minute'),
    max: startTimestamp !== null && moment(startTimestamp, DATETIME_FORMAT).isValid()
      ? moment.utc(startTimestamp, DATETIME_FORMAT).add(maxHoursDuration, 'hour').endOf('minute')
      : now.clone().add(maxHoursDuration, 'hour').endOf('minute')
  }
});

module.exports = {
  SIGMET_MODES: SIGMET_MODES,
  SIGMET_TEMPLATES: TEMPLATES,
  SIGMET_TYPES: TYPES,
  MOVEMENT_TYPES: MOVEMENT_TYPES,
  MOVEMENT_OPTIONS: MOVEMENT_OPTIONS,
  DISTRIBUTION_TYPES: DISTRIBUTION_TYPES,
  DISTRIBUTION_OPTIONS: DISTRIBUTION_OPTIONS,
  DIRECTIONS: DIRECTIONS,
  CHANGE_TYPES: CHANGE_TYPES,
  CHANGE_OPTIONS: CHANGE_OPTIONS,
  UNITS_ALT: UNITS_ALT,
  UNITS: UNITS,
  MODES_LVL: MODES_LVL,
  MODES_LVL_OPTIONS: MODES_LVL_OPTIONS,
  SIGMET_VARIANTS_PREFIXES: SIGMET_VARIANTS_PREFIXES,
  PHENOMENON_CODE_VOLCANIC_ASH: PHENOMENON_CODE_VOLCANIC_ASH,
  PHENOMENON_CODE_TROPICAL_CYCLONE: PHENOMENON_CODE_TROPICAL_CYCLONE,
  dateRanges: dateRanges
};
