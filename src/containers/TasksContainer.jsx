import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Form, InputGroupButton, InputGroup, Input, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';

const items = [
  {
    title: 'Checklist shift',
    notifications: 3,
    tasks: [
      { title: 'Basis forecast' },
      { title: 'Guidance Model interpretation' },
      { title: 'General Transfer' },
      { title: 'Safety Shift Transfer' },
      { title: 'Shift Report' }
    ]
  },
  {
    title: 'Products',
    tasks: [
      { title: 'Today\'s all shift products' },
      { title: 'Shared products' },
      { title: 'Warnings' },
      {
        title: 'Create SIGMET',
        notifications: 4,
        action: this.createSIGMET
      },
      { title: 'Forecasts' },
      { title: 'Analyses' }
    ]
  },
  {
    title: 'Reports & Logs',
    tasks: [
      { title: 'Shift report' }
    ]
  },
  {
    title: 'Monitoring & Triggers',
    tasks: [
      { title: 'Extremes' }
    ]
  }
];

class TasksContainer extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.filter = this.filter.bind(this);
    this.state = { collapse: false, filter: undefined };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse, filter: this.state.filter });
  }
  filter () {
    const filter = new RegExp(document.querySelector('.filter').value, 'i');
    console.log('filter', document.querySelector('.filter').value);
    this.setState({ collapse: this.state.collapse, filter: filter });
  }

  render () {
    let title = <Form inline>
      <Button color='primary' onClick={this.toggle}>{this.state.collapse ? '«' : '»'}</Button>
      <InputGroup>
        <Input className='filter' placeholder='search term&hellip;' />
        <InputGroupButton>
          <Button className='btn-outline-info' onClick={this.filter}>Search</Button>
        </InputGroupButton>
      </InputGroup>
    </Form>;
    return (
      <Col className='TasksContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.collapse} isHorizontal minSize={64} maxSize={300}>
          <Panel className='Panel' title={title}>
            {items.filter(item => this.state.filter ? this.state.filter.test(item.title) : true)
              .map((item, index) => <TaskCategory key={index} title={item.title} notifications={item.notifications} tasks={item.tasks} />)}
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TasksContainer.propTypes = {
  title: PropTypes.string
};

class TaskCategory extends React.Component {
  constructor () {
    super();
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: false };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  render () {
    const { title, notifications, tasks } = this.props;
    return (
      <Card className='row accordion'>
        <CardHeader onClick={this.toggle}>
          {title}
          {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
        </CardHeader>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.collapse} minSize={0} maxSize={40 * tasks.length}>
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                {tasks.map((item, i) =>
                  <Button id='submenuitem' className='justify-content-between' tag='button' key={i} onClick={item.action} >
                    {item.title}
                    <span>{item.notifications > 0 ? <Badge color='danger' pill>{item.notifications}</Badge> : null}
                      {<Icon name='caret-right' />}</span>
                  </Button>)}
              </Col>
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>
    );
  }
}

TaskCategory.propTypes = {
  title         : React.PropTypes.string.isRequired,
  notifications : React.PropTypes.number,
  tasks         : React.PropTypes.array.isRequired
};

export default TasksContainer;
