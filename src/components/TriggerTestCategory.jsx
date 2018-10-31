import React, { Component } from 'react';
import { Button, Col, Badge, Card, CardHeader, Input, InputGroup, ButtonGroup, Label } from 'reactstrap';
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
    this.setTriggerMessage = this.setTriggerMessage.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.inputfieldParameter = '';
    this.inputfieldOperator = '';
    this.inputfieldLimit = '';
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
    if (hours.toString().length < 2) {
      hours = '0' + hours;
    }
    const triggerinfo = {
      parameter: this.inputfieldParameter,
      operator: this.inputfieldOperator,
      limit: this.inputfieldLimit,
      serviceurl: 'http://birdexp07.knmi.nl/geoweb/data/OBS/kmds_alle_stations_10001_' + year + month + day + hours + minutes + '0.nc'
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggercreate',
      data: triggerinfo
    });
    setTimeout(this.getTriggerFile, 100);
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

  setTriggerMessage (data) {
    let locationamount = '';
    const { locations, phenomenon } = data;
    const { long_name, operator, limit, unit } = phenomenon;
    if (locations.length === 1) {
      locationamount = 'location';
    } else {
      locationamount = 'locations';
    }
    return `${long_name} ${operator} than ${limit} ${unit} detected at ${locations.length} ` + locationamount;
  }

  showTriggerMessage (data) {
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

  handleOnChange (event) {
    if (event.target.name === 'parameter') {
      this.inputfieldParameter = event.target.value;
    }
    if (event.target.name === 'operator') {
      this.inputfieldOperator = event.target.value;
    }
    if (event.target.name === 'limit') {
      this.inputfieldLimit = event.target.value;
    }
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
          <Card>
            <InputGroup>
              <Col>
                <Label>Parameter</Label>
              </Col>
              <Col>
                <Input type='text' name='parameter' onChange={this.handleOnChange} />
              </Col>
            </InputGroup>
            <InputGroup>
              <Col>
                <Label>Operator</Label>
              </Col>
              <Col>
                <Input type='text' name='operator' onChange={this.handleOnChange} />
              </Col>
            </InputGroup>
            <InputGroup>
              <Col>
                <Label>Limit</Label>
              </Col>
              <Col>
                <Input type='number' step='0.1' name='limit' onChange={this.handleOnChange} />
              </Col>
            </InputGroup>
            <ButtonGroup>
              <Button color='primary' onClick={this.addTrigger}>Create</Button>
            </ButtonGroup>
          </Card>
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
