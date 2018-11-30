import React, { Component } from 'react';
import { Col, Badge, Card, CardBody, CardHeader, CardText, Row, CardGroup } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import CollapseOmni from '../CollapseOmni';
import axios from 'axios';

class TriggerActiveCategory extends Component {
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
    this.getActiveTriggers();
  }

  getActiveTriggers () {
    if (this.getIntervalTimerIsRunning) {
    } else {
      this.getIntervalTimerIsRunning = true;
      this._getActiveTriggersTimer();
    }
  }

  _getActiveTriggersTimer () {
    if (!this.props.urls) {
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
      setTimeout(this._getActiveTriggersTimer, 60000);
    });
  }

  getTriggers () {
    let infoList = [];
    if (!this.state.activeList || this.state.activeList.length < 1) {
      return infoList;
    }
    for (let i = 0; i < this.state.activeList.length; i++) {
      const triggersInfo = this.state.activeList[i];
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

TriggerActiveCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func,
  urls          : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired
};

export default TriggerActiveCategory;
