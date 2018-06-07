import React, { Component } from 'react';
import { hot, setConfig } from 'react-hot-loader';
import { hashHistory, Router } from 'react-router';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import NotificationsSystem from 'reapop';
import theme from 'reapop-theme-wybo';

class AppContainer extends Component {
  constructor () {
    super();
    setConfig({ logLevel: 'debug' });
  }
  shouldComponentUpdate () {
    return false;
  }

  render () {
    const { routes, store } = this.props;
    return (
      <Provider store={store} >
        <div style={{ height: 'inherit' }}>
          <Router history={hashHistory} children={routes} />
          <NotificationsSystem theme={theme} />
        </div>
      </Provider>
    );
  }
}

AppContainer.propTypes = {
  routes : PropTypes.object.isRequired,
  store  : PropTypes.object.isRequired
};
export default hot(module)(AppContainer)
