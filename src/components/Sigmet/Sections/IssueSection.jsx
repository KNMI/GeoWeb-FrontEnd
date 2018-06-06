import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class IssueSection extends PureComponent {
  render () {
    const children = {};
    this.props.children.map(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
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
      </Col>
    </Row>;
  }
}

IssueSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
};
