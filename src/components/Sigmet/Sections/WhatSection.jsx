import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class WhatSection extends PureComponent {
  render () {
    const children = {};
    this.props.children.map(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    return <Row className='What'>
      <Col>
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
      </Col>
    </Row>;
  }
}

WhatSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
