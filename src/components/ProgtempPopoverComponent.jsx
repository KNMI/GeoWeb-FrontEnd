import React, { Component } from 'react';
import { Popover, PopoverTitle, Row, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import axios from 'axios';
import { DefaultLocations } from '../constants/defaultlocations';
import { ReadLocations } from '../utils/admin';
import PropTypes from 'prop-types';
import ProgtempComponent from './ProgtempComponent';
import { GetServiceByNamePromise } from '../utils/getServiceByName';
var moment = require('moment');

// TODO: Generalize this component to make one PopoverComponent
// such that we can remove this one and TimeseriesPopoverComponent
export default class ProgtempPopoverComponent extends Component {
  /* istanbul ignore next */
  constructor (props) {
    super(props);
    this.setChosenLocation = this.setChosenLocation.bind(this);
    this.getLocationOrErrors = this.getLocationOrErrors.bind(this);
    this.clearTypeAhead = this.clearTypeAhead.bind(this);
    this.state = {
      locationDropdownOpen: false,
      selectedModel: 'HARMONIE'
    };
    this.progtempLocations = DefaultLocations;
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
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
    return GetServiceByNamePromise(this.props.urls.BACKEND_SERVER_URL, 'HARM_N25_ML').then(
      (serviceURL) => {
        try {
          let referenceTimeRequestURL = serviceURL + '&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetReferenceTimes&LAYERS=air_temperature__at_ml';
          return axios.get(referenceTimeRequestURL).then((r) => {
            this.setState({ referenceTime: moment.utc(r.data[0]) });
            return axios.get(referenceTimeRequestURL).then((r) => {
              this.setState({ referenceTime: moment.utc(r.data[0]) });
              // Check ref time too long ago
              // TODO: this
            });
          });
        } catch (e) {
          console.error('ERROR: unable to fetch ' + serviceURL);
        }
      },
      (e) => {
        console.error(e);
      }
    );
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
      this.setState({ isLoading: true });
    }
  }

  clearTypeAhead () {
    if (!this._typeahead) return;
    if (!this._typeahead.getInstance()) return;
    this._typeahead.getInstance().clear();
  }

  componentWillUpdate (nextProps) {
    if (this.props.adagucProperties.cursor !== nextProps.adagucProperties.cursor) {
      this.setState({ isLoading: true });
    }
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

  getLocationOrErrors (cursor, error) {
    console.log(this.state);
    if (this.state.isLoading) {
      return 'Loading...';
    }
    if (error) {
      return error;
    } else {
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
  }

  /* istanbul ignore next */
  render () {
    const { cursor } = this.props.adagucProperties;
    const { urls } = this.props;
    const adaStart = moment.utc(this.props.adagucProperties.timeDimension).startOf('hour');
    if (!this.state.referenceTime) {
      return null;
    }
    return (
      <Popover placement='left' isOpen={this.props.isOpen} target='progtemp_button'>
        <PopoverTitle>Reference time: <strong>{this.state.referenceTime ? this.state.referenceTime.format('ddd DD, HH:mm UTC') : '??'}</strong></PopoverTitle>
        <ProgtempComponent urls={urls} location={cursor ? cursor.location : null} referenceTime={this.state.referenceTime}
          selectedModel={this.state.selectedModel} loadingDone={() => this.setState({ isLoading: false })} onError={(error) => {
            console.log(error);
            if (this.state.error !== error) {
              this.setState({ error });
            }
          }} time={adaStart} className='popover-content'
          style={{ height: '600px', width: '450px', marginLeft: '-3.6rem', marginRight: '1.4rem' }} />
        <Row style={{ padding: '0 0 1rem 1rem' }}>
          {this.getLocationOrErrors(cursor, this.state.error)}
        </Row>
        <Row style={{ flexDirection: 'column' }} >
          <Typeahead ref={ref => { this._typeahead = ref; }}
            onChange={this.setChosenLocation} options={this.progtempLocations} labelKey='name' placeholder='Search ICAO location' submitFormOnEnter />
          <ButtonDropdown isOpen={this.state.locationDropdownOpen} toggle={() => { this.setState({ locationDropdownOpen: !this.state.locationDropdownOpen }); }}>
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
  adagucActions: PropTypes.object.isRequired,
  urls: PropTypes.object.isRequired
};
