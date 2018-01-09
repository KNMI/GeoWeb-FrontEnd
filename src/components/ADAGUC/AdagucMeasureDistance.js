import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { haverSine } from '../../utils/Distance';
import { drawVertice } from '../../utils/DrawUtils';

export const ADAGUCMEASUREDISTANCE_EDITING = 'ADAGUCMEASUREDISTANCE_EDITING';
export const ADAGUCMEASUREDISTANCE_UPDATE = 'ADAGUCMEASUREDISTANCE_UPDATE';

export default class AdagucMeasureDistance extends PureComponent {
  constructor () {
    super();
    this.drawTextBG = this.drawTextBG.bind(this);
    this.adagucBeforeDraw = this.adagucBeforeDraw.bind(this);
    this.adagucMouseMove = this.adagucMouseMove.bind(this);
    this.adagucMouseDown = this.adagucMouseDown.bind(this);
    this.adagucMouseUp = this.adagucMouseUp.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /* istanbul ignore next */
  drawTextBG (ctx, txt, x, y, fontSize) {
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#FFF';
    const width = ctx.measureText(txt).width;
    ctx.fillRect(x, y, width, parseInt(fontSize, 10));
    ctx.fillStyle = '#000';
    ctx.fillText(txt, x, y);
  }

  /* istanbul ignore next */
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

    drawVertice(ctx, lineStart, false, false, true);
    drawVertice(ctx, lineStop, false, false, true);
    const mx = (lineStart.x + lineStop.x) / 2;
    const my = (lineStart.y + lineStop.y) / 2;
    ctx.strokeStyle = '#000';
    ctx.fillStyle = '#000';

    const kmDistance = this.distance / 100 / 10;
    const distanceKmText = `${kmDistance.toFixed(1)} km`;
    const distanceNmText = `${(0.54 * kmDistance).toFixed(1)} nm`;
    const bearingText = `${this.bearing.toFixed(1)} °`;

    ctx.font = 'bold 16px Arial';
    this.drawTextBG(ctx, distanceKmText, mx, my, 16);
    this.drawTextBG(ctx, distanceNmText, mx, my + 16, 16);
    this.drawTextBG(ctx, bearingText, mx, my + 32, 16);
  }

  /* istanbul ignore next */
  adagucMouseMove (event) {
    /* adagucMouseMove is an event callback function which is triggered when the mouse moves over the map
      This event is only triggered if the map is in hover state.
      E.g. when the map is dragging/panning, this event is not triggerd
    */
    const { mouseX, mouseY } = event;
    if (this.mouseX === mouseX && this.mouseY === mouseY) {
      return;
    }
    this.mouseX = mouseX;
    this.mouseY = mouseY;
    if (this.props.isInEditMode === false) {
      return;
    }
    const { webmapjs } = this.props;
    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });

    if (this.isMeasuring === true) {
      this.lineStopLonLat = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
      const h = haverSine(this.lineStartLonLat, this.lineStopLonLat);
      this.bearing = h.bearing;
      this.distance = h.distance;
      this.props.dispatch({ type: ADAGUCMEASUREDISTANCE_UPDATE, payload: { distance: h.distance, bearing: h.bearing } });
      this.showLine = true;
    }
    webmapjs.draw('AdagucMeasureDistance::adagucMouseMove');
    return false;
  }

  /* istanbul ignore next */
  adagucMouseDown (event) {
    if (this.props.isInEditMode === false) {
      return;
    }
    const { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    if (!this.isMeasuring) {
      this.isMeasuring = true;
      this.lineStartX = mouseX;
      this.lineStartY = mouseY;
      this.lineStartLonLat = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
      this.showLine = false;
    } else {
      this.isMeasuring = false;
    }
    return false; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
  }

  /* istanbul ignore next */
  adagucMouseUp () {
    if (this.props.isInEditMode === false) {
      return;
    }
    const { webmapjs } = this.props;
    webmapjs.draw('AdagucMeasureDistance::adagucMouseUp');
    return false;
  }

  /* istanbul ignore next */
  handleKeyDown (event) {
    const ESCAPE_KEY = 27;
    if (event.keyCode === ESCAPE_KEY && this.props.isInEditMode) {
      this.props.dispatch({ type: ADAGUCMEASUREDISTANCE_EDITING, payload: { isInEditMode: false } });
      this.isMeasuring = false;
      this.showLine = false;
      this.props.webmapjs.draw('AdagucMeasureDistance::handleKeyDown');
    }
  }

  componentWillMount () {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  /* istanbul ignore next */
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

  /* istanbul ignore next */
  render () {
    const { webmapjs } = this.props;
    if (this.disabled === undefined) {
      this.disabled = true;
    }
    if (webmapjs !== undefined && this.listenersInitialized === undefined) {
      this.listenersInitialized = true;
      webmapjs.addListener('beforecanvasdisplay', this.adagucBeforeDraw, true);
      webmapjs.addListener('beforemousemove', this.adagucMouseMove, true);
      webmapjs.addListener('beforemousedown', this.adagucMouseDown, true);
      webmapjs.addListener('beforemouseup', this.adagucMouseUp, true);
      this.disabled = false;
    }
    return <div />;
  }
}

AdagucMeasureDistance.propTypes = {
  webmapjs: PropTypes.object,
  isInEditMode: PropTypes.bool,
  dispatch: PropTypes.func.isRequired
};

AdagucMeasureDistance.defaultProps = {
  isInEditMode: false,
  distance: 0,
  bearing: 0
};
