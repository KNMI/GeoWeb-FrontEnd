import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../../styles/core.scss';

class BaseLayout extends Component {
  render () {
    const { header, leftSideBar, mainViewport, rightSideBar } = this.props;
    return (
      <Container fluid className={this.props.routes[1] && this.props.routes[1].path === 'layout_test' ? 'test' : ''}>
        <Row className='Header'>
          {header || 'Oops'}
        </Row>
        <Row className='MainSection'>
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
  rightSideBar: PropTypes.element,
  routes: PropTypes.array
};

export default BaseLayout;
