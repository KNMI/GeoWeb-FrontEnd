import React, { Component } from 'react';
import { Button, ButtonGroup, Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
var moment = require('moment');
export default class TriggerItems extends Component {
  constructor () {
    super();
    this.state = {
      isOpen: true
    };
  }

  getReadablePhenomenon (phenomenon) {
    switch (phenomenon) {
      case 't2m':
        return 'Temperature (at 2m)';
      default:
        return '';
    }
  }

  renderTrigger (triggername, issuedate) {
    let retStr;
    if (triggername.includes('obs')) {
      retStr = 'Observation ' + triggername.slice(3) + 'degrees at ' + moment(issuedate).format('LT');
    }
    return retStr;
  }
  render () {
    const { title, icon, notifications, triggers, discardedTriggers, discardTrigger } = this.props;
    return (
      <Card className='row accordion'>
        <CardHeader title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
          </Col>
        </CardHeader>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen}>
          <CardBlock>
            <Row style={{ flex: 1 }}>
              {triggers.filter((trigger) => !discardedTriggers.includes(trigger.uuid)).map((trigger, idx) => {
                const { phenomenon, triggername, uuid, issuedate } = trigger;
                return (
                  <Row key={idx} style={{ flex: 1 }}>
                    <Col>
                      {this.getReadablePhenomenon(phenomenon)}
                    </Col>
                    <Col>
                      {this.renderTrigger(triggername, issuedate)}
                    </Col>
                    <Col>
                      <Icon name='check' onClick={() => discardTrigger(uuid)} />
                    </Col>
                  </Row>);
              })
              }
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>);
  }
}
