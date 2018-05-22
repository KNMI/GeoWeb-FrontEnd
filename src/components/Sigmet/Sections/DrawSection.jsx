import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class DrawSection extends PureComponent {
  render () {
    const children = {};
    this.props.children.flatten().map(child => {
      if (child && child.props) {
        children[child.props['data-field']] = child;
      }
    });
    return <Row className='section DrawSection'>
      <Col xs={{ size: 'auto', offset: 3 }}>
        {children['select-region']}
        {children['select-shape']}
        {children['select-fir']}
        {children['delete-selection']}
        {children['noDrawingWarning']}
      </Col>
    </Row>;
  }
}

DrawSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element
  ]))
};
