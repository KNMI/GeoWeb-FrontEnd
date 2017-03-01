import React from 'react';
import { Button, Input } from 'reactstrap';

const AdagucMeasureDistance = React.createClass({
  propTypes: {
    webmapjs: React.PropTypes.object,
    geojson: React.PropTypes.object
  },
  getDefaultProps () {
  },
  getInitialState: function () {
    return { editMode: false, distance: 0, bearing: 0 };
  },
  handleStartEdit () {
    if (this.state.editMode === false) {
      this.setState({ editMode:true });
      console.log('handleStartEdit true');
    } else {
      this.setState({ editMode:false });
    }
    if (this.props.webmapjs) {
      this.props.webmapjs.draw();
    }
  },
  drawVertice (ctx, coord, selected, middle) {
    let w = 7;
    if (this.state.editMode === false) {
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
    ctx.globalAlpha = 1.0;
    ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
    ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
    ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
  },
  drawTextBG (ctx, txt, x, y, fontSize) {
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#FFF';
    let width = ctx.measureText(txt).width;
    ctx.fillRect(x, y, width, parseInt(fontSize, 10));
    ctx.fillStyle = '#000';
    ctx.fillText(txt, x, y);
  },
  adagucBeforeDraw (ctx) {
    /* adagucBeforeDraw is an event callback function which is triggered
     just before adagucviewer will flip the back canvas buffer to the front.
     You are free to draw anything you like on the canvas.
    */
    if (this.state.editMode === true) {
      /* Draw Line */
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

        let distanceText = Math.round(this.state.distance / 100) / 10 + ' km';
        let bearingText = Math.round(this.state.bearing * 10) / 10 + ' °';

        ctx.font = 'bold 16px Arial';
        this.drawTextBG(ctx, distanceText, mx, my, 16);
        this.drawTextBG(ctx, bearingText, mx, my + 16, 16);
      }
    }
  },
  haverSine (point1, point2) {
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
  },
  adagucMouseMove (event) {
    /* adagucMouseMove is an event callback function which is triggered when the mouse moves over the map
      This event is only triggered if the map is in hover state.
      E.g. when the map is dragging/panning, this event is not triggerd
    */
    let { mouseX, mouseY } = event;
    if (this.mouseX === mouseX && this.mouseY === mouseY) { return; }
    this.mouseX = mouseX; this.mouseY = mouseY;
    if (this.state.editMode === false) return;
    const { webmapjs } = this.props;
    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });

    if (this.isMeasuring === true) {
      this.lineStopLonLat = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });
      let h = this.haverSine(this.lineStartLonLat, this.lineStopLonLat);
      this.setState({ distance:h.distance, bearing: h.bearing });
      this.showLine = true;
    }
    webmapjs.draw();
    return false;
  },
  adagucMouseDown (event) {
    if (this.state.editMode === false) return;
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
  },
  adagucMouseUp (event) {
    if (this.state.editMode === false) return;
    const { webmapjs } = this.props;
    webmapjs.draw();
    return false;
  },
  handleKeyDown (event) {
    switch (event.keyCode) {
      case 27: /* ESCAPE_KEY */
        this.setState({ editMode:false });
        this.isMeasuring = false;
        this.showLine = false;
        this.props.webmapjs.draw();
        break;
      default:
        break;
    }
  },
  componentWillMount () {
    console.log('componentWillMount');
    document.addEventListener('keydown', this.handleKeyDown);
  },
  componentWillUnMount () {
    console.log('componentWillUnMount');
    document.removeEventListener('keydown', this.handleKeyDown);
    const { webmapjs } = this.props;
    if (webmapjs !== undefined && this.listenersInitialized === true) {
      this.listenersInitialized = undefined;
      webmapjs.removeListener('beforecanvasdisplay', this.adagucBeforeDraw);
      webmapjs.removeListener('beforemousemove', this.adagucMouseMove);
      webmapjs.removeListener('beforemousedown', this.adagucMouseDown);
      webmapjs.removeListener('beforemouseup', this.adagucMouseUp);
    }
  },
  featureHasChanged (text) {
    console.log('Feature has changed: ' + text, this.props.geojson);
  },
  componentDidMount () {
    console.log('componentDidMount');
  },
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
        console.log('webmapjs listeners added');
      }
      webmapjs.draw();
    }
    return (
      <div style={{ display:'inline-block', whiteSpace: 'nowrap' }} >
        <Button color='primary' onClick={this.handleStartEdit} disabled={this.disabled}>{this.state.editMode === false ? 'Measure distance' : 'Exit measuring mode'}</Button>
        <Input style={{ marginLeft: '5px', display:'inline-block', width: '120px' }} type='text' value={Math.round(this.state.distance / 100) / 10 + ' km'} onChange={() => {}} />
        <Input style={{ display:'inline-block', width: '120px' }} type='text' value={Math.round(this.state.bearing * 10) / 10 + ' °'} onChange={() => {}} />
      </div>
    );
  }
});

export default AdagucMeasureDistance;
