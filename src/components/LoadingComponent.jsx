import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class LoadingComponent extends Component {
  render () {
    console.log(this.props);
    if (this.props.isLoading) {
      return <div className='imageloading' style={{ ...this.props.style }} />;
    } else {
      return <div />;
    }
  }
}

LoadingComponent.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  style: PropTypes.object
};
