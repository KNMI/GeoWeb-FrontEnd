import React from 'react';
import NumberSpinner from './NumberSpinner.js';
const TimeComponent = React.createClass({
  propTypes: {
    onChange: React.PropTypes.func,
    date: React.PropTypes.string,
    webmapjs: React.PropTypes.object
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
  eventOnMapDimUpdate () {
    this.eventOnDimChange();
  },
  eventOnDimChange () {
    let timeDim = this.props.webmapjs.getDimension('time');
    if (timeDim !== undefined) {
      this.setState({ value:timeDim.currentValue });
    }
  },
  toISO8601 (value) {
    function prf (input, width) {
      // print decimal with fixed length (preceding zero's)
      let string = input + '';
      let len = width - string.length;
      let j = '';
      let zeros = '';
      for (j = 0; j < len; j++)zeros += '0' + zeros;
      string = zeros + string;
      return string;
    }
    let iso = prf(value.year, 4) +
        '-' + prf(value.month , 2) +
            '-' + prf(value.day, 2) +
                'T' + prf(value.hour, 2) +
                    ':' + prf(value.minute, 2) +
                        ':' + prf(value.second, 2) + 'Z';
    return iso;
  },
  setNewDate (value) {
    let isodate = this.toISO8601(value);
    var date = parseISO8601DateToDate(isodate);
    this.props.webmapjs.setDimension('time',date.toISO8601());
    this.props.webmapjs.draw();
    this.eventOnDimChange();
  },
  decomposeDateString (value) {
    return { year:parseInt(this.state.value.substring(0, 4)),
      month : parseInt(this.state.value.substring(5, 7)),
      day : parseInt(this.state.value.substring(8, 10)),
      hour : parseInt(this.state.value.substring(11, 13)),
      minute : parseInt(this.state.value.substring(14, 16)),
      second : parseInt(this.state.value.substring(17, 19))
    };
  },
  changeYear (value) {
    let date = this.decomposeDateString(this.state.value); date.year = value; this.setNewDate(date);
  },
  changeMonth (value) {
    let date = this.decomposeDateString(this.state.value); date.month = value; this.setNewDate(date);
  },
  changeDay (value) {
    let date = this.decomposeDateString(this.state.value); date.day = value; this.setNewDate(date);
  },
  changeHour (value) {
    let date = this.decomposeDateString(this.state.value); date.hour = value; this.setNewDate(date);
  },
  changeMinute (value) {
    let date = this.decomposeDateString(this.state.value); date.minute = value; this.setNewDate(date);
  },
  changeSecond (value) {
    let date = this.decomposeDateString(this.state.value); date.second = value; this.setNewDate(date);
  },
  render () {
    if (this.props.webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        this.props.webmapjs.addListener('onmapdimupdate', this.eventOnMapDimUpdate, true);
        this.props.webmapjs.addListener('ondimchange', this.eventOnDimChange, true);
      }
    }
    let { year, month, day, hour, minute, second } = this.decomposeDateString(this.state.value);


    return <div >
      <NumberSpinner value={year} numDigits={4} width={100} onChange={this.changeYear} />
      <NumberSpinner value={month} numDigits={2} width={60} onChange={this.changeMonth} />
      <NumberSpinner value={day} numDigits={2} width={60} onChange={this.changeDay} />
      <NumberSpinner value={hour} numDigits={2} width={60} onChange={this.changeHour} />
      <NumberSpinner value={minute} numDigits={2} width={60} onChange={this.changeMinute} />
      <NumberSpinner value={second} numDigits={2} width={60} onChange={this.changeSecond} />

    </div>;
  }
});

export default TimeComponent;
