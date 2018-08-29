import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
import { MOVEMENT_TYPES } from '../SigmetTemplates';

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

    return <Row className='Move'>
      <Col>
        <Row className={this.props.movementType !== MOVEMENT_TYPES.MOVEMENT ? 'disabled' : null}>
          <Col xs='3'>
            <Badge color='success'>Movement</Badge>
          </Col>
        </Row>
        <Row className={this.props.movementType !== MOVEMENT_TYPES.MOVEMENT ? 'disabled' : null}>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Direction</Badge>
          </Col>
          <Col xs='9'>
            {children.direction}
            {children.direction && children.direction.props.selected && !children.direction.props.disabled
              ? <span className={children.direction.props.selected.length > 0 ? 'required' : 'required missing'} />
              : null
            }
          </Col>
        </Row>
        <Row className={this.props.movementType !== MOVEMENT_TYPES.MOVEMENT ? 'disabled' : null}>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Speed</Badge>
          </Col>
          <Col xs='9'>
            {children.speed}
            {children.speed && children.speed.props && !children.speed.props.disabled
              ? <span className={children.speed.props.className.split(' ').includes('missing') ? 'required missing' : 'required'} />
              : null
            }
          </Col>
        </Row>
        <Row className={this.props.movementType !== MOVEMENT_TYPES.FORECAST_POSITION ? 'disabled' : null}>
          <Col xs='3'>
            <Badge color='success'>End position</Badge>
          </Col>
        </Row>
        <Row className={this.props.movementType !== MOVEMENT_TYPES.FORECAST_POSITION ? 'disabled' : null}>
          <Col>
            {children.drawbar}
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
  movementType: PropTypes.string
};
