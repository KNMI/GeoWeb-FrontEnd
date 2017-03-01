import React from 'react';
import { Button, Input } from 'reactstrap';
import { Icon } from 'react-fa';

const NumberSpinner = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    value: React.PropTypes.number,
    numDigits: React.PropTypes.string,
    width: React.PropTypes.number
  },
  getInitialState () {
    return { value: this.props.value };
  },
  getDefaultProps () {
    return {
      numDigits: 2,
      value:200,
      width:100,
      onChange:function () {}
    };
  },
  formatNumDigits (value, _numdigits) {
    let numdigits = parseInt(_numdigits);
    let v = '' + value;
    while (v.length < numdigits) { v = '0' + v; }
    while (v.length > numdigits) { v = v.substring(1); }
    return v;
  },
  handleClickUp (event) {
    let newNumber = parseInt(this.state.value) + 1;
    this.setState({ value:newNumber });
    this.props.onChange(newNumber);
  },
  handleClickDown (event) {
    let newNumber = parseInt(this.state.value) - 1;
    this.setState({ value:newNumber });
    this.props.onChange(newNumber);
  },
  handleChange (event) {
    this.setState({ value: event.target.value });
    this.props.onChange(event.target.value);
  },
  componentWillReceiveProps (nextProps) {
    this.setState(nextProps);
  },
  render () {
    let value = this.state.value;
    if (this.props.numDigits === 'month') {
      switch (this.state.value) {
        case 1: { value = 'JAN'; break; }
        case 2: { value = 'FEB'; break; }
        case 3: { value = 'MAR'; break; }
        case 4: { value = 'APR'; break; }
        case 5: { value = 'MAY'; break; }
        case 6: { value = 'JUN'; break; }
        case 7: { value = 'JUL'; break; }
        case 8: { value = 'AUG'; break; }
        case 9: { value = 'SEP'; break; }
        case 10: { value = 'OCT'; break; }
        case 11: { value = 'NOV'; break; }
        case 12: { value = 'DEC'; break; }
        default:'0';
      }
    } else {
      value = this.formatNumDigits(this.state.value, this.props.numDigits);
    }
    return <div style={{ width: this.props.width, display:'inline-block' }} >
      <Button style={{ padding: 0 }} onClick={this.handleClickUp} block>
        <Icon name='chevron-up' />
      </Button>
      <Input type='text' value={value}
        onChange={this.handleChange}
        style={{ fontSize:22, height:25, padding: '5px', textAlign: 'center' }} />
      <Button style={{ padding: 0 }} onClick={this.handleClickDown} block>
        <Icon name='chevron-down' />
      </Button>
    </div>;
  }
});

export default NumberSpinner;
