import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
export default class HeightsSection extends PureComponent {
  render () {
    console.log('heightssection: ', this.props.children);
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.map(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }
    console.log(children);
    return (
      <Row className='Level' >
        <Col>
          <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Altitiude</Badge>
            </Col>
            <Col xs='9'>
              {children['between-at-toggle']}
            </Col>
          </Row>
          <Row>
            <Col xs={{ size: 1, offset: 3 }}>
              {children['tops-toggle']}
            </Col>
            <Col xs='5'>
              {children['at-above-toggle']}
            </Col>
            <Col xs='3'>
              {children['at-above-altitude']}
            </Col>
          </Row>
          <Row>
            <Col xs={{ size: 2, offset: 3 }}>
              <label>Between</label>
            </Col>
            <Col xs='6'>
              {children['between-lev-1']}
            </Col>
            <Col />
          </Row>
          <Row>
            <Col xs={{ size: 1, offset: 3 }}>
              <label>and</label>
            </Col>
            <Col xs='3'>
              {children['between-lev-2']}
            </Col>
            <Col />
          </Row>
        </Col>
      </Row>);
  }
}

HeightsSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
};
