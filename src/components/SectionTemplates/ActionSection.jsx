import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ActionSection extends PureComponent {
  render () {
    const { children, colSize } = this.props;
    const childrenSize = children.length * (colSize || 1);
    return <Row className='Action'>
      <Col>
        <Row>
          <Col xs={{ size: childrenSize, offset: 12 - childrenSize }}>
            {children}
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

ActionSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  colSize: PropTypes.number
};
