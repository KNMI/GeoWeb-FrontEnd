import React, { Component } from 'react';
import { Col, Badge, Card, CardHeader, Label, Button, Row, CardBlock } from 'reactstrap';
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
      setTimeout(this._getActiveTriggersTimer, 10000);
    });
  }

  getTriggers () {
    let infoList = [];
    if (!this.state.activeList || this.state.activeList.length < 1) {
      return infoList;
    }
    for (var i = 0; i < this.state.activeList.length; i++) {
      var triggersInfo = this.state.activeList[i];
      infoList.push(this.setActiveTriggerInfo(triggersInfo));
    }
    return infoList;
  }

  setActiveTriggerInfo (triggersInfo) {
    const { phenomenon } = triggersInfo;
    const { long_name, operator, limit, unit } = phenomenon;
    return `${long_name} ${operator} than ${limit} ${unit}`;
  }

  render () {
    const { title, icon, toggleMethod } = this.props;
    const { activeList } = this.state;
    let triggers = this.getTriggers();
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
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                <Card className='row accordion'>
                  {

                    triggers.map((item, index) => {
                      return (
                        <Button key={index} onClick={() => { console.log(item); }}>
                          <Row>
                            <Col>
                              <Label>{item}</Label>
                            </Col>
                          </Row>
                        </Button>
                      );
                    })
                  }
                </Card>
              </Col>
            </Row>
          </CardBlock>
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
