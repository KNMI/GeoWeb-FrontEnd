import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import Enum from 'es6-enum';

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
const TYPE_FALLBACK = PropTypes.shape({
  fallback: PropTypes.shape({
    value: PropTypes.string,
    message: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(
        PropTypes.string
      )
    ])
  })
});
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
  })

};
TYPES.GEOJSON = PropTypes.shape({
  type: PropTypes.string,
  features: PropTypes.arrayOf(TYPES.FEATURE)
});
TYPES.LEVELS = PropTypes.arrayOf(TYPES.LEVEL);

TYPES.CHANGE_GROUP = PropTypes.shape({
  changeStart: PropTypes.oneOfType([
    PropTypes.string,
    TYPE_FALLBACK
  ]),
  changeEnd: PropTypes.oneOfType([
    PropTypes.string,
    TYPE_FALLBACK
  ]),
  changeType: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      fallback: PropTypes.shape({
        probability: PropTypes.string,
        change: PropTypes.string
      })
    })
  ]),
  forecast: TYPES.FORECAST
});
TYPES.TAF = PropTypes.shape({
  forecast: TYPES.FORECAST,
  metadata: TYPES.METADATA,
  changegroups: PropTypes.arrayOf(TYPES.CHANGE_GROUP)
});

/**
 * MISC
 */
/* const CHANGE_TYPES = Enum(
  'FM', // from - instant, persisting change
  'BECMG', // becoming - gradual / fluctuating change, after which the change is persistent
  'PROB30', // probability of 30% for a temporary steady change
  'PROB40', // probability of 40% for a temporary steady change
  'TEMPO', // temporary fluctuating change
  'PROB30_TEMPO', // probability of 30% for a temporary fluctating change
  'PROB40_TEMPO' // probability of 40% for a temporary fluctating change
);

const CHANGE_TYPES_ORDER = [
  CHANGE_TYPES.FM,
  CHANGE_TYPES.BECMG,
  CHANGE_TYPES.PROB30,
  CHANGE_TYPES.PROB40,
  CHANGE_TYPES.TEMPO,
  CHANGE_TYPES.PROB30_TEMPO,
  CHANGE_TYPES.PROB40_TEMPO
];

const CHANGE_TYPES_SHORTHAND = {};
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.FM] = 'F';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.BECMG] = 'B';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB30] = 'P30';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB40] = 'P40';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.TEMPO] = 'T';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB30_TEMPO] = 'P30T';
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB40_TEMPO] = 'P40T'; */

/**
 * Gets the change type by typeName
 * @param {string} typeName The name of the type
 * @return {symbol} The change type
 */
/* const getChangeType = (typeName) => {
  if (typeof typeName === 'string') {
    const normalizedTypeName = typeName.toUpperCase().replace(/\s/g, '_');
    if (normalizedTypeName in CHANGE_TYPES) {
      return CHANGE_TYPES[normalizedTypeName];
    } else {
      return null;
    }
  } else {
    return null;
  }
}; */

/* const PHENOMENON_TYPES = Enum(
  'WIND',
  'VISIBILITY',
  'WEATHER',
  'CLOUDS',
  'CAVOK',
  'VERTICAL_VISIBILITY'
); */

/* const PHENOMENON_TYPES_ORDER = [
  PHENOMENON_TYPES.WIND,
  PHENOMENON_TYPES.CAVOK,
  PHENOMENON_TYPES.VISIBILITY,
  PHENOMENON_TYPES.WEATHER,
  PHENOMENON_TYPES.CLOUDS,
  PHENOMENON_TYPES.VERTICAL_VISIBILITY
]; */

/**
 * Gets the phenomenon type by typeName
 * @param {string} typeName The name of the type
 * @return {symbol} The phenomenon type symbol
 */
/* const getPhenomenonType = (typeName) => {
  if (typeof typeName === 'string' && typeName.toUpperCase() in PHENOMENON_TYPES) {
    return PHENOMENON_TYPES[typeName.toUpperCase()];
  } else {
    return null;
  }
}; */

/**
 * Gets the phenomenon label by typeSymbol
 * @param {symbol} typeSymbol The phenomenon type symbol
 * @return {string} The phenomenon type label
 */
/* const getPhenomenonLabel = (typeSymbol) => {
  if (typeof typeSymbol === 'symbol') {
    switch (typeSymbol) {
      case PHENOMENON_TYPES.WIND: return 'wind';
      case PHENOMENON_TYPES.VISIBILITY: return 'visibility';
      case PHENOMENON_TYPES.CAVOK: return 'caVOK';
      case PHENOMENON_TYPES.WEATHER: return 'weather';
      case PHENOMENON_TYPES.CLOUDS: return 'clouds';
      case PHENOMENON_TYPES.VERTICAL_VISIBILITY: return 'vertical_visibility';
    }
  } else {
    return null;
  }
}; */

module.exports = {
  SIGMET_TEMPLATES: TEMPLATES,
  SIGMET_TYPES: TYPES // ,
/*   CHANGE_TYPES: CHANGE_TYPES,
  CHANGE_TYPES_ORDER: CHANGE_TYPES_ORDER,
  CHANGE_TYPES_SHORTHAND: CHANGE_TYPES_SHORTHAND,
  getChangeType: getChangeType,
  PHENOMENON_TYPES: PHENOMENON_TYPES,
  PHENOMENON_TYPES_ORDER: PHENOMENON_TYPES_ORDER,
  getPhenomenonType: getPhenomenonType,
  getPhenomenonLabel: getPhenomenonLabel */
};
