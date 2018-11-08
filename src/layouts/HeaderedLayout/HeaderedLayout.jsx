import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';

class HeaderedLayout extends Component {
  render () {
    const { route } = this.props;
    const { header } = route;
    return (
      <Col className='headeredLayout'>
        { header
          ? <Row className='Header no-gutters' tag='header'>
            {React.cloneElement(header, this.props) || 'Oops'}
          </Row>
          : null }
        <Row className='headeredContent no-gutters'>
          {this.props.children}
        </Row>
      </Col>
    );
  }
}

HeaderedLayout.propTypes = {
  route: PropTypes.shape({
    footer: PropTypes.element
  }),
  children: PropTypes.element
};

export default HeaderedLayout;
