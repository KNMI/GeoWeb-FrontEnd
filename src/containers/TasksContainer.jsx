import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, InputGroupButton, InputGroup, Input, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import Icon from 'react-fa';
import cloneDeep from 'lodash/cloneDeep';
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
    this.setFilter = this.setFilter.bind(this);
    this.handleClickFilter = this.handleClickFilter.bind(this);
    this.handleClickClear = this.handleClickClear.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.createSIGMET = this.createSIGMET.bind(this);
    this.state = { collapse: false };
  }

  toggle (evt) {
    this.setState({ collapse: !this.state.collapse });
    evt.preventDefault();
  }
  setFilter () {
    const filterText = document.querySelector('#task-filter').value;
    this.setState({ filter: (typeof filterText === 'string' && filterText.length > 0) ? new RegExp(filterText, 'i') : null });
  }
  handleClickFilter (evt) {
    this.setFilter();
    evt.preventDefault();
  }
  handleClickClear (evt) {
    const filterElmt = document.querySelector('#task-filter');
    filterElmt.value = '';
    evt.target.classList.remove('active');
    this.setFilter();
  }
  handleKeyPress (evt) {
    if (evt.key === 'Enter') {
      this.setFilter();
      evt.preventDefault();
    }
  }
  handleKeyUp (evt) {
    const clearElmt = document.querySelector('.search-clear');
    const hasActive = clearElmt.classList.contains('active');
    if (evt.target.value.length > 0) {
      if (!hasActive) {
        clearElmt.classList.add('active');
      }
    } else if (hasActive) {
      clearElmt.classList.remove('active');
    }
    this.setFilter();
  }
  handleFocus (evt) {
    const clearElmt = document.querySelector('.search-clear');
    clearElmt.classList.add('focus');
  }
  handleBlur (evt) {
    const clearElmt = document.querySelector('.search-clear');
    clearElmt.classList.remove('focus');
  }
  createSIGMET () {
    console.log('item hit');
  }

  render () {
    let title = <Row>
      <Button color='primary' onClick={this.toggle}>{this.state.collapse ? '«' : '»'}</Button>
      <InputGroup>
        <Input id='task-filter' className='search-input' placeholder='search term&hellip;'
          onKeyPress={this.handleKeyPress} onKeyUp={this.handleKeyUp} onFocus={this.handleFocus} onBlur={this.handleBlur} />
        <InputGroupButton className='search-clear'onClick={this.handleClickClear}>❌</InputGroupButton>
        <InputGroupButton>
          <Button className='btn-outline-info' onClick={this.handleClickFilter}>Search</Button>
        </InputGroupButton>
      </InputGroup>
    </Row>;
    const hasFilter = this.state.filter instanceof RegExp;
    console.log('hasFilter', hasFilter);
    let filteredItems = cloneDeep(items).filter(category => {
      if (hasFilter) {
        category.tasks = category.tasks.filter(item => this.state.filter.test(item.title));
        return category.tasks.length > 0 || this.state.filter.test(category.title);
      }
      return true;
    });
    return (
      <Col className='TasksContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.collapse} isHorizontal minSize={64} maxSize={300}>
          <Panel className='Panel' title={title}>
            {filteredItems.map((item, index) => <TaskCategory key={index} title={item.title} isOpen={hasFilter} notifications={item.notifications} tasks={item.tasks} />)}
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
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { collapse: props.isOpen };
  }

  toggle () {
    this.setState({ collapse: !this.state.collapse });
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ collapse: nextProps.isOpen });
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
  isOpen        : React.PropTypes.bool,
  title         : React.PropTypes.string.isRequired,
  notifications : React.PropTypes.number,
  tasks         : React.PropTypes.array.isRequired
};

export default TasksContainer;
