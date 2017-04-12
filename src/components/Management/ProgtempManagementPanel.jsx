import React from 'react';
import Panel from '../Panel';
import { Input, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Label } from 'reactstrap';
import { DefaultLocations } from '../../routes/ADAGUC/constants/defaultlocations';
import { ReadLocations } from '../../routes/ADAGUC/utils/admin';
export default class ProgtempManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.addAvailable = this.addAvailable.bind(this);
    this.progtempLocations = DefaultLocations;
    console.log('Start reading progtemp locs');
    ReadLocations((data) => {
      if (data) {
        this.progtempLocations = data;
        console.log('progtemlocations set');
      } else {
        console.log('get progtemlocations failed');
      }
    });
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
