import React, { Component, PropTypes } from 'react';

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
