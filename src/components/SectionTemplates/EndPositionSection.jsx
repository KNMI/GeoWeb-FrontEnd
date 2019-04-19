import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class EndPositionSection extends PureComponent {
  render () {
    const { children : childrenFromProps, disabled } = this.props;
    const childrenToProcess = !Array.isArray(childrenFromProps) ? [childrenFromProps] : childrenFromProps;
    const children = {};
    childrenToProcess.forEach(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    const className = disabled === true ? 'disabled' : null;

    return <Row className='EndPosition'>
      <Col>
        <Row className={className}>
          <Col xs='3'>
            <Badge color='success'>End position</Badge>
          </Col>
        </Row>
        <Row className={className}>
          <Col>
            {children.drawbar}
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

EndPositionSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  disabled: PropTypes.bool
};
