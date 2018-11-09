import React, { Component } from 'react';
import { Button, Col, Row, InputGroupAddon, InputGroup, Input, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import { Link } from 'react-router';
import Icon from 'react-fa';
import cloneDeep from 'lodash.clonedeep';
import CollapseOmni from '../components/CollapseOmni';
import Panel from '../components/Panel';
import PropTypes from 'prop-types';
import { CheckIfUserHasRole } from '../utils/user';
const items = [
  {
    title: 'Checklist shift',
    notifications: 3,
    icon: 'calendar-check-o',
    // link: 'checklist',
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
        title: 'Make EHAM TAF',
        eta: '13:00',
        link: 'products/tafs'
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
    tasks: [
      { title: 'Today\'s all shift products' },
      { title: 'Shared products' },
      { title: 'Warnings' },
      {
        title: 'SIGMETs',
        link: 'products/sigmets'
      },
      {
        title: 'TAFs',
        link: 'products/tafs'
      },
      { title: 'Forecasts' },
      { title: 'Analyses' }
    ]
  },
  {
    title: 'Reports & Logs',
    icon: 'file-text-o',
    // link: 'reports_and_logs',
    tasks: [
      { title: 'Shift report' },
      { title: 'Telephone records' }
    ]
  },
  {
    title: 'Monitoring & Triggers',
    icon: 'bell-o',
    // link: 'monitoring_and_triggers',
    tasks: [
      { title: 'Extremes' },
      { title: 'Alarms' }
    ]
  },
  {
    title: 'Triggers',
    icon: 'warning',
    link: 'triggers_test',
    tasks: [
      {
        title: 'Create Trigger',
        link: 'triggers_test/trigger_create'
      },
      {
        title: 'Active Triggers',
        link: 'triggers_test/trigger_active'
      },
      {
        title: 'Inactive Triggers',
        link: 'triggers_test/trigger_inactive'
      }
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

  setNotifications (list, linkName, notificationCount) {
    const newItems = cloneDeep(list).map((item) => {
      if (item.link === linkName) {
        item.notifications = notificationCount;
      }
      return item;
    });
    return newItems;
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.state !== nextState ||
           this.props.user !== nextProps.user;
  }

  render () {
    const { user, isOpen : isOpenProp, openCategory } = this.props;
    if (user && (!user.isLoggedIn || !CheckIfUserHasRole(user, 'MET'))) {
      return null;
    }

    const isOpen = isOpenProp === true || this.state.isOpen === true;
    const hasFilter = this.state.filter instanceof RegExp;
    const triggers = this.props.recentTriggers || [];
    let title = <Row>
      {typeof openCategory !== 'string' || openCategory.length === 0
        ? <Button color='primary' onClick={this.toggle} title={isOpen ? 'Collapse panel' : 'Expand '}>
          <Icon name={isOpen ? 'angle-double-left' : 'angle-double-right'} />
        </Button>
        : null
      }
      {isOpen ? <InputGroup>
        <Input id='task-filter' className='search-input' placeholder='search term&hellip;'
          onKeyPress={this.handleKeyPress} onKeyUp={this.handleKeyUp} onFocus={this.handleFocus} onBlur={this.handleBlur} />
        <InputGroupAddon addonType='append'>
          <Button className='search-clear'onClick={this.handleClickClear} disabled={!hasFilter}>
            <span>×</span>
          </Button>
        </InputGroupAddon>
        <InputGroupAddon addonType='append'>
          <Button outline color='info' onClick={this.handleClickFilter}>Search</Button>
        </InputGroupAddon>
      </InputGroup> : ''}
    </Row>;
    let filteredItems = cloneDeep(items).filter(category => {
      if (hasFilter) {
        category.tasks = category.tasks.filter(item => this.state.filter.test(item.title));
        return category.tasks.length > 0 || this.state.filter.test(category.title);
      }
      return true;
    });
    const notifiedItems = this.setNotifications(filteredItems, 'monitoring_and_triggers', triggers.filter((trigger) => !trigger.discarded).length);
    return (
      <Col className='TasksContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={isOpen} isHorizontal minSize={64} maxSize={300}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper'>
              {notifiedItems.map((item, index) => {
                return <TaskCategory key={index} title={item.title} isOpen={isOpen && (hasFilter || item.title === openCategory)} parentCollapsed={!isOpen}
                  icon={item.icon} notifications={item.notifications} link={item.link} tasks={item.tasks} />;
              }
              )}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TasksContainer.propTypes = {
  recentTriggers: PropTypes.array,
  user: PropTypes.object,
  isOpen: PropTypes.bool,
  openCategory: PropTypes.string
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
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
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
          </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={40 * tasks.length}>
          <CardBody>
            <Row>
              <Col className='btn-group-vertical'>
                {tasks.map((item, i) =>
                  <Button tag={Link} to={item.link} className='row' key={i} disabled={!item.link} >
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
                  </Button>
                )}
              </Col>
            </Row>
          </CardBody>
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
