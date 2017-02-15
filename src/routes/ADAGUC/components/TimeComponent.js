import React from 'react';
import NumberSpinner from './NumberSpinner.js';
import ButtonPausePlayAnimation from './ButtonPausePlayAnimation.js';
import CanvasComponent from './CanvasComponent.js';
import { Button, Glyphicon } from 'react-bootstrap';
const TimeComponent = React.createClass({
  propTypes: {
    onChangeAnimation: React.PropTypes.func,
    date: React.PropTypes.string,
    webmapjs: React.PropTypes.object,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },
  getInitialState () {
    return { value: this.props.date };
  },
  getDefaultProps () {
    return {
      date:'2000-01-01T00:00:00Z',
      onChangeAnimation:function () {},
      width:300,
      height:80
    };
  },
  handleChange (event) {
  },
  eventOnMapDimUpdate () {
    this.eventOnDimChange();
  },
  eventOnDimChange () {
    if (!this.props.webmapjs) return;
    let timeDim = this.props.webmapjs.getDimension('time');

    // console.log(timeDim);
    if (timeDim !== undefined) {
      if (this.state.value === timeDim.currentValue) {
        if (this.hoverDate === this.hoverDateDone) {
          // console.log('ret');
          return;
        }
      }
      this.setState({ value:timeDim.currentValue });
    } else {
      return;
    }
    this.hoverDateDone = this.hoverDate;

    let layers = this.props.webmapjs.getLayers();

    let ctx = this.ctx;
    let canvasWidth = ctx.canvas.clientWidth;
    let canvasHeight = ctx.canvas.clientHeight;
    ctx.fillStyle = '#CCC';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#FF0000';

    ctx.font = '14px Arial';
    ctx.lineWidth = 1;
    let scaleWidth = canvasWidth;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    // eslint-disable-next-line no-undef
    this.startDate = parseISO8601DateToDate(timeDim.currentValue); // getCurrentDateIso8601();
    // eslint-disable-next-line no-undef
    this.endDate = parseISO8601DateToDate(timeDim.currentValue); // getCurrentDateIso8601();

    this.timeWidth = 24 / 2;
    let hours = this.startDate.getUTCHours();
    let h = parseInt(hours / this.timeWidth) * this.timeWidth;
    this.startDate.setUTCHours(h);
    this.startDate.setUTCMinutes(0);
    this.startDate.setUTCSeconds(0);
    this.endDate.setUTCHours(h);
    this.endDate.setUTCMinutes(0);
    this.endDate.setUTCSeconds(0);

    // eslint-disable-next-line no-undef
    // startDate.substract(new DateInterval(0, 0, 0, 12, 0, 0));

    // eslint-disable-next-line no-undef
    this.startDate.add(new DateInterval(0, 0, 0, 0, 0, 0));
    // eslint-disable-next-line no-undef
    this.endDate.add(new DateInterval(0, 0, 0, this.timeWidth, 0, 0));
    // console.log(startDate.toISO8601());
    let canvasDateIntervalStr = this.startDate.toISO8601() + '/' + this.endDate.toISO8601() + '/PT1M';
    // console.log(canvasDateIntervalStr);
    // eslint-disable-next-line
    this.canvasDateInterval = new parseISOTimeRangeDuration(canvasDateIntervalStr);
    // console.log(canvasDateInterval);
    // let sliderStartIndex = canvasDateInterval.getTimeStepFromISODate(startDate.toISO8601());
    let sliderCurrentIndex = -1;
    try {
      sliderCurrentIndex = this.canvasDateInterval.getTimeStepFromISODate(currentDate.toISO8601(), true);
    } catch (e) {
      // Current date is out of range
      // console.log(e);
    }
    let sliderMapIndex = this.canvasDateInterval.getTimeStepFromISODate(timeDim.currentValue);
    let sliderStopIndex = this.canvasDateInterval.getTimeStepFromISODate(this.endDate.toISO8601());

    let canvasDateIntervalStrHour = this.startDate.toISO8601() + '/' + this.endDate.toISO8601() + '/PT1H';
    // // console.log(canvasDateIntervalStr);
    // eslint-disable-next-line no-undef
    // eslint-disable-next-line
    let canvasDateIntervalHour = new parseISOTimeRangeDuration(canvasDateIntervalStrHour);
    let timeBlockStartIndex = canvasDateIntervalHour.getTimeStepFromDate(this.startDate);
    let timeBlockStopIndex = canvasDateIntervalHour.getTimeStepFromISODate(this.endDate.toISO8601());

    /* Draw system time, past and future */
    let x = parseInt((sliderCurrentIndex / sliderStopIndex) * scaleWidth) + 0.5;
    ctx.fillStyle = '#CFC';
    ctx.fillRect(0, 0, x - 0, canvasHeight);
    ctx.fillStyle = '#DDF';
    ctx.fillRect(x, 0, canvasWidth - x, canvasHeight);

    /* Draw time indication blocks */
    for (let j = timeBlockStartIndex - 1; j < timeBlockStopIndex + 1; j++) {
      let dateAtTimeStep = canvasDateIntervalHour.getDateAtTimeStep(j);
      let layerTimeIndex = this.canvasDateInterval.getTimeStepFromDate(dateAtTimeStep);
      let layerTimeIndexNext = this.canvasDateInterval.getTimeStepFromDate(canvasDateIntervalHour.getDateAtTimeStep(j + 1));
      let pos = layerTimeIndex / sliderStopIndex;
      let width = (layerTimeIndexNext - layerTimeIndex) / sliderStopIndex;
      ctx.fillStyle = '#AAA';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      let x = parseInt(pos * scaleWidth);
      ctx.fillRect(x + 0.5, canvasHeight - 16 + 0.5, width * scaleWidth + 0.5, 15);
      ctx.strokeRect(x + 0.5, canvasHeight - 16 + 0.5, width * scaleWidth + 0.5, 15);
      ctx.fillStyle = '#000';
      ctx.fillText(dateAtTimeStep.getUTCHours() + 'H', pos * scaleWidth + 3, canvasHeight - 3);
    }

    /* Draw blocks for layer */
    for (let j = 0; j < layers.length; j++) {
      let y = j * 25 + 1;
      let h = 16;
      let layer = layers[j];
      let dim = layer.getDimension('time');
      ctx.lineWidth = 1;
      ctx.fillStyle = '#F66';
      ctx.fillRect(0, 5 + y + 0.5, canvasWidth, h);
      ctx.strokeStyle = '#AAA';
      ctx.strokeRect(-1, 5 + y + 0.5, canvasWidth + 2, h);
      if (dim) {
        let layerStartIndex = dim.getIndexForValue(this.startDate, false);
        let layerStopIndex = dim.getIndexForValue(this.endDate, false);
        for (let j = layerStartIndex - 1; j < layerStopIndex + 1; j++) {
          let layerTimeIndex = this.canvasDateInterval.getTimeStepFromISODate(dim.getValueForIndex(j));
          let layerTimeIndexNext = this.canvasDateInterval.getTimeStepFromISODate(dim.getValueForIndex(j + 1));
          let pos = layerTimeIndex / sliderStopIndex;
          let posNext = layerTimeIndexNext / sliderStopIndex;
          // let width = (layerTimeIndexNext - layerTimeIndex) / sliderStopIndex;
          ctx.fillStyle = '#BBB';
          if (sliderMapIndex >= layerTimeIndex && sliderMapIndex < layerTimeIndexNext) {
            ctx.fillStyle = '#FFFF60';
          }
          ctx.strokeStyle = '#888';
          let x = parseInt(pos * scaleWidth);
          let w = parseInt(posNext * scaleWidth) - x;

          ctx.fillRect(x + 0.5, 5 + y + 0.5, w, h);
          ctx.strokeRect(x + 0.5, 5 + y + 0.5, w, h);
        }
      }
      ctx.font = 'bold 10pt Arial';
      ctx.fillStyle = '#000';
      ctx.fillText(layer.title, 6, h + 2 + y);
    }

    /* Draw current system time */
    if (sliderCurrentIndex !== -1) {
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.strokeStyle = '#0000FF';
      x = parseInt((sliderCurrentIndex / sliderStopIndex) * scaleWidth) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }

    /* Draw current map time */
    ctx.lineWidth = 2;

    ctx.strokeStyle = '#333';
    x = parseInt((sliderMapIndex / sliderStopIndex) * scaleWidth);
    ctx.fillStyle = '#333';
    // ctx.fillRect(x - 5, 0, 10, 3);
    ctx.strokeStyle = '#444';
    // ctx.fillRect(x - 5, canvasHeight - 19, 10, 3);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 0.0, 0);
    ctx.lineTo(x + 0.0, canvasHeight);
    ctx.stroke();

    // let textXPos = x;
    // let textWidth = 30;
    // if (x > canvasWidth - (textWidth + 8)) {
    //   textXPos -= (textWidth + 8);
    // } else {
    //   textXPos += 8;
    // }
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#EEE';
    ctx.fillRect(x - 26, canvasHeight - 15, 52, 14);
    // ctx.strokeRect(x - 20.5, canvasHeight - 15.5, 40, 16);
    ctx.fillStyle = '#000000';
    ctx.fillText(timeDim.currentValue.substring(11, 16), x - 15, canvasHeight - 3);
  },
  toISO8601 (value) {
    function prf (input, width) {
      // print decimal with fixed length (preceding zero's)
      let string = input + '';
      let len = width - string.length;
      let j = '';
      let zeros = '';
      for (j = 0; j < len; j++) {
        zeros += '0' + zeros;
      }
      string = zeros + string;
      return string;
    }
    let iso = prf(value.year, 4) + '-' + prf(value.month, 2) + '-' + prf(value.day, 2) + 'T' + prf(value.hour, 2) + ':' + prf(value.minute, 2) + ':' + prf(value.second, 2) + 'Z';
    return iso;
  },
  setNewDate (value) {
    // console.log('update');
    let isodate = this.toISO8601(value);
    // eslint-disable-next-line no-undef
    var date = parseISO8601DateToDate(isodate);
    this.props.webmapjs.setDimension('time', date.toISO8601(), false);
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
  onChangeAnimation (value) {
    this.props.onChangeAnimation(value);
  },
  componentDidMount () {
    console.log('mount');
  },
  componentWillUnmount () {
    console.log('unmount');
  },
  onRenderCanvas (ctx) {
    this.ctx = ctx;
    this.eventOnDimChange();
  },
  onClickCanvas (x, y) {
    let t = x / this.ctx.canvas.clientWidth;
    let s = this.canvasDateInterval.getTimeSteps() - 1;
    let newTimeStep = parseInt(t * s);
    try {
      let newDate = this.canvasDateInterval.getDateAtTimeStep(newTimeStep, true);
      this.props.webmapjs.setDimension('time', newDate.toISO8601(), false);
      this.props.webmapjs.draw();
      this.eventOnDimChange();
    } catch (e) {
      console.log(e);
    }
  },
  handleButtonClickNow () {
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    this.props.webmapjs.setDimension('time', currentDate.toISO8601(), false);
    this.props.webmapjs.draw();
    this.eventOnDimChange();
  },
  handleButtonClickPrevPage () {
    let date = this.decomposeDateString(this.state.value);
    date.hour -= 1;
    this.setNewDate(date);
  },
  handleButtonClickNextPage () {
    let date = this.decomposeDateString(this.state.value);
    date.hour += 1;
    this.setNewDate(date);
  },
  onMouseMoveCanvas (x, y) {
    // let t = x / this.ctx.canvas.clientWidth;
    // let s = this.canvasDateInterval.getTimeSteps() - 1;
    // let newTimeStep = parseInt(t * s);
    // try {
    //   this.hoverDate = this.canvasDateInterval.getDateAtTimeStep(newTimeStep, true);
    //   this.eventOnDimChange();
    // } catch (e) {
    //   console.log(e);
    // }
  },
  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        console.log('initlistener');

        webmapjs.addListener('onlayeradd', this.eventOnMapDimUpdate, true);
        webmapjs.addListener('onmapdimupdate', this.eventOnMapDimUpdate, true);
        webmapjs.addListener('ondimchange', this.eventOnDimChange, true);
      }
    }
    let { year, month, day, hour, minute } = this.decomposeDateString(this.state.value);

    return <div style={{ display:'flex', border:'0px solid red' }}>
      <div style={{ display:'flex', flex: 1 }} >
        <div>
          <ButtonPausePlayAnimation webmapjs={this.props.webmapjs} onChange={this.onChangeAnimation} />
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <NumberSpinner value={year} numDigits={4} width={100} onChange={this.changeYear} />
          <NumberSpinner value={month} numDigits={'month'} width={90} onChange={this.changeMonth} />
          <NumberSpinner value={day} numDigits={2} width={60} onChange={this.changeDay} />
          <NumberSpinner value={hour} numDigits={2} width={60} onChange={this.changeHour} />
          <NumberSpinner value={minute} numDigits={2} width={60} onChange={this.changeMinute} />
          { /* <NumberSpinner value={second} numDigits={2} width={60} onChange={this.changeSecond} /> */ }
        </div >

      </div>
      <div>
        <Button bsStyle='primary' bsSize='large' style={{ padding:'20px', margin:'5px' }} onClick={this.handleButtonClickNow}>Now</Button>
      </div>
      <div>
        <Button bsStyle='primary' style={{ padding:'28px 5px 30px 5px', marginLeft:'1px' }} onClick={this.handleButtonClickPrevPage}>
          <Glyphicon glyph={'glyphicon glyphicon-chevron-left'} />
        </Button>
      </div>
      <div style={{ border:'0px solid blue', margin: '0px 2px 0px 2px', padding: 0, background:'white', display: 'block' }}>
        <CanvasComponent width={this.props.width - 620} height={78}
          onRenderCanvas={this.onRenderCanvas}
          onClick={this.onClickCanvas}
          onMouseMove={this.onMouseMoveCanvas} />
      </div >
      <div>
        <Button bsStyle='primary' style={{ padding:'28px 5px 30px 5px' }} onClick={this.handleButtonClickNextPage}>
          <Glyphicon glyph={'glyphicon glyphicon-chevron-right'} />
        </Button>
      </div>
    </div>;
  }
});

export default TimeComponent;
