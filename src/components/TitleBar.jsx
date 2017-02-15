import React, { Component, PropTypes } from 'react';

class TitleBar extends Component {
  render () {
    const { title } = this.props;
    return (
      <div>
        <span>TitleBar:</span>
        {title || 'Oops'}
      </div>
    );
  }
}

TitleBar.propTypes = {
  title: PropTypes.string.isRequired
};

export default TitleBar;
