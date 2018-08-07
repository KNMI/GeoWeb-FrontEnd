import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class HeaderSection extends PureComponent {
  render () {
    const { type, isCancelFor } = this.props;
    return <Row className='Header'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='info'>SIGMET</Badge>
          </Col>
          <Col xs='6'>{type}</Col>
          <Col xs='3'>
            {isCancelFor
              ? <Badge color='warning'>{`Cancels ${isCancelFor}`}</Badge>
              : null
            }
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

HeaderSection.propTypes = {
  type: PropTypes.string,
  isCancelFor: PropTypes.number
};
