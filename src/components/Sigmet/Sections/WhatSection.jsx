import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

class WhatSection extends PureComponent {
  render () {
    const children = {};
    this.props.children.map(child => {
      children[child.props['data-field']] = child;
    });
    return <Col className='What'>
      <Row>
        <Col xs='3'>
          <Badge color='success'>What</Badge>
        </Col>
        <Col xs='9'>
          {children.phenomenon}
        </Col>
      </Row>
      <Row>
        <Col xs={{ size: 9, offset: 3 }}>
          {children.obs_or_fcst}
        </Col>
      </Row>
      <Row>
        <Col xs={{ size: 2, offset: 1 }}>
          <Badge>At</Badge>
        </Col>
        <Col xs='9'>
          {children.obsFcTime}
        </Col>
      </Row>
    </Col>;
  }
}

WhatSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};

export default WhatSection;
