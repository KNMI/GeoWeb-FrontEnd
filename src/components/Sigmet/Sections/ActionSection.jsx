import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

class ActionSection extends PureComponent {
  render () {
    const { children } = this.props;

    console.log('AS', children);
    const offset = 12 - children.length * 2;
    return <Row className='Action'>
      <Col>
        <Row>
          <Col xs={{ size: 2 * children.length, offset: offset }}>
            {children}
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

ActionSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};

export default ActionSection;
