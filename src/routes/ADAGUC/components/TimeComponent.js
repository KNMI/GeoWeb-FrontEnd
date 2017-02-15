import React from 'react';
import NumberSpinner from './NumberSpinner.js';
import ButtonPausePlayAnimation from './ButtonPausePlayAnimation.js';
import CanvasComponent from './CanvasComponent.js';

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
    let timeDim = this.props.webmapjs.getDimension('time');
    // console.log(timeDim);
    if (timeDim !== undefined) {
      if( this.state.value == timeDim.currentValue ){
        return;
      }
      this.setState({ value:timeDim.currentValue });
    }else{
      return;
    }

    let layers = this.props.webmapjs.getLayers();



    let ctx  = this.ctx;
    let canvasWidth = ctx.canvas.clientWidth;
    let canvasHeight = ctx.canvas.clientHeight;
    ctx.fillStyle = '#CCC';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = '#FF0000';

    ctx.font = '14px Arial';


    let scaleWidth = canvasWidth;
    let currentDate = getCurrentDateIso8601 ();
    let startDate = getCurrentDateIso8601 ();
    let endDate = getCurrentDateIso8601 ();

    startDate.substract(new DateInterval (0, 0, 0, 8, startDate.getUTCMinutes(), startDate.getUTCSeconds() ));
    endDate.add(new DateInterval (0, 0, 0, 2, startDate.getUTCMinutes(), startDate.getUTCSeconds()));
    // console.log(startDate.toISO8601());
    let canvasDateIntervalStr = startDate.toISO8601()+'/'+endDate.toISO8601()+'/PT1M';
    // console.log(canvasDateIntervalStr);
    let canvasDateInterval = new parseISOTimeRangeDuration(canvasDateIntervalStr);
    // console.log(canvasDateInterval);
    let sliderStartIndex = canvasDateInterval.getTimeStepFromISODate(startDate.toISO8601());
    let sliderCurrentIndex = canvasDateInterval.getTimeStepFromISODate(currentDate.toISO8601());
    let sliderMapIndex = canvasDateInterval.getTimeStepFromISODate(timeDim.currentValue);
    let sliderStopIndex = canvasDateInterval.getTimeStepFromISODate(endDate.toISO8601());


    let canvasDateIntervalStrHour = startDate.toISO8601()+'/'+endDate.toISO8601()+'/PT1H';
    // // console.log(canvasDateIntervalStr);
    let canvasDateIntervalHour = new parseISOTimeRangeDuration(canvasDateIntervalStrHour);
    let timeBlockStartIndex = canvasDateIntervalHour.getTimeStepFromDate(startDate);
    let timeBlockStopIndex = canvasDateIntervalHour.getTimeStepFromISODate(endDate.toISO8601());


    /* Draw time indication blocks */
    for (let j = timeBlockStartIndex - 1; j < timeBlockStopIndex; j++) {
      let dateAtTimeStep = canvasDateIntervalHour.getDateAtTimeStep(j);
      let layerTimeIndex = canvasDateInterval.getTimeStepFromDate(dateAtTimeStep);
      let layerTimeIndexNext = canvasDateInterval.getTimeStepFromDate(canvasDateIntervalHour.getDateAtTimeStep(j + 1));
      let pos = layerTimeIndex/sliderStopIndex;
      let width = (layerTimeIndexNext - layerTimeIndex) / sliderStopIndex;
      ctx.fillStyle = '#606060';
      ctx.strokeStyle = '#404040';
      ctx.fillRect(pos * scaleWidth, canvasHeight-16, width * scaleWidth, 16);
      ctx.strokeRect(pos * scaleWidth,  canvasHeight-16, width * scaleWidth, 16);
      ctx.fillStyle = '#000';
      ctx.fillText(dateAtTimeStep.getUTCHours(), pos * scaleWidth, canvasHeight-3);
    }


    /* Draw blocks for layer */

    for (let j=0; j<layers.length; j++){
      let y = j*25;
      let layer = layers[j];
      let dim = layer.getDimension('time');
      let layerStartIndex = dim.getIndexForValue(startDate, false);
      let layerStopIndex = dim.getIndexForValue(currentDate, false);



      for (let j = layerStartIndex-1; j < layerStopIndex+1; j++) {
        let layerTimeIndex = canvasDateInterval.getTimeStepFromISODate(dim.getValueForIndex(j));
        let layerTimeIndexNext = canvasDateInterval.getTimeStepFromISODate(dim.getValueForIndex(j + 1));
        let pos = layerTimeIndex/sliderStopIndex;
        let width = (layerTimeIndexNext - layerTimeIndex) / sliderStopIndex;
        ctx.fillStyle = '#606060';
        if (sliderMapIndex == layerTimeIndex) {
           ctx.fillStyle = '#FFFF60';
        }

        ctx.strokeStyle = '#404040';
        ctx.fillRect(pos * scaleWidth, 5+y, width * scaleWidth, 20);
        ctx.strokeRect(pos * scaleWidth, 5+y, width * scaleWidth, 20);
      }
      ctx.fillStyle = '#000';
      ctx.fillText(layer.title, 6, 22+y);
    }

    // console.log(sliderStartIndex + ' till ' + sliderStopIndex)
    // console.log(dim.getIndexForValue(startDate));
    // console.log(dim.size()-1);
    // console.log(dim.getIndexForValue(currentDate));
    // console.log(dim.getIndexForValue(currentDate,false));

    /* Draw current system time */
    ctx.beginPath();
    ctx.strokeStyle = '#0000FF';
    ctx.moveTo((sliderCurrentIndex / sliderStopIndex) * scaleWidth, 0);
    ctx.lineTo((sliderCurrentIndex / sliderStopIndex) * scaleWidth, 150);
    ctx.stroke();

    /* Draw current map time */
    ctx.beginPath();
    ctx.strokeStyle = '#FF0000';
    ctx.moveTo((sliderMapIndex / sliderStopIndex) * scaleWidth, 0);
    ctx.lineTo((sliderMapIndex / sliderStopIndex) * scaleWidth, 150);
    ctx.stroke();
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
    console.log('update');
    let isodate = this.toISO8601(value);
    // eslint-disable-next-line no-undef
    var date = parseISO8601DateToDate(isodate);
    this.props.webmapjs.setDimension('time', date.toISO8601() , false);
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
  },
  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        console.log('initlistener');
        webmapjs.addListener('onmapdimupdate', this.eventOnMapDimUpdate, true);
        webmapjs.addListener('ondimchange', this.eventOnDimChange, true);

      }
    }
    let { year, month, day, hour, minute, second } = this.decomposeDateString(this.state.value);

    return <div style={{ display:'flex', border:'0px solid red' }}>
      <div style={{ display:'flex', flex: 1 }} >
        <div style={{ background: 'lightblue' }}>
          <ButtonPausePlayAnimation webmapjs={this.props.webmapjs} onChange={this.onChangeAnimation} />
        </div>
        <div style={{ whiteSpace: 'nowrap' }}>
          <NumberSpinner value={year} numDigits={4} width={100} onChange={this.changeYear} />
          <NumberSpinner value={month} numDigits={2} width={60} onChange={this.changeMonth} />
          <NumberSpinner value={day} numDigits={2} width={60} onChange={this.changeDay} />
          <NumberSpinner value={hour} numDigits={2} width={60} onChange={this.changeHour} />
          <NumberSpinner value={minute} numDigits={2} width={60} onChange={this.changeMinute} />
          <NumberSpinner value={second} numDigits={2} width={60} onChange={this.changeSecond} />
        </div >
      </div>
      <div style={{ border:'0px solid blue', display: 'block' }}>
        <CanvasComponent width={this.props.width - 500} height={78} onRenderCanvas={this.onRenderCanvas} />
      </div >

    </div>;
  }
});

export default TimeComponent;
