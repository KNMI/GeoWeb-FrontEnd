import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, InputGroupButton, InputGroup, Input, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import { Link } from 'react-router';
import Icon from 'react-fa';
import cloneDeep from 'lodash/cloneDeep';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';

const items = [
  {
    title: 'Checklist shift',
    notifications: 3,
    icon: 'calendar-check-o',
    link: 'checklist',
    tasks: [
      {
        title: 'Basis forecast',
        eta: '09:00'
      },
      {
        title: 'Guidance',
        eta: '09:10'
      },
      {
        title: 'General Transfer',
        eta: '14:30'
      },
      {
        title: 'Safety Shift Transfer',
        eta: '15:00'
      },
      {
        title: 'Shift Report',
        eta: '15:15'
      }
    ]
  },
  {
    title: 'Products',
    icon: 'gift',
    link: 'products',
    tasks: [
      { title: 'Today\'s all shift products' },
      { title: 'Shared products' },
      { title: 'Warnings' },
      {
        title: 'SIGMETs',
        notifications: 4,
        link: 'products/sigmets'
      },
      { title: 'Forecasts' },
      { title: 'Analyses' }
    ]
  },
  {
    title: 'Reports & Logs',
    icon: 'file-text-o',
    link: 'reports_and_logs',
    tasks: [
      { title: 'Shift report' },
      { title: 'Telephone records' }
    ]
  },
  {
    title: 'Monitoring & Triggers',
    icon: 'bell-o',
    link: 'monitoring_and_triggers',
    tasks: [
      { title: 'Extremes' },
      { title: 'Alarms' }
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
    this.state = { isOpen: false };
  }

  toggle (evt) {
    this.setState({ isOpen: !this.state.isOpen });
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
  handleClickClear () {
    const filterElmt = document.querySelector('#task-filter');
    const clearElmt = document.querySelector('.search-clear');
    filterElmt.value = '';
    clearElmt.classList.remove('active');
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
  handleFocus () {
    const clearElmt = document.querySelector('.search-clear');
    clearElmt.classList.add('focus');
  }
  handleBlur () {
    const clearElmt = document.querySelector('.search-clear');
    clearElmt.classList.remove('focus');
  }

  render () {
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand '}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
      {this.state.isOpen ? <InputGroup>
        <Input id='task-filter' className='search-input' placeholder='search term&hellip;'
          onKeyPress={this.handleKeyPress} onKeyUp={this.handleKeyUp} onFocus={this.handleFocus} onBlur={this.handleBlur} />
        <InputGroupButton className='search-clear'onClick={this.handleClickClear}>
          <Icon name='times' />
        </InputGroupButton>
        <InputGroupButton>
          <Button outline color='info' onClick={this.handleClickFilter}>Search</Button>
        </InputGroupButton>
      </InputGroup> : ''}
    </Row>;
    const hasFilter = this.state.filter instanceof RegExp;
    let filteredItems = cloneDeep(items).filter(category => {
      if (hasFilter) {
        category.tasks = category.tasks.filter(item => this.state.filter.test(item.title));
        return category.tasks.length > 0 || this.state.filter.test(category.title);
      }
      return true;
    });
    return (
      <Col className='TasksContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={300}>
          <Panel className='Panel' title={title}>
            {filteredItems.map((item, index) =>
              <TaskCategory key={index} title={item.title} isOpen={this.state.isOpen && hasFilter} parentCollapsed={!this.state.isOpen}
                icon={item.icon} notifications={item.notifications} link={item.link} tasks={item.tasks} />)
              }
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TasksContainer.propTypes = {
  title: PropTypes.string
};

class TaskCategory extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { isOpen: props.isOpen };
  }

  toggle () {
    this.setState({ isOpen: !this.state.isOpen });
  }

  componentWillReceiveProps (nextProps) {
    this.setState({ isOpen: nextProps.isOpen });
  }

  render () {
    const { title, notifications, tasks, icon, link, parentCollapsed } = this.props;
    return (
      <Card className='row accordion'>
        {parentCollapsed ? <Link to={link}><CardHeader title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>&nbsp;</Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill className='collapsed'>{notifications}</Badge> : null}
          </Col>
        </CardHeader></Link>
        : <CardHeader onClick={this.toggle} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
          </Col>
          <Col xs='auto'>
            <Link to={link} className='row'>
              <Button outline color='info' disabled={typeof link === 'undefined'}>
                <Icon name='caret-right' />
              </Button>
            </Link>
          </Col>
        </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={40 * tasks.length}>
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                {tasks.map((item, i) =>
                  <Button tag='button' className='row' key={i} disabled={!item.link} >
                    <Link to={item.link} className='row'>
                      <Col xs='auto' style={{ paddingRight: '0.4rem' }}>
                        {item.eta}
                      </Col>
                      <Col>
                        {item.title}
                      </Col>
                      <Col xs='auto'>
                        {item.notifications > 0 ? <Badge pill color='danger'>{item.notifications}</Badge> : null}
                      </Col>
                      <Col xs='auto'>
                        <Icon name='caret-right' className='icon' />
                      </Col>
                    </Link>
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
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  notifications : PropTypes.number,
  icon          : PropTypes.string,
  link          : PropTypes.string,
  tasks         : PropTypes.array.isRequired,
  parentCollapsed : PropTypes.bool
};

export default TasksContainer;
