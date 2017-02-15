import React from 'react';

export default class HomeView extends React.Component {
  render () {
    return (
      <div>
        {this.props.children}
      </div>
    );
  }
}

HomeView.propTypes = {
  children: React.PropTypes.array
};
