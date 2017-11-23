import PropTypes from 'prop-types';

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
  clouds: TEMPLATES.CLOUDS,
  vertical_visibility: null, // number
  visibility: TEMPLATES.VISIBILITY,
  weather: TEMPLATES.WEATHER,
  wind: TEMPLATES.WIND,
  temperature: TEMPLATES.TEMPERATURE
};
TEMPLATES.CHANGE_GROUP = {
  changeStart: null, // string
  changeEnd: null, // string
  changeType: null, // string
  forecast: TEMPLATES.FORECAST
};
TEMPLATES.TAF = {
  forecast: TEMPLATES.FORECAST,
  metadata: TEMPLATES.METADATA,
  changegroups: [
    TEMPLATES.CHANGE_GROUP
  ]
};

const TYPES = {
  CLOUDS: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      amount: PropTypes.string,
      height: PropTypes.number
    }))
  ]),
  VISIBILITY: PropTypes.shape({
    unit: PropTypes.string,
    value: PropTypes.number
  }),
  WEATHER: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.shape({
      qualifier: PropTypes.string,
      descriptor: PropTypes.string,
      phenomena: PropTypes.arrayOf(PropTypes.string)
    }))
  ]),
  WIND: PropTypes.shape({
    direction: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string
    ]),
    speed: PropTypes.number,
    gusts: PropTypes.number,
    unit: PropTypes.string
  }),
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
  changeStart: PropTypes.string,
  changeEnd: PropTypes.string,
  changeType: PropTypes.string,
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
