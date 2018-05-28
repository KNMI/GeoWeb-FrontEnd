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
        <Col style={{ margin: '0.5rem' }}>
          <Row>
            <Col xs={{ size: '4', offset: '3' }}>
              {children['between-at-toggle']}
            </Col>
            <Col xs='auto' />
          </Row>
          <Row>
            <Col xs={{ size: 2, offset: 3 }} style={{ top: '0.5rem' }}>
              {children['tops-toggle']}
            </Col>
            <Col xs='4' style={{ top: '0.5rem' }}>
              {children['at-above-toggle']}
            </Col>
            <Col xs='3'>
              {children['at-above-altitude']}
            </Col>
          </Row>
          <Row className='disabled' >
            <Col xs={{ size: 2, offset: 3 }} style={{ top: '0.5rem' }}>
              <span>Between</span>
            </Col>
            <Col xs='3'>
              {children['between-lev-1']}
            </Col>
            <Col xs='1' style={{ left: '0.25rem', top: '0.5rem' }}>
              <span>and</span>
            </Col>
            <Col xs='3'>
              {children['between-lev-2']}
            </Col>

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
