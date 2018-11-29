import React, { Component } from 'react';
import { Button, Col, Row, Badge, Card, CardHeader, CardBody } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import Icon from 'react-fa';
import CollapseOmni from '../CollapseOmni';
import PropTypes from 'prop-types';
import axios from 'axios';
const DATE_TIME_FORMAT = 'YYYY MMM DD - HH:mm UTC';

class OldTriggerCategory extends Component {
  constructor (props) {
    super(props);
    this.handleTriggerClick = this.handleTriggerClick.bind(this);
    this.setPreset = this.setPreset.bind(this);
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
    const { BACKEND_SERVER_URL } = this.props.urls;
    axios.get(BACKEND_SERVER_URL + '/preset/getpreset?name=' + presetName, { withCredentials: true }).then((res) => {
      this.props.dispatch(this.props.actions.setPreset(res.data));
    }).catch((error) => {
      console.error(error);
    });
  }

  render () {
    const data = this.props.data || [];
    const { title, icon, parentCollapsed, selectedIndex, toggleMethod } = this.props;
    const notifications = data.length;
    const maxSize = 500 * notifications;
    return (
      <Card className='row accordion'>
        {parentCollapsed ? <CardHeader>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>&nbsp;</Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill className='collapsed'>{notifications}</Badge> : null}
          </Col>
        </CardHeader>
          : <CardHeader onClick={maxSize > 0 ? toggleMethod : null} className={maxSize > 0 ? null : 'disabled'} title={title}>
            <Col xs='auto'>
              <Icon name={icon} />
            </Col>
            <Col style={{ marginLeft: '0.9rem' }}>
              {title}
            </Col>
            <Col xs='auto'>
              {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
            </Col>
          </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
          <CardBody>
            <Row>
              <Col className='btn-group-vertical'>
                {data.map((item, index) =>
                  <Button tag='div' className={'Sigmet row' + (selectedIndex === index ? ' active' : '')}
                    key={index} onClick={(evt) => { this.handleTriggerClick(evt, index); }} title={this.getTitle(item.phenomenon)} >
                    <Row>
                      <Col xs='3'>
                        <Badge color='success'>What</Badge>
                      </Col>
                      <Col xs='9'>
                        <span style={{ fontWeight: 'bold' }}>{this.getTitle(item.phenomenon)}</span>
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>When</Badge>
                      </Col>
                      <Col xs='9'>
                        <Moment format={DATE_TIME_FORMAT} date={moment.utc(item.triggerdate)} utc />
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>Where</Badge>
                      </Col>
                      <Col xs='9'>
                        <span>At {item.locations.length} location{item.locations.length !== 1 ? 's' : ''}</span>
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>Presets</Badge>
                      </Col>
                      {item.presets.length > 0
                        ? <Col xs='9'>
                          <a className='triggerPreset' href='#' onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.setPreset(item.presets[0]); }}>{item.presets[0]}</a>
                        </Col>
                        : ''
                      }
                    </Row>
                    {item.presets.filter((item, i) => i !== 0).map((preset, i) =>
                      <Row className='' key={i}>
                        <Col xs={{ size: 9, offset: 3 }}>
                          <a className='triggerPreset' href='#' onClick={(e) => { e.preventDefault(); e.stopPropagation(); this.setPreset(preset); }}>{preset}</a>
                        </Col>
                      </Row>
                    )}
                  </Button>
                )}
              </Col>
            </Row>
          </CardBody>
        </CollapseOmni>
      </Card>);
  }
}

OldTriggerCategory.propTypes = {
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
  urls              : PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  })
};

export default OldTriggerCategory;
