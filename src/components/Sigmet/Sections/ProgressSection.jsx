import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class ProgressSection extends PureComponent {
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

    return <Row className='Progress'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Progress</Badge>
          </Col>
          <Col xs='9'>
            {children.movement}
          </Col>
        </Row>
        {
          children.hasOwnProperty('direction')
            ? <Row>
              <Col xs={{ size: 2, offset: 1 }}>
                <Badge>Direction</Badge>
              </Col>
              <Col xs='9'>
                {children.direction}
              </Col>
            </Row>
            : null
        }
        {
          children.hasOwnProperty('speed')
            ? <Row>
              <Col xs={{ size: 2, offset: 1 }}>
                <Badge>Speed</Badge>
              </Col>
              <Col xs='9'>
                {children.speed}
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
