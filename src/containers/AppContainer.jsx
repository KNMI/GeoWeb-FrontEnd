import React, { Component } from 'react';
import { hashHistory, Router } from 'react-router';
import { Provider } from 'react-redux';
import PropTypes from 'prop-types';
import Perf from 'react-addons-perf'; // ES6

class AppContainer extends Component {
  shouldComponentUpdate () {
    return false;
  }
  componentDidMount () {
    this.startTimer = setTimeout(() => { Perf.start(); }, 1000);
    this.stopTimer = setTimeout(() => { Perf.stop(); Perf.printInclusive(); Perf.printExclusive(); Perf.printWasted(); Perf.printOperations(); }, 120000);
  }

  componentWillUnmount () {
    if(this.startTimer) clearTimeout(this.startTimer);
    if(this.stopTimer) clearTimeout(this.stopTimer);
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
