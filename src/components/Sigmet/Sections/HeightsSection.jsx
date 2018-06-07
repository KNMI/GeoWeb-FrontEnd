import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
export default class HeightsSection extends PureComponent {
  render () {
    const { isLevelBetween, children } = this.props;
    const localChildren = {};
    if (!Array.isArray(children)) {
      localChildren[children.props['data-field']] = children;
    } else {
      children.map(child => {
        if (child && child.props) {
          localChildren[child.props['data-field']] = child;
        }
      });
    }
    return (
      <Row className='Level' >
        <Col>
          <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Levels</Badge>
            </Col>
            <Col xs='9'>
              {localChildren['between-at-toggle']}
            </Col>
          </Row>
          <Row className={isLevelBetween ? 'disabled' : null}>
            <Col xs={{ size: 1, offset: 3 }}>
              {localChildren['tops-toggle']}
            </Col>
            <Col xs='5'>
              {localChildren['at-above-toggle']}
            </Col>
            <Col xs='3'>
              {localChildren['at-above-altitude']}
            </Col>
          </Row>
          <Row className={!isLevelBetween ? 'disabled' : null}>
            <Col xs={{ size: 2, offset: 4 }}>
              <label>Between</label>
            </Col>
            <Col xs={{ size: 6 }}>
              {localChildren['between-lev-1']}
            </Col>
          </Row>
          <Row className={!isLevelBetween ? 'disabled' : null}>
            <Col xs={{ size: 1, offset: 8 }}>
              <label>and</label>
            </Col>
            <Col xs='3'>
              {localChildren['between-lev-2']}
            </Col>
          </Row>
        </Col>
      </Row>);
  }
}

HeightsSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  isLevelBetween: PropTypes.bool
};
