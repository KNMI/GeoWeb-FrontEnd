import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Inspector extends Component {
  render () {
    const { title } = this.props;
    return (
      <div>
        <span>Inspector:</span>
        {title || 'Oops'}
      </div>
    );
  }
}

Inspector.propTypes = {
  title: PropTypes.string.isRequired
};

export default Inspector;
