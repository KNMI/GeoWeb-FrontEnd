import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

class WhatSection extends PureComponent {
  render () {
    const { children } = this.props;
    const phenomenon = children.filter(child => child.props.dataFunction === 'phenomenon');
    const obsOrFcst = children.filter(child => child.props.dataFunction === 'obs_or_fcst');
    const obsFcTime = children.filter(child => child.props.dataFunction === 'obsFcTime');
    return <Col style={{ flexDirection: 'column' }}>
      <Row style={{ flex: '0 auto' }}>
        <Col xs='3'>
          <Badge color='success'>What</Badge>
        </Col>
        <Col xs='9'>
          {phenomenon}
        </Col>
      </Row>
      <Row style={{ flex: '0 auto' }}>
        <Col xs={{ size: 9, offset: 3 }}>
          {obsOrFcst}
        </Col>
      </Row>
      <Row style={{ flex: '0 auto' }}>
        <Col xs={{ size: 2, offset: 1 }}>
          <Badge>At</Badge>
        </Col>
        <Col xs='9'>
          {obsFcTime}
        </Col>
      </Row>
    </Col>;
  }
}

WhatSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};

export default WhatSection;
