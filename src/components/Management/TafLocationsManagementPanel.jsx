import React from 'react';
import Panel from '../Panel';
import { Button, Row, Col, Label } from 'reactstrap';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations, SaveLocations } from '../../utils/admin';
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import { LocationCardLayout } from '../../layouts';
import Checkbox from '../Basis/Checkbox';

const TAF = 'taf';

class TafLocationsManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.compareByName = this.compareByName.bind(this);
    this.isLocationSelected = this.isLocationSelected.bind(this);
    this.selectLocation = this.selectLocation.bind(this);
    this.saveLocationSelection = this.saveLocationSelection.bind(this);
    this.state = {
      locations: DefaultLocations,
      hasChanges: false
    };
  };

  compareByName (itemA, itemB) {
    if (itemA.name < itemB.name) {
      return -1;
    }
    if (itemA.name > itemB.name) {
      return 1;
    }
    return 0;
  };

  isLocationSelected (locationName) {
    const filteredByName = this.state.locations.filter((loc) => loc.name === locationName);
    if (Array.isArray(filteredByName) && filteredByName.length === 1 && filteredByName[0].hasOwnProperty('availability') &&
        Array.isArray(filteredByName[0].availability) && filteredByName[0].availability.includes(TAF)) {
      return true;
    }
    return false;
  };

  selectLocation (locationName) {
    const newLocations = cloneDeep(this.state.locations);
    let hasChanges = false;
    newLocations.forEach((location) => {
      if (location.name === locationName && location.hasOwnProperty('availability') &&
          Array.isArray(location.availability)) {
        const index = location.availability.indexOf(TAF);
        if (index === -1) {
          location.availability.push(TAF);
        } else {
          location.availability.splice(index, 1);
        }
        hasChanges = true;
      }
    });
    if (hasChanges) {
      this.setState({ locations: newLocations, hasChanges: true });
    }
  }

  saveLocationSelection (clickEvent) {
    const saveLocations = cloneDeep(this.state.locations);
    SaveLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/create`, saveLocations);
    this.setState({ hasChanges: false });
  }

  componentWillMount () {
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
      if (data) {
        this.setState({ locations: data });
      } else {
        console.error('Couldn\'t retrieve locations');
      }
    });
  };

  render () {
    if (!this.state.locations) {
      return null;
    }
    return (
      <Panel className='TafLocationManagementPanel'>
        <Col>
          <Row className='grid'>
            {this.state.locations.sort(this.compareByName).map((loc, index) =>
              <LocationCardLayout key={`locationCard-${index}`}>
                <span data-role='abbreviation'>{loc.name}</span>
                <Label data-role='latitude'>{loc.y}</Label>
                <Label data-role='longitude'>{loc.x}</Label>
                <Checkbox
                  value={this.isLocationSelected(loc.name) ? loc.name : ''}
                  option={{ optionId: loc.name, label: 'Allow for TAFs' }}
                  onChange={(evt, optionId) => this.selectLocation(loc.name)}
                  data-role='actions'
                  data-field='locationTafEnabled'
                />
              </LocationCardLayout>
            )}
          </Row>
          <Row className='grid'>
            <Col />
            <Col xs='auto'>
              <Button color='primary' disabled={!this.state.hasChanges} onClick={this.saveLocationSelection}>Save</Button>
            </Col>
          </Row>
          <Row />
        </Col>
      </Panel>
    );
  }
}

TafLocationsManagementPanel.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};
export default TafLocationsManagementPanel;
