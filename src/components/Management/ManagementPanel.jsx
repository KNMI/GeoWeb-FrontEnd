
import React from 'react';
import { TabContent, TabPane, Nav, NavItem, NavLink, Card, Button, CardTitle, CardText, Row, Col } from 'reactstrap';
import classnames from 'classnames';
import { Link } from 'react-router';
import Panel from '../Panel';
export default class ManagementPanel extends React.Component {
  constructor (props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      activeTab: '1'
    };
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
      <Panel className='managementPanel'>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '1' })}
              onClick={() => { this.toggle('1'); }}
            >
              Generic management
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === '2' })}
              onClick={() => { this.toggle('2'); }}
            >
              Productmanagement
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <Row className='managementRow'>
              <Card className='col-auto loc-card' block>
                <CardTitle>Locaties</CardTitle>
                <CardText>De lijst met vaste locaties.</CardText>
                <Link to='manage/locations' className='row'>
                  <Button>Bewerk</Button>
                </Link>
              </Card>
            </Row>
          </TabPane>
          <TabPane tabId='2'>
            <Row className='managementRow'>
              <Col sm='6'>
                <Card className='col-auto loc-card' block>
                  <CardTitle>Bijvoet Diagram</CardTitle>
                  <CardText>Selecteer de locaties die beschikbaar moeten zijn voor het Bijvoetdiagram.</CardText>
                  <Link to='manage/product/progtemp' className='row'>
                    <Button>Bewerk</Button>
                  </Link>

                </Card>
              </Col>
              <Col sm='6'>
                <Card className='col-auto loc-card' block>
                  <CardTitle>SIGMET</CardTitle>
                  <CardText>Selecteer de standaardlagen en uitsnede voor het maken van een SIGMET.</CardText>
                  <Link to='manage/product/sigmet' className='row'>
                    <Button>Bewerk</Button>
                  </Link>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </Panel>
    );
  }
}
