import React, { PureComponent } from 'react';
import { Col, Row, Card, CardTitle, CardBody, Label } from 'reactstrap';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { withLabeledChildren } from '../.';

class LocationCardLayout extends PureComponent {
  render () {
    const { childrenMap, className, ...otherProps } = this.props;
    return (
      <Col xs='12' sm='6' md='4' lg='3' xl='2' {...otherProps} className={classNames('LocationCard', className)}>
        <Card>
          <CardTitle>{childrenMap.abbreviation}</CardTitle>
          <CardBody>
            <Row>
              <Col xs='6'>
                <Label>Latitude</Label>
              </Col>
              <Col xs='6' className='numericValue'>
                {childrenMap.latitude}
              </Col>
            </Row>
            <Row>
              <Col xs='6'>
                <Label>Longitude</Label>
              </Col>
              <Col xs='6' className='numericValue'>
                {childrenMap.longitude}
              </Col>
            </Row>
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

LocationCardLayout.propTypes = {
  childrenMap: PropTypes.objectOf(PropTypes.element)
};

export default withLabeledChildren(LocationCardLayout, 'role');
