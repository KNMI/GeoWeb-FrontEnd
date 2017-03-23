import React from 'react';

export const ADAGUCMEASUREDISTANCE_EDITING = 'ADAGUCMEASUREDISTANCE_EDITING';
export const ADAGUCMEASUREDISTANCE_UPDATE = 'ADAGUCMEASUREDISTANCE_UPDATE';

const AdagucMeasureDistance = React.createClass({
  propTypes: {
    webmapjs: React.PropTypes.object,
    isInEditMode: React.PropTypes.bool,
    dispatch  : React.PropTypes.func.isRequired
  },

  getDefaultProps: function () {
    return { isInEditMode: false, distance: 0, bearing: 0 };
  },
  drawVertice (ctx, coord, selected, middle) {
    let w = 7;
    if (this.props.isInEditMode === false) {
      /* Standard style, no editing, just display location of vertices */
      ctx.strokeStyle = '#000'; ctx.fillStyle = '#000'; ctx.lineWidth = 1.0; w = 5;
    } else {
      if (selected === false) {
        if (middle === true) {
          /* Style for middle editable vertice */
          ctx.strokeStyle = '#000'; ctx.fillStyle = '#D87502'; ctx.lineWidth = 1.0;
        } else {
          /* Style for standard editable vertice */
          ctx.strokeStyle = '#000'; ctx.fillStyle = '#0275D8'; ctx.lineWidth = 1.0;
        }
      } else {
        /* Style for selected editable vertice */
        ctx.strokeStyle = '#000'; ctx.fillStyle = '#FF0'; ctx.lineWidth = 1.0; w = 11;
      }
    }
    /* istanbul ignore next */
    ctx.globalAlpha = 1.0;
    /* istanbul ignore next */
    ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
    /* istanbul ignore next */
    ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
    /* istanbul ignore next */
    ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
  },
  drawTextBG (ctx, txt, x, y, fontSize) {
    /* istanbul ignore next */
    ctx.textBaseline = 'top';
    /* istanbul ignore next */
    ctx.fillStyle = '#FFF';
    /* istanbul ignore next */
    let width = ctx.measureText(txt).width;
    /* istanbul ignore next */
    ctx.fillRect(x, y, width, parseInt(fontSize, 10));
    /* istanbul ignore next */
    ctx.fillStyle = '#000';
    /* istanbul ignore next */
    ctx.fillText(txt, x, y);
  },
  adagucBeforeDraw (ctx) {
    /* adagucBeforeDraw is an event callback function which is triggered
     just before adagucviewer will flip the back canvas buffer to the front.
     You are free to draw anything you like on the canvas.
    */
    /* istanbul ignore next */
    if (this.props.isInEditMode === true) {
      /* Draw Line */
      /* istanbul ignore next */
      if (this.showLine && this.lineStartLonLat !== undefined && this.lineStopLonLat !== undefined) {
        const { webmapjs } = this.props;
        let lineStart = webmapjs.getPixelCoordFromLatLong(this.lineStartLonLat);
        let lineStop = webmapjs.getPixelCoordFromLatLong(this.lineStopLonLat);

        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(lineStart.x, lineStart.y);
        ctx.lineTo(lineStop.x, lineStop.y);
        ctx.stroke();

        this.drawVertice(ctx, lineStart, false);
        this.drawVertice(ctx, lineStop, false);
        let mx = (lineStart.x + lineStop.x) / 2;
        let my = (lineStart.y + lineStop.y) / 2;
        ctx.strokeStyle = '#000';
        ctx.fillStyle = '#000';

        let distanceText = Math.round(this.distance / 100) / 10 + ' km';
        let bearingText = Math.round(this.bearing * 10) / 10 + ' °';

        ctx.font = 'bold 16px Arial';
        this.drawTextBG(ctx, distanceText, mx, my, 16);
        this.drawTextBG(ctx, bearingText, mx, my + 16, 16);
      }
    }
  },
  adagucMouseMove (event) {
    /* adagucMouseMove is an event callback function which is triggered when the mouse moves over the map
      This event is only triggered if the map is in hover state.
      E.g. when the map is dragging/panning, this event is not triggerd
    */
    /* istanbul ignore next */
    let { mouseX, mouseY } = event;
    /* istanbul ignore next */
    if (this.mouseX === mouseX && this.mouseY === mouseY) { return; }
    /* istanbul ignore next */
    this.mouseX = mouseX; this.mouseY = mouseY;
    /* istanbul ignore next */
    if (this.props.isInEditMode === false) return;
    const { webmapjs } = this.props;
    /* istanbul ignore next */
    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });

    /* istanbul ignore next */
    if (this.isMeasuring === true) {
      this.lineStopLonLat = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });
      let h = Vincenty(this.lineStartLonLat, this.lineStopLonLat);
      if (h) {
        this.bearing = h.bearing;
        this.distance = h.distance;
        this.props.dispatch({ type: ADAGUCMEASUREDISTANCE_UPDATE, payload: { distance:h.distance, bearing: h.bearing } });
        this.showLine = true;
      }
    }
    webmapjs.draw();
    return false;
  },
  adagucMouseDown (event) {
    if (this.props.isInEditMode === false) return;
    let { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    /* istanbul ignore next */
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
  },
  adagucMouseUp (event) {
    if (this.props.isInEditMode === false) return;
    const { webmapjs } = this.props;
    webmapjs.draw();
    return false;
  },
  handleKeyDown (event) {
    /* istanbul ignore next */
    switch (event.keyCode) {
      case 27: /* ESCAPE_KEY */
        if (this.props.isInEditMode === true) {
          this.props.dispatch({ type: ADAGUCMEASUREDISTANCE_EDITING, payload: { isInEditMode:false } });
          this.isMeasuring = false;
          this.showLine = false;
          this.props.webmapjs.draw();
        }
        break;
      default:
        break;
    }
  },
  componentWillReceiveProps (nextProps) {
    if (this.props.webmapjs !== undefined) {
      this.props.webmapjs.draw();
    }
  },
  componentWillMount () {
    document.addEventListener('keydown', this.handleKeyDown);
  },
  componentWillUnMount () {
    document.removeEventListener('keydown', this.handleKeyDown);
    const { webmapjs } = this.props;
    /* istanbul ignore next */
    if (webmapjs !== undefined && this.listenersInitialized === true) {
      this.listenersInitialized = undefined;
      webmapjs.removeListener('beforecanvasdisplay', this.adagucBeforeDraw);
      webmapjs.removeListener('beforemousemove', this.adagucMouseMove);
      webmapjs.removeListener('beforemousedown', this.adagucMouseDown);
      webmapjs.removeListener('beforemouseup', this.adagucMouseUp);
    }
  },
  componentDidMount () {
  },
  render () {
    const { webmapjs } = this.props;
    if (this.disabled === undefined) {
      this.disabled = true;
    }
    /* istanbul ignore next */
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
});

