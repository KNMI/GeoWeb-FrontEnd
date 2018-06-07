import React, { PureComponent } from 'react';
import { Col, Row } from 'reactstrap';
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
    const buttons = Object.entries(children).filter((child) => child[0].endsWith('_button'));
    const alerts = Object.entries(children).filter((child) => child[0].endsWith('_alert'));
    return <Row className='Draw'>
      <Col xs={{ size: 9, offset: 3 }}>
        { buttons.map((button) =>
          button[1]
        )}
      </Col>
      <Col xs='12'>
        {alerts.map((alert) =>
          alert[1]
        )}
      </Col>
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
