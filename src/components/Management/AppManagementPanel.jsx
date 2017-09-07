import React from 'react';
import { Card, Button, CardTitle, CardText, Row } from 'reactstrap';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class AppManagementPanel extends React.Component {
  render () {
    return (
      <Panel>
        <Row className='managementRow'>
          <Card className='col-auto loc-card' block>
            <CardTitle>Locations</CardTitle>
            <CardText>Edit the list of available locations</CardText>
            <Link to='manage/app/locations' className='row'>
              <Button>Edit</Button>
            </Link>
          </Card>
        </Row>
      </Panel>
    );
  }
}
