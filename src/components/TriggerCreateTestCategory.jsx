import React, { Component } from 'react';
import { Button, Col, Badge, Card, CardHeader, Input, InputGroup, ButtonGroup, Label } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import PropTypes from 'prop-types';
import axios from 'axios';
import { notify } from 'reapop';

class TriggerCreateTestCategory extends Component {
  constructor (props) {
    super(props);
    this.addTrigger = this.addTrigger.bind(this);
    this.getTriggerFile = this.getTriggerFile.bind(this);
    this.showTriggerMessage = this.showTriggerMessage.bind(this);
    this.setTriggerMessage = this.setTriggerMessage.bind(this);
    this.handleOnLimitChange = this.handleOnLimitChange.bind(this);
    this.handleOnSourceTypeaheadChange = this.handleOnSourceTypeaheadChange.bind(this);
    this.handleOnParameterTypeaheadChange = this.handleOnParameterTypeaheadChange.bind(this);
    this.getParameterOptions = this.getParameterOptions.bind(this);
    this.setParameterOptions = this.setParameterOptions.bind(this);
    this.setServiceURL = this.setServiceURL.bind(this);
    this.getUnit = this.getUnit.bind(this);
    this.state = {
      isOpen: props.isOpen,
      parameterOption: '',
      operatorOption: '',
      sourceOption: '',
      inputfieldLimit: '',
      unit: '',
      parameterOptions: []
    };
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  setServiceURL () {
    const { sourceOption } = this.state;
    let source = '';
    const currentdate = new Date();
    const year = currentdate.getUTCFullYear();
    let month = currentdate.getUTCMonth() + 1;
    let day = currentdate.getUTCDate();
    let hours = currentdate.getUTCHours();
    let minutes = Math.floor(currentdate.getUTCMinutes() / 10);
    if (month.toString().length < 2) {
      month = '0' + month;
    }
    if (day.toString().length < 2) {
      day = '0' + day;
    }
    if (minutes !== 0) {
      minutes = minutes - 1;
    } else {
      minutes = 5;
      hours = hours - 1;
    }
    if (hours.toString().length < 2) {
      hours = '0' + hours;
    }
    // eslint-disable-next-line eqeqeq
    if (sourceOption == 'OBS') {
      source = 'http://birdexp07.knmi.nl/geoweb/data/OBS/kmds_alle_stations_10001_' + year + month + day + hours + minutes + '0.nc';
    }
    return source;
  }

  addTrigger () {
    const triggerinfo = {
      parameter: this.state.parameterOption.toString(),
      operator: this.state.operatorOption.toString(),
      limit: this.state.inputfieldLimit,
      serviceurl: this.setServiceURL()
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggercreate',
      data: triggerinfo
    });
    // setTimeout(this.getTriggerFile, 100);
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

  handleOnLimitChange (value) {
    this.setState({ inputfieldLimit: value });
  }

  handleOnSourceTypeaheadChange (value) {
    this.setState({ sourceOption: value }, function () {
      this.getParameterOptions();
    });
  }

  handleOnParameterTypeaheadChange (value) {
    this.setState({ parameterOption: value }, function () {
      this.getUnit();
    });
  }

  getParameterOptions () {
    const serviceurl = this.setServiceURL();
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/parametersget',
      data: { serviceurl }
    }).then((res) => {
      this.setParameterOptions(res.data);
    }).catch((error) => {
      console.error(error);
    });
  }

  setParameterOptions (parameters) {
    this.setState({ parameterOptions: parameters }, function () {
      return this.state.parameterOptions;
    });
  }

  getUnit () {
    const unitInfo = {
      serviceurl: this.setServiceURL(),
      parameter: this.state.parameterOption.toString()
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/unitget',
      data: unitInfo
    }).then((res) => {
      this.setState({ unit: '(in ' + res.data.unit + ')' });
    }).catch((error) => {
      console.error(error);
    });
  }

  render () {
    const { title, icon, toggleMethod } = this.props;
    const { sourceOption, parameterOption, operatorOption, inputfieldLimit } = this.state;
    return (
      <Card className='row accordion'>
        <CardHeader onClick={toggleMethod} title={title}>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col style={{ marginLeft: '0.9rem' }}>
            {title}
          </Col>
          <Col xs='auto'>
            <Badge color='danger' pill><Icon name='plus' /></Badge>
          </Col>
        </CardHeader>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={500}>
          <Card className='row accordion'>
            <InputGroup style={{ marginTop: '0.4rem' }}>
              <Col xs='3' style={{ margin: '0.3rem', marginLeft: '0.5rem' }}>
                <Label>Source</Label>
              </Col>
              <Col style={{ margin: '0.3rem' }}>
                <Typeahead onChange={(sourceOption) => { this.handleOnSourceTypeaheadChange(sourceOption); }}
                  filterBy={(sourceOption) => {
                    if (sourceOption.length) {
                      return true;
                    }
                  }}
                  options={[ 'OBS' ]} />
              </Col>
            </InputGroup>
            <InputGroup>
              <Col xs='3' style={{ margin: '0.3rem', marginLeft: '0.5rem' }}>
                <Label>Phenomenon</Label>
              </Col>
              <Col style={{ margin: '0.3rem' }}>
                <Typeahead disabled={!sourceOption}
                  options={this.state.parameterOptions}
                  onChange={(parameterOption) => { this.handleOnParameterTypeaheadChange(parameterOption); }}
                  filterBy={(parameterOptions) => {
                    if (parameterOptions.length) {
                      return true;
                    }
                  }}
                  maxHeight='150px' />
              </Col>
            </InputGroup>
            <InputGroup>
              <Col xs='3' style={{ margin: '0.3rem', marginLeft: '0.5rem' }}>
                <Label>Operator</Label>
              </Col>
              <Col style={{ margin: '0.3rem' }}>
                <Typeahead onChange={(operatorOption) => { this.setState({ operatorOption }); }}
                  filterBy={(operatorOption) => {
                    if (operatorOption.length) {
                      return true;
                    }
                  }}
                  options={[ 'higher', 'lower' ]} />
              </Col>
            </InputGroup>
            <InputGroup>
              <Col xs='3' style={{ margin: '0.3rem', marginLeft: '0.5rem' }}>
                <Label>Limit {this.state.unit}</Label>
              </Col>
              <Col style={{ margin: '0.3rem' }}>
                <Input type='number' step='0.1' name='limit' onChange={(inputfieldLimit) => { this.setState({ inputfieldLimit: inputfieldLimit.target.value }); }} style={{ height: '34px' }} />
              </Col>
            </InputGroup>
            <ButtonGroup>
              <Button color='primary' onClick={this.addTrigger} style={{ margin: '0.7rem' }}
                disabled={sourceOption === '' || parameterOption === '' || operatorOption === '' || inputfieldLimit === ''}>Create</Button>
            </ButtonGroup>
          </Card>
        </CollapseOmni>
      </Card>);
  }
}

TriggerCreateTestCategory.propTypes = {
  dispatch      : PropTypes.func,
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func,
  urls          : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired
};

export default TriggerCreateTestCategory;
