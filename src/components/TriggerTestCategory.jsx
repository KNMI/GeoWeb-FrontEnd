import React, { Component } from 'react';
import { Button, Col, Badge, Card, CardHeader } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import PropTypes from 'prop-types';
import axios from 'axios';

class TriggerTestCategory extends Component {
  constructor (props) {
    super(props);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.setPreset = this.setPreset.bind(this);
    this.addTrigger = this.addTrigger.bind(this);
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

  setPreset (presetName) {
    axios.get(BACKEND_SERVER_URL + '/preset/getpreset?name=' + presetName, { withCredentials: true }).then((res) => {
      this.props.dispatch(this.props.actions.setPreset(res.data));
    }).catch((error) => {
      console.error(error);
    });
  }

  addTrigger(){
    const currentdate = new Date();
    const year = currentdate.getUTCFullYear();
    const month = currentdate.getUTCMonth() + 1;
    const day = currentdate.getUTCDate();
    const hours = currentdate.getUTCHours();
    let minutes = Math.floor(currentdate.getUTCMinutes() / 10);
    if (minutes != 0){
      minutes = minutes - 1;
    }
    else{
      minutes = 5;
    }
    console.log('Date: ', year, '-', month, '-', day, '|| Time: ', hours, ':', minutes);
    const dataseturl = 'http://birdexp07.knmi.nl/geoweb/data/OBS/kmds_alle_stations_10001_'+ year + month + day + hours + minutes + '0.nc';
    const triggerinfo = {
      parameter: 'ta',
      operator: 'higher',
      limit: 7.5,
      serviceurl: dataseturl
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggertest',
      data: triggerinfo
    }).then((res) => {
      this.props.dispatch(this.props.actions.setPreset(res.data));
    }).catch((error) => {
      console.error(error);
    });
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
  selectedIndex : PropTypes.number,
  toggleMethod  : PropTypes.func,
  parentCollapsed   : PropTypes.bool,
  data              : PropTypes.array,
  urls              : PropTypes.shape({BACKEND_SERVER_URL:PropTypes.string}).isRequired
};

export default TriggerTestCategory;
