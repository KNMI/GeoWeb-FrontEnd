import React, { Component } from 'react';
import { Popover, PopoverTitle, PopoverContent } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import CanvasComponent from './ADAGUC/CanvasComponent';
import axios from 'axios';
import { BACKEND_SERVER_URL } from '../constants/backend';
import { DefaultLocations } from '../constants/defaultlocations';
import PropTypes from 'prop-types';
var moment = require('moment');

export default class ProgtempComponent extends Component {
  /* istanbul ignore next */
  constructor () {
    super();
    this.state = {
      canvasWidth: 480,
      canvasHeight: 670
    };
    this.renderBaseProgtemp = this.renderBaseProgtemp.bind(this);
    this.setChosenLocation = this.setChosenLocation.bind(this);

    this.progtempLocations = [];
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/admin/read',
      params:{ type:'locations', name:'locations' },
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.progtempLocations = JSON.parse(src.data.payload);
      this.setState();
    }).catch(error => {
      alert('Loading default list, because: ' + error.response.data.error);
      this.progtempLocations = DefaultLocations;
    });
  }
  /* istanbul ignore next */
  componentDidMount () {
    this.renderBaseProgtemp(this.state.canvasWidth, this.state.canvasHeight);
  }
  /* istanbul ignore next */
  renderBaseProgtemp (canvasWidth, canvasHeight) {
    var canvasBG = document.getElementById('bijvoetCanvas');
    // eslint-disable-next-line no-undef
    drawProgtempBg(canvasBG, canvasWidth, canvasHeight);
  }
  /* istanbul ignore next */
  toggleCanvas () {
    var canvas = this.refs.canvasLoadingOverlay;
    const attribute = canvas.getAttribute('class');
    if (!attribute || attribute === 'canvasLoadingOverlay') {
      canvas.setAttribute('class', 'canvasLoadingOverlay canvasDisabled');
    } else {
      canvas.setAttribute('class', 'canvasLoadingOverlay');
    }
  }
  /* istanbul ignore next */
  modifyData (data, referenceTime, timeOffset) {
    function fetchData (data, referenceTime, timeOffset, name) {
      let selectedData = data.filter((obj) => obj.name === name)[0].data;
      selectedData = (selectedData[Object.keys(selectedData)[timeOffset]]);
      let selectedObjs = Object.keys(selectedData).map((key) => parseFloat(selectedData[key][Object.keys(selectedData[key])[0]]));
      return selectedObjs;
    }

    function getWindInfo (windX, windY) {
      let toRadians = (deg) => {
        return (deg / 180) * Math.PI;
      };
      let toDegrees = (rad) => {
        return (((rad / Math.PI) * 180) + 360) % 360;
      };

      let windSpeed = [];
      let windDirection = [];
      for (var i = 0; i < windX.length; ++i) {
        windSpeed.push(Math.sqrt(windX[i] * windX[i] + windY[i] * windY[i]));
        windDirection.push(toDegrees(toRadians(270) - Math.atan2(windY[i], windX[i])));
      }
      return { windSpeed, windDirection };
    }

    function computeTwTv (T, Td, pressure) {
      let Tw = [];
      let Tv = [];
      for (var i = 0; i < T.length; ++i) {
        // eslint-disable-next-line no-undef
        Tw = calc_Tw(T[i], Td[i], pressure[i]);
        // eslint-disable-next-line no-undef
        Tv = calc_Tv(T[i], Td[i], pressure[i]);
      }
      return { Tw, Tv };
    }
    let pressureData = fetchData(data, referenceTime, timeOffset, 'air_pressure__at_ml');
    let airTemp = fetchData(data, referenceTime, timeOffset, 'air_temperature__at_ml');
    let windXData = fetchData(data, referenceTime, timeOffset, 'x_wind__at_ml');
    let windYData = fetchData(data, referenceTime, timeOffset, 'y_wind__at_ml');
    let { windSpeed, windDirection } = getWindInfo(windXData, windYData);
    let dewTemp = fetchData(data, referenceTime, timeOffset, 'dewpoint_temperature__at_ml');
    let { Tw, Tv } = computeTwTv(airTemp, dewTemp, pressureData);
    return { PSounding: pressureData, TSounding: airTemp, TdSounding: dewTemp, ddSounding: windDirection, ffSounding: windSpeed, TwSounding: Tw, TvSounding: Tv };
  }
  /* istanbul ignore next */
  fetchNewLocationData (cursor, wmjslayers, adagucTime, canvasWidth, canvasHeight) {
    const { location } = cursor;
    const harmlayer = wmjslayers.layers.filter((layer) => layer.service.includes('HARM'))[0];
    if (!harmlayer) return;
    const refTime = harmlayer.getDimension('reference_time').currentValue;
    if (location && (refTime !== this.referenceTime || !this.props.adagucProperties.cursor ||
      !this.props.adagucProperties.location || location !== this.props.adagucProperties.cursor.location)) {
      this.referenceTime = refTime;
      const url = `http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.HARM_N25_ML.cgi?SERVICE=WMS&&SERVICE=WMS&VERSION=1.3.0
&REQUEST=GetPointValue&LAYERS=&QUERY_LAYERS=air_pressure__at_ml,y_wind__at_ml,x_wind__at_ml,dewpoint_temperature__at_ml,air_temperature__at_ml
&CRS=EPSG%3A4326&INFO_FORMAT=application/json&time=*&DIM_reference_time=` + this.referenceTime + `&x=` + location.x + `&y=` + location.y + `&DIM_modellevel=*`;
      this.toggleCanvas();
      axios.get(url).then((res) => {
        if (res.data.includes('No data available')) {
          console.log('no data');
          this.toggleCanvas();
          return;
        }
        this.toggleCanvas();
        this.progtempData = res.data;
        this.renderProgtempData(canvasWidth, canvasHeight, Math.floor(moment.duration(moment.utc(adagucTime).diff(moment.utc(this.referenceTime))).asHours()));
      });
    }
  }
  /* istanbul ignore next */
  renderProgtempData (canvasWidth, canvasHeight, timeOffset) {
    if (!this.progtempData) {
      return;
    }
    if (timeOffset < 0 || timeOffset > 48) {
      return;
    }
    var canvas = document.getElementById('canvasOverlay');
    if (!canvas) {
      return;
    }
    const { PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding, TvSounding } = this.modifyData(this.progtempData, this.referenceTime, timeOffset);
    // eslint-disable-next-line no-undef
    drawProgtemp(canvas, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding, TvSounding);
    // eslint-disable-next-line no-undef
    plotHodo(canvas, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding);
  }
  /* istanbul ignore next */
  componentWillReceiveProps (nextProps) {
    const { adagucProperties } = nextProps;
    const { layers, wmjslayers, cursor } = adagucProperties;

    // No layers or not in progtemp mode so no need to draw
    if (!wmjslayers || !wmjslayers.layers || adagucProperties.mapMode !== 'progtemp') {
      return;
    }

    // If there is no HARMONIE layer we can also abort.
    if (wmjslayers.layers.length > 0 && layers.panel[adagucProperties.activeMapId].datalayers.filter((layer) => layer.title && layer.title.includes('HARM')).length > 0) {
      const harmlayer = wmjslayers.layers.filter((layer) => layer.service && layer.service.includes('HARM'))[0];
      if (!harmlayer) return;
      this.referenceTime = harmlayer.getDimension('reference_time').currentValue;
    }

    // Refetch data if there is a location change (either due to pre-chosen location or mapclick)
    if (cursor && this.props.adagucProperties.cursor !== cursor) {
      this.fetchNewLocationData(cursor, wmjslayers, adagucProperties.timedim, this.state.canvasWidth, this.state.canvasHeight);
    }
    // On a new time, the progtemp data needs to be redrawn
    if (this.props.adagucProperties.timedim !== adagucProperties.timedim) {
      const diff = Math.floor(moment.duration(moment.utc(adagucProperties.timedim).diff(moment.utc(this.referenceTime))).asHours());
      this.renderProgtempData(this.state.canvasWidth, this.state.canvasHeight, diff);
    }
  }
  /* istanbul ignore next */
  convertMinSec (loc) {
    function padLeft (nr, n, str) {
      return Array(n - String(nr).length + 1).join(str || '0') + nr;
    }

    const behindComma = (loc - Math.floor(loc));

    const minutes = behindComma * 60;
    const seconds = Math.floor((minutes - Math.floor(minutes)) * 60);

    return Math.floor(loc) + ':' + padLeft(Math.floor(minutes), 2, '0') + ':' + padLeft(seconds, 2, '0');
  }
  /* istanbul ignore next */
  setChosenLocation (loc) {
    this.props.dispatch(this.props.actions.cursorLocation(loc[0]));
  }
  /* istanbul ignore next */
  render () {
    const adagucTime = moment.utc(this.props.adagucProperties.timedim);
    const maxWidth = this.state.canvasWidth + 'px';
    const maxHeight = this.state.canvasHeight + 'px';
    const offset = '-' + this.state.canvasHeight + 'px';
    const { cursor } = this.props.adagucProperties;
    const now = moment(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
    const timeOffset = Math.floor(moment.duration(adagucTime.diff(now)).asHours()).toString();
    return (
      <Popover placement='left' isOpen={this.props.isOpen} target='progtemp_button'>
        {cursor && cursor.location
          ? <PopoverTitle>Location: {cursor.location.name ? cursor.location.name : this.convertMinSec(cursor.location.x) + ', ' + this.convertMinSec(cursor.location.y)}</PopoverTitle>
          : <div />
        }
        <PopoverContent style={{ maxWidth: maxWidth, maxHeight: maxHeight }}>
          <CanvasComponent id='bijvoetCanvas' style={{ display: 'block' }} width={this.state.canvasWidth}
            height={this.state.canvasHeight} onRenderCanvas={() => this.renderBaseProgtemp(this.state.canvasWidth, this.state.canvasHeight)} />
          <CanvasComponent id='canvasOverlay' style={{ marginTop: offset, display: 'block' }}
            width={this.state.canvasWidth} height={this.state.canvasHeight}
            onRenderCanvas={() => this.renderProgtempData(this.state.canvasWidth, this.state.canvasHeight, timeOffset)} />
          <div className='canvasLoadingOverlay' ref='canvasLoadingOverlay' />
          <Typeahead onChange={this.setChosenLocation} options={this.progtempLocations} labelKey='name' placeholder='Type to select default location' submitFormOnEnter />
        </PopoverContent>
      </Popover>);
  }
}

ProgtempComponent.propTypes = {
  adagucProperties: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};
