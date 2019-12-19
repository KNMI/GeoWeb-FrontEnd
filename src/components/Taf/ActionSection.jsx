import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ActionSection extends PureComponent {
  render () {
    const { children, colSize } = this.props;
    const childrenSize = children.length * 2 * (colSize || 1);
    return <Row className='TafActionSection'>
      <Col xs={{ size: childrenSize, offset: 12 - childrenSize }}>
        {children}
      </Col>
    </Row>;
  }
}

ActionSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element),
  colSize: PropTypes.number
};
