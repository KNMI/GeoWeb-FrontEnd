import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'react-fa';
import { Col, Row, Card, CardTitle, CardText, Button, ButtonGroup, InputGroupAddon } from 'reactstrap';
import CollapseOmni from '../CollapseOmni';
import moment from 'moment';
import axios from 'axios';
import { TAF_TEMPLATES } from './TafTemplates';
import cloneDeep from 'lodash.clonedeep';
import TafCategory from './TafCategory';
import { ReadLocations } from '../../utils/admin';

const TAF = 'taf';

/*
  Renders multiple TafCategories, provides additional functions for loading and saving, and has functions for filtering on type and status.
*/
export default class Taf extends Component {
  constructor () {
    super();
    this.deleteTAF = this.deleteTAF.bind(this);
    this.fetchTAFs = this.fetchTAFs.bind(this);
    this.selectLocation = this.selectLocation.bind(this);
    this.setStatusFilter = this.setStatusFilter.bind(this);
    this.updateTafs = this.updateTafs.bind(this);

    this.state = {
      tafs: [],
      expandedTAF: null,
      expandedTAC: null,
      expandedJSON: null,
      tafTypeSelections: [],
      tafLocationSelections: [],
      tafLocations: [],
      tafSelectedLocation: null
    };
  }

  componentWillMount () {
    this.fetchTAFs();
    this.fetchLocations();
  }

  // componentWillReceiveProps (nextprops, nextstate) {
  //   if (this.props.latestUpdateTime !== nextprops.latestUpdateTime) {
  //     if (this.props.title === 'Open concept TAFs') {
  //       this.fetchTAFs();
  //     }
  //   }
  // }

  // Sort by location
  sortTAFs (tafs) {
    const order = ['EHAM', 'EHRD', 'EHGG', 'EHBK', 'EHLE'];
    const tafsCpy = cloneDeep(tafs);
    tafsCpy.sort((a, b) => {
      const aLocation = a.metadata.location;
      const bLocation = b.metadata.location;

      const aStart = moment.utc(a.metadata.validityStart);
      const bStart = moment.utc(b.metadata.validityStart);

      // If the location is the same
      if (aLocation === bLocation) {
        // Place the taf with the latest start time first
        if (aStart.isAfter(bStart)) {
          return -1;
        } else if (aStart.isBefore(bStart)) {
          return 1;
        } else {
          return 0;
        }
      } else {
        // Check whether the location is in the order array
        if (order.includes(aLocation)) {
          if (order.includes(bLocation)) {
            // If they both are, compare them according to the order in the array
            return order.indexOf(aLocation) < order.indexOf(bLocation) ? -1 : 1;
          }
          // The first location is in the array, and the second isn't, so a comes first
          return -1;
        } else {
          // only the second is in the array so the first comes later
          if (order.includes(bLocation)) {
            return 1;
          }
        }

        // Both not in the array, so sort according to lexicographical order.
        return aLocation < bLocation ? -1 : 1;
      }
    });
    return tafsCpy;
  }

  fetchTAFs (url) {
    if (!url && !this.props.source) return;
    let fetchUrl = url;
    if (!fetchUrl) {
      fetchUrl = this.props.source;
    }
    return new Promise((resolve, reject) => {
      axios({
        method: 'get',
        url: fetchUrl,
        withCredentials: true,
        responseType: 'json'
      }).then(src => {
        if (src.data && src.data.tafs) {
          this.setState({ tafs: src.data.tafs });
        }
        resolve('Fetched tafs');
      }).catch(error => {
        reject(error);
      });
    });
  }

