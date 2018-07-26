import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class MovementSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.map(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }

    return <Row className={this.props.disabled ? 'Move disabled' : 'Move'}>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Move</Badge>
          </Col>
          <Col xs='9'>
            {children.movementType}
          </Col>
        </Row>
        <Row className={!this.props.useGeometryForEnd ? 'disabled' : null}>
          <Col>
            {children.drawbar}
          </Col>
        </Row>
        <Row className={this.props.useGeometryForEnd ? 'disabled' : null}>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Direction</Badge>
          </Col>
          <Col xs='9'>
            {children.direction}
          </Col>
        </Row>
        <Row className={this.props.useGeometryForEnd ? 'disabled' : null}>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Speed</Badge>
          </Col>
          <Col xs='9'>
            {children.speed}
          </Col>
        </Row>
      </Col>
    </Row>;
  }
}

MovementSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  disabled: PropTypes.bool,
  useGeometryForEnd: PropTypes.bool
};
