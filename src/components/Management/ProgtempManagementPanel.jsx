import React from 'react';
import Panel from '../Panel';
import { Input, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Label } from 'reactstrap';
export default class ProgtempManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.addAvailable = this.addAvailable.bind(this);
    this.progtempLocations = [
      {
        name: 'EHAM',
        x: 4.77,
        y: 52.30,
        availability: []
      }, {
        name: 'EHRD',
        x: 4.42,
        y: 51.95,
        availability: []
      }, {
        name: 'EHTW',
        x: 6.98,
        y: 52.28,
        availability: []
      }, {
        name: 'EHBK',
        x: 5.76,
        y: 50.95,
        availability: []
      }, {
        name: 'EHFS',
        x: 3.68,
        y: 51.46,
        availability: []
      }, {
        name: 'EHDB',
        x: 5.18,
        y: 52.12,
        availability: []
      }, {
        name: 'EHGG',
        x: 6.57,
        y: 53.10,
        availability: []
      }, {
        name: 'EHKD',
        x: 4.74,
        y: 52.93,
        availability: []
      }, {
        name: 'EHAK',
        x: 3.81,
        y: 55.399,
        availability: []
      }, {
        name: 'EHDV',
        x: 2.28,
        y: 53.36,
        availability: []
      }, {
        name: 'EHFZ',
        x: 3.94,
        y: 54.12,
        availability: []
      }, {
        name: 'EHFD',
        x: 4.67,
        y: 54.83,
        availability: []
      }, {
        name: 'EHHW',
        x: 6.04,
        y: 52.037,
        availability: []
      }, {
        name: 'EHKV',
        x: 3.68,
        y: 53.23,
        availability: []
      }, {
        name: 'EHMG',
        x: 4.93,
        y: 53.63,
        availability: []
      }, {
        name: 'EHMA',
        x: 5.94,
        y: 53.54,
        availability: []
      }, {
        name: 'EHQE',
        x: 4.15,
        y: 52.92,
        availability: []
      }, {
        name: 'EHPG',
        x: 3.3416,
        y: 52.36,
        availability: []
      }
    ];
  }
  componentWillMount () {
    this.setState({ locations: this.progtempLocations });
  }
  componentWillReceiveProps (nextprops) {
    this.setState({ locations: nextprops.locations });
  }
  addAvailable (i) {
    let listCpy = this.state.locations.map((a) => Object.assign(a));
    listCpy[i].availability.push('progtemp');
    this.setState({ locations: listCpy });
  }
  render () {
    return (
      <Panel style={{ overflowX: 'hidden', overflowY: 'auto' }}>
        <Row style={{ flex: 1 }}>
          {this.state.locations.map((loc, i) =>
            <Card className='col-auto loc-card' key={i} block>
              <CardTitle>{loc.name}</CardTitle>
              <CardText>
                <table style={{ display: 'table', width: '100%' }}>
                  <tbody>
                    <tr>
                      <td>Latitude</td>
                      <td>{loc.y}</td>
                    </tr>
                    <tr>
                      <td>Longtitude</td>
                      <td>{loc.x}</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                <FormGroup check>
                  <Label check>
                    <Input type='checkbox' checked={this.state.locations[i].availability.find((e) => e === 'progtemp')} onClick={() => this.addAvailable(i)} />{' '}
                    Beschikbaar voor bijvoet diagram
                  </Label>
                </FormGroup>
              </CardText>
            </Card>
          )}
        </Row>
        <Row style={{ bottom: '1rem', position: 'fixed' }}>
          <Col>
            <Button color='primary'>Save</Button>
          </Col>
        </Row>

      </Panel>
    );
  }
}
