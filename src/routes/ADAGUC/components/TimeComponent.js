import React from 'react';
import ButtonPausePlayAnimation from './ButtonPausePlayAnimation.js';
import CanvasComponent from './CanvasComponent.js';
import { Icon } from 'react-fa';
import { Button, Col, Row } from 'reactstrap';
var elementResizeEvent = require('element-resize-event');

export default class TimeComponent extends React.Component {
  constructor () {
    super();
    this.state = {
      value: '2000-01-01T00:00:00Z'
    };
    this.onRenderCanvas = this.onRenderCanvas.bind(this);
    this.eventOnDimChange = this.eventOnDimChange.bind(this);
    this.eventOnMapDimUpdate = this.eventOnMapDimUpdate.bind(this);
    this.drawCanvas = this.drawCanvas.bind(this);
    this.onClickCanvas = this.onClickCanvas.bind(this);
    this.onClickCanvas = this.onClickCanvas.bind(this);
    this.handleButtonClickPrevPage = this.handleButtonClickPrevPage.bind(this);
    this.handleButtonClickNextPage = this.handleButtonClickNextPage.bind(this);
    this.handleButtonClickNow = this.handleButtonClickNow.bind(this);
    this.handleChange = this.handleChange.bind(this);
    // this.onChangeAnimation = this.onChangeAnimation.bind(this);
    this.changeYear = this.changeYear.bind(this);
    this.changeMonth = this.changeMonth.bind(this);
    this.changeDay = this.changeDay.bind(this);
    this.changeHour = this.changeHour.bind(this);
    this.changeMinute = this.changeMinute.bind(this);
    this.element = document.querySelector('.map .content');
  }
  handleChange (event) {
  }
  eventOnMapDimUpdate () {
    this.eventOnDimChange();
  }
  /* istanbul ignore next */
  eventOnDimChange () {
    this.drawCanvas();

    let timeDim = this.props.timedim;

    if (timeDim !== undefined) {
      if (this.state.value === timeDim) {
        if (this.hoverDate === this.hoverDateDone) {
          this.drawCanvas();
        }
      }
      if (timeDim !== this.state.value) {
        this.setState({ value:timeDim });
      }
    } else {
      this.drawCanvas();
    }
    this.drawCanvas();
  }
  /* istanbul ignore next */
  drawCanvas () {
    let timeDim = this.props.timedim;
    if (timeDim === undefined) {
      return;
    }
    this.hoverDateDone = this.hoverDate;
    let layers = this.props.wmjslayers.layers;
    let overlayers = this.props.wmjslayers.baselayers.filter((layer) => layer.keepOnTop === true);
    let ctx = this.ctx;
    // let canvasWidth = ctx.canvas.clientWidth;
    // let canvasHeight = ctx.canvas.clientHeight;
    // eslint-disable-next-line no-undef
    const canvasWidth = $(ctx.canvas).width();
    // eslint-disable-next-line no-undef
    const canvasHeight = $(ctx.canvas).height();
    ctx.fillStyle = '#CCC';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#FF0000';

    ctx.font = '14px Arial';
    ctx.lineWidth = 1;
    let scaleWidth = canvasWidth;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    // eslint-disable-next-line no-undef
    this.startDate = parseISO8601DateToDate(timeDim); // getCurrentDateIso8601();
    // eslint-disable-next-line no-undef
    this.endDate = parseISO8601DateToDate(timeDim); // getCurrentDateIso8601();

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
    let canvasDateIntervalStr = this.startDate.toISO8601() + '/' + this.endDate.toISO8601() + '/PT1M';
    // eslint-disable-next-line
    this.canvasDateInterval = new parseISOTimeRangeDuration(canvasDateIntervalStr);
    // let sliderStartIndex = canvasDateInterval.getTimeStepFromISODate(startDate.toISO8601());
    let sliderCurrentIndex = -1;
    try {
      sliderCurrentIndex = this.canvasDateInterval.getTimeStepFromISODate(currentDate.toISO8601(), true);
    } catch (e) {
      // ???????
      // Apparantly we're reliant on exceptions
    }
    let sliderMapIndex = this.canvasDateInterval.getTimeStepFromISODate(timeDim);
    let sliderStopIndex = this.canvasDateInterval.getTimeStepFromISODate(this.endDate.toISO8601());

    let canvasDateIntervalStrHour = this.startDate.toISO8601() + '/' + this.endDate.toISO8601() + '/PT1H';
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
    for (let j = 0; j < layers.length + 0; j++) {
      let y = j * 20 + 1 + overlayers.length * 20;
      let h = 16;
      let layer = layers[j];
      let dim = layer.getDimension('time');
      ctx.lineWidth = 1;
      ctx.fillStyle = '#F66';
      ctx.fillRect(0, y + 0.5, canvasWidth, h);
      ctx.strokeStyle = '#AAA';
      ctx.strokeRect(-1, y + 0.5, canvasWidth + 2, h);
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

          ctx.fillRect(x + 0.5, y + 0.5, w, h);
          ctx.strokeRect(x + 0.5, y + 0.5, w, h);
        }
      }
      // ctx.font = 'bold 10pt Arial';
      // ctx.fillStyle = '#000';
      // ctx.fillText(layer.title, 6, h + y - 3);
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
    ctx.fillText(timeDim.substring(11, 16), x - 15, canvasHeight - 3);
    if (!this.element) {
      this.element = document.querySelector('.map .content');
      elementResizeEvent(this.element, this.drawCanvas);
    }
  }
  /* istanbul ignore next */
  toISO8601 (value) {
    function prf (input, width) {
      // print decimal with fixed length (preceding zero's)
      let string = input + '';
      let len = width - string.length;
      let zeros = '';
      for (let j = 0; j < len; j++) {
        zeros += '0' + zeros;
      }
      string = zeros + string;
      return string;
    }
    let iso = prf(value.year, 4) + '-' + prf(value.month, 2) + '-' + prf(value.day, 2) + 'T' + prf(value.hour, 2) + ':' + prf(value.minute, 2) + ':' + prf(value.second, 2) + 'Z';
    return iso;
  }
  /* istanbul ignore next */
  setNewDate (value) {
    let isodate = this.toISO8601(value);
    // eslint-disable-next-line no-undef
    var date = parseISO8601DateToDate(isodate);
    this.props.dispatch(this.props.actions.setTimeDimension(date.toISO8601()));
    // this.props.webmapjs.setDimension('time', date.toISO8601(), true);
    // this.props.webmapjs.draw();
    this.eventOnDimChange();
  }
  /* istanbul ignore next */
  decomposeDateString (value) {
    return { year:parseInt(this.state.value.substring(0, 4)),
      month : parseInt(this.state.value.substring(5, 7)),
      day : parseInt(this.state.value.substring(8, 10)),
      hour : parseInt(this.state.value.substring(11, 13)),
      minute : parseInt(this.state.value.substring(14, 16)),
      second : parseInt(this.state.value.substring(17, 19))
    };
  }
  /* istanbul ignore next */
  changeYear (value) {
    let date = this.decomposeDateString(this.state.value); date.year = value; this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeMonth (value) {
    let date = this.decomposeDateString(this.state.value); date.month = value; this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeDay (value) {
    let date = this.decomposeDateString(this.state.value); date.day = value; this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeHour (value) {
    let date = this.decomposeDateString(this.state.value); date.hour = value; this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeMinute (value) {
    let date = this.decomposeDateString(this.state.value); date.minute = value; this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeSecond (value) {
    let date = this.decomposeDateString(this.state.value); date.second = value; this.setNewDate(date);
  }
  /* istanbul ignore next */
  componentDidMount () {
    setInterval(this.drawCanvas, 60000);
  }
  componentDidUpdate () {
    this.drawCanvas();
  }
  /* istanbul ignore next */
  componentWillUnmount () {
    this.element = undefined;
  }
  /* istanbul ignore next */
  onRenderCanvas (ctx) {
    this.ctx = ctx;
  }
  /* istanbul ignore next */
  onClickCanvas (x, y) {
    let t = x / this.ctx.canvas.clientWidth;
    let s = this.canvasDateInterval.getTimeSteps() - 1;
    let newTimeStep = parseInt(t * s);
    /* istanbul ignore next */
    try {
      let newDate = this.canvasDateInterval.getDateAtTimeStep(newTimeStep, true);
      this.props.dispatch(this.props.actions.setTimeDimension(newDate.toISO8601()));
      // this.props.webmapjs.setDimension('time', newDate.toISO8601(), true);
      // this.props.webmapjs.draw();
      this.eventOnDimChange();
    } catch (e) {
      throw new Error('311: ', e);
    }
  }
  handleButtonClickNow () {
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    this.props.dispatch(this.props.actions.setTimeDimension(currentDate.toISO8601()));
    // this.props.webmapjs.setDimension('time', currentDate.toISO8601(), true);
    // this.props.webmapjs.draw();
    this.eventOnDimChange();
  }
  handleButtonClickPrevPage () {
    let date = this.decomposeDateString(this.state.value);
    date.hour -= 1;
    this.setNewDate(date);
  }
  handleButtonClickNextPage () {
    let date = this.decomposeDateString(this.state.value);
    date.hour += 1;
    this.setNewDate(date);
  }

  render () {
    /* istanbul ignore next */

    return (
      <Col>
        <Row style={{ flex: 1 }}>
          <Col xs='auto'>
            <ButtonPausePlayAnimation dispatch={this.props.dispatch} actions={this.props.actions} />
          </Col>
          <Col xs='auto'>
            <Button color='primary' size='large' onClick={this.handleButtonClickNow}>Now</Button>
          </Col>
          <Col xs='auto'>
            <Button color='primary' onClick={this.handleButtonClickPrevPage}>
              <Icon name='chevron-left' />
            </Button>
          </Col>
          <Col>
            <CanvasComponent id='timeline' onRenderCanvas={this.onRenderCanvas} onClick={this.onClickCanvas} />
          </Col>
          <Col xs='auto'>
            <Button color='primary' onClick={this.handleButtonClickNextPage}>
              <Icon name='chevron-right' />
            </Button>
          </Col>
        </Row>
      </Col>
    );
  }
}
TimeComponent.propTypes = {
  timedim: React.PropTypes.string,
  wmjslayers: React.PropTypes.object,
  dispatch: React.PropTypes.func,
  actions: React.PropTypes.object
};
