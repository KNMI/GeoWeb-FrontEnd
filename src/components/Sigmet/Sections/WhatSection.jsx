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
            {children.phenomenon && children.phenomenon.props.selected
              ? <span className={children.phenomenon.props.selected.length > 0 ? 'required' : 'required missing'} />
              : null
            }
          </Col>
        </Row>
        {children.obs_or_fcst
          ? <Row>
            <Col xs={{ size: 9, offset: 3 }}>
              {children.obs_or_fcst}
            </Col>
          </Row>
          : null
        }
        {children.obsFcTime
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>At</Badge>
            </Col>
            <Col xs='9'>
              {children.obsFcTime}
            </Col>
          </Row>
          : null
        }
      </Col>
    </Row>;
  }
}

WhatSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
