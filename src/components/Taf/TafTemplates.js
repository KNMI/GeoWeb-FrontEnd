import PropTypes from 'prop-types';
import MomentPropTypes from 'react-moment-proptypes';
import cloneDeep from 'lodash.clonedeep';
import Enum from 'es6-enum';

/**
 * TEMPLATES
 */
const TEMPLATES = {
  CLOUDS: [{
    amount: null, // string
    height: null, // number
    mod: null // string
  }],
  VISIBILITY: {
    unit: null, // string
    value: null // number
  },
  WEATHER: [{
    qualifier: null, // string
    descriptor: null, // string
    phenomena: [null] // string values
  }],
  WIND: {
    direction: null, // number
    speed: null, // number
    speedOperator: null, // string
    gusts: null, // number
    gustsOperator: null, // string
    unit: null // string
  },
  TEMPERATURE: [{
    minimum: null, // number
    maximum: null // number
  }],
  METADATA: {
    issueTime: null, // string
    location: null, // string
    status: null, // string
    type: null, // string
    uuid: null, // string
    previousUuid: null, // string
    validityStart: null, // string
    validityEnd: null, // string,
    modified: null, // string
    author: null
  }
};

TEMPLATES.FORECAST = {
  caVOK: false,
  clouds: cloneDeep(TEMPLATES.CLOUDS),
  vertical_visibility: null, // number
  visibility: cloneDeep(TEMPLATES.VISIBILITY),
  weather: cloneDeep(TEMPLATES.WEATHER),
  wind: cloneDeep(TEMPLATES.WIND),
  temperature: cloneDeep(TEMPLATES.TEMPERATURE)
};
TEMPLATES.CHANGE_GROUP = {
  changeStart: null, // string
  changeEnd: null, // string
  changeType: null, // string
  forecast: cloneDeep(TEMPLATES.FORECAST)
};
TEMPLATES.TAF = {
  forecast: cloneDeep(TEMPLATES.FORECAST),
  metadata: cloneDeep(TEMPLATES.METADATA),
  changegroups: [
    cloneDeep(TEMPLATES.CHANGE_GROUP)
  ]
};
TEMPLATES.SELECTABLE_TAF = {
  location: null, // string
  timestamp: null, // moment
  uuid: null, // moment
  hasEdits: false, // boolean
  label: {
    time: null, // string
    text: null, // string
    status: null, // string
    icon: null // string
  },
  tafData: cloneDeep(TEMPLATES.TAF)
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
  CLOUDS: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.shape({
        amount: PropTypes.string,
        height: PropTypes.number
      }),
      TYPE_FALLBACK
    ]))
  ]),
  VISIBILITY: PropTypes.oneOfType([
    PropTypes.shape({
      unit: PropTypes.string,
      value: PropTypes.number
    }),
    TYPE_FALLBACK
  ]),
  WEATHER: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.shape({
        qualifier: PropTypes.string,
        descriptor: PropTypes.string,
        phenomena: PropTypes.arrayOf(PropTypes.string)
      }),
      TYPE_FALLBACK
    ]))
  ]),
  WIND: PropTypes.oneOfType([
    PropTypes.shape({
      direction: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
      ]),
      speed: PropTypes.number,
      gusts: PropTypes.number,
      unit: PropTypes.string
    }),
    TYPE_FALLBACK
  ]),
  TEMPERATURE: PropTypes.arrayOf(PropTypes.shape({
    minimum: PropTypes.number,
    maximum: PropTypes.number
  })),
  METADATA: PropTypes.shape({
    issueTime: PropTypes.string,
    location: PropTypes.string,
    status: PropTypes.string,
    type: PropTypes.string,
    uuid: PropTypes.string,
    previousUuid: PropTypes.string,
    validityStart: PropTypes.string,
    validityEnd: PropTypes.string,
    modified: PropTypes.string,
    author: PropTypes.string
  })
};
TYPES.FORECAST = PropTypes.shape({
  caVOK: PropTypes.bool,
  clouds: TYPES.CLOUDS,
  vertical_visibility: PropTypes.number,
  visibility: TYPES.VISIBILITY,
  weather: TYPES.WEATHER,
  wind: TYPES.WIND,
  temperature: TYPES.TEMPERATURE
});
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
TYPES.SELECTABLE_TAF = PropTypes.shape({
  location: PropTypes.string,
  timestamp: MomentPropTypes.momentObj,
  uuid: PropTypes.string,
  hasEdits: PropTypes.bool,
  label: PropTypes.shape({
    time: PropTypes.string,
    text: PropTypes.string,
    status: PropTypes.string,
    icon: PropTypes.string
  }),
  tafData: TYPES.TAF
});

/**
 * MISC
 */
const CHANGE_TYPES = Enum(
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
CHANGE_TYPES_SHORTHAND[CHANGE_TYPES.PROB40_TEMPO] = 'P40T';

/**
 * Gets the change type by typeName
 * @param {string} typeName The name of the type
 * @return {symbol} The change type
 */
const getChangeType = (typeName) => {
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
};

const PHENOMENON_TYPES = Enum(
  'WIND',
  'VISIBILITY',
  'WEATHER',
  'CLOUDS',
  'CAVOK',
  'VERTICAL_VISIBILITY'
);

const PHENOMENON_TYPES_ORDER = [
  PHENOMENON_TYPES.WIND,
  PHENOMENON_TYPES.CAVOK,
  PHENOMENON_TYPES.VISIBILITY,
  PHENOMENON_TYPES.WEATHER,
  PHENOMENON_TYPES.CLOUDS,
  PHENOMENON_TYPES.VERTICAL_VISIBILITY
];

/**
 * Gets the phenomenon type by typeName
 * @param {string} typeName The name of the type
 * @return {symbol} The phenomenon type symbol
 */
const getPhenomenonType = (typeName) => {
  if (typeof typeName === 'string' && typeName.toUpperCase() in PHENOMENON_TYPES) {
    return PHENOMENON_TYPES[typeName.toUpperCase()];
  } else {
    return null;
  }
};

/**
 * Gets the phenomenon label by typeSymbol
 * @param {symbol} typeSymbol The phenomenon type symbol
 * @return {string} The phenomenon type label
 */
const getPhenomenonLabel = (typeSymbol) => {
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
};

const TIMESTAMP_FORMAT = ('YYYY-MM-DD[T]HH:mm:ss[Z]');
const TIMELABEL_FORMAT = ('HH:mm');

module.exports = {
  TAF_TEMPLATES: TEMPLATES,
  TAF_TYPES: TYPES,
  CHANGE_TYPES: CHANGE_TYPES,
  CHANGE_TYPES_ORDER: CHANGE_TYPES_ORDER,
  CHANGE_TYPES_SHORTHAND: CHANGE_TYPES_SHORTHAND,
  getChangeType: getChangeType,
  PHENOMENON_TYPES: PHENOMENON_TYPES,
  PHENOMENON_TYPES_ORDER: PHENOMENON_TYPES_ORDER,
  getPhenomenonType: getPhenomenonType,
  getPhenomenonLabel: getPhenomenonLabel,
  TIMESTAMP_FORMAT: TIMESTAMP_FORMAT,
  TIMELABEL_FORMAT: TIMELABEL_FORMAT
};
