import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
var moment = require('moment');
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
    const now = moment(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
    const hourDifference = Math.floor(moment.duration(adagucTime.diff(now)).asHours());
    if (hourDifference > 0) {
      this.setState({ display: adagucTime.format('ddd D HH:mm').toString() + ' (+' + (hourDifference - 1) + ')' });
    } else {
      this.setState({ display: adagucTime.format('ddd D HH:mm').toString() + ' (' + (hourDifference) + ')' });
    }
  }

  /* istanbul ignore next */
  resetState () {
    this.setState({ display: '' });
  }

  /* istanbul ignore next */
  render () {
    const { webmapjs } = this.props;

    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) {
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
