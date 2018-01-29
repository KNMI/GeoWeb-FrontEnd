import React, { Component } from 'react';
import { Container } from 'reactstrap';
import '../../styles/core.scss';
import PropTypes from 'prop-types';

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
  children: PropTypes.object,
  routes: PropTypes.array
};

export default BaseLayout;
