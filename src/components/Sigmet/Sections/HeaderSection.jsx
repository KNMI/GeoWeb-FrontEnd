import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class HeaderSection extends PureComponent {
  render () {
    return <Row className='Header'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='info'>SIGMET</Badge>
          </Col>
          <Col xs='9'>{this.props.type}</Col>
        </Row>
      </Col>
    </Row>;
  }
}

HeaderSection.propTypes = {
  type: PropTypes.string
};
