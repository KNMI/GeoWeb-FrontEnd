import React, { Component } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import TimeSchedule from '../TimeSchedule';
import moment from 'moment';
import { Button, Row, Col } from 'reactstrap';
import { createTAFJSONFromInput, setTACColumnInput, removeInputPropsFromTafJSON, cloneObjectAndSkipNullProps } from './FromTacCodeToTafjson';
import TafTable from './TafTable';

/**
  TafCategory is the component which renders an editable and sortable TAF table.
  The UI is generated from a TAF JSON and it can generate/update TAF JSON from user input

  The component hierarchy is structured as follows:

                                  TACColumn(s) -> BaseForecast -> \
                                                                    --> TafTable -> TafCategory -> Taf
      TACColumn(s) -> ChangeGroup(s) -> SortableChangeGroup(s) -> /

*/
class TafCategory extends Component {
  constructor (props) {
    super(props);
    this.onSortEnd = this.onSortEnd.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onAddRow = this.onAddRow.bind(this);
    this.onDeleteRow = this.onDeleteRow.bind(this);
    this.onFocusOut = this.onFocusOut.bind(this);
    this.updateTACtoTAFJSONtoTac = this.updateTACtoTAFJSONtoTac.bind(this);
    this.validateTAF = this.validateTAF.bind(this);

    let TAFStartHour = moment().utc().hour();
    TAFStartHour = TAFStartHour + 6;
    TAFStartHour = parseInt(TAFStartHour / 6);
    TAFStartHour = TAFStartHour * (6);
    this.state = {
      tafJSON: {
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
            'unit': 'M'
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
                'value': 1000,
                'unit': 'M'
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
      }
    };
    return;
    this.state = {
      tafJSON: {
        forecast:{},
        metadata:{
          validityStart: moment().utc().hour(TAFStartHour).add(0, 'hour').format('YYYY-MM-DDTHH:00:00') + 'Z',
          validityEnd: moment().utc().hour(TAFStartHour).add(30, 'hour').format('YYYY-MM-DDTHH:00:00') + 'Z'
        },
        changegroups:[]
      }
    };
  };

  /*
    Event handler which handles change events from all input (TAC) fields.
    - colIndex is the corresponding TACColumn
    - rowIndex -1 means BaseForecast, other values (>= 0) are ChangeGroups
  */
  onChange (event, rowIndex, colIndex) {
    let fieldVal = event.target.value;
    if (fieldVal === undefined || fieldVal === null) fieldVal = '';
    fieldVal = fieldVal.toUpperCase();
    let clonedTafState = cloneObjectAndSkipNullProps(this.state.tafJSON);
    setTACColumnInput(fieldVal, rowIndex, colIndex, rowIndex >= 0 ? clonedTafState.changegroups[rowIndex] : clonedTafState);
    this.setState({
      tafJSON: createTAFJSONFromInput(clonedTafState)
    });
    this.validateTAF(clonedTafState);
  }

  validateTAF (tafJSON) {
    // Validate typed settings
    let taf = removeInputPropsFromTafJSON(createTAFJSONFromInput(tafJSON));
    this.props.validateTaf(taf);
  }

  /*
    Function to update whole UI, roundtrip from TAC->JSON->TAC
    - First TAC fields are converted to TAF json object.
    - Second, TAC fields are rendered from TAF json (by setState)
  */
  updateTACtoTAFJSONtoTac () {
    /* First from form inputs to TAF JSON */
    let newTAFJSON = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
    if (!newTAFJSON) {
      console.log('error newTAFJSON is null');
      return;
    }
    /* Then update state and inputs will be rendered from JSON */
    this.setState({
      tafJSON: newTAFJSON
    });
    return newTAFJSON;
  }

