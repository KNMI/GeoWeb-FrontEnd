import React from 'react';
import { Button, Input } from 'reactstrap';
import { Icon } from 'react-fa';

const NumberSpinner = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    value: React.PropTypes.number,
    numDigits: React.PropTypes.number,
    renderAsMonth: React.PropTypes.bool,
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
      renderAsMonth: false,
      onChange:function () {}
    };
  },
  formatNumDigits (value) {
    let { numDigits } = this.props;
    let v = '' + value;
    while (v.length < numDigits) { v = '0' + v; }
    while (v.length > numDigits) { v = v.substring(1); }
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
    if (this.props.renderAsMonth) {
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
        default: { value = '0'; break; }
      }
    } else {
      value = this.formatNumDigits(this.state.value);
    }
    return <div style={{ width: this.props.width, display:'inline-block' }} >
      <Button id='incNumberspinner' style={{ padding: 0 }} onClick={this.handleClickUp} block>
        <Icon name='chevron-up' />
      </Button>
      <Input type='text' value={value}
        onChange={this.handleChange}
        style={{ fontSize:22, height:25, padding: '5px', textAlign: 'center' }} />
      <Button id='decNumberspinner' style={{ padding: 0 }} onClick={this.handleClickDown} block>
        <Icon name='chevron-down' />
      </Button>
    </div>;
  }
});

export default NumberSpinner;
