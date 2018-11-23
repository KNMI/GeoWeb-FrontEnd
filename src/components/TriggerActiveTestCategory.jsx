import React, { Component } from 'react';
import { Col, Badge, Card, CardBody, CardHeader, CardText, Row, CardGroup } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import CollapseOmni from '../components/CollapseOmni';
import { notify } from 'reapop';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class TriggerActiveTestCategory extends Component {
  constructor (props) {
    super(props);
    this.getActiveTriggers = this.getActiveTriggers.bind(this);
    this.getTriggers = this.getTriggers.bind(this);
    this.setActiveTriggerInfo = this.setActiveTriggerInfo.bind(this);
    this.calculateActiveTriggers = this.calculateActiveTriggers.bind(this);
    this.showTriggerMessage = this.showTriggerMessage.bind(this);
    this.setTriggerMessage = this.setTriggerMessage.bind(this);
    this.setWebSocket = this.setWebSocket.bind(this);
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
    // const { setWebSocket, getActiveTriggers } = this;
    // setWebSocket();
    // getActiveTriggers();
  }

  setWebSocket () {
    const { calculateActiveTriggers, getActiveTriggers } = this;
    var stompClient = null;
    var socket = new SockJS(this.props.urls.BACKEND_SERVER_URL + '/websockettest');

    stompClient = Stomp.over(socket);
    stompClient.connect({}, function () {
      stompClient.subscribe('/topic/messages', function (message) {
        console.log(message.body);
        if (message.body === 'Notifications') {
          calculateActiveTriggers();
        }
        if (message.body === 'Active Triggers') {
          getActiveTriggers();
        }
      });
    });
  }

  getActiveTriggers () {
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/gettriggers'
    }).then((res) => {
      this.setState({ activeList: res.data });
    }).catch((error) => {
      console.error(error);
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
    // eslint-disable-next-line camelcase
    const { long_name, operator, limit, unit } = phenomenon;
    // eslint-disable-next-line camelcase
    return `${long_name} ${operator} than ${limit} ${unit}`;
  }

  calculateActiveTriggers () {
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggercalculate'
    }).then((res) => {
      for (let i = 0; i < res.data.length; i++) {
        console.log('calc', res.data[i]);
        this.showTriggerMessage(res.data[i]);
      };
    }).catch((error) => {
      console.error(error);
    });
  }

  setTriggerMessage (data) {
    let locationamount = '';
    const { locations, phenomenon } = data;
    // eslint-disable-next-line camelcase
    const { long_name, operator, limit, unit } = phenomenon;
    if (locations.length === 1) {
      locationamount = 'location';
    } else {
      locationamount = 'locations';
    }
    // eslint-disable-next-line camelcase
    return `${long_name} ${operator} than ${limit} ${unit} detected at ${locations.length} ` + locationamount;
  }

  showTriggerMessage (data) {
    console.log('show', data);
    const { dispatch } = this.props;
    dispatch(notify({
      title: data.phenomenon.long_name,
      message: this.setTriggerMessage(data),
      status: 'warning',
      image: 'https://static.wixstatic.com/media/73705d_91d9fa48770e4ed283fc30da3b178041~mv2.gif',
      position: 'bl',
      dismissAfter: 0,
      dismissible: true
    }));
  }

  render () {
    const { title, icon, toggleMethod } = this.props;
    const { activeList } = this.state;
    let triggers = this.getTriggers().sort();
    const maxSize = 500;
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
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
          <CardGroup>
            <Row>
              <Card className='row accordion'>
                {
                  triggers.map((item, index) => {
                    return (
                      <CardGroup key={index} style={{ margin: '0.3rem', width: maxSize - 35 }}>
                        <Row />
                        <Card style={{ borderColor: '#bab8b8' }}>
                          <CardBody>
                            <CardText style={{ margin: '0.5rem' }}>
                              {item}
                            </CardText>
                          </CardBody>
                        </Card>
                      </CardGroup>
                    );
                  })
                }
              </Card>
            </Row>
          </CardGroup>
        </CollapseOmni>
      </Card>);
  }
}

TriggerActiveTestCategory.propTypes = {
  dispatch      : PropTypes.func,
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func,
  urls          : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired
};

export default TriggerActiveTestCategory;
