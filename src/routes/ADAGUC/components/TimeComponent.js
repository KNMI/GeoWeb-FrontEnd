import React from 'react';
import NumberSpinner from './NumberSpinner.js';
const TimeComponent = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    date: React.PropTypes.string
  },
  getInitialState () {
    return { value: this.props.date };
  },
  getDefaultProps () {
    console.log('getDefaultProps');
    return {
      date:'2000-01-01T00:00:00Z'
    };
  },
  handleChange (event) {
  },
  render () {
    return <div className='well'>
      <NumberSpinner value={2000} numDigits={4} width={100} onChange={this.change} />
      <NumberSpinner value={1} numDigits={2} width={60} onChange={this.change} />
      <NumberSpinner value={1} numDigits={2} width={60} onChange={this.change} />

    </div>;
  }
});

export default TimeComponent;
