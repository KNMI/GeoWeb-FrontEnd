import React, { Component } from 'react';
import { Button, ButtonGroup, Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import Icon from 'react-fa';
import { cloneDeep, isEmpty } from 'lodash';
import CollapseOmni from '../components/CollapseOmni';
import PropTypes from 'prop-types';

const TAG_NAMES = {
  DIV: 'div',
  SPAN: 'span'
};
const DATE_FORMAT = 'YYYY MMM DD - ';
const TIME_FORMAT = 'HH:mm UTC';
const DATE_TIME_FORMAT = 'YYYY MMM DD - HH:mm UTC';

class TriggerCategory extends Component {
  constructor (props) {
    super(props);
    this.handleSigmetClick = this.handleSigmetClick.bind(this);
    this.state = {
      isOpen: props.isOpen
    };
  }

  handleSigmetClick (evt, index) {
    let shouldContinue = false;
    if (!this.props.editable) {
      shouldContinue = true;
    } else if (this.props.selectedIndex !== 0) {
      shouldContinue = true;
    } else if (this.hasTagName(evt.target, TAG_NAMES.DIV) && evt.target.classList.contains('row')) {
      shouldContinue = true;
    } else if (this.hasTagName(evt.target, TAG_NAMES.SPAN) && evt.target.classList.contains('badge')) {
      shouldContinue = true;
    }

    if (shouldContinue) {
      this.props.selectMethod(index, this.state.list[index].geojson);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
  }

  getTitle(t) {
    return t;
  }

  render () {
    console.log(this.props.data);
    const { title, icon, parentCollapsed, selectedIndex, toggleMethod, data } = this.props;
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
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                {data.map((item, index) =>
                  <Button tag='div' className={'Sigmet row' + (selectedIndex === index ? ' active' : '')}
                    key={index} onClick={(evt) => { this.handleSigmetClick(evt, index); }} title={this.getTitle(item.phenomenon)} >
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
                        <Moment format={DATE_TIME_FORMAT} date={item.issuedate} />
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>Where</Badge>
                      </Col>
                      <Col xs='9'>
                        <span>{item.firname || '--'}</span>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ size: 9, offset: 3 }}>
                        {item.location_indicator_icao}
                      </Col>
                    </Row>
                  </Button>
                )}
              </Col>
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>);
  }
}

TriggerCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  editable      : PropTypes.bool,
  selectedIndex : PropTypes.number,
  selectMethod  : PropTypes.func,
  toggleMethod  : PropTypes.func,
  parentCollapsed   : PropTypes.bool,
  data              : PropTypes.array
};

export default TriggerCategory;
