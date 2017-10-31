import React, { Component } from 'react';
import { Popover, PopoverTitle, Row, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import axios from 'axios';
import { DefaultLocations } from '../constants/defaultlocations';
import { MODEL_LEVEL_URL } from '../constants/default_services';
import { ReadLocations } from '../utils/admin';
import PropTypes from 'prop-types';
import TimeseriesComponent from './TimeseriesComponent';
var moment = require('moment');

export default class ProgtempPopoverComponent extends Component {
  /* istanbul ignore next */
  constructor () {
    super();
    this.setChosenLocation = this.setChosenLocation.bind(this);
    this.getLocationAsString = this.getLocationAsString.bind(this);
    this.clearTypeAhead = this.clearTypeAhead.bind(this);
    this.state = {
      locationDropdownOpen: false,
      selectedModel: 'HARMONIE'
    };
    this.progtempLocations = DefaultLocations;
    ReadLocations((data) => {
      if (data) {
        this.progtempLocations = data;
      } else {
        console.error('get progtemlocations failed');
      }
    });
  }

  componentWillMount () {
    this.setReferenceTime(this.state.selectedModel);
  }

  setReferenceTime (model) {
    let refUrl;
    switch (model.toUpperCase()) {
      default:
        refUrl = `${MODEL_LEVEL_URL}SERVICE=WMS&VERSION=1.3.0&REQUEST=GetReferenceTimes&LAYERS=air_pressure__at_ml`;
        break;
    }
    return axios.get(refUrl).then((r) => this.setState({ referenceTime: moment.utc(r.data[0]) }));
  }

  convertMinSec (loc) {
    function padLeft (nr, n, str) {
      return Array(n - String(nr).length + 1).join(str || '0') + nr;
    }

    const behindComma = (loc - Math.floor(loc));

    const minutes = behindComma * 60;
    const seconds = Math.floor((minutes - Math.floor(minutes)) * 60);

    return Math.floor(loc) + ':' + padLeft(Math.floor(minutes), 2, '0') + ':' + padLeft(seconds, 2, '0');
  }
  /* istanbul ignore next */
  setChosenLocation (loc) {
    const { dispatch, adagucActions } = this.props;

    // Only dispatch a new location and don't unset it
    // (this happens when the typeahead is cleared because this is a change from its filled state)
    if (loc.length > 0) {
      dispatch(adagucActions.setCursorLocation(loc[0]));
    }
  }

  clearTypeAhead () {
    if (!this._typeahead) return;
    if (!this._typeahead.getInstance()) return;
    this._typeahead.getInstance().clear();
  }

  componentDidUpdate (prevProps) {
    const { cursor } = this.props.adagucProperties;

    // Clear the Typeahead if previously a location was selected from the dropdown
    // and now a location is selected by clicking on the map
    const prevCursor = prevProps.adagucProperties.cursor;
    if (cursor && cursor.location && !cursor.location.name && prevCursor && prevCursor.location && prevCursor.location.name) {
      this.clearTypeAhead();
    }
  }

  getLocationAsString () {
    const { cursor } = this.props.adagucProperties;
    if (cursor && cursor.location) {
      if (cursor.location.name) {
        return <span>Location from list: <strong>{cursor.location.name}</strong></span>;
      } else {
        return <span>Location from map: <strong>{this.convertMinSec(cursor.location.x) + ', ' + this.convertMinSec(cursor.location.y)}</strong></span>;
      }
    } else {
      return 'Select location';
    }
  }

  /* istanbul ignore next */
  render () {
    console.log(this.state);
    const { cursor } = this.props.adagucProperties;
    const adaStart = moment.utc(this.props.adagucProperties.timeDimension).startOf('hour');
    if (!this.state.referenceTime) {
      return null;
    }
    return (
      <Popover placement='left' isOpen={this.props.isOpen} target='timeseries_button'>
        <PopoverTitle>Reference time: <strong>{this.state.referenceTime ? this.state.referenceTime.format('ddd DD, HH:mm UTC') : '??'}</strong></PopoverTitle>
        <TimeseriesComponent location={cursor ? cursor.location : null} referenceTime={this.state.referenceTime}
          selectedModel={this.state.selectedModel} time={adaStart} id='timeseriesPopover'/>
        <Row style={{ padding: '0 0 1rem 1rem' }}>
          {this.getLocationAsString(cursor)}
        </Row>
        <Row style={{ flexDirection: 'column' }} >
          <Typeahead onClick={this.clearTypeAhead} onFocus={this.clearTypeAhead} ref={ref => { this._typeahead = ref; }}
            onChange={this.setChosenLocation} options={this.progtempLocations} labelKey='name' placeholder='Search ICAO location' submitFormOnEnter />
          <ButtonDropdown isOpen={this.state.locationDropdownOpen} toggle={() => {}}>
            <DropdownToggle caret>
              {this.state.selectedModel || 'Select model'}
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem onClick={() => { this.setReferenceTime('HARMONIE'); this.setState({ selectedModel: 'HARMONIE' }); }}>HARMONIE</DropdownItem>
            </DropdownMenu>
          </ButtonDropdown>
        </Row>
      </Popover>);
  }
}

ProgtempPopoverComponent.propTypes = {
  adagucProperties: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  adagucActions: PropTypes.object.isRequired
};
