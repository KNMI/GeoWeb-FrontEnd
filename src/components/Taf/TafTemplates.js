import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

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
    phenomena: [] // string values
  }],
  WIND: {
    direction: null, // number
    speed: null, // number
    gusts: null, // number
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
    validityStart: null, // string
    validityEnd: null // string
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

/**
 * TYPES
 */
const TYPE_FALLBACK = PropTypes.shape({
  fallback: PropTypes.string
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
    validityStart: PropTypes.string,
    validityEnd: PropTypes.string
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

module.exports = {
  TAF_TEMPLATES: TEMPLATES,
  TAF_TYPES: TYPES
};
