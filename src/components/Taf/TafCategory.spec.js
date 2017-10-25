import React from 'react';
import TafCategory from './TafCategory';
import { mount } from 'enzyme';

let testTaf = {
  'metadata': {
    'uuid': '6f533de6-aed8-4a42-b226-0be62e37d03a',
    'issueTime': '2017-08-31T09:24:47.829Z',
    'validityStart': '2017-08-04T12:00:00Z',
    'validityEnd': '2017-08-05T18:00:00Z',
    'location': 'EHAM',
    'status': 'concept',
    'type': 'normal'
  },
  'forecast': {
    'vertical_visibility': 900,
    'weather': 'NSW',
    'visibility': {
      'value': 8000,
      'unit': null
    },
    'wind': {
      'direction': 200,
      'speed': 15,
      'gusts': 25,
      'unit': 'KT'
    },
    'temperature': null,
    'caVOK': null
  },
  'changegroups': [
    {
      'visibility': null,
      'wind': null,
      'temperature': null,
      'changeType': 'BECMG',
      'changeStart': '2017-08-04T16:00:00Z',
      'changeEnd': '2017-08-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'isNSC': null,
            'amount': 'FEW',
            'mod': null,
            'height': 90
          },
          {
            'isNSC': null,
            'amount': 'SCT',
            'mod': null,
            'height': 150
          },
          {
            'isNSC': null,
            'amount': 'OVC',
            'mod': null,
            'height': 720
          }
        ],
        'weather': [
          {
            'isNSW': null,
            'qualifier': null,
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ]
          },
          {
            'isNSW': null,
            'qualifier': null,
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ]
          }
        ],
        'visibility': {
          'value': 9999,
          'unit': null
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        },
        'temperature': null,
        'caVOK': null
      },
      'caVOK': null
    },
    {
      'visibility': null,
      'wind': null,
      'temperature': null,
      'changeType': 'PROB30',
      'changeStart': '2017-08-04T16:00:00Z',
      'changeEnd': '2017-08-04T20:00:00Z',
      'forecast': {
        'clouds': [
          {
            'isNSC': null,
            'amount': 'FEW',
            'mod': null,
            'height': 90
          },
          {
            'isNSC': null,
            'amount': 'OVC',
            'mod': 'TCU',
            'height': 150
          }
        ],
        'weather': [
          {
            'isNSW': null,
            'qualifier': 'heavy',
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ]
          }
        ],
        'visibility': {
          'value': 1000,
          'unit': null
        },
        'wind': {
          'direction': 220,
          'speed': 17,
          'gusts': 27,
          'unit': 'KT'
        },
        'temperature': null,
        'caVOK': null
      },
      'caVOK': null
    },
    {
      'visibility': null,
      'wind': null,
      'temperature': null,
      'changeType': 'BECMG',
      'changeStart': '2017-08-05T03:00:00Z',
      'changeEnd': '2017-08-05T05:00:00Z',
      'forecast': {
        'clouds': [
          {
            'isNSC': null,
            'amount': 'FEW',
            'mod': null,
            'height': 90
          },
          {
            'isNSC': null,
            'amount': 'SCT',
            'mod': null,
            'height': 120
          }
        ],
        'weather': [
          {
            'isNSW': null,
            'qualifier': null,
            'descriptor': 'showers',
            'phenomena': [
              'rain'
            ]
          },
          {
            'isNSW': null,
            'qualifier': null,
            'descriptor': 'thunderstorm',
            'phenomena': [
              'rain'
            ]
          }
        ],
        'visibility': {
          'value': 9999,
          'unit': null
        },
        'wind': {
          'direction': 200,
          'speed': 7,
          'gusts': 17,
          'unit': 'KT'
        },
        'temperature': null,
        'caVOK': null
      },
      'caVOK': null
    }
  ]
};

describe('(Container) Taf/TafCategory.jsx', () => {
  it('Renders a TafCategory', () => {
    const _component = mount(<TafCategory taf={testTaf} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  it('Renders an editable TafCategory', () => {
    const _component = mount(<TafCategory editable taf={testTaf} />);
    expect(_component.type()).to.eql(TafCategory);
  });

  // <TafCategory
  //               taf={this.state.inputValueJSON}
  //               validationReport={this.state.validationReport}
  //               editable={this.props.tafEditable}
  //               saveTaf={this.saveTaf}
  //               validateTaf={this.validateTaf} />
});
