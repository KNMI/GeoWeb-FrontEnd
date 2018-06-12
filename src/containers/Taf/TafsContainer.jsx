import React, { Component } from 'react';
import { Col } from 'reactstrap';
import PropTypes from 'prop-types';
import produce from 'immer';
import Panel from '../../components/Panel';
import Taf from '../../components/Taf/Taf';
import ContainerHeader from '../../components/Taf/ContainerHeader';
import TafSelector from '../../components/Taf/TafSelector';
import axios from 'axios';
import moment from 'moment';
import cloneDeep from 'lodash.clonedeep';
import isEqual from 'lodash.isequal';
import { ReadLocations } from '../../utils/admin';
import { getExample, INITIAL_STATE, LOCAL_ACTIONS, STATUSES, LIFECYCLE_STAGE_NAMES } from './TafActions';
import { localDispatch as dispatch } from './TafReducers';
import { TAF_TEMPLATES, TIMESTAMP_FORMAT } from '../../components/Taf/TafTemplates';

export default class TafsContainer extends Component {
  constructor (props) {
    super(props);
    this.localDispatch = this.localDispatch.bind(this);
    this.state = produce(INITIAL_STATE, draftState => { });
    this.generateTimestamps = this.generateTimestamps.bind(this);
    this.retrieveTafLocations = this.retrieveTafLocations.bind(this);
    this.retrieveExistingTafs = this.retrieveExistingTafs.bind(this);
    this.receivedExistingTafsCallback = this.receivedExistingTafsCallback.bind(this);
    this.setSpaceTimeTafs = this.setSpaceTimeTafs.bind(this);
    this.syncSelectableTafs = this.syncSelectableTafs.bind(this);
    this.isSelectableMatchForExisting = this.isSelectableMatchForExisting.bind(this);
    this.selectTaf = this.selectTaf.bind(this);
  }

  localDispatch (localAction) {
    dispatch(localAction, this);
  };