  /*
    Event handler which handles keyUp events from input fields. E.g. arrow keys, Enter key, Esc key, etc...
  */
  onKeyUp (event, row, col, inputValue) {
    if (event.keyCode === 13) {
      this.onAddRow();
    }
    if (event.keyCode === 27) {
      this.updateTACtoTAFJSONtoTac();
      let taf = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
      this.props.validateTaf(taf);
    }
    if (this.state.tafJSON.changegroups.length > 0) {
      if (event.keyCode === 38) { // KEY ARROW UP
        if (row === 0) { // Up from changegroup to baseforecast
          this.refs['taftable'].refs['baseforecast'].refs['column_' + col].refs['inputfield'].focus();
        } else if (row > 0) { // Up from changegroup to changegroup
          this.refs['taftable'].refs['changegroup_' + (row - 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        }
      }
      if (event.keyCode === 40) { // KEY ARROW DOWN
        if (row === -1) { // Down from baseforecast to changegroup
          this.refs['taftable'].refs['changegroup_' + (row + 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        } else if (row >= 0 && row < (this.state.tafJSON.changegroups.length - 1)) { // Down from changegroup to changegroup
          this.refs['taftable'].refs['changegroup_' + (row + 1)].refs['sortablechangegroup'].refs['column_' + col].refs['inputfield'].focus();
        }
      }
    }
  }

  /*
    Event handler that is called upon jumping out of an input field.
  */
  onFocusOut () {
    this.updateTACtoTAFJSONtoTac();
    this.validateTAF(this.state.tafJSON);
  }

  /*
    This function adds a new changegroup to the TAF.
    This method is for example fired upon clicking the 'Add row button' next to changegroups.
  */
  onAddRow () {
    let newTaf = cloneObjectAndSkipNullProps(this.state.tafJSON);
    newTaf.changegroups.push({});
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  }

  /*
    This function removes a changeGroup by given rowIndex.
  */
  onDeleteRow (rowIndex) {
    let newTaf = cloneObjectAndSkipNullProps(this.state.tafJSON);
    newTaf.changegroups.splice(rowIndex, 1);
    this.props.validateTaf(newTaf);
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  };

  /*
    Callback function called by SortableElement and SortableContainer when changegroups are sorted by Drag and Drop
  */
  onSortEnd ({ oldIndex, newIndex }) {
    let newTaf = cloneObjectAndSkipNullProps(this.state.tafJSON);
    newTaf.changegroups = arrayMove(newTaf.changegroups, oldIndex, newIndex);
    this.setState({
      tafJSON: newTaf
    });
    this.validateTAF(newTaf);
  };

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      validationReport: nextProps.validationReport
    });
    let tafJSON = null;
    if (nextProps.taf) {
      if (typeof nextProps.taf === 'string') {
        try {
          tafJSON = JSON.parse(nextProps.taf);
        } catch (e) {
          console.log(e);
        }
      } else {
        tafJSON = nextProps.taf;
      }
      if (tafJSON !== null) {
        if (tafJSON.changegroups) {
          let uuid = null;
          if (tafJSON.metadata && tafJSON.metadata.uuid) {
            uuid = tafJSON.metadata.uuid;
          }
          if (this.changegroupsSet === uuid) return;
          this.changegroupsSet = uuid;
          this.setState({
            tafJSON: Object.assign({}, tafJSON)
          });
        }
      }
    }
  }

  render () {
    const flatten = list => list.reduce(
      (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );
    let validationErrors = null;
    let validationSucceeded = false;
    if (this.state.validationReport && this.state.validationReport.errors) {
      validationErrors = JSON.parse(this.state.validationReport.errors);
    }
    if (this.state.validationReport && this.state.validationReport.succeeded === true) {
      validationSucceeded = true;
    }

    // const tafJson = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
    // const items = [];
    // items.push({ start: moment(tafJson.metadata.validityStart), end: moment(tafJson.metadata.validityEnd), properties: tafJson.forecast });
    // tafJson.changegroups.map(group => items.push({ start: moment(group.changeStart), end: moment(group.changeEnd), properties: group.forecast }));

    return (
      <Row className='TafCategory'>
        <Row style={{ flex: 'auto' }}>
          <Col style={{ margin: '0px', padding:'4px', backgroundColor:'#EEE', flexDirection:'column', flex: 1 }}>
            <Row style={{ flex: 'unset' }}>
              <Col>{this.state.tafJSON.metadata.uuid}</Col>
            </Row>
            <Row>
              <Col>
                <TafTable
                  ref={'taftable'}
                  validationReport={this.state.validationReport}
                  tafJSON={this.state.tafJSON}
                  onSortEnd={this.onSortEnd}
                  onChange={this.onChange}
                  onKeyUp={this.onKeyUp}
                  onAddRow={this.onAddRow}
                  onDeleteRow={this.onDeleteRow}
                  editable={this.props.editable}
                  onFocusOut={this.onFocusOut} />
              </Col>
            </Row>
            { this.state.validationReport
              ? <Row className={validationSucceeded ? 'TAFValidationReportSuccess' : 'TAFValidationReportError'} style={{ flex: 'unset' }} >
                <Col style={{ flexDirection: 'column' }}>
                  <div><b>{this.state.validationReport.message}</b></div>
                  { validationErrors ? (flatten(Object.values(validationErrors).filter(v => Array.isArray(v)))).map((value, index) => {
                    return (<div key={'errmessageno' + index}>{(index + 1)} - {value}</div>);
                  }) : null}
                </Col>
              </Row> : null
            }
            <Row style={{ flex: 'unset' }}>
              <Col />
              <Col xs='auto'>
                <Button color='primary' onClick={() => {
                  let taf = removeInputPropsFromTafJSON(createTAFJSONFromInput(this.state.tafJSON));
                  this.props.saveTaf(taf);
                }} >Save</Button>
              </Col>
              <Col xs='auto'>
                <Button disabled={!validationSucceeded} onClick={() => { alert('Sending a TAF out is not yet implemented'); }} color='primary'>Send</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        { /* <Row style={{ flex: 'auto' }}>
          <Col>
            <TimeSchedule startMoment={moment(tafJson.metadata.validityStart)} endMoment={moment(tafJson.metadata.validityEnd)} items={items} />
          </Col>
        </Row> */
        }
      </Row>
    );
  }
}

TafCategory.propTypes = {
  taf: PropTypes.object,
  saveTaf :PropTypes.func,
  validateTaf :PropTypes.func,
  editable: PropTypes.bool,
  validationReport:PropTypes.object
};

export default TafCategory;
