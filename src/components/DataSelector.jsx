import React, { Component, PropTypes } from 'react';

class DataSelector extends Component {
  render () {
    const { title } = this.props;
    return (
      <div>
        <span>DataSelector:</span>
        {title || 'Oops'}
      </div>
    );
  }
}

DataSelector.propTypes = {
  title: PropTypes.string.isRequired
};

export default DataSelector;
