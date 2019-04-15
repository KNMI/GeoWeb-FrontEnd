import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ValiditySection extends PureComponent {
  render () {
    const children = {};
    this.props.children.forEach(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    return <Row className='Validity'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Valid</Badge>
          </Col>
          <Col xs='9' />
        </Row>
        <Row>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>From</Badge>
          </Col>
          <Col xs='9'>
            {children.validdate}
          </Col>
        </Row>
        <Row>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Until</Badge>
          </Col>
          <Col xs='9'>
            {children.validdate_end}
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

ValiditySection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