export default AdagucMeasureDistance;
export function Vincenty (point1, point2) {
  let toRadians = (deg) => {
    return (deg / 180) * Math.PI;
  };
  let toDegrees = (rad) => {
    return (((rad / Math.PI) * 180) + 360) % 360;
  };

  let φ1 = toRadians(point1.y);
  let φ2 = toRadians(point2.y);
  let λ1 = toRadians(point1.x);
  let λ2 = toRadians(point2.x);
  const f = 1 / 298.257223563;
  const a = 6378137.0;
  const b = 6356752.314245;
  const L = λ2 - λ1;
  const tanU1 = (1 - f) * Math.tan(φ1);
  const cosU1 = 1 / Math.sqrt((1 + tanU1 * tanU1));
  const sinU1 = tanU1 * cosU1;
  const tanU2 = (1 - f) * Math.tan(φ2);
  const cosU2 = 1 / Math.sqrt((1 + tanU2 * tanU2));
  const sinU2 = tanU2 * cosU2;

  let λ = L;
  let λʹ;
  const iterationLimit = 100;
  let numIterations = 0;
  do {
    var sinλ = Math.sin(λ);
    var cosλ = Math.cos(λ);
    var sinSqσ = (cosU2 * sinλ) * (cosU2 * sinλ) + (cosU1 * sinU2 - sinU1 * cosU2 * cosλ) * (cosU1 * sinU2 - sinU1 * cosU2 * cosλ);
    var sinσ = Math.sqrt(sinSqσ);
    if (sinσ === 0) return 0;  // co-incident points
    var cosσ = sinU1 * sinU2 + cosU1 * cosU2 * cosλ;
    var σ = Math.atan2(sinσ, cosσ);
    var sinα = cosU1 * cosU2 * sinλ / sinσ;
    var cosSqα = 1 - sinα * sinα;
    var cos2σM = cosσ - 2 * sinU1 * sinU2 / cosSqα;
    if (isNaN(cos2σM)) cos2σM = 0;  // equatorial line: cosSqα=0 (§6)
    var C = f / 16 * cosSqα * (4 + f * (4 - 3 * cosSqα));
    λʹ = λ;
    λ = L + (1 - C) * f * sinα * (σ + C * sinσ * (cos2σM + C * cosσ * (-1 + 2 * cos2σM * cos2σM)));
  } while (Math.abs(λ - λʹ) > 1e-12 && numIterations++ < iterationLimit);
  if (numIterations === iterationLimit) throw new Error('Formula failed to converge');

  var uSq = cosSqα * (a * a - b * b) / (b * b);
  var A = 1 + uSq / 16384 * (4096 + uSq * (-768 + uSq * (320 - 175 * uSq)));
  var B = uSq / 1024 * (256 + uSq * (-128 + uSq * (74 - 47 * uSq)));
  var Δσ = B * sinσ * (cos2σM + B / 4 * (cosσ * (-1 + 2 * cos2σM * cos2σM) -
      B / 6 * cos2σM * (-3 + 4 * sinσ * sinσ) * (-3 + 4 * cos2σM * cos2σM)));

  var s = b * A * (σ - Δσ);

  var fwdAz = toDegrees(Math.atan2(cosU2 * sinλ, cosU1 * sinU2 - sinU1 * cosU2 * cosλ));
  return { distance: s, bearing: fwdAz };
}
export function haverSine (point1, point2) {
  /*
     Function which calculates the distance between two points
     Check  http://www.movable-type.co.uk/scripts/latlong.html
  */
  let toRadians = (deg) => {
    return (deg / 180) * Math.PI;
  };
  let toDegrees = (rad) => {
    return (((rad / Math.PI) * 180) + 360) % 360;
  };

  /* Haversine distance: */
  let R = 6371e3; // metres
  let φ1 = toRadians(point1.y);
  let φ2 = toRadians(point2.y);
  let λ1 = toRadians(point1.x);
  let λ2 = toRadians(point2.x);
  let Δφ = (φ2 - φ1);
  let Δλ = (λ2 - λ1);
  let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let distance = R * c;

  // Haversine bearing
  let y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  let x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1);
  let bearing = toDegrees(Math.atan2(y, x));
  return { distance:distance, bearing:bearing };
}
