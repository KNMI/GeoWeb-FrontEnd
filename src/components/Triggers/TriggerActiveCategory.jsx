import React, { Component } from 'react';
import { Col, Badge, Button, Card, CardBody, CardHeader, CardText, Row, CardGroup } from 'reactstrap';
import Icon from 'react-fa';
import PropTypes from 'prop-types';
import CollapseOmni from '../CollapseOmni';
import axios from 'axios';

class TriggerActiveCategory extends Component {
  constructor (props) {
    super(props);
    this.getTriggers = this.getTriggers.bind(this);
    this.setActiveTriggerInfo = this.setActiveTriggerInfo.bind(this);
    this.deleteTrigger = this.deleteTrigger.bind(this);
    this.state = {
      isOpen: props.isOpen
    };
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  getTriggers () {
    let infoList = [];
    if (!this.props.activeTriggersList || this.props.activeTriggersList.length < 1) {
      return infoList;
    }
    for (let i = 0; i < this.props.activeTriggersList.length; i++) {
      const triggersInfo = this.props.activeTriggersList[i];
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

  deleteTrigger (trigger) {
    const triggerinfo = {
      uuid: this.props.activeTriggersList[trigger].phenomenon.UUID.toString()
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggerdelete',
      data: triggerinfo
    }).then(() => {
      this.props.getActiveTriggersOnChange();
    });
  }

  render () {
    const { title, icon, toggleMethod, activeTriggersList } = this.props;
    let triggers = this.getTriggers();
    const maxSize = 500;
    return (
      <Card className='row accordion'>
        <CardHeader onClick={activeTriggersList.length > 0 ? toggleMethod : null} className={activeTriggersList.length > 0 ? null : 'disabled'} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {activeTriggersList.length > 0 ? <Badge color='danger' pill>{activeTriggersList.length}</Badge> : null}
          </Col>
        </CardHeader>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize * triggers.length}>
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
                            <Button onClick={() => this.deleteTrigger(index)} style={{ border: '0rem', margin: '0.5rem', background: 'transparent' }}>
                              <Icon name={'times'} style={{ color: '#017daf' }} /></Button>
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
  urls          : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired,
  activeTriggersList  : PropTypes.array,
  getActiveTriggersOnChange : PropTypes.func
};

export default TriggerActiveCategory;
