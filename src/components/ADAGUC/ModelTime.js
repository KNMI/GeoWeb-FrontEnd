import React, { Component } from 'react';
import { PropTypes } from 'prop-types';

const moment = require('moment');

export default class ModelTime extends Component {
  constructor () {
    super();
    this.updateState = this.updateState.bind(this);
    this.resetState = this.resetState.bind(this);
    this.state = {
      display: null
    };
  }
  /* istanbul ignore next */
  updateState () {
    if (!this.props.webmapjs.getDimension('time')) {
      return;
    }

    if (!this.props.active) {
      this.resetState();
      return;
    }
    const adagucTime = moment.utc(this.props.webmapjs.getDimension('time').currentValue);
    const adaStart = moment.utc(this.props.webmapjs.getDimension('time').currentValue).startOf('hour');
    const now = moment.utc();
    const nowStart = now.startOf('hour');
    const ms = adaStart.diff(nowStart);
    const d = moment.duration(ms);

    const hourDifference = parseInt(d.asHours());
    const timeFormat = 'ddd DD MMM YYYY HH:mm [UTC]';
    if (hourDifference >= 0) {
      this.setState({ display: `${adagucTime.format(timeFormat).toString()} (+${hourDifference})` });
    } else {
      if (hourDifference < 0) {
        this.setState({ display: `${adagucTime.format(timeFormat).toString()} (${hourDifference})` });
      } else {
        this.setState({ display: null });
      }
    }
  }

  /* istanbul ignore next */
  resetState () {
    this.setState({ display: '' });
  }

  componentWillUnmount () {
    this.listenersInitialized = false;
    const { webmapjs } = this.props;
    if (webmapjs) {
      webmapjs.removeListener('ondimchange', this.updateState);
      webmapjs.removeListener('onmapdimupdate', this.updateState);
      webmapjs.removeListener('onmapdimchange', this.updateState);
    }
  }

  /* istanbul ignore next */
  render () {
    const { webmapjs } = this.props;

    if (webmapjs !== undefined) {
      if (!this.listenersInitialized) {
        this.listenersInitialized = true;
        webmapjs.addListener('ondimchange', this.updateState, true);
        webmapjs.addListener('onmapdimupdate', this.updateState, true);
        webmapjs.addListener('onmapdimchange', this.updateState, true);
      }
      webmapjs.setTimeOffset(this.state.display);
      webmapjs.setActive(this.props.active);
    }
    return <div />;
  }
}
ModelTime.propTypes = {
  webmapjs: PropTypes.object,
  active: PropTypes.bool
};
