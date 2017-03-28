
import React from 'react';
import Panel from '../Panel';
import { Input, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import { Icon } from 'react-fa';
export default class LocationManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.progtempLocations = [
      {
        name: 'EHAM',
        x: 4.77,
        y: 52.30
      }, {
        name: 'EHRD',
        x: 4.42,
        y: 51.95
      }, {
        name: 'EHTW',
        x: 6.98,
        y: 52.28
      }, {
        name: 'EHBK',
        x: 5.76,
        y: 50.95
      }, {
        name: 'EHFS',
        x: 3.68,
        y: 51.46
      }, {
        name: 'EHDB',
        x: 5.18,
        y: 52.12
      }, {
        name: 'EHGG',
        x: 6.57,
        y: 53.10
      }, {
        name: 'EHKD',
        x: 4.74,
        y: 52.93
      }, {
        name: 'EHAK',
        x: 3.81,
        y: 55.399
      }, {
        name: 'EHDV',
        x: 2.28,
        y: 53.36
      }, {
        name: 'EHFZ',
        x: 3.94,
        y: 54.12
      }, {
        name: 'EHFD',
        x: 4.67,
        y: 54.83
      }, {
        name: 'EHHW',
        x: 6.04,
        y: 52.037
      }, {
        name: 'EHKV',
        x: 3.68,
        y: 53.23
      }, {
        name: 'EHMG',
        x: 4.93,
        y: 53.63
      }, {
        name: 'EHMA',
        x: 5.94,
        y: 53.54
      }, {
        name: 'EHQE',
        x: 4.15,
        y: 52.92
      }, {
        name: 'EHPG',
        x: 3.3416,
        y: 52.36
      }
    ];
  }

  toggle (tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }
  render () {
    return (
      <LocationMapper locations={this.progtempLocations} />
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
  }
  deleteLocation (i) {
    let arrayCpy = this.state.locations.map((a) => Object.assign(a));
    arrayCpy.splice(i, 1);
    this.setState({ locations: arrayCpy });
  }
  doneEditing (i) {
    const newName = document.querySelector('#nameinput' + i).value;
    const newLat = document.querySelector('#latinput' + i).value;
    const newLon = document.querySelector('#loninput' + i).value;
    let arrayCpy = this.state.locations.map((a) => Object.assign(a));
    arrayCpy[i].name = newName;
    arrayCpy[i].x = parseFloat(newLon);
    arrayCpy[i].y = parseFloat(newLat);
    arrayCpy[i].edit = false;
    this.setState({ locations: arrayCpy });
  }
  setEditMode (i) {
    let arrayCpy = this.state.locations.map((a) => Object.assign(a));
    arrayCpy[i].edit = true;
    this.setState({ locations: arrayCpy });
  }
  addCard () {
    let arrayCpy = this.state.locations.map((a) => Object.assign(a));
    arrayCpy.push({ edit: true });
    this.setState({ locations: arrayCpy });
  }
  componentWillMount () {
    this.setState({ locations: this.props.locations });
  }
  componentWillReceiveProps (nextprops) {
    this.setState({ locations: nextprops.locations });
  }
  render () {
    return (
      <Panel style={{ overflowX: 'hidden', overflowY: 'auto' }}>
        <Row style={{ flex: 1 }}>
          {this.state.locations.map((loc, i) =>
            <LocationCard key={i} edit={loc.edit} name={loc.name} x={loc.x} y={loc.y} i={i} doneEditing={this.doneEditing} setEditMode={this.setEditMode} deleteLocation={this.deleteLocation} />
          )}
        </Row>
        <Row style={{ bottom: '1rem', position: 'fixed' }}>
          <Col>
            <Button color='primary' style={{ marginRight: '1rem' }}>Save</Button>
            <Button color='primary' onClick={this.addCard}>Add</Button>
          </Col>
        </Row>
      </Panel>
    );
  }
}
LocationMapper.propTypes = {
  locations: React.PropTypes.array.isRequired
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
  name: React.PropTypes.string.isRequired,
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired,
  i: React.PropTypes.number.isRequired,
  edit: React.PropTypes.bool,
  doneEditing: React.PropTypes.func.isRequired,
  setEditMode: React.PropTypes.func.isRequired,
  deleteLocation: React.PropTypes.func.isRequired
};

class EditCard extends React.Component {
  render () {
    const { name, x, y, i, doneEditing } = this.props;
    return <Card className='col-auto loc-card' key={i} block>
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
        <Icon name='check' onClick={() => doneEditing(i)} />
      </CardText>
    </Card>;
  }
}
EditCard.propTypes = {
  name: React.PropTypes.string.isRequired,
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired,
  i: React.PropTypes.number.isRequired,
  doneEditing: React.PropTypes.func.isRequired
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
        <Icon name='pencil' onClick={() => setEditMode(i)} />
        <Icon name='times' onClick={() => deleteLocation(i)} />
      </CardText>
    </Card>;
  }
}
StaticCard.propTypes = {
  name: React.PropTypes.string.isRequired,
  x: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired,
  i: React.PropTypes.number.isRequired,
  setEditMode: React.PropTypes.func.isRequired,
  deleteLocation: React.PropTypes.func.isRequired
};
