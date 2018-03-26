
import React from 'react';
import Panel from '../Panel';
import { Input, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations, SaveLocations } from '../../utils/admin';
import cloneDeep from 'lodash.clonedeep';
export default class LocationManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      locations: DefaultLocations
    }
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
    }
  }
  /* istanbul ignore next */
  deleteLocation (i) {
    let arrayCpy = this.state.locations.map((a) => Object.assign(a));
    arrayCpy.splice(i, 1);
    this.setState({ locations: arrayCpy });
  }
  /* istanbul ignore next */
  doneEditing (i) {
    const newName = document.querySelector('#nameinput' + i).value;
    const newLat = parseFloat(document.querySelector('#latinput' + i).value);
    const newLon = parseFloat(document.querySelector('#loninput' + i).value);
    let arrayCpy = cloneDeep(this.state.locations);
    if (isNaN(newLat) || isNaN(newLon)) {
      alert('Please enter location numbers');
      return;
    }
    arrayCpy[i].name = newName;
    arrayCpy[i].x = parseFloat(newLon);
    arrayCpy[i].y = parseFloat(newLat);
    delete arrayCpy[i].edit;
    if (!arrayCpy[i].hasOwnProperty('availability')) {
      arrayCpy[i].availability = [];
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
      <Panel style={{}}>
        <Row style={{ flex: 1, overflowX: 'hidden', overflowY: 'auto' }}>
          <Row style={{ flex: 1 }}>
            {this.state.locations.map((loc, i) =>
              <LocationCard key={i} edit={loc.edit} name={loc.name} x={loc.x} y={loc.y} i={i} doneEditing={this.doneEditing} setEditMode={this.setEditMode} deleteLocation={this.deleteLocation} />
            )}
          </Row>
        </Row>
        <Row style={{ height:'4rem' }}>
          <Row style={{ bottom: '1rem', position: 'fixed' }}>
            <Col>
              <Button color='primary' style={{ marginRight: '1rem' }} onClick={this.addCard}>Add location</Button>
              <Button color='primary' style={{ marginRight: '1rem' }} onClick={this.saveLocations}>Save</Button>
              <Button color='primary' style={{ marginRight: '1rem' }} onClick={this.loadLocations}>(Re)load</Button>
            </Col>
          </Row>
        </Row>
      </Panel>
    );
  }
}
LocationMapper.propTypes = {
  locations: PropTypes.array.isRequired
};

class LocationCard extends React.Component {
  render () {
    const { edit, name, x, y, i, doneEditing, setEditMode, deleteLocation } = this.props;
    return (edit
      ? <Col><EditCard i={i} name={name} x={x} y={y} doneEditing={doneEditing} /></Col>
      : <Col><StaticCard i={i} name={name} x={x} y={y} setEditMode={setEditMode} deleteLocation={deleteLocation} /></Col>);
  }
}
LocationCard.propTypes = {
  name: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  i: PropTypes.number.isRequired,
  edit: PropTypes.bool,
  doneEditing: PropTypes.func.isRequired,
  setEditMode: PropTypes.func.isRequired,
  deleteLocation: PropTypes.func.isRequired
};

class EditCard extends React.Component {
  render () {
    const { name, x, y, i, doneEditing } = this.props;
    return <Card className='col-auto loc-card' key={i} block style={{ border:'2px solid black' }} >
      <CardTitle><Input style={{ margin: 0 }} id={'nameinput' + i} placeholder='Location name' defaultValue={name} required /></CardTitle>
      <CardText>
        <table style={{ display: 'table', width: '100%' }}>
          <tbody>
            <tr>
              <td>Latitude</td>
              <td><Input type='number' step='any' id={'latinput' + i} placeholder='Latitude' defaultValue={y} required /></td>
            </tr>
            <tr>
              <td>Longtitude</td>
              <td><Input type='number' step='any' id={'loninput' + i} placeholder='Longitude' defaultValue={x} required /></td>
            </tr>
          </tbody>
        </table>
        <Icon name='check' onClick={() => doneEditing(i)} style={{ float:'right', cursor:'pointer' }} />
      </CardText>
    </Card>;
  }
}
EditCard.propTypes = {
  name: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  i: PropTypes.number.isRequired,
  doneEditing: PropTypes.func.isRequired
};

class StaticCard extends React.Component {
  render () {
    const { name, x, y, i, setEditMode, deleteLocation } = this.props;
    return <Card className='col-auto loc-card' key={i} block>
      <CardTitle>{name}</CardTitle>
      <CardText>
        <table style={{ display: 'table', width: '100%' }}>
          <tbody>
            <tr>
              <td>Latitude</td>
              <td>{y}</td>
            </tr>
            <tr>
              <td>Longtitude</td>
              <td>{x}</td>
            </tr>
          </tbody>
        </table>
        <Icon name='pencil' onClick={() => setEditMode(i)} style={{ cursor:'pointer' }} />
        <Icon name='times' onClick={() => deleteLocation(i)} style={{ cursor:'pointer' }} />
      </CardText>
    </Card>;
  }
}
StaticCard.propTypes = {
  name: PropTypes.string,
  x: PropTypes.number,
  y: PropTypes.number,
  i: PropTypes.number.isRequired,
  setEditMode: PropTypes.func.isRequired,
  deleteLocation: PropTypes.func.isRequired
};
