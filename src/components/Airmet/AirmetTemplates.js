import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

const AIRMET_MODES = {
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
  CLOUD_LEVELS: {
    lower: {
      surface: false, // bool
      val: null, // number
      unit: null // string
    },
    upper: {
      above: false, // bool
      val: null, // number
      unit: null // string
    }
  },
  WIND: {
    speed: {
      val: null, // number
      unit: null // string
    },
    direction: {
      val: null, // number
      unit: null // string
    }
  },
  OBSCURING: {
    name: null, // string
    code: null // string
  },
  VISIBILITY: {
    val: null, // number
    unit: null // string
  },
  PHENOMENON: {
    code: null, // string
    name: null, // string
    paraminfo: null, // string
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

TEMPLATES.AIRMET = {
  /* What */
  phenomenon: null, // string
  wind: cloneDeep(TEMPLATES.WIND),
  cloudLevels: cloneDeep(TEMPLATES.CLOUD_LEVELS),
  obscuring: [cloneDeep(TEMPLATES.OBSCURING)],
  visibility: cloneDeep(TEMPLATES.VISIBILITY),
  obs_or_forecast: cloneDeep(TEMPLATES.OBS_OR_FORECAST),
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
  [AIRMET_MODES.READ]: {
    isEditable: false,
    isDeletable: false,
    isCopyable: false,
    isPublishable: false,
    isCancelable: false
  },
  [AIRMET_MODES.EDIT]: {
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
  airmets: [cloneDeep(TEMPLATES.AIRMET)],
  abilities: cloneDeep(TEMPLATES.ABILITIES)
};
TEMPLATES.CONTAINER = {
  categories: [cloneDeep(TEMPLATES.CATEGORY)],
  phenomena: [cloneDeep(TEMPLATES.PHENOMENON)],
  obscuringPhenomena: [cloneDeep(TEMPLATES.OBSCURING)],
  parameters: {
    active_firs: [null], // string values
    firareas: {
      '{patternProperties}_^[A-Z]{4}$': {
        adjacent_firs: cloneDeep(TEMPLATES.ADJACENT_FIRS),
        areapreset: null, // string
        firname: null, // string
        location_indicator_icao: null, // string
        hoursbeforevalidity: null, // number
        maxhoursofvalidity: null // number
      }
    },
    location_indicator_wmo: null // string
  },
  firs: {
    '{patternProperties}_^[A-Z]+[ ](FIR|UIR|CTA)$': cloneDeep(TEMPLATES.FEATURE)
  },
  focussedCategoryRef: null, // string (uuid)
  selectedAirmet: [cloneDeep(TEMPLATES.AIRMET)],
  selectedAuxiliaryInfo: {
    mode: null, // string
    drawModeStart: null, // string
    feedbackStart: null, // string
    hasEdits: false // boolean
  },
  copiedAirmetRef: null, // string
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
  CLOUD_LEVELS: PropTypes.shape({
    lower: PropTypes.shape({
      surface: PropTypes.bool, // bool
      val: PropTypes.number, // number
      unit: PropTypes.string // string
    }),
    upper: PropTypes.shape({
      above: PropTypes.bool, // bool
      val: PropTypes.number, // number
      unit: PropTypes.string // string
    })
  }),
  WIND: PropTypes.shape({
    speed: PropTypes.shape({
      val: PropTypes.number, // number
      unit: PropTypes.string // string
    }),
    direction: PropTypes.shape({
      val: PropTypes.number, // number
      unit: PropTypes.string // string
    })
  }),
  OBSCURING_PHENOMENON: PropTypes.shape({
    name: PropTypes.string, // string
    code: PropTypes.string // string
  }),
  VISIBILITY: PropTypes.shape({
    val: PropTypes.number, // number
    unit: PropTypes.string // string
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
TYPES.OBSCURING = PropTypes.arrayOf(TYPES.OBSCURING_PHENOMENON);
TYPES.AIRMET = PropTypes.shape({
  phenomenon: TYPES.PHENOMENON,
  wind: TYPES.WIND,
  cloudLevels: TYPES.CLOUD_LEVELS,
  obscuring: TYPES.OBSCURING,
  visibility: TYPES.VISIBILITY,
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
  feedbackStart: PropTypes.string,
  hasEdits: PropTypes.bool
});

/**
 * MISC
 */
// Movement types
const MOVEMENT_TYPES = {
  STATIONARY: 'STATIONARY',
  MOVEMENT: 'MOVEMENT'
};

const MOVEMENT_OPTIONS = [
  { optionId: MOVEMENT_TYPES.STATIONARY, label: 'Stationary', disabled: false },
  { optionId: MOVEMENT_TYPES.MOVEMENT, label: 'Movement', disabled: false }
];

const PARAMS_NEEDED = {
  NEEDS_NONE: 'NEEDS_NONE',
  NEEDS_WIND: 'NEEDS_WIND',
  NEEDS_CLOUDLEVELS: 'NEEDS_CLOUDLEVELS',
  NEEDS_OBSCURATION: 'NEEDS_OBSCURATION'
};

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
  M: 'M',
  KT: 'KT',
  MPS: 'MPS',
  DEGREES: 'degrees'
};

// Units label
const UNITS_LABELED = [
  { unit: UNITS.FL, label: 'FL', dim: 'length' },
  { unit: UNITS.FT, label: 'ft', dim: 'length' },
  { unit: UNITS.M, label: 'm', dim: 'length' },
  { unit: UNITS.KT, label: 'KT', dim: 'speed' },
  { unit: UNITS.MPS, label: 'm/s', dim: 'speed' },
  { unit: UNITS.DEGREES, label: 'deg', dim: 'angle' }
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

const AIRMET_VARIANTS = {
  NORMAL: 'NORMAL'
};

// Airmet distribution types
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

const AIRMET_VARIANTS_PREFIXES = {};
AIRMET_VARIANTS_PREFIXES[AIRMET_VARIANTS.NORMAL] = '';

module.exports = {
  AIRMET_MODES: AIRMET_MODES,
  AIRMET_TEMPLATES: TEMPLATES,
  AIRMET_TYPES: TYPES,
  MOVEMENT_TYPES: MOVEMENT_TYPES,
  MOVEMENT_OPTIONS: MOVEMENT_OPTIONS,
  DISTRIBUTION_TYPES: DISTRIBUTION_TYPES,
  DISTRIBUTION_OPTIONS: DISTRIBUTION_OPTIONS,
  DIRECTIONS: DIRECTIONS,
  CHANGE_TYPES: CHANGE_TYPES,
  CHANGE_OPTIONS: CHANGE_OPTIONS,
  PARAMS_NEEDED: PARAMS_NEEDED,
  UNITS_LABELED: UNITS_LABELED,
  UNITS: UNITS,
  MODES_LVL: MODES_LVL,
  MODES_LVL_OPTIONS: MODES_LVL_OPTIONS,
  AIRMET_VARIANTS_PREFIXES: AIRMET_VARIANTS_PREFIXES
};
