import React, { Component } from 'react';
import { Col, Badge, Card, CardHeader, Label } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import CollapseOmni from '../components/CollapseOmni';
import axios from 'axios';

class TriggerActiveTestCategory extends Component {
  constructor (props) {
    super(props);
    this.getActiveTriggers = this.getActiveTriggers.bind(this);
    this._getActiveTriggersTimer = this._getActiveTriggersTimer.bind(this);
    this.getTriggers = this.getTriggers.bind(this);
    this.setActiveTriggerInfo = this.setActiveTriggerInfo.bind(this);
    this.state = {
      isOpen: props.isOpen,
      activeList: []
    };
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  componentDidMount () {
    console.log('componentDidmount');
    this.getActiveTriggers();
  }

  getActiveTriggers () {
    if (this.getIntervalTimerIsRunning) {
      console.log('Timer is running');
    } else {
      this.getIntervalTimerIsRunning = true;
      console.log('Calling _getActiveTriggersTimer with getActiveTriggers');
      this._getActiveTriggersTimer();
    }
  }

  _getActiveTriggersTimer () {
    console.log('_getActiveTriggersTimer called');
    if (!this.props.urls) {
      console.log('No urls set, Skipping');
      this.getIntervalTimerIsRunning = false;
      return;
    }
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/gettriggers'
    }).then((res) => {
      this.setState({ activeList: res.data });
    }).catch((error) => {
      console.error(error);
    }).finally(() => {
      console.log('Calling _getActiveTriggersTimer with setInterval');
      setTimeout(this._getActiveTriggersTimer, 1000);
    });
  }

  getTriggers () {
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/gettriggers'
    }).then((res) => {
      for (var i = 0; i < res.data.length; i++) {
        var triggersInfo = res.data[i];
        this.setActiveTriggerInfo(triggersInfo);
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  setActiveTriggerInfo (triggersInfo) {
    const { phenomenon } = triggersInfo;
    const { long_name, operator, limit, unit } = phenomenon;
    return `${long_name} ${operator} than ${limit} ${unit}`;
  }

  render () {
    const { title, icon, toggleMethod } = this.props;
    const { activeList } = this.state;
    return (
      <Card className='row accordion'>
        <CardHeader onClick={activeList.length > 0 ? toggleMethod : null} className={activeList.length > 0 ? null : 'disabled'} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {activeList.length > 0 ? <Badge color='danger' pill>{activeList.length}</Badge> : null}
          </Col>
        </CardHeader>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={500}>
          <Card className='row accordion'>
            {this.getTriggers}
          </Card>
        </CollapseOmni>
      </Card>);
  }
}

TriggerActiveTestCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func,
  urls          : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired
};

export default TriggerActiveTestCategory;
