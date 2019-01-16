import React, { Component } from 'react';
import { Button, Col, Badge, Card, CardHeader, Input, InputGroup, ButtonGroup, Label } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import Icon from 'react-fa';
import CollapseOmni from '../CollapseOmni';
import PropTypes from 'prop-types';
import axios from 'axios';

class TriggerCreateCategory extends Component {
  constructor (props) {
    super(props);
    this.addTrigger = this.addTrigger.bind(this);
    this.handleOnLimitChange = this.handleOnLimitChange.bind(this);
    this.handleOnSourceTypeaheadChange = this.handleOnSourceTypeaheadChange.bind(this);
    this.handleOnParameterTypeaheadChange = this.handleOnParameterTypeaheadChange.bind(this);
    this.getParameterOptions = this.getParameterOptions.bind(this);
    this.setParameterOptions = this.setParameterOptions.bind(this);
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

  addTrigger () {
    const triggerinfo = {
      parameter: this.state.parameterOption.toString(),
      operator: this.state.operatorOption.toString(),
      limit: this.state.inputfieldLimit,
      source: this.state.sourceOption.toString()
    };
    axios({
      method: 'post',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/triggercreate',
      data: triggerinfo
    }).then(() => {
      this.props.getActiveTriggersOnChange();
    });
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
    axios({
      method: 'get',
      url: this.props.urls.BACKEND_SERVER_URL + '/triggers/parametersget'
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

TriggerCreateCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  toggleMethod  : PropTypes.func,
  urls          : PropTypes.shape({ BACKEND_SERVER_URL:PropTypes.string }).isRequired,
  getActiveTriggersOnChange : PropTypes.func
};

export default TriggerCreateCategory;
