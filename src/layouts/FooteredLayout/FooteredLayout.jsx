import React, { PureComponent } from 'react';
import { Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';

class FooteredLayout extends PureComponent {
  render () {
    const { route } = this.props;
    const { footer } = route;
    return (
      <Col className='footeredLayout'>
        <Row className='footeredContent'>
          {this.props.children}
        </Row>
        {footer
          ? <Row className='Footer' tag='footer'>
            {footer}
          </Row>
          : null }
      </Col>
    );
  }
}

FooteredLayout.propTypes = {
  route: PropTypes.shape({
    footer: PropTypes.element
  }),
  children: PropTypes.element
};

export default FooteredLayout;
