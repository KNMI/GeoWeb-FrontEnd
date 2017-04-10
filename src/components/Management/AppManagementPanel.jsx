import React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class AppManagementPanel extends React.Component {
  render () {
    return (
      <Panel>
        <Row className='managementRow'>
          <Card className='col-auto loc-card' block>
            <CardTitle>Locaties</CardTitle>
            <CardText>De lijst met vaste locaties.</CardText>
            <Link to='manage/app/locations' className='row'>
              <Button>Bewerk</Button>
            </Link>
          </Card>
        </Row>
      </Panel>
    );
  }
}
