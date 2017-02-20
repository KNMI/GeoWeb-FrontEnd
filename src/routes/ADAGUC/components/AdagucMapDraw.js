import React from 'react';
import { Button } from 'reactstrap';

/* Static demo geojson for development purposes */
let poly = { 'type': 'FeatureCollection',
  'features': [
    { 'type': 'Feature',
      'geometry': { 'type': 'Point', 'coordinates': [ 52, 5 ] },
      'properties': { 'prop0': 'value0' }
    },
    { 'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [
          [5.0, 52.0], [6.0, 52.0], [6.0, 51.0], [5.0, 51]
        ]
      },
      'properties': {
        'prop0': 'value0',
        'prop1': 0.0
      }
    },
    { 'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [[4.0, 52.0], [5.0, 52.0], [6.0, 53.0], [5.0, 53.5], [4.0, 53.0]],
          [[6.6, 52.5], [7.6, 52.5], [8.6, 53.5], [8.2, 53.6], [6.6, 53.5]],
          [[4.9, 51.8], [5.2, 51.0], [3.6, 51.3]]
        ]
      },
      'properties': {
        'prop0': 'value0',
        'prop1': { 'this':  'that' }
      }
    }
  ]
};

const AdagucMapDraw = React.createClass({
  propTypes: {
    webmapjs: React.PropTypes.object
  },
  getDefaultProps () {
    return {
    };
  },
  componentDidMount () {
  },
  handleStartEdit () {
    this.editMode = true;
    this.props.webmapjs.draw();
  },
  convertGeoCoordsToScreenCoords (featureCoords) {
    const { webmapjs } = this.props;
    let XYCoords = [];
    for (let j = 0; j < featureCoords.length; j++) {
      let coord = webmapjs.getPixelCoordFromLatLong({ x:featureCoords[j][0], y:featureCoords[j][1] });
      XYCoords.push(coord);
    }
    return XYCoords;
  },
  adagucBeforeDraw (ctx) {
    if (this.editMode === false) return;
    /* Current selected feature from GeoJSON */
    let featureIndex = 2;

    let feature = poly.features[featureIndex];

    for (let polygonIndex = 0; polygonIndex < feature.geometry.coordinates.length; polygonIndex++) {
      let featureCoords = feature.geometry.coordinates[polygonIndex];

      /* Draw polygons */
      let XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 5;
      ctx.fillStyle = '#F88';
      ctx.beginPath();

      let middle = { x:0, y:0 };

      for (let j = 0; j < XYCoords.length; j++) {
        let coord = XYCoords[j];
        if (j === 0)ctx.moveTo(coord.x, coord.y); else ctx.lineTo(coord.x, coord.y);
        middle.x += coord.x;
        middle.y += coord.y;
      }
      middle.x = parseInt(middle.x / XYCoords.length);
      middle.y = parseInt(middle.y / XYCoords.length);

      ctx.closePath();
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.stroke();

      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#88F';
      ctx.lineWidth = 1.0;

      let drawVertice = (coord) => {
        ctx.fillRect(coord.x - 4.5, coord.y - 4.5, 9, 9);
        ctx.strokeRect(coord.x - 4.5, coord.y - 4.5, 9, 9);
        ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
      };

      for (let j = 0; j < XYCoords.length; j++) {
        drawVertice(XYCoords[j]);
      }
      drawVertice(middle);
    }
  },
  adagucMouseMove (event) {
    if (this.editMode === false) return;
    let featureIndex = 2;
    /* The mouse is hovering a vertice, and the mousedown is into effect, move vertice accordingly */
    let feature = poly.features[featureIndex];
    let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
    const { webmapjs } = this.props;
    let { mouseX, mouseY, mouseDown } = event;
    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });

    /* The mouse has selected a vertex, transpose the vertex to the new mousecoords */
    if (mouseDown === true && this.mouseIsOverVertexNr !== -1) {
      if (this.mouseIsOverVertexNr !== -2) {
        featureCoords[this.mouseIsOverVertexNr][0] = this.mouseGeoCoord.x;
        featureCoords[this.mouseIsOverVertexNr][1] = this.mouseGeoCoord.y;
      }
      if (this.mouseIsOverVertexNr === -2) {
        if (this.snappedGeoCoords) {
          let incX = this.mouseGeoCoord.x - this.snappedGeoCoords.x;
          let incY = this.mouseGeoCoord.y - this.snappedGeoCoords.y;
          for (let j = 0; j < featureCoords.length; j++) {
            featureCoords[j][0] += incX;
            featureCoords[j][1] += incY;
            this.snappedGeoCoords.x = this.mouseGeoCoord.x;
            this.snappedGeoCoords.y = this.mouseGeoCoord.y;
          }
        }
      }
      webmapjs.draw();
      return false;
    }

    /* Check if the mouse hovers any vertice of any polygon */
    let foundVertex = -1;
    for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
      let featureCoords = feature.geometry.coordinates[polygonIndex];
      /* Get all vertexes */
      let XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);

      let checkDist = (coord) => {
        let diffX = mouseX - coord.x;
        let diffY = mouseY - coord.y;
        let distance = Math.sqrt(diffX * diffX + diffY * diffY);
        if (distance < 8) {
          this.snappedGeoCoords = { ...this.mouseGeoCoord };
          this.snappedPolygonIndex = polygonIndex;
          return true;
        }
        return false;
      };

      let middle = { x:0, y:0 };

      /* Snap to the vertex closer than specified pixels */
      for (let j = 0; j < XYCoords.length; j++) {
        let coord = XYCoords[j];
        middle.x += coord.x;
        middle.y += coord.y;
        if (checkDist(coord)) {
          foundVertex = j;
          break;
        }
      }
      middle.x = parseInt(middle.x / XYCoords.length);
      middle.y = parseInt(middle.y / XYCoords.length);

      if (foundVertex === -1 && checkDist(middle)) {
        foundVertex = -2; /* -2 Means middle of polygon */
      }

      /* If mouse is hovering outside a vertex, reset the cursor to default */
      if (this.mouseIsOverVertexNr !== -1 && foundVertex === -1) {
        webmapjs.setCursor();
      }
      this.mouseIsOverVertexNr = foundVertex;

      /* We found a vertex */
      if (foundVertex !== -1) {
        webmapjs.setCursor('move');
        return false;
      }
    }

    /* We did not find any vertex, return true means that the map will continue with its own mousehandling */
    if (foundVertex === -1) {
      return true;
    }
  },
  render () {
    const { webmapjs } = this.props;
    if (webmapjs !== undefined) {
      if (this.listenersInitialized === undefined) { // TODO mount/unmount
        this.listenersInitialized = true;
        this.editMode = false;
        console.log('initlistener');

        webmapjs.addListener('beforecanvasdisplay', this.adagucBeforeDraw, true);
        webmapjs.addListener('beforemousemove', this.adagucMouseMove, true);
      }
    }
    return (
      <Button onClick={this.handleStartEdit}>Start Editing</Button>
    );
  }
});

export default AdagucMapDraw;
