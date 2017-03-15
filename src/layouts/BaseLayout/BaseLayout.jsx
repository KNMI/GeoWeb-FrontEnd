import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../../styles/core.scss';

class BaseLayout extends Component {
  render () {
    const { header, leftSideBar, map, layerManager, rightSideBar } = this.props;
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
            <Row className='map'>
              {map || 'Oops'}
            </Row>
            <Row className='layerManager'>
              {layerManager || 'Oops'}
            </Row>
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
  map: PropTypes.element,
  layerManager: PropTypes.element,
  rightSideBar: PropTypes.element,
  routes: PropTypes.array
};

export default BaseLayout;
