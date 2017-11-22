import React, { Component } from 'react';
import { hashHistory, Router } from 'react-router';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';

class AppContainer extends Component {
  shouldComponentUpdate () {
    return false;
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
