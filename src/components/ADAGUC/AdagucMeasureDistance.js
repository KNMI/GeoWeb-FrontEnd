import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { haverSine } from '../../utils/Distance';
export const ADAGUCMEASUREDISTANCE_EDITING = 'ADAGUCMEASUREDISTANCE_EDITING';
export const ADAGUCMEASUREDISTANCE_UPDATE = 'ADAGUCMEASUREDISTANCE_UPDATE';

export default class AdagucMeasureDistance extends Component {
  constructor () {
    super();
    this.drawVertice = this.drawVertice.bind(this);
    this.drawTextBG = this.drawTextBG.bind(this);
    this.adagucBeforeDraw = this.adagucBeforeDraw.bind(this);
    this.adagucMouseMove = this.adagucMouseMove.bind(this);
    this.adagucMouseDown = this.adagucMouseDown.bind(this);
    this.adagucMouseUp = this.adagucMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  drawVertice (ctx, coord, selected, middle) {
    let w = 7;
    if (this.props.isInEditMode === false) {
      /* Standard style, no editing, just display location of vertices */
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#000';
      ctx.lineWidth = 1.0;
      w = 5;
    } else {
      if (selected === false) {
        if (middle === true) {
          /* Style for middle editable vertice */
          ctx.strokeStyle = '#000';
          ctx.fillStyle = '#D87502';
          ctx.lineWidth = 1.0;
        } else {
          /* Style for standard editable vertice */
          ctx.strokeStyle = '#000';
          ctx.fillStyle = '#0275D8';
          ctx.lineWidth = 1.0;
        }
      } else {
        /* Style for selected editable vertice */
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#FF0';
        ctx.lineWidth = 1.0;
        w = 11;
      }
    }
    ctx.globalAlpha = 1.0;
    ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
    ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
    ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
  }

  drawTextBG (ctx, txt, x, y, fontSize) {
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#FFF';
    const width = ctx.measureText(txt).width;
    ctx.fillRect(x, y, width, parseInt(fontSize, 10));
    ctx.fillStyle = '#000';
    ctx.fillText(txt, x, y);
  }

  adagucBeforeDraw (ctx) {
    /* adagucBeforeDraw is an event callback function which is triggered
     just before adagucviewer will flip the back canvas buffer to the front.
     You are free to draw anything you like on the canvas.
    */
    if (!this.lineStartLonLat || !this.lineStopLonLat) {
      return;
    }

    if (!this.showLine || !this.props.isInEditMode) {
      return;
    }

    /* Draw Line */
    const { webmapjs } = this.props;
    const lineStart = webmapjs.getPixelCoordFromLatLong(this.lineStartLonLat);
    const lineStop = webmapjs.getPixelCoordFromLatLong(this.lineStopLonLat);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lineStart.x, lineStart.y);
    ctx.lineTo(lineStop.x, lineStop.y);
    ctx.stroke();

    this.drawVertice(ctx, lineStart, false, false);
    this.drawVertice(ctx, lineStop, false, false);
    const mx = (lineStart.x + lineStop.x) / 2;
    const my = (lineStart.y + lineStop.y) / 2;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';

    const distanceText = Math.round(this.distance / 100) / 10 + ' km';
    const bearingText = Math.round(this.bearing * 10) / 10 + ' °';

    ctx.font = 'bold 16px Arial';
    this.drawTextBG(ctx, distanceText, mx, my, 16);
    this.drawTextBG(ctx, bearingText, mx, my + 16, 16);
  }

  adagucMouseMove (event) {
    /* adagucMouseMove is an event callback function which is triggered when the mouse moves over the map
      This event is only triggered if the map is in hover state.
      E.g. when the map is dragging/panning, this event is not triggerd
    */
    let { mouseX, mouseY } = event;
    if (this.mouseX === mouseX && this.mouseY === mouseY) {
      return;
    }
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    if (this.props.isInEditMode === false) {
      return;
    }
    const { webmapjs } = this.props;
    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });

    if (this.isMeasuring === true) {
      this.lineStopLonLat = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });
      const h = haverSine(this.lineStartLonLat, this.lineStopLonLat);
      this.bearing = h.bearing;
      this.distance = h.distance;
      this.props.dispatch({ type: ADAGUCMEASUREDISTANCE_UPDATE, payload: { distance:h.distance, bearing: h.bearing } });
      this.showLine = true;
    }
    webmapjs.draw();
    return false;
  }

  adagucMouseDown (event) {
    if (this.props.isInEditMode === false) {
      return;
    }
    let { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    if (!this.isMeasuring) {
      this.isMeasuring = true;
      this.lineStartX = mouseX;
      this.lineStartY = mouseY;
      this.lineStartLonLat = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });
      this.showLine = false;
    } else {
      this.isMeasuring = false;
    }
    return false; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
  }

  adagucMouseUp () {
    if (this.props.isInEditMode === false) {
      return;
    }
    const { webmapjs } = this.props;
    webmapjs.draw();
    return false;
  }

  handleKeyDown (event) {
    const ESCAPE_KEY = 27;
    if (event.keyCode === ESCAPE_KEY && this.props.isInEditMode) {
      this.props.dispatch({ type: ADAGUCMEASUREDISTANCE_EDITING, payload: { isInEditMode:false } });
      this.isMeasuring = false;
      this.showLine = false;
      this.props.webmapjs.draw();
    }
  }

  componentWillReceiveProps () {
    if (this.props.webmapjs !== undefined) {
      this.props.webmapjs.draw();
    }
  }

  componentWillMount () {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount () {
    document.removeEventListener('keydown', this.handleKeyDown);
    const { webmapjs } = this.props;
    if (webmapjs !== undefined && this.listenersInitialized === true) {
      this.listenersInitialized = undefined;
      webmapjs.removeListener('beforecanvasdisplay', this.adagucBeforeDraw);
      webmapjs.removeListener('beforemousemove', this.adagucMouseMove);
      webmapjs.removeListener('beforemousedown', this.adagucMouseDown);
      webmapjs.removeListener('beforemouseup', this.adagucMouseUp);
    }
  }

  render () {
    const { webmapjs } = this.props;
    if (this.disabled === undefined) {
      this.disabled = true;
    }
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) {
        this.listenersInitialized = true;
        webmapjs.addListener('beforecanvasdisplay', this.adagucBeforeDraw, true);
        webmapjs.addListener('beforemousemove', this.adagucMouseMove, true);
        webmapjs.addListener('beforemousedown', this.adagucMouseDown, true);
        webmapjs.addListener('beforemouseup', this.adagucMouseUp, true);
        this.disabled = false;
      }
      webmapjs.draw();
    }
    return <div />;
  }
}

AdagucMeasureDistance.propTypes = {
  webmapjs: PropTypes.object,
  isInEditMode: PropTypes.bool,
  dispatch  : PropTypes.func.isRequired
};

AdagucMeasureDistance.defaultProps = {
  isInEditMode: false,
  distance: 0,
  bearing: 0
};
