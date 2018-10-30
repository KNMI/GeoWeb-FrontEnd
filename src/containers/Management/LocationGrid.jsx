import React, { PureComponent } from 'react';
import { Input, Card, CardTitle, Row, Col, Label } from 'reactstrap';
import PropTypes from 'prop-types';

export class LocationGrid extends PureComponent {
  render () {
    return <Row className='grid'>
      {this.state.locations.sort(this.compareByName).map((loc, i) =>
        <Col xs='12' sm='6' md='4' lg='3' xl='2' key={`tafLocMan-${i}`}>
          <Card>
            <CardTitle>{loc.name}</CardTitle>
            <Row>
              <Col xs='6'>
                <Label>Latitude</Label>
              </Col>
              <Col xs='6'>
                <Label style={{ width: '100%', textAlign: 'right' }}>{loc.y}</Label>
              </Col>
            </Row>
            <Row>
              <Col xs='6'>
                <Label>Longitude</Label>
              </Col>
              <Col xs='6'>
                <Label style={{ width: '100%', textAlign: 'right' }}>{loc.x}</Label>
              </Col>
            </Row>
            <Row>
              <FormGroup check>
                <Label check>
                  <Input type='checkbox' checked={this.isLocationSelected(loc.name)} onClick={() => this.selectLocation(loc.name)} />{' '}
                  Allow TAFs for this location
                      </Label>
              </FormGroup>
            </Row>
          </Card>
        </Col>
      )}
    </Row>
  };
}
