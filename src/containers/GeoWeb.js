import React from 'react';
import { Provider } from 'react-redux';
import { browserHistory, Router } from 'react-router';
import '../styles/core.scss';

export default class GeoWeb extends React.Component {
  render () {
    const { store, routes, adagucProperties } = this.props;
    return <Provider store={store}>
      <div style={{ height: '100%' }}>
        <Router adagucProperties={adagucProperties} history={browserHistory} children={routes} />
      </div>
    </Provider>;
  }
}

GeoWeb.propTypes = {
  adagucProperties: React.PropTypes.object,
  store: React.PropTypes.object,
  routes: React.PropTypes.object
};
