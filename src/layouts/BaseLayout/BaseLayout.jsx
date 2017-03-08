import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../../styles/core.scss';

class BaseLayout extends Component {
  render () {
    const { header, leftSideBar, mainViewport, rightSideBar } = this.props;
    return (
      <Container fluid style={{ minHeight: '100vh' }}>
        <Row className='Header'>
          {header || 'Oops'}
        </Row>
        <Row>
          <Col xs='auto' className='LeftSideBar'>
            {leftSideBar || 'Oops'}
          </Col>
          <Col className='MainViewport'>
            {mainViewport || 'Oops'}
          </Col>
          <Col xs='auto' className='RightSideBar'>
            {rightSideBar || 'Oops'}
          </Col>
        </Row>
      </Container>
    );
  }
}
BaseLayout.propTypes = {
  header: PropTypes.element,
  leftSideBar: PropTypes.element,
  mainViewport: PropTypes.element,
  rightSideBar: PropTypes.element
};

export default BaseLayout;
