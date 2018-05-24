import React, { PureComponent } from 'react';
import { Row, Col, Badge } from 'reactstrap';
import PropTypes from 'prop-types';

export default class DrawSection extends PureComponent {
  render () {
    const children = {};
    if (!Array.isArray(this.props.children)) {
      children[this.props.children.props['data-field']] = this.props.children;
    } else {
      this.props.children.flatten().map(child => {
        if (child && child.props) {
          children[child.props['data-field']] = child;
        }
      });
    }
    return <Row className='section DrawSection'>
      {children['buttons-row']}
      {children['danger-row']}
    </Row>;
  }
}

DrawSection.propTypes = {
  children: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
    PropTypes.object
  ]))
};
