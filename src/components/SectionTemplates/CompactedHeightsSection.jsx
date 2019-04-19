import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';
export default class CompactedHeightsSection extends PureComponent {
  render () {
    const { hasSurface, children } = this.props;
    const localChildren = {};
    if (!Array.isArray(children)) {
      localChildren[children.props['data-field']] = children;
    } else {
      children.forEach(child => {
        if (child && child.props) {
          localChildren[child.props['data-field']] = child;
        }
      });
    }
    return (
      <Row className='CompactedLevel' >
        {localChildren.complete
          ? <Col className='complete'>
            <Row>
              <Col xs={{ size: 2, offset: 1 }}>
                <Badge>Levels</Badge>
              </Col>
              <Col xs='9'>{localChildren.complete}</Col>
            </Row>
          </Col>
          : <Col>
            <Row>
              <Col xs={{ size: 2, offset: 1 }}>
                <Badge>Levels</Badge>
              </Col>
              <Col xs='2'>
                <label>Between</label>
              </Col>
              <Col xs='2'>
                {localChildren['above-toggle']}
              </Col>
              <Col xs='5'>
                {localChildren['upper']}
                {localChildren['upper'] && localChildren['upper'].props && !localChildren['upper'].props.disabled
                  ? <span className={localChildren['upper'].props.className === 'missing' ? 'required missing' : 'required'} />
                  : null
                }
              </Col>
            </Row>
            <Row>
              <Col xs={{ size: 1, offset: 4 }}>
                <label>and</label>
              </Col>
              <Col xs={{ size: 7 }}>
                {localChildren['lower']}
                {!hasSurface && localChildren['lower'] && localChildren['lower'].props && !localChildren['lower'].props.disabled
                  ? <span className={localChildren['lower'].props.className === 'missing' ? 'required missing' : 'required'} />
                  : null
                }
              </Col>
            </Row>
          </Col>
        }
      </Row>);
  }
}

CompactedHeightsSection.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]),
  hasSurface: PropTypes.bool
};