  fetchLocations () {
    if (!this.props.hasOwnProperty('urls') || !this.props.urls ||
      !this.props.urls.hasOwnProperty('BACKEND_SERVER_URL') || typeof this.props.urls.BACKEND_SERVER_URL !== 'string') {
      return;
    }
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (tafLocationsData) => {
      if (tafLocationsData && typeof tafLocationsData === 'object') {
        const locationNames = [];
        tafLocationsData.forEach((location) => {
          if (location.hasOwnProperty('name') && typeof location.name === 'string' &&
            location.hasOwnProperty('availability') && Array.isArray(location.availability) && location.availability.includes(TAF)) {
            locationNames.push(location.name);
          }
        });
        let selectedLocation = this.state.tafSelectedLocation;
        if (!locationNames.includes(selectedLocation)) {
          selectedLocation = locationNames[0];
        }
        this.setState({ tafLocations: locationNames, tafSelectedLocation: selectedLocation });
      } else {
        console.error('Couldn\'t retrieve locations');
      }
    });
  }

  deleteTAF (uuid) {
    axios({
      method: 'delete',
      url: this.props.urls.BACKEND_SERVER_URL + '/tafs/' + uuid,
      responseType: 'json'
    }).then(src => {
      this.fetchTAFs();
    }).catch(error => {
      console.error(error);
    });
  }

  setExpandedTAF (uuid) {
    // Clicking the already expanded TAF collapses it
    if (this.state.expandedTAF === uuid) {
      this.setState({ expandedTAF: null, expandedTAC: null });
    } else if (uuid === 'edit') {
      this.setState({ expandedTAF: 'edit', expandedTAC: null });
    } else {
      // Selecting a new or another TAF, loads its TAC and sets it to expanded
      axios({
        method: 'get',
        url: this.props.urls.BACKEND_SERVER_URL + '/tafs/' + uuid,
        withCredentials: true,
        responseType: 'text',
        headers: { 'Accept': 'text/plain' }
      }).then(src => this.setState({ expandedTAF: uuid, expandedTAC: src.data }));
      axios({
        method: 'get',
        url: this.props.urls.BACKEND_SERVER_URL + '/tafs/' + uuid,
        withCredentials: true,
        responseType: 'json',
        headers: { 'Accept': 'application/json' }
      }).then(src => {
        this.setState({ expandedTAF: uuid, expandedJSON: src.data });
      }
      );
    }
  }

  setStatusFilter (clickEvent) {
    if (clickEvent.hasOwnProperty('target') && clickEvent.target.getAttribute('data-status')) {
      const clickedStatus = clickEvent.target.getAttribute('data-status');
      if (typeof clickedStatus === 'string') {
        const selectionsCopy = cloneDeep(this.state.tafTypeSelections);
        const index = selectionsCopy.indexOf(clickedStatus);
        if (index === -1) {
          selectionsCopy.push(clickedStatus);
        } else {
          selectionsCopy.splice(index, 1);
        }
        this.setState({ tafTypeSelections: selectionsCopy });
      }
    }
  }

  selectLocation (clickEvent) {
    if (clickEvent.hasOwnProperty('target') && clickEvent.target.getAttribute('data-location')) {
      const clickedLocation = clickEvent.target.getAttribute('data-location');
      if (typeof clickedLocation === 'string' && clickedLocation !== this.state.tafSelectedLocation) {
        this.setState({ tafSelectedLocation: clickedLocation });
      }
      if (typeof clickedLocation === 'string') {
        const selectionsCopy = cloneDeep(this.state.tafLocationSelections);
        const index = selectionsCopy.indexOf(clickedLocation);
        if (index === -1) {
          selectionsCopy.push(clickedLocation);
        } else {
          selectionsCopy.splice(index, 1);
        }
        this.setState({ tafLocationSelections: selectionsCopy });
      }
    }
  }

  updateTafs () {
    this.props.updateParent();
  }

  render () {
    const tafLocation = this.state.tafSelectedLocation || (this.state.tafLocations.length > 0 ? this.state.tafLocations[0] : null);
    if (this.state.tafs) {
      const tafStates = [
        { state: 'NORMAL', name: 'ORG' },
        { state: 'AMENDMENT', name: 'AMD' },
        { state: 'CORRECTION', name: 'COR' },
        { state: 'RETARDED', name: 'RTD' },
        { state: 'CANCEL', name: 'CNL' },
        { state: 'MISSING', name: 'NIL' }
      ];

      return <Col style={{ flexDirection: 'column' }}>
        { this.props.tafStatus === 'concept'
          ? <ButtonGroup style={{ marginTop: '.167rem', marginBottom: '0.33rem' }}>
            <InputGroupAddon style={{ padding: '0.2rem 0.3rem', fontSize: '80%' }}><Icon name='filter' /></InputGroupAddon>
            {tafStates.map((status, index) => {
              return <Button key={`filterByStatus-${index}`} className='col-1 btn btn-info' color='info' data-status={status.state} onClick={this.setStatusFilter}
                active={this.state.tafTypeSelections.includes(status.state)}>{status.name}</Button>;
            })}
          </ButtonGroup>
          : null
        }
        { this.state.tafLocations.length > 0 && this.props.tafStatus === 'new'
          ? <ButtonGroup style={{ marginTop: '.167rem', marginBottom: '0.33rem' }}>
            <InputGroupAddon style={{ padding: '0.2rem 0.3rem', fontSize: '70%' }}><Icon name='circle' /></InputGroupAddon>
            {this.state.tafLocations.map((locationName, index) => {
              return <Button key={`filterByLocation-${index}`} className='col-1 btn btn-info' color='info' data-location={locationName} onClick={this.selectLocation}
                active={tafLocation === locationName}>{locationName}</Button>;
            })}
          </ButtonGroup>
          : null
        }
        { this.state.tafLocations.length > 0 && this.props.tafStatus !== 'new'
          ? <ButtonGroup style={{ marginTop: '.167rem', marginBottom: '0.33rem' }}>
            <InputGroupAddon style={{ padding: '0.2rem 0.3rem', fontSize: '70%' }}><Icon name='filter' /></InputGroupAddon>
            {this.state.tafLocations.map((locationName, index) => {
              return <Button key={`filterByLocation-${index}`} className='col-1 btn btn-info' color='info' data-location={locationName} onClick={this.selectLocation}
                active={this.state.tafLocationSelections.includes(locationName)}>{locationName}</Button>;
            })}
          </ButtonGroup>
          : null
        }
        {
          this.props.editable
            ? <Card block>
              <Row>
                <Col>
                  <TafCategory
                    urls={this.props.urls}
                    taf={this.state.inputValueJSON || cloneDeep(TAF_TEMPLATES.TAF)}
                    update editable={this.props.tafEditable}
                    fixedLayout={this.props.fixedLayout}
                    location={tafLocation}
                    browserLocation={this.props.browserLocation}
                    updateParent={this.updateTafs}
                    user={this.props.user}
                  />
                </Col>
              </Row>
            </Card>
            : this.state.tafs.filter(
              (taf) => {
                return ((this.state.tafTypeSelections.includes(taf.metadata.type.toUpperCase() ) || this.state.tafTypeSelections.length === 0) &&
                (this.state.tafLocationSelections.includes(taf.metadata.location.toUpperCase() ) || this.state.tafLocationSelections.length === 0));
              }
            ).map((taf, index) => {
              return <Card key={index} block>
                <CardTitle onClick={() => this.setExpandedTAF(taf.metadata.uuid)} style={{ cursor: 'pointer' }}>
                  {taf.metadata ? taf.metadata.location : 'EWat?'} - {moment.utc(taf.metadata.validityStart).format('YYYY-MM-DDTHH:mm') + ' UTC'} - {taf.metadata.uuid}
                </CardTitle>
                <CollapseOmni className='CollapseOmni' style={{ flexDirection: 'column' }} isOpen={this.state.expandedTAF === taf.metadata.uuid} minSize={0} maxSize={800}>
                  <Row>
                    <Col>
                      <CardText onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>{this.state.expandedTAC}</CardText>
                    </Col>
                  </Row>
                  {taf.metadata.status === 'concept'
                    ? <Row style={{ padding: '0.5rem' }}>
                      <Col />
                      <Col xs='auto'>
                        <a href={this.props.urls.BACKEND_SERVER_URL + '/tafs/' + taf.metadata.uuid} target='_blank'>
                          <Button color='primary' style={{ marginRight: '0.33rem' }}>Show IWXXM</Button>
                        </a>
                      </Col>
                      <Col xs='auto'>
                        <Button onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.deleteTAF(taf.metadata.uuid); }} color='primary'>Delete</Button>
                      </Col>
                    </Row>
                    : null }
                  <Row>
                    <Col>
                      <TafCategory
                        editTaf={this.props.editTaf}
                        urls={this.props.urls}
                        taf={this.state.expandedJSON || cloneDeep(TAF_TEMPLATES.TAF)}
                        editable={this.props.tafEditable}
                        fixedLayout={this.props.fixedLayout}
                        updateParent={this.updateTafs}
                        user={this.props.user}
                      />
                    </Col>
                  </Row>
                </CollapseOmni>
              </Card>;
            })
        }
      </Col>
      ;
    } else {
      return <div />;
    }
  }
}

Taf.propTypes = {
  editable: PropTypes.bool,
  tafEditable: PropTypes.bool,
  updateParent: PropTypes.func,
  source: PropTypes.string,
  latestUpdateTime: PropTypes.object,
  title: PropTypes.string,
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  }),
  fixedLayout: PropTypes.bool
};
