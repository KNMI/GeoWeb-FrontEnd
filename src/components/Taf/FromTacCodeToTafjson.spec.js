import { createTAFJSONFromInput, removeInputPropsFromTafJSON } from './FromTacCodeToTafjson';

let tafJSONWithUserInputsAndNulls = {
  'metadata': {
    'uuid': '6f533de6-aed8-4a42-b226-0be62e37d03a',
    'issueTime': '2017-10-31T09:24:47.829Z',
    'validityStart': '2017-10-04T12:00:00Z',
    'validityEnd': '2017-10-05T18:00:00Z',
    'location': 'EHAM',
    'status': 'concept',
    'type': 'normal'
  },
  'forecast': {
    'weather': 'NSW',
    'visibility': {
      'value': 8000
    },
    'wind': {
      'direction': 200,
      'speed': 15,
      'gusts': 25,
      'unit': 'KT'
    },
    'clouds': 'NSC'
  },
  'changegroups': [
    {
      'changeType': 'BECMG',
      'changeStart': '2017-10-04T16:00:00Z',
      'changeEnd': '2017-10-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'SCT',
            'height': 150
          },
          {
            'amount': 'OVC',
            'height': 720
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          },
          {
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          }
        ],
        'visibility': {
          'value': 9999
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        }
      },
      'input': {
        'prob': null,
        'change': 'BECMG',
        'valid': '0416/0420',
        'wind': '22017G27',
        'visibility': '9999',
        'weather0': 'SHRA',
        'weather1': 'TSRA',
        'weather2': null,
        'clouds0': 'FEW090',
        'clouds1': 'SCT150',
        'clouds2': 'OVC720',
        'clouds3': null
      }
    },
    {
      'changeType': 'PROB30',
      'changeStart': '2017-10-04T16:00:00Z',
      'changeEnd': '2017-10-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'OVC',
            'height': 150,
            'mod': 'TCU'
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'heavy'
          }
        ],
        'visibility': {
          'value': 1000
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        }
      },
      'input': {
        'prob': 'PROB30',
        'change': null,
        'valid': '0416/0420',
        'wind': '22017G27',
        'visibility': '1000',
        'weather0': '+SHRA',
        'weather1': null,
        'weather2': null,
        'clouds0': 'FEW090',
        'clouds1': 'OVC150TCU',
        'clouds2': null,
        'clouds3': null
      }
    },
    {
      'changeType': 'BECMG',
      'changeStart': '2017-10-05T03:00:00Z',
      'changeEnd': '2017-10-05T05:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'SCT',
            'height': 120
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          },
          {
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          }
        ],
        'visibility': {
          'value': 9999
        },
        'wind': {
          'direction': 200,
          'speed': 7,
          'gusts': 17,
          'unit': 'KT'
        }
      },
      'input': {
        'prob': null,
        'change': 'BECMG',
        'valid': '0503/0505',
        'wind': '20007G17',
        'visibility': '9999',
        'weather0': 'SHRA',
        'weather1': 'TSRA',
        'weather2': null,
        'clouds0': 'FEW090',
        'clouds1': 'SCT120',
        'clouds2': null,
        'clouds3': null
      }
    }
  ],
  'input': {
    'valid': '0412/0518',
    'wind': '20015G25',
    'visibility': '8000',
    'weather0': null,
    'weather1': null,
    'weather2': null,
    'clouds0': null,
    'clouds1': null,
    'clouds2': null,
    'clouds3': null
  }
};

