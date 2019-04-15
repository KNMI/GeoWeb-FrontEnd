import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ProgressSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.forEach(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }

    return <Row className='Progress'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Progress</Badge>
          </Col>
          <Col xs='9'>
            {children.hasOwnProperty('no_va_expected')
              ? children.no_va_expected
              : children.movement
            }
            {}
          </Col>
        </Row>
        {children.hasOwnProperty('no_va_expected')
          ? <Row>
            <Col xs={{ size: 9, offset: 3 }}>
              {children.movement}
            </Col>
          </Row>
          : null
        }
        {children.hasOwnProperty('move_to_fir')
          ? <Row>
            <Col xs={{ size: 9, offset: 3 }}>
              {children.move_to_fir}
            </Col>
          </Row>
          : null
        }
      </Col>
    </Row>;
  }
}

ProgressSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ])
};
