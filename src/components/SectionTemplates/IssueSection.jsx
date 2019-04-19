import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class IssueSection extends PureComponent {
  render () {
    const children = {};
    const { className, children : propsChildren } = this.props;
    if (Array.isArray(propsChildren)) {
      propsChildren.forEach(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    } else {
      children[propsChildren.props['data-field']] = propsChildren;
    }
    return <Row className='Issue'>
      <Col>
        <Row>
          <Col xs='3'>
            <Badge color='success'>Issued at</Badge>
          </Col>
          <Col xs='9'>
            {children.issuedate}
          </Col>
        </Row>
        <Row>
          <Col xs={{ size: 9, offset: 3 }}>
            {children.issueLocation}
          </Col>
        </Row>
        {children.sequence
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Sequence</Badge>
            </Col>
            <Col xs='9'>
              {children.sequence}
            </Col>
          </Row>
          : null}
        {children.tac
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>TAC</Badge>
            </Col>
            <Col xs='9'>
              {children.tac}
            </Col>
          </Row>
          : null}
        {children.distribution_type
          ? <Row>
            <Col xs={{ size: 2, offset: 1 }}>
              <Badge>Type</Badge>
            </Col>
            <Col xs='9'>
              <Row className={className || ''}>
                <Col xs='auto'>
                  {children.distribution_type}
                </Col>
                <Col />
              </Row>
            </Col>
          </Row>
          : null}
      </Col>
    </Row>;
  }
}

IssueSection.propTypes = {
  className: PropTypes.string,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
    PropTypes.object
  ])
};
