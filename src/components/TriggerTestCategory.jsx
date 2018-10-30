import React, { Component } from 'react';
import { Button, Col, Badge, Card, CardHeader } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import PropTypes from 'prop-types';
import axios from 'axios';
import { notify } from 'reapop';

class TriggerTestCategory extends Component {
  constructor (props) {
    super(props);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.addTrigger = this.addTrigger.bind(this);
    this.getTriggerFile = this.getTriggerFile.bind(this);
    this.showTriggerMessage = this.showTriggerMessage.bind(this);
    this.state = {
      isOpen: props.isOpen
    };
  }

  handleTriggerClick (evt, index) {
    const locations = this.props.data[index].locations;
    if (locations !== this.props.adagucProperties.triggerLocations) {
      this.props.dispatch(this.props.actions.setTriggerLocations(locations));
    } else {
      this.props.dispatch(this.props.actions.setTriggerLocations([]));
    }
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  getTitle (trigger) {
    const { parameter, operator, threshold, units } = trigger;
    return `${parameter} (${operator}${threshold} ${units})`;
  }

  addTrigger () {
    const currentdate = new Date();
    const year = currentdate.getUTCFullYear();
    const month = currentdate.getUTCMonth() + 1;
    const day = currentdate.getUTCDate();
    let hours = currentdate.getUTCHours();
    let minutes = Math.floor(currentdate.getUTCMinutes() / 10);
    if (minutes !== 0) {
      minutes = minutes - 1;
    } else {
      minutes = 5;
      hours = hours - 1;
    }
    const triggerinfo = {
      parameter: 'ta',
      operator: 'higher',
      limit: 7.5,
      serviceurl: 'http://birdexp07.knmi.nl/geoweb/data/OBS/kmds_alle_stations_10001_' + year + month + day + hours + minutes + '0.nc'
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggercreate',
      data: triggerinfo
    });
    setTimeout(this.getTriggerFile, 500);
  }

  getTriggerFile () {
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggerget'
    }).then((res) => {
      this.showTriggerMessage(res.data);
    }).catch((error) => {
      console.error(error);
    });
  }

  showTriggerMessage (data) {
    // const datajson = require(data);
    // console.log(datajson.phenomenon.long_name);
    console.log(data);
    const { dispatch } = this.props;
    dispatch(notify({
      title: 'Test',
      message: data,
      status: 'warning',
      position: 'bl',
      dismissAfter: 0,
      dismissible: true
    }));
  }

  render () {
    const data = this.props.data || [];
    const { title, icon, toggleMethod } = this.props;
    return (
      <Card className='row accordion'>
        <CardHeader onClick={data == false ? toggleMethod : null} className={data == false ? null : 'disabled'} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            {data == false ? <Badge color='danger' pill><Icon name='plus' /></Badge> : null}
          </Col>
        </CardHeader>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={500}>
          <Button color='primary' onClick={this.addTrigger}>Create</Button>
        </CollapseOmni>
      </Card>);
  }
}

TriggerTestCategory.propTypes = {
  adagucProperties: PropTypes.object,
  actions       : PropTypes.object,
  dispatch      : PropTypes.func,
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func,
  data              : PropTypes.array,
  urls              : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired
};

export default TriggerTestCategory;
