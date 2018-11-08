import React, { PureComponent } from 'react';
import { Col, Row, Card, CardTitle, CardBody } from 'reactstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { withLabeledChildren } from '../.';

class CategoryCardLayout extends PureComponent {
  render () {
    const { childrenMap, className, ...otherProps } = this.props;
    return (
      <Col xs='12' sm='6' md='4' lg='3' xl='2' {...otherProps} className={classNames('CategoryCard', className)}>
        <Card>
          <CardTitle>{childrenMap.name}</CardTitle>
          <CardBody>
            <Row>
              <Col>
                {childrenMap.description}
              </Col>
            </Row>
            <Row />
            <Row>
              <Col>
                {childrenMap.actions}
              </Col>
            </Row>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

CategoryCardLayout.propTypes = {
  childrenMap: PropTypes.objectOf(PropTypes.element)
};

export default withLabeledChildren(CategoryCardLayout, 'role');
