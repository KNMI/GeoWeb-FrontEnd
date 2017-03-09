import React, { Component, PropTypes } from 'react';

class Panel extends Component {
  render () {
    const { title } = this.props;
    return (
      <div className='panel'>
        <span>Location for panel title:</span>
        {title || 'Oops'}
      </div>
    );
  }
}

Panel.propTypes = {
  title: PropTypes.string.isRequired
};

export default Panel;
