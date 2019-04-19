
import React from 'react';
import Panel from '../Panel';
import { Input, Button, Row, Col, Label } from 'reactstrap';
import { Icon } from 'react-fa';
import cloneDeep from 'lodash.clonedeep';
import PropTypes from 'prop-types';
import { LocationCardLayout } from '../../layouts';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations, SaveLocations } from '../../utils/admin';

export default class LocationManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      locations: DefaultLocations
    };
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
      if (data) {
        this.setState({ locations: data });
      }
    });
  }

  /* istanbul ignore next */
  toggle (tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render () {
    return (
      <LocationMapper urls={this.props.urls} locations={this.state.locations} />
    );
  }
}

LocationManagementPanel.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export class LocationMapper extends React.Component {
  constructor () {
    super();
    this.addCard = this.addCard.bind(this);
    this.deleteLocation = this.deleteLocation.bind(this);
    this.doneEditing = this.doneEditing.bind(this);
    this.setEditMode = this.setEditMode.bind(this);
    this.saveLocations = this.saveLocations.bind(this);
    this.loadLocations = this.loadLocations.bind(this);
    this.state = {
      locations: []
    };
  }

  /* istanbul ignore next */
  deleteLocation (i) {
    let arrayCpy = this.state.locations.map((a) => Object.assign(a));
    arrayCpy.splice(i, 1);
    this.setState({ locations: arrayCpy });
  }
  /* istanbul ignore next */
  doneEditing (index) {
    const newName = document.querySelector(`#nameinput-${index}`).value;
    const newLat = parseFloat(document.querySelector(`#latinput-${index}`).value);
    const newLon = parseFloat(document.querySelector(`#loninput-${index}`).value);
    let arrayCpy = cloneDeep(this.state.locations);
    if (isNaN(newLat) || isNaN(newLon)) {
      console.warn('Location coordinates are missed or invalid');
      return;
    }
    arrayCpy[index].name = newName;
    arrayCpy[index].x = parseFloat(newLon);
    arrayCpy[index].y = parseFloat(newLat);
    delete arrayCpy[index].edit;
    if (!arrayCpy[index].hasOwnProperty('availability')) {
      arrayCpy[index].availability = [];
    }
    this.setState({ locations: arrayCpy });
  }
  setEditMode (i) {
    let arrayCpy = cloneDeep(this.state.locations);
    arrayCpy[i].edit = true;
    this.setState({ locations: arrayCpy });
  }
  /* istanbul ignore next */
  addCard () {
    let arrayCpy = cloneDeep(this.state.locations);
    arrayCpy.unshift({ edit: true });
    this.setState({ locations: arrayCpy });
  }

  componentDidMount () {
    this.setState({ locations: this.props.locations });
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ locations: nextProps.locations });
  }

  /* istanbul ignore next */
  loadLocations () {
    this.setState({ locations: [] });
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
      if (data) {
        this.setState({ locations: data });
      }
    });
  }
  /* istanbul ignore next */
  saveLocations () {
    SaveLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/create`, this.state.locations);
  }
  render () {
    return (
      <Panel className='LocationManagementPanel'>
        <Col>
          <Row className='grid'>
            {this.state.locations.map((loc, index) =>
              <LocationCardLayout key={`locationCard-${index}`}>
                {loc.edit === true
                  ? <Input data-role='abbreviation' id={`nameinput-${index}`} placeholder='Location abbreviation' defaultValue={loc.name} required />
                  : <span data-role='abbreviation'>{loc.name}</span>
                }
                {loc.edit === true
                  ? <Input data-role='latitude' type='number' step='any' id={`latinput-${index}`} placeholder='00.000' defaultValue={loc.y} required />
                  : <Label data-role='latitude'>{loc.y}</Label>
                }
                {loc.edit === true
                  ? <Input data-role='longitude' type='number' step='any' id={`loninput-${index}`} placeholder='00.000' defaultValue={loc.x} required />
                  : <Label data-role='longitude'>{loc.x}</Label>
                }
                <Row data-role='actions'>
                  <Col />
                  <Col xs='auto'>
                    {loc.edit === true
                      ? <Button color='secondary' onClick={() => this.doneEditing(index)}>
                        <Icon name='check' /> Done
                      </Button>
                      : <Button color='secondary' onClick={() => this.setEditMode(index)}>
                        <Icon name='pencil' /> Edit
                      </Button>
                    }
                    {loc.edit !== true
                      ? <Button color='secondary' onClick={() => this.deleteLocation(index)}>
                        <Icon name='times' /> Delete
                      </Button>
                      : null
                    }
                  </Col>
                </Row>
              </LocationCardLayout>
            )}
          </Row>
          <Row className='grid'>
            <Col />
            <Col xs='auto'>
              <Button color='primary' onClick={this.addCard}>Add location</Button>
              <Button color='primary' onClick={this.saveLocations}>Save</Button>
              <Button color='primary' onClick={this.loadLocations}>(Re)load</Button>
            </Col>
          </Row>
          <Row />
        </Col>
      </Panel>
    );
  }
}
LocationMapper.propTypes = {
  locations: PropTypes.array.isRequired,
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};
