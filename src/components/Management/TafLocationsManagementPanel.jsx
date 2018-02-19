import React from 'react';
import Panel from '../Panel';
import { Input, Card, Button, CardTitle, CardText, Row, Col, FormGroup, Label } from 'reactstrap';
import { DefaultLocations } from '../../constants/defaultlocations';
import { ReadLocations } from '../../utils/admin';
import PropTypes from 'prop-types';

class TafLocationsManagementPanel extends React.Component {
  constructor (props) {
    super(props);
    this.addAvailable = this.addAvailable.bind(this);
    this.tafLocations = DefaultLocations;
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
      if (data) {
        this.tafLocations = data;
        this.setState({ locations: data });
      } else {
        console.error('get taflocations failed');
      }
    });
  }
  componentWillMount () {
    this.setState({ locations: this.tafLocations });
  }
  componentWillReceiveProps (nextprops) {
    this.setState({ locations: nextprops.locations });
  }
  addAvailable (i) {
    let listCpy = this.state.locations.map((a) => Object.assign(a));
    listCpy[i].availability.push('taf');
    this.setState({ locations: listCpy });
  }
  render () {
    if (!this.state.locations) {
      return null;
    }
    return (
      <Panel className='TafLocationManagementPanel'>
        <Row style={{ flex: 1 }}>
          {this.state.locations.map((loc, i) =>
            <Card className='col-auto loc-card' key={i} block>
              <CardTitle>{loc.name}</CardTitle>
              <CardText>
                <Row style={{ display: 'flex' }}>
                  <Col xs='4'>
                    <Label>Latitude</Label>
                  </Col>
                  <Col xs='4'>
                    <Label style={{ width: '100%', textAlign: 'right' }}>{loc.y}</Label>
                  </Col>
                </Row>
                <Row style={{ display: 'flex' }}>
                  <Col xs='4'>
                    <Label>Longitude</Label>
                  </Col>
                  <Col xs='4'>
                    <Label style={{ width: '100%', textAlign: 'right' }}>{loc.x}</Label>
                  </Col>
                </Row>
                <FormGroup check>
                  <Label check>
                    <Input type='checkbox' checked={this.state.locations[i].availability.find((e) => e === 'taf')} onClick={() => this.addAvailable(i)} />{' '}
                    Allow TAFs for this location
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

TafLocationsManagementPanel.propTypes = {
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};
export default TafLocationsManagementPanel;
