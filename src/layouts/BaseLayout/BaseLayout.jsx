import React, { Component, PropTypes } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../../styles/core.scss';

const browserFullScreenRequests = [
  'mozRequestFullScreen',
  'msRequestFullscreen',
  'webkitRequestFullScreen'
];

class BaseLayout extends Component {
  constructor (props) {
    super(props);
    this.elementToFullScreen = this.elementToFullScreen.bind(this);
  }

  elementToFullScreen (evt) {
    if (evt.key === 'F11') {
      evt.preventDefault();
      const fullScreenPath = 'full_screen';
      const tag = this.props.routes.some((routeElmt) => routeElmt.path === fullScreenPath) ? 'body' : 'main';
      const elmt = document.querySelector(tag);
      let requestFullScreenFunc = elmt.requestFullscreen;
      if (!requestFullScreenFunc) {
        browserFullScreenRequests.forEach((request) => {
          requestFullScreenFunc = requestFullScreenFunc || elmt[request];
        });
      }
      if (typeof requestFullScreenFunc !== 'undefined') {
        requestFullScreenFunc.call(elmt);
      }
    }
  }

  componentWillMount () {
    document.addEventListener('keydown', this.elementToFullScreen);
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.elementToFullScreen);
  }

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
          <Col className='MainViewport'>
            <Row className='map' tag='main'>
              {map || 'Oops'}
            </Row>
            <Row className='Footer'>
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
