import React, { Component } from 'react';
import { arrayMove } from 'react-sortable-hoc';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button } from 'reactstrap';
import { createTAFJSONFromInput } from './FromTacCodeToTafjson';
import TafTable from './TafTable';

/**
  TafCategory is the component which renders an editable and sortable TAC table.
  The component hierarchy is structured as follows:

                    TACColumn->BaseForecast-> \
                                                -> TafTable->TafCategory->Taf
TACColumn->ChangeGroup->SortableChangeGroup-> /

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

    let TAFStartHour = moment().utc().hour();
    TAFStartHour = TAFStartHour + 6;
    TAFStartHour = parseInt(TAFStartHour / 6);
    TAFStartHour = TAFStartHour * (6);
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

  onSortEnd ({ oldIndex, newIndex }) {
    // console.log('state from sort');
    this.state.tafJSON.changegroups = arrayMove(this.state.tafJSON.changegroups, oldIndex, newIndex);
    this.setState({
      tafJSON: this.state.tafJSON
    });
  };

  setTACColumnInput (value, rowIndex, colIndex, tafRow) {
    if (!tafRow) {
      console.log('returning because tafRow missing');
      return tafRow;
    }
    if (!tafRow.forecast) {
      tafRow.forecast = {};
    }
    if (!tafRow.input) tafRow.input = {};
    switch (colIndex) {
      case 1:
        tafRow.input.prob = value; break;
      case 2:
        tafRow.input.change = value; break;
      case 3:
        tafRow.input.valid = value; break;
      case 4:
        tafRow.input.wind = value; break;
      case 5:
        tafRow.input.visibility = value; break;
      case 6: case 7: case 8:
        tafRow.input['weather' + (colIndex - 6)] = value; break;
      case 9: case 10: case 11: case 12:
        tafRow.input['clouds' + (colIndex - 9)] = value; break;
    }
    return tafRow;
  }

  /*
    rowIndex -1 means forcast, others are changegroups
  */
  onChange (event, rowIndex, colIndex) {
    let fieldVal = event.target.value;
    if (fieldVal === undefined || fieldVal === null) fieldVal = '';
    fieldVal = fieldVal.toUpperCase();
    let newTaf = Object.assign({}, this.state.tafJSON);
    this.setTACColumnInput(fieldVal, rowIndex, colIndex, rowIndex >= 0 ? newTaf.changegroups[rowIndex] : newTaf);
    // console.log('state from input');
    this.setState({
      tafJSON: newTaf
    });
  }

  updateTACtoTAFJSONtoTac () {
    /* First from form inputs to TAF JSON */
    let newTAFJSON = createTAFJSONFromInput(this.state.tafJSON);
    if (!newTAFJSON) {
      console.log('error newTAFJSON is null');
      return;
    }
    newTAFJSON.metadata.uuid = null;
    /* Then update state and inputs will be rendered from JSON */
    this.setState({
      tafJSON: Object.assign({}, newTAFJSON)
    });
    return newTAFJSON;
  }

  onKeyUp (event, row, col, inputValue) {
    if (event.keyCode === 13) {
      this.onAddRow();
    }
    if (event.keyCode === 27) {
      this.updateTACtoTAFJSONtoTac();
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

  onAddRow () {
    let changeGroups = this.state.tafJSON.changegroups;
    changeGroups.push({});
    this.setState({
      tafJSON: this.state.tafJSON
    });
  }

  onFocusOut () {
    this.updateTACtoTAFJSONtoTac();
  }

  onDeleteRow (rowIndex) {
    let changeGroups = this.state.tafJSON.changegroups;
    changeGroups.splice(rowIndex, 1);
    this.setState({
      tafJSON: this.state.tafJSON
    });
    console.log(rowIndex);
  };

  shouldComponentUpdate (nextProps, nextState) {
    return true;
  }

  componentWillReceiveProps (nextProps) {
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
          // console.log('state from props');
          this.setState({
            tafJSON: Object.assign({}, tafJSON)
          });
        }
      }
    }
  }

  render () {
    return (
      <div style={{ margin: '0px', padding:'0px', overflow:'auto', display:'inline-block' }}>
        <div style={{ backgroundColor:'#EEE', padding:'5px' }}>
          <TafTable
            ref={'taftable'}
            tafJSON={this.state.tafJSON}
            onSortEnd={this.onSortEnd}
            onChange={this.onChange}
            onKeyUp={this.onKeyUp}
            onAddRow={this.onAddRow}
            onDeleteRow={this.onDeleteRow}
            editable={this.props.editable}
            onFocusOut={this.onFocusOut}
            focusRefId={''} />
        </div>
        <div style={{ float:'right' }}>
          <Button color='primary' onClick={() => { this.props.saveTaf(createTAFJSONFromInput(this.state.tafJSON)); }} >Save</Button>
          <Button onClick={() => { alert('Sending a TAF out is not yet implemented'); }} color='primary'>Send</Button>
        </div>
      </div>);
  }
}

TafCategory.propTypes = {
  taf: PropTypes.object,
  saveTaf :PropTypes.func,
  editable: PropTypes.bool
};

export default TafCategory;
