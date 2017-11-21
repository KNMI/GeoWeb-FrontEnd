import React, { PureComponent } from 'react';
import CanvasComponent from './CanvasComponent.js';
import { Icon } from 'react-fa';
import { Button, Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { debounce } from '../../utils/debounce';

export default class TimeComponent extends PureComponent {
  constructor () {
    super();
    this.onRenderCanvas = this.onRenderCanvas.bind(this);
    this.eventOnDimChange = this.eventOnDimChange.bind(this);
    this.eventOnMapDimUpdate = this.eventOnMapDimUpdate.bind(this);
    this.drawCanvas = this.drawCanvas.bind(this);
    this.onCanvasClick = this.onCanvasClick.bind(this);
    this.handleButtonClickPrevPage = this.handleButtonClickPrevPage.bind(this);
    this.handleButtonClickNextPage = this.handleButtonClickNextPage.bind(this);
    this.handleButtonClickNow = this.handleButtonClickNow.bind(this);
    this.changeYear = this.changeYear.bind(this);
    this.changeMonth = this.changeMonth.bind(this);
    this.changeDay = this.changeDay.bind(this);
    this.changeHour = this.changeHour.bind(this);
    this.changeMinute = this.changeMinute.bind(this);
    this.debouncedForceUpdate = debounce(this.forceUpdate, 100, false);
  }
  /* istanbul ignore next */
  eventOnMapDimUpdate () {
    this.eventOnDimChange();
  }
  /* istanbul ignore next */
  eventOnDimChange () {
    window.requestAnimationFrame(this.drawCanvas);
  }

  /* istanbul ignore next */
  drawTimeIndicationBlocks (ctx, timeBlockStartIndex, timeBlockStopIndex, canvasDateIntervalHour, sliderStopIndex, scaleWidth, canvasHeight) {
    for (let j = timeBlockStartIndex - 1; j < timeBlockStopIndex + 1; j++) {
      const dateAtTimeStep = canvasDateIntervalHour.getDateAtTimeStep(j);
      const layerTimeIndex = this.canvasDateInterval.getTimeStepFromDate(dateAtTimeStep);
      const layerTimeIndexNext = this.canvasDateInterval.getTimeStepFromDate(canvasDateIntervalHour.getDateAtTimeStep(j + 1));
      const pos = layerTimeIndex / sliderStopIndex;
      const width = (layerTimeIndexNext - layerTimeIndex) / sliderStopIndex;
      ctx.fillStyle = '#AAA';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.5;
      const x = parseInt(pos * scaleWidth);
      ctx.fillRect(x + 0.5, canvasHeight - 16 + 0.5, width * scaleWidth + 0.5, 15);
      ctx.strokeRect(x + 0.5, canvasHeight - 16 + 0.5, width * scaleWidth + 0.5, 15);
      ctx.fillStyle = '#000';
      ctx.fillText(dateAtTimeStep.getUTCHours() + 'H', pos * scaleWidth + 3, canvasHeight - 3);
    }
  }

  /* istanbul ignore next */
  drawLayerBlocks (ctx, canvasWidth, sliderStopIndex, sliderMapIndex, scaleWidth) {
    // TODO: if only time changes just redraw that part?
    const layers = this.props.wmjslayers.layers;
    const overlayers = this.props.wmjslayers.baselayers.filter(layer => layer.keepOnTop === true);
    const layerHeight = 20;
    const blockHeight = 16;
    ctx.lineWidth = 1;
    for (let j = 0; j < layers.length; j++) {
      const y = j * layerHeight + 1 + overlayers.length * layerHeight;
      const layer = layers[j];
      const dim = layer.getDimension('time');
      if (!dim) {
        continue;
      }
      ctx.fillStyle = '#F66';
      ctx.strokeStyle = '#AAA';
      ctx.fillRect(0, y + 0.5, canvasWidth, blockHeight);
      ctx.strokeRect(-1, y + 0.5, canvasWidth + 2, blockHeight);
      const layerStartIndex = dim.getIndexForValue(this.startDate, false);
      const layerStopIndex = dim.getIndexForValue(this.endDate, false);
      for (let j = layerStartIndex - 1; j < layerStopIndex + 1; j++) {
        let layerTimeIndex;
        let layerTimeIndexNext;
        try {
          layerTimeIndex = this.canvasDateInterval.getTimeStepFromISODate(dim.getValueForIndex(j));
          layerTimeIndexNext = this.canvasDateInterval.getTimeStepFromISODate(dim.getValueForIndex(j + 1));
        } catch (error) {
          console.error('Layer probably does not have a time dimension');
          continue;
        }
        const pos = layerTimeIndex / sliderStopIndex;
        const posNext = layerTimeIndexNext / sliderStopIndex;
        ctx.fillStyle = '#BBB';
        if (sliderMapIndex >= layerTimeIndex && sliderMapIndex < layerTimeIndexNext) {
          ctx.fillStyle = '#FFFF60';
        }
        ctx.strokeStyle = '#888';
        const x = parseInt(pos * scaleWidth);
        const w = parseInt(posNext * scaleWidth) - x;

        ctx.fillRect(x + 0.5, y + 0.5, w, blockHeight);
        ctx.strokeRect(x + 0.5, y + 0.5, w, blockHeight);
      }
    }
  }

  /* istanbul ignore next */
  drawCanvas () {
    const { timedim, wmjslayers } = this.props;
    if (!timedim) {
      return;
    }
    if (timedim.length !== 20 || timedim[19] !== 'Z' || timedim[10] !== 'T') {
      return;
    }
    this.hoverDateDone = this.hoverDate;
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    // eslint-disable-next-line no-undef
    const canvasWidth = ctx.canvas.width;
    // eslint-disable-next-line no-undef
    const numlayers = wmjslayers.baselayers && wmjslayers.layers ? wmjslayers.baselayers.length + wmjslayers.layers.length + 1 : 2;
    const canvasHeight = 20 * numlayers;

    this.canvasHeight = canvasHeight;
    this.timedim = timedim;
    this.ctxCanvasHeight = ctx.canvas.height;
    this.ctxCanvasWidth = ctx.canvas.width;

    ctx.fillStyle = '#CCC';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#FF0000';

    ctx.font = '14px Arial';
    ctx.lineWidth = 1;
    const scaleWidth = canvasWidth;
    // eslint-disable-next-line no-undef
    const currentDate = getCurrentDateIso8601();
    // eslint-disable-next-line no-undef
    this.startDate = parseISO8601DateToDate(timedim);
    // eslint-disable-next-line no-undef
    this.endDate = parseISO8601DateToDate(timedim);

    this.timeWidth = 24 / 2;
    const hours = this.startDate.getUTCHours();
    const h = parseInt(hours / this.timeWidth) * this.timeWidth;
    this.startDate.setUTCHours(h);
    this.startDate.setUTCMinutes(0);
    this.startDate.setUTCSeconds(0);
    this.endDate.setUTCHours(h);
    this.endDate.setUTCMinutes(0);
    this.endDate.setUTCSeconds(0);

    // eslint-disable-next-line no-undef
    this.startDate.add(new DateInterval(0, 0, 0, 0, 0, 0));
    // eslint-disable-next-line no-undef
    this.endDate.add(new DateInterval(0, 0, 0, this.timeWidth, 0, 0));
    const canvasDateIntervalStr = this.startDate.toISO8601() + '/' + this.endDate.toISO8601() + '/PT1M';
    // eslint-disable-next-line
    this.canvasDateInterval = new parseISOTimeRangeDuration(canvasDateIntervalStr);
    let sliderCurrentIndex = -1;
    try {
      sliderCurrentIndex = this.canvasDateInterval.getTimeStepFromISODate(currentDate.toISO8601(), true);
    } catch (e) {
      // ???????
      // Apparantly we're reliant on exceptions
    }
    const sliderMapIndex = this.canvasDateInterval.getTimeStepFromISODate(timedim);
    const sliderStopIndex = this.canvasDateInterval.getTimeStepFromISODate(this.endDate.toISO8601());

    const canvasDateIntervalStrHour = this.startDate.toISO8601() + '/' + this.endDate.toISO8601() + '/PT1H';
    // eslint-disable-next-line
    const canvasDateIntervalHour = new parseISOTimeRangeDuration(canvasDateIntervalStrHour);
    const timeBlockStartIndex = canvasDateIntervalHour.getTimeStepFromDate(this.startDate);
    const timeBlockStopIndex = canvasDateIntervalHour.getTimeStepFromISODate(this.endDate.toISO8601());

    /* Draw system time, past and future */
    let x = parseInt((sliderCurrentIndex / sliderStopIndex) * scaleWidth) + 0.5;
    ctx.fillStyle = '#CFC';
    ctx.fillRect(0, 0, x - 0, canvasHeight);
    ctx.fillStyle = '#DDF';
    ctx.fillRect(x, 0, canvasWidth - x, canvasHeight);

    /* Draw time indication blocks */
    this.drawTimeIndicationBlocks(ctx, timeBlockStartIndex, timeBlockStopIndex, canvasDateIntervalHour, sliderStopIndex, scaleWidth, canvasHeight);
    /* Draw blocks for layer */
    this.drawLayerBlocks(ctx, canvasWidth, sliderStopIndex, sliderMapIndex, scaleWidth);

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
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 0.0, 0);
    ctx.lineTo(x + 0.0, canvasHeight);
    ctx.stroke();

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 0.5;
    ctx.fillStyle = '#EEE';
    ctx.fillRect(x - 26, canvasHeight - 15, 52, 14);
    ctx.fillStyle = '#000000';
    ctx.fillText(timedim.substring(11, 16), x - 15, canvasHeight - 3);
  }
  /* istanbul ignore next */
  toISO8601 (value) {
    function prf (input, width) {
      // print decimal with fixed length (preceding zero's)
      let string = input + '';
      const len = width - string.length;
      let zeros = '';
      for (let j = 0; j < len; j++) {
        zeros += '0' + zeros;
      }
      string = zeros + string;
      return string;
    }
    if (typeof value === 'string') {
      return value;
    }
    let iso = prf(value.year, 4) +
    '-' + prf(value.month, 2) +
    '-' + prf(value.day, 2) +
    'T' + prf(value.hour, 2) +
    ':' + prf(value.minute, 2) +
    ':' + prf(value.second, 2) + 'Z';
    return iso;
  }
  /* istanbul ignore next */
  setNewDate (value) {
    if (!value) {
      return;
    }
    const isodate = this.toISO8601(value);
    // eslint-disable-next-line no-undef
    const date = parseISO8601DateToDate(isodate);
    this.props.dispatch(this.props.adagucActions.setTimeDimension(date.toISO8601()));
    this.eventOnDimChange();
  }
  /* istanbul ignore next */
  decomposeDateString (value) {
    return { year: parseInt(value.substring(0, 4)),
      month: parseInt(value.substring(5, 7)),
      day: parseInt(value.substring(8, 10)),
      hour: parseInt(value.substring(11, 13)),
      minute: parseInt(value.substring(14, 16)),
      second: parseInt(value.substring(17, 19))
    };
  }
  /* istanbul ignore next */
  changeYear (value) {
    const date = this.decomposeDateString(this.props.timedim);
    date.year = value;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeMonth (value) {
    const date = this.decomposeDateString(this.props.timedim);
    date.month = value;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeDay (value) {
    const date = this.decomposeDateString(this.props.timedim);
    date.day = value;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeHour (value) {
    const date = this.decomposeDateString(this.props.timedim);
    date.hour = value;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeMinute (value) {
    const date = this.decomposeDateString(this.props.timedim);
    date.minute = value;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  changeSecond (value) {
    const date = this.decomposeDateString(this.props.timedim);
    date.second = value;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  componentDidMount () {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(window.requestAnimationFrame(this.drawCanvas), 60000);
  }
  /* istanbul ignore next */
  componentDidUpdate () {
    window.requestAnimationFrame(this.drawCanvas);
  }
  /* istanbul ignore next */
  componentWillUnmount () {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
  /* istanbul ignore next */
  onRenderCanvas (ctx) {
    this.ctx = ctx;
  }
  /* istanbul ignore next */
  onCanvasClick (x) {
    const t = x / this.ctx.canvas.clientWidth;
    const s = this.canvasDateInterval.getTimeSteps() - 1;
    const newTimeStep = parseInt(t * s);
    /* istanbul ignore next */
    const newDate = this.canvasDateInterval.getDateAtTimeStep(newTimeStep, true);
    this.setNewDate(newDate.toISO8601());
  }
  /* istanbul ignore next */
  handleButtonClickNow () {
    // eslint-disable-next-line no-undef
    const currentDate = getCurrentDateIso8601();
    this.props.dispatch(this.props.actions.setTimeDimension(currentDate.toISO8601()));
    this.eventOnDimChange();
  }
  /* istanbul ignore next */
  handleButtonClickPrevPage () {
    const date = this.decomposeDateString(this.props.timedim);
    date.hour -= 1;
    this.setNewDate(date);
  }
  /* istanbul ignore next */
  handleButtonClickNextPage () {
    const date = this.decomposeDateString(this.props.timedim);
    date.hour += 1;
    this.setNewDate(date);
  }

  shouldComponentUpdate (nextProps) {
    const currentNumlayers = this.props.wmjslayers.baselayers && this.props.wmjslayers.layers ? this.props.wmjslayers.baselayers.length + this.props.wmjslayers.layers.length + 1 : 2;
    const nextNumlayers = nextProps.wmjslayers.baselayers && nextProps.wmjslayers.layers ? nextProps.wmjslayers.baselayers.length + nextProps.wmjslayers.layers.length + 1 : 2;
    return this.props.timedim !== nextProps.timedim ||
           this.props.width !== nextProps.width ||
           this.props.height !== nextProps.height ||
           currentNumlayers !== nextNumlayers ||
           this.props.activeMapId !== nextProps.activeMapId;
  }

  /* istanbul ignore next */
  render () {
    const { wmjslayers } = this.props;
    const numlayers = wmjslayers.baselayers && wmjslayers.layers ? wmjslayers.baselayers.length + wmjslayers.layers.length + 1 : 2;
    const height = 20 * numlayers;
    return (
      <Row style={{ flex: 1 }}>
        <Col xs='auto'>
          <Button outline color='info' onClick={this.handleButtonClickPrevPage}>
            <Icon name='chevron-left' />
          </Button>
        </Col>
        <Col style={{ height: height }}>
          <CanvasComponent onRenderCanvas={this.onRenderCanvas} onCanvasClick={this.onCanvasClick} />
        </Col>
        <Col xs='auto'>
          <Button outline color='info' onClick={this.handleButtonClickNextPage}>
            <Icon name='chevron-right' />
          </Button>
        </Col>
      </Row>
    );
  }
}
TimeComponent.propTypes = {
  timedim: PropTypes.string,
  wmjslayers: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  adagucActions: PropTypes.object,
  activeMapId: PropTypes.number
};
