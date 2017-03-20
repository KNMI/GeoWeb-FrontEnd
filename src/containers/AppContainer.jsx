import React, { Component, PropTypes } from 'react';
import { hashHistory, Router } from 'react-router';
import { Provider } from 'react-redux';

class AppContainer extends Component {
  constructor (props) {
    super(props);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  shouldComponentUpdate () {
    return false;
  }

  handleKeyDown (evt) {
    console.log('keypress');
    if (evt.key === 'F11') {
      this.props.routes.push('full_screen');
    }
  };

  componentWillMount () {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  render () {
    const { routes, store } = this.props;
    return (
      <Provider store={store} >
        <div style={{ height: 'inherit' }}>
          <Router history={hashHistory} children={routes} />
        </div>
      </Provider>
    );
  }
}

AppContainer.propTypes = {
  routes : PropTypes.object.isRequired,
  store  : PropTypes.object.isRequired
};

export default AppContainer;
