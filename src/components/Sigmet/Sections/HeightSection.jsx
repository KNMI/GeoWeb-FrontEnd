import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
export default class HeightSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.flatten().map(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }

    return (
      <Row className='Level'>
        <Col xs={{ offset: 3, size: 3 }}>
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
