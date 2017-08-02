import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import '../../styles/core.scss';
import PropTypes from 'prop-types';
import NotificationsSystem from 'reapop';
import theme from 'reapop-theme-wybo';

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
    return (
      <Container fluid>
        {this.props.children}
      </Container>
    );
  }
}
BaseLayout.propTypes = {
  header: PropTypes.element,
  leftSideBar: PropTypes.element,
  secondLeftSideBar: PropTypes.element,
  map: PropTypes.element,
  layerManager: PropTypes.element,
  rightSideBar: PropTypes.element,
  routes: PropTypes.array
};

export default BaseLayout;
