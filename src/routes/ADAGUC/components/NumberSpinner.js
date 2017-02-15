import React from 'react';
import { Button, Glyphicon, FormControl } from 'react-bootstrap';

const NumberSpinner = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    value: React.PropTypes.number,
    numDigits: React.PropTypes.number,
    width: React.PropTypes.number
  },
  getInitialState () {
    return { value: this.props.value };
  },
  getDefaultProps () {
    return {
      numDigits: 3,
      value:200,
      width:100,
      onChange:function () {}
    };
  },
  formatNumDigits (value, numdigits) {
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
    return <div style={{ width: this.props.width, display:'inline-block' }} >
      <Button style={{ padding: 0 }} onClick={this.handleClickUp} block>
        <Glyphicon glyph='glyphicon glyphicon-chevron-up' />
      </Button>
      <FormControl bsStyle='primary' type='text' value={this.formatNumDigits(this.state.value, this.props.numDigits)}
        onChange={this.handleChange}
        style={{ fontSize:25, height:35, textAlign:'center' }} />
      <Button style={{ padding: 0 }} onClick={this.handleClickDown} block>
        <Glyphicon glyph='glyphicon glyphicon-chevron-down' />
      </Button>
    </div>;
  }
});

export default NumberSpinner;
