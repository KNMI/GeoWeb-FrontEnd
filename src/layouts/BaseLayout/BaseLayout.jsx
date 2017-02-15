import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.css';

class BaseLayout extends Component {
  static propTypes = {
    header: PropTypes.element,
    leftSideBar: PropTypes.element,
    mainViewport: PropTypes.element,
    rightSideBar: PropTypes.element
  }

  render () {
    const { header, leftSideBar, mainViewport, rightSideBar } = this.props;

    return (
      <Container>
        <Row className='Header'>
          {header || 'Oops'}
        </Row>
        <Row>
          <Col xs='3' className='LeftSideBar'>
            {leftSideBar || 'Oops'}
          </Col>
          <Col xs='auto' className='MainViewport'>
            {mainViewport || 'Oops'}
          </Col>
          <Col xs='3' className='RightSideBar'>
            {rightSideBar || 'Oops'}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default BaseLayout;
