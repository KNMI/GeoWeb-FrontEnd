import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
export default class HeightSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.forEach(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }

    return (
      <Row className='Level'>
        <Col xs={{ size: 2, offset: 1 }}>
          <Badge>Levels</Badge>
        </Col>
        <Col xs='3'>
          {children.level}
        </Col>
        <Col xs='auto' />
      </Row>);
  }
}

HeightSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
};
