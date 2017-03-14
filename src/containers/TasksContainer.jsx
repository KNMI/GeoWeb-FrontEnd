import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Form, InputGroupButton, InputGroup, Input, ListGroup, ListGroupItem, Badge, Collapse,
  Card, CardHeader, CardBlock } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';

class TasksContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  render () {
    const items = [
      {
        title: 'Checklist shift',
        notification: 3,
        subItems: [
          { title: 'Basis forecast' },
          { title: 'Guidance Model interpretation' },
          { title: 'General Transfer' },
          { title: 'Safety Shift Transfer' },
          { title: 'Shift Report' }
        ]
      },
      {
        title: 'Products',
        subItems: [
          { title: 'Today\'s all shift products' },
          { title: 'Shared products' },
          { title: 'Warnings' },
          {
            title: 'Create SIGMET',
            notificationCount: 4,
            action: this.createSIGMET
          },
          { title: 'Forecasts' },
          { title: 'Analyses' }
        ]
      },
      {
        title: 'Reports & Logs',
        subItems: [
          { title: 'Shift report' }
        ]
      },
      {
        title: 'Monitoring & Triggers',
        subItems: [
          { title: 'Extremes' }
        ]
      }
    ];

    let title = <Form inline>
      <Button color='primary' onClick={this.toggle}>{this.state.collapse ? '«' : '»'}</Button>
      <InputGroup>
        <Input placeholder='search term' />
        <InputGroupButton>
          <Button className='btn-outline-info'>Search</Button>
        </InputGroupButton>
      </InputGroup>
    </Form>;
    return (
      <Col className='TasksContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.collapse} isHorizontal minSize={64} maxSize={300}>
          <Panel className='Panel' title={title}>
            {items.map((item, index) => <MenuItem key={index} title={item.title} notification={item.notification} subitems={item.subItems} />)}
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TasksContainer.propTypes = {
  title: PropTypes.string
};

class MenuItem extends React.Component {
  constructor () {
    super();
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  render () {
    const { title, notification, subitems } = this.props;
    const numNotifications = parseInt(notification);
    return (
      <ListGroup style={{ margin: '2px', width: '100%' }} className='row'>
        <ListGroupItem id='menuitem' onClick={this.toggle} className='justify-content-between row' active>{title}
          {numNotifications > 0 ? <Badge color='danger' pill>{numNotifications}</Badge> : null}</ListGroupItem>
        <Collapse isOpen={this.state.collapse} className='row'>
          <Card>
            <CardBlock>
              <ListGroup>
                {subitems.map((subitemobj, i) =>
                  <ListGroupItem id='submenuitem' className='justify-content-between' tag='button' key={i} onClick={subitemobj.action} >{subitemobj.title}
                    <span>{subitemobj.notificationCount > 0 ? <Badge color='danger' pill>{subitemobj.notificationCount}</Badge> : null}
                      {<Icon name='caret-right' />}</span>
                  </ListGroupItem>)}
              </ListGroup>
            </CardBlock>
          </Card>
        </Collapse>
      </ListGroup>
    );
  }
}

MenuItem.propTypes = {
  title         : React.PropTypes.string,
  notification  : React.PropTypes.number,
  subitems      : React.PropTypes.array.isRequired
};

export default TasksContainer;
