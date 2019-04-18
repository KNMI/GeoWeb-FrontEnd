import React, { PureComponent } from 'react';
import hasClass from '../../utils/hasclass';
import classNames from 'classnames';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class MovementSection extends PureComponent {
  render () {
    const { children: childrenFromProps, disabled } = this.props;
    const childrenToProcess = !Array.isArray(childrenFromProps) ? [childrenFromProps] : childrenFromProps;
    const children = {};
    childrenToProcess.forEach(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    const className = disabled === true ? 'disabled' : null;

    return <Row className='Move'>
      <Col>
        <Row className={className}>
          <Col xs='3'>
            <Badge color='success'>Movement</Badge>
          </Col>
        </Row>
        <Row className={className}>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Direction</Badge>
          </Col>
          <Col xs='9'>
            {children.direction}
            {children.direction && hasClass(children.direction.props.classNames, 'required')
              ? <span className={classNames('required', { missing: hasClass(children.direction.props.classNames, 'missing') })} />
              : null
            }
          </Col>
        </Row>
        <Row className={className}>
          <Col xs={{ size: 2, offset: 1 }}>
            <Badge>Speed</Badge>
          </Col>
          <Col xs='9'>
            {children.speed}
            {children.speed && hasClass(children.speed.props.classNames, 'required')
              ? <span className={classNames('required', { missing: hasClass(children.speed.props.classNames, 'missing') })} />
              : null
            }
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
  disabled: PropTypes.bool
};