  /**
   * Retrieve locations for TAF creation from backend configuration
   */
  retrieveTafLocations () {
    if (!this.props.hasOwnProperty('urls') || !this.props.urls ||
    !this.props.urls.hasOwnProperty('BACKEND_SERVER_URL') || typeof this.props.urls.BACKEND_SERVER_URL !== 'string') {
      return;
    }
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (tafLocationsData) => {
      if (tafLocationsData && typeof tafLocationsData === 'object') {
        const locationNames = [];
        tafLocationsData.forEach((location) => {
          if (location.hasOwnProperty('name') && typeof location.name === 'string' &&
          location.hasOwnProperty('availability') && Array.isArray(location.availability) && location.availability.includes('taf')) {
            locationNames.push(location.name);
          }
        });
        this.setSpaceTimeTafs(locationNames);
        this.retrieveExistingTafs();
      } else {
        console.error('Couldn\'t retrieve TAF locations');
      }
    });
  }

  /**
   * Retrieve existing TAFs
   */
  retrieveExistingTafs () {
    const { urls } = this.props;
    const tafResources = [
      { url: `${urls.BACKEND_SERVER_URL}/tafs?active=true`, status: STATUSES.PUBLISHED },
      { url: `${urls.BACKEND_SERVER_URL}/tafs?active=false&status=concept`, status: STATUSES.CONCEPT }
    ];
    tafResources.forEach((tafResource) => {
      axios({
        method: 'get',
        url: tafResource.url,
        withCredentials: true,
        responseType: 'json'
      }).then(response => {
        response = tafResource.status === STATUSES.PUBLISHED
          ? getExample(this.state.selectableTafs[0].timestamp, this.state.selectableTafs[0].location, tafResource.status)
          : getExample(this.state.selectableTafs[2].timestamp, this.state.selectableTafs[2].location, tafResource.status);
        this.receivedExistingTafsCallback(response, tafResource.status);
      }).catch(error => {
        console.error('Couldn\'t retrieve existing TAFs', error);
      });
    });
  }

  receivedExistingTafsCallback (response, tafStatus) {
    const isSameTaf = (tafA, tafB) => tafA.metadata.uuid === tafB.metadata.uuid &&
      tafA.metadata.validityStart === tafB.metadata.validityStart &&
      tafA.metadata.type.toUpperCase() === tafB.metadata.type.toUpperCase() &&
      tafA.metadata.location.toUpperCase() === tafB.metadata.location.toUpperCase();

    if (response.data && response.data.ntafs && !isNaN(response.data.ntafs) &&
      Number.isInteger(response.data.ntafs) && response.data.ntafs > 0 &&
      response.data.tafs && Array.isArray(response.data.tafs)) {
      const draftExistingTafs = cloneDeep(this.state.existingTafs);
      response.data.tafs.map((incomingTaf) => {
        const currentIndex = draftExistingTafs.findIndex((existingTaf) => isSameTaf(incomingTaf, existingTaf));
        if (currentIndex > -1) {
          draftExistingTafs[currentIndex] = incomingTaf;
        } else {
          draftExistingTafs.push(incomingTaf);
        }
      });
      this.setState({ existingTafs: draftExistingTafs });
      this.syncSelectableTafs();
    }
  }

  /**
   * Updates the selectableTafs with the information of the existingTafs
   */
  syncSelectableTafs () {
    const draftSelectableTafs = cloneDeep(this.state.selectableTafs);
    draftSelectableTafs.map((selectable) => {
      const selectableAndExistingTaf = this.state.existingTafs.find((existingTaf) => this.isSelectableMatchForExisting(selectable, existingTaf));
      if (selectableAndExistingTaf && selectableAndExistingTaf.metadata && typeof selectableAndExistingTaf.metadata.status === 'string') {
        let newStatus = selectableAndExistingTaf.metadata.status.toUpperCase();
        if (Object.values(STATUSES).includes(newStatus)) {
          selectable.status = newStatus;
        }
      }
    });
    this.setState({ selectableTafs: draftSelectableTafs });
  }

  /**
   * Determines if there a selectableTaf matches an existingTaf
   * @param {object} selectable The selectableTaf to compare
   * @param {object} existing The existingTaf to compare
   * @return {boolean} True when matched
   */
  isSelectableMatchForExisting (selectable, existing) {
    return selectable.location.toUpperCase() === existing.metadata.location.toUpperCase() &&
      selectable.timestamp.format(TIMESTAMP_FORMAT) === existing.metadata.validityStart;
  }

  /**
   * Set the combinations for locations, current and next TAFs
   * @param {array} [tafLocations=this.state.tafLocations] Array of available TAF locations, as string
   * @return {object} Object containing timestamps for current and next TAFs
   */
  setSpaceTimeTafs (tafLocations = this.state.tafLocations) {
    const timestamps = this.generateTimestamps();
    const spaceTimeCombinations = this.createLocationTimeCombinations(tafLocations, timestamps);

    if (tafLocations === this.state.tafLocations) {
      this.setState({
        timestamps: timestamps,
        selectableTafs: spaceTimeCombinations
      });
    } else {
      this.setState({
        tafLocations: tafLocations,
        timestamps: timestamps,
        selectableTafs: spaceTimeCombinations
      });
    }
    this.syncSelectableTafs();
  }

  /**
   * Generate timestamps for current and next TAFs, and modified
   * @return {object} Object containing timestamps for current and next TAFs, and modified
   */
  generateTimestamps () {
    const now = moment().utc();
    let TAFStartHour = now.hour();
    TAFStartHour = TAFStartHour - TAFStartHour % 6 + 6;
    const currentTafTimestamp = now.clone().hour(TAFStartHour).startOf('hour');
    return {
      current: currentTafTimestamp,
      next: currentTafTimestamp.clone().add(6, 'hour'),
      modified: now
    };
  }

  createLocationTimeCombinations (locations, timestamps) {
    let combinations = [];
    const LOCATION_FORMAT = 'HH:mm';
    if (Array.isArray(locations) && timestamps && timestamps.current && timestamps.next) {
      locations.forEach((location) => {
        if (typeof location !== 'string') {
          return;
        }
        combinations.push({
          location: location,
          timestamp: timestamps.current,
          timeLabel: timestamps.current.format(LOCATION_FORMAT)
        },
        {
          location: location,
          timestamp: timestamps.next,
          timeLabel: timestamps.next.format(LOCATION_FORMAT)
        });
      });
    }
    return combinations;
  }

  selectTaf (tafSelection) {
    if (isEqual(tafSelection, this.state.selectedTafOption)) {
      return;
    }
    if (Array.isArray(tafSelection) && tafSelection.length === 1) {
      const chosenTaf = tafSelection[0];
      let draftSelectedTaf;
      const selectedAndExistingTaf = this.state.existingTafs.find((existingTaf) => this.isSelectableMatchForExisting(chosenTaf, existingTaf));
      if (selectedAndExistingTaf) {
        draftSelectedTaf = cloneDeep(selectedAndExistingTaf);
      } else {
        draftSelectedTaf = cloneDeep(TAF_TEMPLATES.TAF);
        draftSelectedTaf.metadata.validityStart = chosenTaf.timestamp.format(TIMESTAMP_FORMAT);
        draftSelectedTaf.metadata.validityEnd = chosenTaf.timestamp.clone().add(30, 'hour').format(TIMESTAMP_FORMAT);
        draftSelectedTaf.metadata.location = chosenTaf.location;
        draftSelectedTaf.metadata.status = chosenTaf.status || STATUSES.CONCEPT;
        draftSelectedTaf.metadata.type = LIFECYCLE_STAGE_NAMES.NORMAL;
      }
      if (draftSelectedTaf) {
        this.setState({ selectedTaf: draftSelectedTaf, selectedTafOption: tafSelection });
        return;
      }
    }
    this.setState({ selectedTaf: null, selectedTafOption: null });
  }

  componentWillReceiveProps (nextProps) {
    const { timestamps } = this.state;
    if (!timestamps || !timestamps.next || moment.utc().isAfter(timestamps.next)) {
      this.setSpaceTimeTafs();
    }
  }

  componentDidMount () {
    this.localDispatch(LOCAL_ACTIONS.updatePhenomenaAction(response.data));
    this.retrieveTafLocations();
  }

  render () {
    const { selectableTafs, selectedTaf, selectedTafOption } = this.state;
    return (
      <Col className='TafsContainer'>
        <Panel className='Panel' title={<ContainerHeader />}>
          <Col>
            <TafSelector selectableTafs={selectableTafs} selectedTaf={selectedTafOption} onChange={this.selectTaf} />
            {selectedTaf
              ? <Taf taf={this.state.selectedTaf} urls={this.props.urls} />
              : null
            }
          </Col>
        </Panel>
      </Col>);
  }
}

TafsContainer.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};