let expectedTafWithInputs = {
  'metadata': {
    'uuid': '6f533de6-aed8-4a42-b226-0be62e37d03a',
    'issueTime': '2017-10-31T09:24:47.829Z',
    'validityStart': '2017-10-04T12:00:00Z',
    'validityEnd': '2017-10-05T18:00:00Z',
    'location': 'EHAM',
    'status': 'concept',
    'type': 'normal'
  },
  'forecast': {
    'weather': 'NSW',
    'visibility': {
      'value': 8000
    },
    'wind': {
      'direction': 200,
      'speed': 15,
      'gusts': 25,
      'unit': 'KT'
    },
    'clouds': 'NSC'
  },
  'changegroups': [
    {
      'changeType': 'BECMG',
      'changeStart': '2017-10-04T16:00:00Z',
      'changeEnd': '2017-10-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'SCT',
            'height': 150
          },
          {
            'amount': 'OVC',
            'height': 720
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          },
          {
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          }
        ],
        'visibility': {
          'value': 9999
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        }
      },
      'input': {
        'change': 'BECMG',
        'valid': '0416/0420',
        'wind': '22017G27',
        'visibility': '9999',
        'weather0': 'SHRA',
        'weather1': 'TSRA',
        'clouds0': 'FEW090',
        'clouds1': 'SCT150',
        'clouds2': 'OVC720'
      }
    },
    {
      'changeType': 'PROB30',
      'changeStart': '2017-10-04T16:00:00Z',
      'changeEnd': '2017-10-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'OVC',
            'height': 150,
            'mod': 'TCU'
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'heavy'
          }
        ],
        'visibility': {
          'value': 1000
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        }
      },
      'input': {
        'prob': 'PROB30',
        'valid': '0416/0420',
        'wind': '22017G27',
        'visibility': '1000',
        'weather0': '+SHRA',
        'clouds0': 'FEW090',
        'clouds1': 'OVC150TCU'
      }
    },
    {
      'changeType': 'BECMG',
      'changeStart': '2017-10-05T03:00:00Z',
      'changeEnd': '2017-10-05T05:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'SCT',
            'height': 120
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          },
          {
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          }
        ],
        'visibility': {
          'value': 9999
        },
        'wind': {
          'direction': 200,
          'speed': 7,
          'gusts': 17,
          'unit': 'KT'
        }
      },
      'input': {
        'change': 'BECMG',
        'valid': '0503/0505',
        'wind': '20007G17',
        'visibility': '9999',
        'weather0': 'SHRA',
        'weather1': 'TSRA',
        'clouds0': 'FEW090',
        'clouds1': 'SCT120'
      }
    }
  ],
  'input': {
    'valid': '0412/0518',
    'wind': '20015G25',
    'visibility': '8000'
  }
};

let newComposedTAF = {
  'metadata': {
    'uuid': '6f533de6-aed8-4a42-b226-0be62e37d03a',
    'issueTime': '2017-10-31T09:24:47.829Z',
    'validityStart': '2017-10-04T12:00:00Z',
    'validityEnd': '2017-10-05T18:00:00Z',
    'location': 'EHAM',
    'status': 'concept',
    'type': 'normal'
  },
  'forecast': {
    'weather': 'NSW',
    'visibility': {
      'value': 8000
    },
    'wind': {
      'direction': 200,
      'speed': 15,
      'gusts': 25,
      'unit': 'KT'
    },
    'clouds': 'NSC'
  },
  'changegroups': [
    {
      'changeType': 'BECMG',
      'changeStart': '2017-10-04T16:00:00Z',
      'changeEnd': '2017-10-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'SCT',
            'height': 150
          },
          {
            'amount': 'OVC',
            'height': 720
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          },
          {
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          }
        ],
        'visibility': {
          'value': 9999
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        }
      }
    },
    {
      'changeType': 'PROB30',
      'changeStart': '2017-10-04T16:00:00Z',
      'changeEnd': '2017-10-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'OVC',
            'height': 150,
            'mod': 'TCU'
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'heavy'
          }
        ],
        'visibility': {
          'value': 1000
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        }
      }
    },
    {
      'changeType': 'BECMG',
      'changeStart': '2017-10-05T03:00:00Z',
      'changeEnd': '2017-10-05T05:00:00Z',
      'forecast': {
        'clouds': [
          {
            'amount': 'FEW',
            'height': 90
          },
          {
            'amount': 'SCT',
            'height': 120
          }
        ],
        'weather': [
          {
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          },
          {
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ],
            'qualifier': 'moderate'
          }
        ],
        'visibility': {
          'value': 9999
        },
        'wind': {
          'direction': 200,
          'speed': 7,
          'gusts': 17,
          'unit': 'KT'
        }
      }
    }
  ]
};

describe('(Function) Taf/createTAFJSONFromInput', () => {
  it('createTAFJSONFromInput', () => {
    let tafJSON = createTAFJSONFromInput(tafJSONWithUserInputsAndNulls);
    expect(tafJSON).to.deep.equal(expectedTafWithInputs);
  });
});

describe('(Function) Taf/removeInputPropsFromTafJSON', () => {
  it('createTAFJSONFromInput', () => {
    let tafJSON = removeInputPropsFromTafJSON(createTAFJSONFromInput(tafJSONWithUserInputsAndNulls));
    expect(tafJSON).to.deep.equal(newComposedTAF);
  });
});
