import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

class ActionSection extends PureComponent {
  render () {
    const children = {};
    this.props.children.map(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    return <Row className='Action'>
      <Col>
        <Row>
          <Col xs={{ size: 3, offset: 9 }}>
            {children.edit}
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
