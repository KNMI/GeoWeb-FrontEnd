import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../../styles/core.scss';

class BaseLayout extends Component {
  render () {
    const { header, leftSideBar, map, layerManager, rightSideBar } = this.props;
    return (
      <Container fluid className={this.props.routes[1] && this.props.routes[1].path === 'layout_test' ? 'test' : ''}>
        <Row className='Header' tag='header'>
          {header || 'Oops'}
        </Row>
        <Row className='MainSection'>
          <Col xs='auto' className='LeftSideBar' tag='aside'>
            {leftSideBar || 'Oops'}
          </Col>
          <Col className='MainViewport' tag='main'>
            <Row className='map'>
              {map || 'Oops'}
            </Row>
            <Row className='LayerManager'>
              {layerManager || 'Oops'}
            </Row>
          </Col>
          <Col xs='auto' className='RightSideBar' tag='aside'>
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
