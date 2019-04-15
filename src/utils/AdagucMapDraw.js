import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Enum from 'es6-enum';
import cloneDeep from 'lodash.clonedeep';

const emptyGeoJSON = {
  'type': 'FeatureCollection',
  'features': []
};

const featurePoint = {
  'type': 'Feature',
  'properties': {},
  'geometry': {
    'type': 'Point',
    'coordinates': []
  }
};

const featureMultiPoint = {
  'type': 'Feature',
  'properties': {},
  'geometry': {
    'type': 'MultiPoint',
    'coordinates': [[]]
  }
};

const featurePolygon = {
  'type': 'Feature',
  'properties': {},
  'geometry': {
    'type': 'Polygon',
    'coordinates': [[]]
  }
};

const featureBox = {
  'type': 'Feature',
  'properties': { '_adaguctype': 'box' },
  'geometry': {
    'type': 'Polygon',
    'coordinates': [[]]
  }
};

export default class AdagucMapDraw extends PureComponent {
  constructor (props) {
    super(props);

    this.EDITMODE = Enum('EMPTY', 'DELETE_FEATURES', 'ADD_FEATURE');
    this.DRAWMODE = Enum('POLYGON', 'BOX', 'MULTIPOINT', 'POINT');
    this.VERTEX = Enum('NONE', 'MIDDLE_POINT_OF_FEATURE');
    this.EDGE = Enum('NONE');
    this.FEATURE = Enum('NONE');
    this.SNAPPEDFEATURE = Enum('NONE');
    this.DRAGMODE = Enum('NONE', 'VERTEX', 'FEATURE');
    this.myEditMode = this.EDITMODE.EMPTY;
    this.myDrawMode = this.DRAWMODE.POLYGON;
    this.adagucBeforeDraw = this.adagucBeforeDraw.bind(this);
    this.adagucMouseMove = this.adagucMouseMove.bind(this);
    this.adagucMouseDown = this.adagucMouseDown.bind(this);
    this.deleteFeature = this.deleteFeature.bind(this);
    this.adagucMouseUp = this.adagucMouseUp.bind(this);
    this.cancelEdit = this.cancelEdit.bind(this);
    this.distance = this.distance.bind(this);
    this.isBetween = this.isBetween.bind(this);
    this.checkDist = this.checkDist.bind(this);
    this.hoverEdge = this.hoverEdge.bind(this);
    this.drawPolygon = this.drawPolygon.bind(this);
    this.moveVertex = this.moveVertex.bind(this);
    this.featureHasChanged = this.featureHasChanged.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.hoverVertex = this.hoverVertex.bind(this);
    this.transposePolygon = this.transposePolygon.bind(this);
    this.transposeVertex = this.transposeVertex.bind(this);
    this.triggerMouseDownTimer = this.triggerMouseDownTimer.bind(this);
    this.adagucMouseDoubleClick = this.adagucMouseDoubleClick.bind(this);
    this.handleDrawMode = this.handleDrawMode.bind(this);
    this.componentCleanup = this.componentCleanup.bind(this);
    this.initializeFeature = this.initializeFeature.bind(this);
    this.validatePolys = this.validatePolys.bind(this);
    this.insertVertexInEdge = this.insertVertexInEdge.bind(this);
    this.createNewFeature = this.createNewFeature.bind(this);
    this.addPointToMultiPointFeature = this.addPointToMultiPointFeature.bind(this);
    this.addVerticesToPolygonFeature = this.addVerticesToPolygonFeature.bind(this);
    this.checkIfFeatureIsBox = this.checkIfFeatureIsBox.bind(this);

    this.handleDrawMode(props.drawMode);

    this.textPositions = [];
    this.mouseOverPolygonCoordinates = [];

    this.defaultPolyProps = {
      'stroke': '#',
      'stroke-width': 0.4,
      'stroke-opacity': 1,
      'fill': '#33cc00',
      'fill-opacity': 1
    };
    this.somethingWasDragged = this.DRAGMODE.NONE;
    this.mouseIsOverVertexNr = this.VERTEX.NONE;
    this.selectedEdge = this.EDGE.NONE;

    if (props.geojson) {
      this.geojson = cloneDeep(props.geojson);
    } else {
      this.geojson = cloneDeep(emptyGeoJSON);
      this.featureHasChanged('new');
    }
    this.validatePolys(true);
  }
  /* istanbul ignore next */
  convertGeoCoordsToScreenCoords (featureCoords) {
    const { webmapjs } = this.props;
    const XYCoords = [];
    for (let j = 0; j < featureCoords.length; j++) {
      const coord = webmapjs.getPixelCoordFromLatLong({ x: featureCoords[j][0], y: featureCoords[j][1] });
      XYCoords.push(coord);
    }
    return XYCoords;
  }

  getPixelCoordFromGeoCoord (featureCoords) {
    const { webmapjs } = this.props;
    const { width, height } = webmapjs.getSize();
    const bbox = webmapjs.getBBOX();
    const proj = webmapjs.getProj4();

    const XYCoords = [];
    for (let j = 0; j < featureCoords.length; j++) {
      let coordinates = { x: featureCoords[j][0], y: featureCoords[j][1] };
      proj.Proj4js.transform(proj.lonlat, proj.proj4, coordinates);
      const x = (width * (coordinates.x - bbox.left)) / (bbox.right - bbox.left);
      const y = (height * (coordinates.y - bbox.top)) / (bbox.bottom - bbox.top);
      XYCoords.push({ x: x, y: y });
    }
    return XYCoords;
  };

  initializeFeature (feature, type) {
    if (!feature) {
      switch (type) {
        case this.DRAWMODE.POINT:
          return cloneDeep(featurePoint);
        case this.DRAWMODE.MULTIPOINT:
          return cloneDeep(featureMultiPoint);
        case this.DRAWMODE.POLYGON:
          return cloneDeep(featurePolygon);
        case this.DRAWMODE.BOX:
          return cloneDeep(featureBox);
        default:
      }
    } else {
      this.validateFeature(feature);
      if (feature.properties._adaguctype) delete feature.properties._adaguctype;
      switch (type) {
        case this.DRAWMODE.POINT:
          feature.geometry.type = 'Point';
          break;
        case this.DRAWMODE.MULTIPOINT:
          feature.geometry.type = 'MultiPoint';
          if (feature.geometry.coordinates.length === 0)feature.geometry.coordinates.push([]);
          break;
        case this.DRAWMODE.BOX:
          feature.geometry.type = 'Polygon';
          feature.properties._adaguctype = 'box';
          break;
        case this.DRAWMODE.POLYGON:
          feature.geometry.type = 'Polygon';
          if (feature.geometry.coordinates.length === 0)feature.geometry.coordinates.push([]);
          break;
      }
    }
    return feature;
  };

  checkIfFeatureIsBox (feature) {
    if (!feature || !feature.properties || !feature.properties._adaguctype) return false;
    return feature.properties._adaguctype === 'box';
  }

  drawVertice (ctx, _coord, selected, middle, isInEditMode) {
    let w = 7;
    let coord = { x: parseInt(_coord.x), y: parseInt(_coord.y) };
    if (isInEditMode === false) {
      return;
      /* Standard style, no editing, just display location of vertices */
      // TODO: Is it OK to remove the vertices completely, when not in edit mode?
      /* ctx.strokeStyle = '#000';
      ctx.fillStyle = '#000';
      ctx.lineWidth = 1.0;
      w = 5; */
    } else if (selected === false) {
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
    ctx.globalAlpha = 1.0;
    ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
    ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
    if (isInEditMode) {
      ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
    }
  }

  drawPoint (ctx, _coord, selected, middle, isInEditMode, featureProperties) {
    const strokeStyle = (featureProperties && featureProperties.stroke) || this.defaultPolyProps.stroke;
    const lineWidth = (featureProperties && featureProperties['stroke-width']) || this.defaultPolyProps['stroke-width'];
    const fillStyle = (featureProperties && featureProperties.fill) || this.defaultPolyProps.fill;
    if (isInEditMode === false) {
      /* Standard style, no editing, just display location of vertices */
      ctx.strokeStyle = strokeStyle;
      ctx.fillStyle = fillStyle;
      ctx.lineWidth = lineWidth;
    } else if (selected === false) {
      /* Style for standard editable vertice */
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#0275D8';
      ctx.lineWidth = 1.0;
    } else {
      /* Style for selected editable vertice */
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#FF0';
      ctx.lineWidth = 1.0;
    }
    let coord = { x: parseInt(_coord.x), y: parseInt(_coord.y) };
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    let topRadius = 9;
    let topHeight = 2.5 * topRadius;
    ctx.arc(coord.x, coord.y - topHeight, topRadius, Math.PI, Math.PI * 2);
    ctx.bezierCurveTo(coord.x + topRadius, coord.y - topHeight, coord.x + (topRadius / 1.6), coord.y - topRadius, coord.x, coord.y);
    ctx.bezierCurveTo(coord.x, coord.y, coord.x - (topRadius / 1.6), coord.y - topRadius, coord.x - topRadius, coord.y - topHeight);
    ctx.stroke();
    ctx.fill();
    /* Fill center circle */
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(coord.x, coord.y - topHeight, topRadius / 2, Math.PI * 2, 0);
    ctx.fill();

    /* Fill marker exact location */
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(coord.x, coord.y, 2, Math.PI * 2, 0);
    ctx.fill();
  }

  /* istanbul ignore next */
  drawPolygon (ctx, XYCoords, featureIndex, polygonIndex) {
    const feature = this.geojson.features[featureIndex];
    if (!feature || !feature.geometry) return;
    if (feature.geometry.type !== 'Polygon') return;
    let polyProps = feature.properties;
    if (!polyProps) polyProps = this.defaultPolyProps;

    /* Draw polygons and calculate center of poly */
    const middle = { x: 0, y: 0, nr: 0 };

    ctx.strokeStyle = polyProps.stroke || this.defaultPolyProps.stroke;
    ctx.lineWidth = polyProps['stroke-width'] || this.defaultPolyProps['stroke-width'];
    ctx.fillStyle = polyProps.fill || this.defaultPolyProps.fill;
    ctx.beginPath();

    const startCoord = XYCoords[0];
    ctx.moveTo(startCoord.x, startCoord.y);
    middle.x += startCoord.x;
    middle.y += startCoord.y;

    for (let j = 1; j < XYCoords.length; j++) {
      const coord = XYCoords[j];
      ctx.lineTo(coord.x, coord.y);
      if (j < XYCoords.length - 1) {
        middle.x += coord.x;
        middle.y += coord.y;
      }
    }
    ctx.closePath();

    ctx.globalAlpha = polyProps['fill-opacity'] || this.defaultPolyProps['fill-opacity'];
    if (polyProps['fill-opacity'] === 0) {
      ctx.globalAlpha = 0;
    }
    ctx.fill();
    ctx.globalAlpha = polyProps['stroke-opacity'] || this.defaultPolyProps['stroke-opacity'];
    ctx.stroke();

    let test = ctx.isPointInPath(this.mouseX, this.mouseY);
    if (test) {
      this.mouseOverPolygonCoordinates = XYCoords;
      this.mouseOverPolygonFeatureIndex = featureIndex;
    }
    middle.x = parseInt(middle.x / (XYCoords.length - 1));
    middle.y = parseInt(middle.y / (XYCoords.length - 1));

    if (this.props.isInEditMode === true &&
        this.snappedPolygonIndex === polygonIndex &&
        this.selectedEdge !== this.EDGE.NONE &&
        this.props.featureNrToEdit === featureIndex) {
      /* Higlight selected edge of a polygon, previousely detected by mouseover event */
      ctx.strokeStyle = '#FF0';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(XYCoords[this.selectedEdge].x, XYCoords[this.selectedEdge].y);
      ctx.lineTo(
        XYCoords[(this.selectedEdge + 1) % XYCoords.length].x,
        XYCoords[(this.selectedEdge + 1) % XYCoords.length].y);
      ctx.stroke();
    }

    middle.nr = XYCoords.length - 1;

    return middle;
  }

  validateFeature (feature) {
    if (!feature.properties) feature.properties = {};
    if (!feature.geometry) feature.geometry = {};
    if (!feature.type) feature.type = 'Feature';
    if (!feature.geometry.coordinates) feature.geometry.coordinates = [];
  }

  validatePolys (fixPolys) {
    if (!this.geojson || !this.geojson.features || !this.geojson.features.length) return;
    for (let featureIndex = 0; featureIndex < this.geojson.features.length; featureIndex++) {
      if (!this.geojson.features) this.geojson.features = [];
      const feature = this.geojson.features[featureIndex];
      this.validateFeature(feature);
      const featureType = feature.geometry.type;
      if (featureType === 'Polygon') {
        /* Loop through all polygons of the same feature */
        for (let polygonIndex = 0; polygonIndex < feature.geometry.coordinates.length; polygonIndex++) {
          let featureCoords = feature.geometry.coordinates[polygonIndex];

          /* Remove duplicates */
          if (!this.checkIfFeatureIsBox(feature)) {
            for (let coordIndex = featureCoords.length - 2; coordIndex >= 0; coordIndex--) {
              let startCoord = featureCoords[coordIndex];
              let endCoord = featureCoords[coordIndex + 1];
              if (startCoord && endCoord) {
                if (startCoord[0] === endCoord[0] && startCoord[1] === endCoord[1]) {
                  featureCoords.splice(coordIndex, 1);
                }
              }
            }
            /* Add begin to end to make closed polygon */
            let startCoord = featureCoords[0];
            let endCoord = featureCoords[featureCoords.length - 1];
            if (startCoord && endCoord) {
              if (startCoord[0] !== endCoord[0] || startCoord[1] !== endCoord[1]) {
                featureCoords.push(cloneDeep(startCoord));
                if (this.mouseIsOverVertexNr !== this.VERTEX.NONE && this.mouseIsOverVertexNr !== this.VERTEX.MIDDLE_POINT_OF_FEATURE) {
                  /* This means that our selected vertex is one lower */
                  this.mouseIsOverVertexNr--;
                }
              }
            }
          }

          /* Sort clockwise */
          if (fixPolys) {
            let checkClockwiseOrder = (featureCoords) => {
              let sum = 0;
              for (let j = 0; j < featureCoords.length - 1; j++) {
                let currentPoint = featureCoords[j];
                let nextPoint = featureCoords[(j + 1) % featureCoords.length];
                sum += ((nextPoint[0] - currentPoint[0]) * (nextPoint[1] + currentPoint[1]));
              }
              return sum;
            };
            const sum = checkClockwiseOrder(featureCoords);
            if (sum < 0) {
              featureCoords = featureCoords.reverse();
              /* The lastly selected vertex is now aways the second in the array */
              if (this.mouseIsOverVertexNr !== this.VERTEX.NONE && this.mouseIsOverVertexNr !== this.VERTEX.MIDDLE_POINT_OF_FEATURE) {
                this.mouseIsOverVertexNr = 1;
              }
            }
          }
        }
      }
    }
  }

  /* istanbul ignore next */
  adagucBeforeDraw (ctx) {
    /* adagucBeforeDraw is an event callback function which is triggered
     just before adagucviewer will flip the back canvas buffer to the front.
     You are free to draw anything you like on the canvas.
    */

    if (!this.geojson || !this.geojson.features || !this.geojson.features.length) return;
    this.textPositions = [];
    this.mouseOverPolygonCoordinates = [];
    this.mouseOverPolygonFeatureIndex = -1;
    /* Current selected feature from GeoJSON */
    for (let featureIndex = 0; featureIndex < this.geojson.features.length; featureIndex++) {
      const feature = this.geojson.features[featureIndex];
      const featureType = feature.geometry.type;
      let totalmiddle = { x: 0, y: 0, nr: 0 };

      if (featureType === 'Point') {
        let featureCoords = feature.geometry.coordinates;
        const XYCoords = this.getPixelCoordFromGeoCoord([featureCoords]);
        if (XYCoords.length === 0) {
          continue;
        }
        for (let j = 0; j < XYCoords.length; j++) {
          this.drawPoint(ctx, XYCoords[j],
            this.mouseIsOverVertexNr === j && this.props.featureNrToEdit === featureIndex,
            false,
            this.props.isInEditMode && this.props.featureNrToEdit === featureIndex,
            feature.properties);
        }
      }

      if (featureType === 'MultiPoint') {
        let featureCoords = feature.geometry.coordinates;
        const XYCoords = this.getPixelCoordFromGeoCoord(featureCoords);
        if (XYCoords.length === 0) {
          continue;
        }
        for (let j = 0; j < XYCoords.length; j++) {
          this.drawPoint(ctx, XYCoords[j],
            this.mouseIsOverVertexNr === j && this.props.featureNrToEdit === featureIndex,
            false,
            this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
        }
      }

      if (featureType === 'MultiPolygon') {
        for (let multiPolygonIndex = 0; multiPolygonIndex < feature.geometry.coordinates.length; multiPolygonIndex++) {
          const multiPoly = feature.geometry.coordinates[multiPolygonIndex];
          for (let polygonIndex = 0; polygonIndex < multiPoly.length; polygonIndex++) {
            const featureCoords = multiPoly[polygonIndex];
            const XYCoords = this.getPixelCoordFromGeoCoord(featureCoords);
            /* Only draw if there is stuff to show */
            if (XYCoords.length === 0) {
              continue;
            }

            const middle = this.drawPolygon(ctx, XYCoords, featureIndex, polygonIndex);
            if (middle) {
              totalmiddle.x += middle.x * middle.nr;
              totalmiddle.y += middle.y * middle.nr;
              totalmiddle.nr += middle.nr;
            }
            if (this.props.isInEditMode) {
              /* Draw all vertices on the edges of the polygons */
              for (let j = 0; j < XYCoords.length; j++) {
                this.drawVertice(ctx,
                  XYCoords[j],
                  this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === j && this.props.featureNrToEdit === featureIndex,
                  false,
                  this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
              }

              if (middle && this.props.isInEditMode === true && XYCoords.length >= 3) {
                /* Draw middle vertice for the poly if poly covers an area, e.g. when it contains more than three points */
                this.drawVertice(ctx,
                  middle,
                  this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === this.VERTEX.MIDDLE_POINT_OF_FEATURE && this.props.featureNrToEdit === featureIndex,
                  true,
                  this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
              }
            }
          }
        }
        if (totalmiddle.nr > 0) {
          let mx = totalmiddle.x / totalmiddle.nr;
          let my = totalmiddle.y / totalmiddle.nr;
          if (feature.properties && feature.properties.text) {
            this.textPositions.push({ x:mx, y:my, text: feature.properties.text });
          }
        }
      }

      if (featureType === 'Polygon') {
        /* Loop through all polygons of the same feature */
        for (let polygonIndex = 0; polygonIndex < feature.geometry.coordinates.length; polygonIndex++) {
          const featureCoords = feature.geometry.coordinates[polygonIndex];

          const XYCoords = this.getPixelCoordFromGeoCoord(featureCoords);
          /* Only draw if there is stuff to show */
          if (XYCoords.length === 0) {
            continue;
          }

          const middle = this.drawPolygon(ctx, XYCoords, featureIndex, polygonIndex);

          if (middle && feature.properties && feature.properties.text) {
            this.textPositions.push({ x:middle.x, y:middle.y, text: feature.properties.text });
          }

          if (this.props.isInEditMode) {
            /* Draw all vertices on the edges of the polygons */
            for (let j = 0; j < XYCoords.length; j++) {
              this.drawVertice(ctx,
                XYCoords[j],
                this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === j && this.props.featureNrToEdit === featureIndex,
                false,
                this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
            }

            if (middle && this.props.isInEditMode === true && XYCoords.length >= 3) {
              /* Draw middle vertice for the poly if poly covers an area, e.g. when it contains more than three points */
              this.drawVertice(ctx,
                middle,
                this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === this.VERTEX.MIDDLE_POINT_OF_FEATURE && this.props.featureNrToEdit === featureIndex,
                true,
                this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
            }
          }
        }
      }
    }

    /* Higlight polygon with mousehover */
    if ((this.props.isInEditMode === true &&
      this.mouseOverPolygonFeatureIndex === this.props.featureNrToEdit &&
      this.mouseIsOverVertexNr === this.VERTEX.NONE &&
      this.snappedPolygonIndex === this.SNAPPEDFEATURE.NONE &&
      this.selectedEdge === this.EDGE.NONE) ||
      this.mouseIsOverVertexNr === this.VERTEX.MIDDLE_POINT_OF_FEATURE) {
      if (this.mouseOverPolygonCoordinates.length >= 2) {
        ctx.beginPath();

        ctx.moveTo(this.mouseOverPolygonCoordinates[0].x, this.mouseOverPolygonCoordinates[0].y);
        for (let j = 1; j < this.mouseOverPolygonCoordinates.length; j++) {
          const coord = this.mouseOverPolygonCoordinates[j];
          ctx.lineTo(coord.x, coord.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#88F';
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
      }
    }

    if (this.props.isInEditMode === true &&
      this.mouseOverPolygonFeatureIndex === this.props.featureNrToEdit &&
      this.props.hoverFeatureCallback) {
      this.props.hoverFeatureCallback(this.mouseOverPolygonFeatureIndex);
    }

    /* Draw labels */
    for (let j = 0; j < this.textPositions.length; j++) {
      const { x, y, text } = this.textPositions[j];
      ctx.fillStyle = 'black';
      ctx.font = '12px Arial';
      ctx.fillText(text, x, y);
    }
  }

  /* Function which calculates the distance between two points */
  /* istanbul ignore next */
  distance (a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
  }

  /* Function which calculates if a point is between two other points */
  /* istanbul ignore next */
  isBetween (a, c, b) {
    const da = this.distance(a, c) + this.distance(c, b);
    const db = this.distance(a, b);
    return (Math.abs(da - db) < 1);
  }

  /* Checks if mouse is in proximity of given coordinate */
  /* istanbul ignore next */
  checkDist (coord, polygonIndex, mouseX, mouseY) {
    const VERTEX = this.distance(coord, { x: mouseX, y: mouseY });
    if (VERTEX < 10) {
      this.snappedGeoCoords = { ...this.mouseGeoCoord };
      this.snappedPolygonIndex = polygonIndex;
      return true;
    }
    return false;
  }

  /* istanbul ignore next */
  hoverEdge (coordinates, mouseX, mouseY) {
    for (let polygonIndex = coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
      const featureCoords = coordinates[polygonIndex];
      if (featureCoords === undefined) {
        continue;
      }
      /* Get all vertexes */
      const XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
      for (let j = 0; j < XYCoords.length; j++) {
        const startV = XYCoords[j];
        const stopV = XYCoords[(j + 1) % XYCoords.length];
        if (this.isBetween(startV, { x: mouseX, y: mouseY }, stopV)) {
          return { selectedEdge: j, snappedPolygonIndex: polygonIndex };
        }
      }
    }
    return { selectedEdge: this.EDGE.NONE, snappedPolygonIndex: this.SNAPPEDFEATURE.NONE };
  }

  /* istanbul ignore next */
  transposePolygon (featureCoords) {
    const incX = this.mouseGeoCoord.x - this.snappedGeoCoords.x;
    const incY = this.mouseGeoCoord.y - this.snappedGeoCoords.y;
    for (let j = 0; j < featureCoords.length; j++) {
      featureCoords[j][0] += incX;
      featureCoords[j][1] += incY;
      this.snappedGeoCoords.x = this.mouseGeoCoord.x;
      this.snappedGeoCoords.y = this.mouseGeoCoord.y;
    }
    if (this.myEditMode !== this.EDITMODE.ADD_FEATURE) {
      this.somethingWasDragged = this.DRAGMODE.FEATURE;
    }
  }

  /* istanbul ignore next */
  transposeVertex (featureCoords) {
    if (this.myEditMode !== this.EDITMODE.ADD_FEATURE) {
      this.somethingWasDragged = this.DRAGMODE.VERTEX;
    }

    if (this.myDrawMode === this.DRAWMODE.POINT) {
      featureCoords[0] = this.mouseGeoCoord.x;
      featureCoords[1] = this.mouseGeoCoord.y;
      return;
    }

    let checkIfVertexNrIsOK = () => {
      if (this.mouseIsOverVertexNr !== this.SNAPPEDFEATURE.NONE && this.mouseIsOverVertexNr !== this.VERTEX.NONE) {
        if (this.mouseIsOverVertexNr && this.mouseIsOverVertexNr.length && this.mouseIsOverVertexNr.length < featureCoords) {
          return true;
        }
      }
      return false;
    };

    if (checkIfVertexNrIsOK() === false) {
      this.mouseIsOverVertexNr = this.VERTEX.NONE;
      return;
    }

    if (this.myDrawMode === this.DRAWMODE.MULTIPOINT) {
      if (this.mouseIsOverVertexNr !== this.SNAPPEDFEATURE.NONE) {
        featureCoords[this.mouseIsOverVertexNr][0] = this.mouseGeoCoord.x;
        featureCoords[this.mouseIsOverVertexNr][1] = this.mouseGeoCoord.y;
      }
      return;
    }

    if (this.myDrawMode === this.DRAWMODE.BOX && (featureCoords.length === 4 || featureCoords.length === 5)) {
      while (featureCoords.length < 4) {
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      }
      if (this.mouseIsOverVertexNr === 0) {
        featureCoords[1][0] = this.mouseGeoCoord.x;
        featureCoords[3][1] = this.mouseGeoCoord.y;
      }
      if (this.mouseIsOverVertexNr === 1) {
        featureCoords[0][0] = this.mouseGeoCoord.x;
        featureCoords[4][0] = this.mouseGeoCoord.x;
        featureCoords[2][1] = this.mouseGeoCoord.y;
      }
      if (this.mouseIsOverVertexNr === 2) {
        featureCoords[1][1] = this.mouseGeoCoord.y;
        featureCoords[3][0] = this.mouseGeoCoord.x;
      }
      if (this.mouseIsOverVertexNr === 3) {
        featureCoords[0][1] = this.mouseGeoCoord.y;
        featureCoords[4][1] = this.mouseGeoCoord.y;
        featureCoords[2][0] = this.mouseGeoCoord.x;
      }
      featureCoords[this.mouseIsOverVertexNr][0] = this.mouseGeoCoord.x;
      featureCoords[this.mouseIsOverVertexNr][1] = this.mouseGeoCoord.y;
      // /* Transpose begin and end vertice */
      if (this.mouseIsOverVertexNr === 0 || this.mouseIsOverVertexNr === [featureCoords.length - 1]) {
        featureCoords[0][0] = this.mouseGeoCoord.x;
        featureCoords[0][1] = this.mouseGeoCoord.y;
        featureCoords[featureCoords.length - 1][0] = this.mouseGeoCoord.x;
        featureCoords[featureCoords.length - 1][1] = this.mouseGeoCoord.y;
      }
    }

    if (this.myDrawMode === this.DRAWMODE.POLYGON) {
      featureCoords[this.mouseIsOverVertexNr][0] = this.mouseGeoCoord.x;
      featureCoords[this.mouseIsOverVertexNr][1] = this.mouseGeoCoord.y;
      /* Transpose begin and end vertice */
      if (this.mouseIsOverVertexNr === 0) {
        featureCoords[featureCoords.length - 1][0] = this.mouseGeoCoord.x;
        featureCoords[featureCoords.length - 1][1] = this.mouseGeoCoord.y;
      }
    }
  }

  /* istanbul ignore next */
  moveVertex (featureCoords, mouseDown) {
    if (!featureCoords) {
      return;
    }

    const vertexSelected = mouseDown === true && this.mouseIsOverVertexNr !== this.VERTEX.NONE;

    if (vertexSelected || this.myEditMode === this.EDITMODE.ADD_FEATURE) {
      /* In case middle point is selected, transpose whole polygon */
      if (this.mouseIsOverVertexNr === this.VERTEX.MIDDLE_POINT_OF_FEATURE && this.snappedGeoCoords) {
        this.transposePolygon(featureCoords);
      } else if (this.mouseIsOverVertexNr !== this.VERTEX.NONE) {
      /* Transpose polygon vertex */
        this.transposeVertex(featureCoords);
      }
      return false;
    }
  }

  /* istanbul ignore next */
  hoverVertex (feature, mouseX, mouseY) {
    let foundVertex = this.VERTEX.NONE;
    this.mouseIsOverVertexNr = this.VERTEX.NONE;

    if (feature.geometry.type === 'Point') {
      this.snappedPolygonIndex = this.SNAPPEDFEATURE.NONE;
      const featureCoords = feature.geometry.coordinates;
      /* Get all vertexes */
      const XYCoords = this.convertGeoCoordsToScreenCoords([featureCoords]);
      if (this.checkDist(XYCoords[0], 0, mouseX, mouseY)) {
        this.mouseIsOverVertexNr = 0;
        return;
      }
    }

    if (feature.geometry.type === 'MultiPoint') {
      this.snappedPolygonIndex = this.SNAPPEDFEATURE.NONE;
      for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
        const featureCoords = feature.geometry.coordinates[polygonIndex];
        if (featureCoords === undefined) {
          continue;
        }
        /* Get all vertexes */
        const XYCoords = this.convertGeoCoordsToScreenCoords([featureCoords]);
        if (this.checkDist(XYCoords[0], polygonIndex, mouseX, mouseY)) {
          this.mouseIsOverVertexNr = polygonIndex;
          return;
        }
      }
    }

    if (feature.geometry.type === 'Polygon') {
      for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
        const featureCoords = feature.geometry.coordinates[polygonIndex];
        if (featureCoords === undefined) {
          continue;
        }
        /* Get all vertexes */
        const XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
        const middle = { x: 0, y: 0 };
        /* Snap to the vertex closer than specified pixels */
        for (let j = 0; j < XYCoords.length - 1; j++) {
          const coord = XYCoords[j];
          middle.x += coord.x;
          middle.y += coord.y;

          if (this.checkDist(coord, polygonIndex, mouseX, mouseY)) {
            foundVertex = j;
            break;
          }
        }
        middle.x = parseInt(middle.x / (XYCoords.length - 1));
        middle.y = parseInt(middle.y / (XYCoords.length - 1));
        /* Check if the mouse hovers the middle vertex */
        if (foundVertex === this.VERTEX.NONE && this.checkDist(middle, polygonIndex, mouseX, mouseY)) {
          foundVertex = this.VERTEX.MIDDLE_POINT_OF_FEATURE;
        }

        this.mouseIsOverVertexNr = foundVertex;
      }
    }
  }

  /* istanbul ignore next */
  adagucMouseMove (event) {
    /* adagucMouseMove is an event callback function which is triggered when the mouse moves over the map
      This event is only triggered if the map is in hover state.
      E.g. when the map is dragging/panning, this event is not triggerd
    */
    const { mouseX, mouseY, mouseDown } = event;
    this.mouseX = mouseX;
    this.mouseY = mouseY;

    if (this.props.isInEditMode === false) {
      return;
    }

    const feature = this.geojson.features[this.props.featureNrToEdit];
    if (!feature) return;
    const featureType = feature.geometry.type;
    let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
    if (featureType === 'Point' || featureType === 'MultiPoint') {
      featureCoords = feature.geometry.coordinates;
    }

    const { webmapjs } = this.props;

    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });

    /* The mouse is hovering a vertice, and the mousedown is into effect, move vertice accordingly */
    const ret = this.moveVertex(featureCoords, mouseDown);
    if (ret === false) {
      webmapjs.draw('AdagucMapDraw::adagucMouseMove');
      return false;
    }

    /* Check if the mouse hovers any vertice of any polygon */
    this.hoverVertex(feature, mouseX, mouseY);
    if (this.mouseIsOverVertexNr !== this.VERTEX.NONE) {
      /* We found a vertex */
      this.selectedEdge = this.EDGE.NONE; /* We found a vertex, not an edge: reset it */
      webmapjs.setCursor('move');
      webmapjs.draw('AdagucMapDraw::hoverVertex');
      return false;
    }

    webmapjs.setCursor();

    /* Check if the mouse hovers an edge of a polygon */
    this.selectedEdge = this.EDGE.NONE;
    if (this.myEditMode !== this.EDITMODE.DELETE_FEATURES) {
      const retObj = this.hoverEdge(feature.geometry.coordinates, mouseX, mouseY);
      this.selectedEdge = retObj.selectedEdge;
      this.snappedPolygonIndex = retObj.snappedPolygonIndex;
    }

    if (this.selectedEdge !== this.EDGE.NONE) {
      webmapjs.draw('AdagucMapDraw::adagucMouseMove');
      return false;
    }

    if (this.myEditMode === this.EDITMODE.ADD_FEATURE) {
      return false;
    }

    /* We did not find anything under the mousecursor,
      return true means that the map will continue with its own mousehandling
    */
    if (this.mouseIsOverVertexNr === this.VERTEX.NONE && this.selectedEdge === this.EDGE.NONE) {
      webmapjs.draw('AdagucMapDraw::adagucMouseMove');
      return true; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
    }
  }

  /* Returns true if double click is detected */
  triggerMouseDownTimer (event) {
    if (!this.doubleClickTimer) this.doubleClickTimer = {};
    const { mouseX, mouseY } = event;

    let checkTimeOut = () => {
      this.doubleClickTimer.isRunning = false;
    };

    /* Reset the timer */
    if (this.doubleClickTimer.timer) {
      clearTimeout(this.doubleClickTimer.timer);
      this.doubleClickTimer.timer = null;
    }

    /* Check if double click on this location occured */
    if (this.doubleClickTimer.isRunning === true) {
      if (mouseX === this.doubleClickTimer.mouseX && mouseY === this.doubleClickTimer.mouseY) {
        this.doubleClickTimer.isRunning = false;
        return true;
      }
    }

    /* Create new timer */
    this.doubleClickTimer.isRunning = true;
    this.doubleClickTimer.mouseX = mouseX;
    this.doubleClickTimer.mouseY = mouseY;
    this.doubleClickTimer.timer = setTimeout(checkTimeOut, 300);

    /* No double click detected, return false */
    return false;
  }

  adagucMouseDoubleClick (event) {
    this.handleKeyDown({ keyCode: 27 });
    return true;
  }

  /* Insert a new vertex into an edge, e.g a line is clicked and a point is added */
  insertVertexInEdge (event) {
    const { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    if (this.myDrawMode === this.DRAWMODE.POLYGON) {
      if (this.selectedEdge !== this.EDGE.NONE &&
          this.myEditMode !== this.EDITMODE.DELETE_FEATURES &&
          this.myDrawMode !== this.DRAWMODE.BOX) {
        this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
        const feature = this.geojson.features[this.props.featureNrToEdit];
        if (this.checkIfFeatureIsBox(feature)) {
          return false;
        }
        const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
        if (featureCoords === undefined) {
          return false;
        }
        featureCoords.splice(this.selectedEdge + 1, 0, [this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        this.featureHasChanged('insert vertex into line');
        this.adagucMouseMove(event);
        return false;
      }
    }
    return true;
  }

  /* This is trigged when a new feature is created.  */
  createNewFeature (event) {
    const { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    if (this.myEditMode === this.EDITMODE.EMPTY) {
      this.myEditMode = this.EDITMODE.ADD_FEATURE;
      let feature = this.geojson.features[this.props.featureNrToEdit];

      feature = this.geojson.features[this.props.featureNrToEdit] = this.initializeFeature(feature, this.myDrawMode);

      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });

      if (this.myDrawMode === this.DRAWMODE.POINT || this.myDrawMode === this.DRAWMODE.MULTIPOINT) {
        /* Create points */
        if (feature.geometry.coordinates === undefined) {
          feature.geometry.coordinates = [];
        }
        if (this.myDrawMode === this.DRAWMODE.POINT) {
          const featureCoords = feature.geometry.coordinates;
          featureCoords[0] = this.mouseGeoCoord.x;
          featureCoords[1] = this.mouseGeoCoord.y;
          this.snappedPolygonIndex = feature.geometry.coordinates.length - 1;
          /* For type POINT it is not possible to add multiple points to the same feature */
          this.myEditMode = this.EDITMODE.EMPTY;
          this.featureHasChanged('new point created');
        }
        if (this.myDrawMode === this.DRAWMODE.MULTIPOINT) {
          this.myEditMode = this.EDITMODE.EMPTY;
          let featureCoords = feature.geometry.coordinates;
          if (featureCoords === undefined) {
            featureCoords = [];
          }
          if (featureCoords[0] === undefined || featureCoords[0].length === 0) {
            featureCoords[0] = []; /* Used to create the first polygon */
          } else {
            featureCoords.push([]); /* Used to create extra polygons in the same feature */
          }
          // featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
          featureCoords[featureCoords.length - 1] = [this.mouseGeoCoord.x, this.mouseGeoCoord.y];
          this.snappedPolygonIndex = feature.geometry.coordinates.length - 1;
          this.featureHasChanged('new point in multipoint created');
        }
      }

      if (this.myDrawMode === this.DRAWMODE.POLYGON || this.myDrawMode === this.DRAWMODE.BOX) {
        /* Create poly's and boxes */
        this.myEditMode = this.EDITMODE.ADD_FEATURE;

        if (feature.geometry.coordinates === undefined) {
          feature.geometry.coordinates = [];
        }
        if (feature.geometry.coordinates[0] === undefined || feature.geometry.coordinates[0].length === 0) {
          feature.geometry.coordinates[0] = []; /* Used to create the first polygon */
        } else {
          feature.geometry.coordinates.push([]); /* Used to create extra polygons in the same feature */
        }
        this.snappedPolygonIndex = feature.geometry.coordinates.length - 1;
        const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);

        /* This is triggered when a bounding box is created. Five points are added at once */
        if (this.myDrawMode === this.DRAWMODE.BOX) {
          featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
          featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
          featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        }

        if (featureCoords.length > 2) {
          this.featureHasChanged('new poly created');
        }

        if (this.myDrawMode === this.DRAWMODE.BOX) {
          this.mouseIsOverVertexNr = 3;
        } else {
          this.mouseIsOverVertexNr = featureCoords.length - 1;
        }
      }
      webmapjs.draw('AdagucMapDraw::adagucMouseDown');

      return false;
    }
    return true;
  }

  /* This is triggered when new points are added during the addmultipoint mode. One point is added per time */
  addPointToMultiPointFeature (event) {
    const { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    if (this.myDrawMode === this.DRAWMODE.MULTIPOINT) {
      if (this.myEditMode === this.EDITMODE.ADD_FEATURE && this.snappedPolygonIndex !== this.SNAPPEDFEATURE.NONE) {
        this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
        const feature = this.geojson.features[this.props.featureNrToEdit];
        const featureCoords = feature.geometry.coordinates;
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        this.featureHasChanged('point added to multipoint');
        this.mouseIsOverVertexNr = this.VERTEX.NONE;
        this.adagucMouseMove(event);
        return false;
      }
    }
    return true;
  }

  /* This is triggered when new points are added during the addpolygon mode. One point is added per time */
  addVerticesToPolygonFeature (event) {
    const { mouseX, mouseY } = event;
    const { webmapjs } = this.props;
    if (this.myDrawMode === this.DRAWMODE.POLYGON) {
      if (this.myEditMode === this.EDITMODE.ADD_FEATURE && this.snappedPolygonIndex !== this.SNAPPEDFEATURE.NONE) {
        this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
        const feature = this.geojson.features[this.props.featureNrToEdit];
        const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        this.featureHasChanged('vertex added to polygon');
        this.mouseIsOverVertexNr = featureCoords.length - 1;
        this.adagucMouseMove(event);
        return false;
      }
    }
    return true;
  }

  /* istanbul ignore next */
  adagucMouseDown (event) {
    if (this.props.isInEditMode === false) {
      return;
    }

    if (this.triggerMouseDownTimer(event)) {
      return this.adagucMouseDoubleClick(event);
    }

    if (this.myEditMode === this.EDITMODE.ADD_FEATURE && this.myDrawMode === this.DRAWMODE.BOX) {
      return this.adagucMouseDoubleClick(event);
    }

    this.somethingWasDragged = this.DRAGMODE.NONE;

    if (this.mouseIsOverVertexNr !== this.VERTEX.NONE && this.myEditMode === this.EDITMODE.EMPTY) {
      return false;
    }

    /* Insert a new vertex into an edge, e.g a line is clicked and a point is added */
    if (this.insertVertexInEdge(event) === false) return false;

    /* This is trigged when a new feature is created.  */
    if (this.createNewFeature(event) === false) return false;

    /* This is triggered when new points are added during the addmultipoint mode. One point is added per time */
    if (this.addPointToMultiPointFeature(event) === false) return false;

    /* This is triggered when new points are added during the addpolygon mode. One point is added per time */
    if (this.addVerticesToPolygonFeature(event) === false) return false;

    return false; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
  }

  deletePolygon (index) {
    const feature = this.geojson.features[this.props.featureNrToEdit];
    feature.geometry.coordinates.splice(index, 1);
    if (this.props.deletePolygonCallback) {
      this.props.deletePolygonCallback();
    }
  }

  /* istanbul ignore next */
  deleteFeature () {
    /* Deletes any features under the mousecursor */
    const { webmapjs } = this.props;
    if (this.mouseIsOverVertexNr === this.VERTEX.NONE) {
      return;
    }
    const feature = this.geojson.features[this.props.featureNrToEdit];
    const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
    if (featureCoords === undefined) {
      return;
    }
    if (this.mouseIsOverVertexNr !== this.VERTEX.MIDDLE_POINT_OF_FEATURE) {
      /* Remove edge of polygon */
      if (featureCoords.length <= 3) {
        /* Remove the polygon completely if it can not have an area */
        this.deletePolygon(this.snappedPolygonIndex);
      } else {
        /* Remove edge of polygon */
        if (!this.checkIfFeatureIsBox(feature)) {
          featureCoords.splice(this.mouseIsOverVertexNr, 1);
        }
      }
    } else {
      /* Remove the polygon completely */
      this.deletePolygon(this.snappedPolygonIndex);
    }
    this.featureHasChanged('deleteFeature');
    this.selectedEdge = this.EDGE.NONE;
    this.mouseIsOverVertexNr = this.VERTEX.NONE;
    webmapjs.draw('AdagucMapDraw::deletefeatures');
  }

  /* istanbul ignore next */
  adagucMouseUp () {
    if (this.props.isInEditMode === false) {
      return;
    }

    if (this.somethingWasDragged !== this.DRAGMODE.NONE) {
      this.featureHasChanged(`A ${this.somethingWasDragged.toString()} was dragged`);
    }

    /* Delete a vertex or feature on mouseUp */
    if (this.myEditMode === this.EDITMODE.DELETE_FEATURES) {
      this.deleteFeature();
      return false;
    }

    if (this.mouseIsOverVertexNr !== this.VERTEX.NONE || this.selectedEdge !== this.EDGE.NONE) {
      return false;
    }

    if (this.myEditMode === this.EDITMODE.ADD_FEATURE) {
      return false;
    }
  }
  /* istanbul ignore next */
  cancelEdit (cancelLastPoint) {
    if (this.props.isInEditMode === false) {
      return;
    }
    const { webmapjs } = this.props;

    /* When in addpolygon mode, finish the polygon */
    if (this.myEditMode === this.EDITMODE.ADD_FEATURE) {
      this.myEditMode = this.EDITMODE.EMPTY;
      if (this.snappedPolygonIndex === this.SNAPPEDFEATURE.NONE) {
        return;
      }

      const feature = this.geojson.features[this.props.featureNrToEdit];
      const coordinates = feature.geometry.coordinates;
      const polygon = coordinates[this.snappedPolygonIndex];

      if (!polygon) {
        coordinates[this.snappedPolygonIndex] = [];
        return;
      }

      if (polygon.length === 0) {
        return;
      }

      if (!this.checkIfFeatureIsBox(feature)) {
        if (cancelLastPoint === true) {
          polygon.pop();
        }
        if (polygon.length < 3) {
          coordinates.pop();
        }
      }

      this.featureHasChanged('cancelEdit');
      webmapjs.draw('AdagucMapDraw::cancelEdit');
    } else {
      /* When in standard mode or deletefeatures mode, remove any vertex under the mousecursor */
      if (this.myEditMode === this.EDITMODE.EMPTY || this.myEditMode === this.EDITMODE.DELETE_FEATURES) {
        this.deleteFeature();
      }
    }
  }

  /* istanbul ignore next */
  handleKeyDown (event) {
    const ESCAPE_KEY = 27;
    if (event.keyCode === ESCAPE_KEY) {
      if (this.props.exitDrawModeCallback && (this.myEditMode === this.EDITMODE.EMPTY || this.myEditMode === this.EDITMODE.DELETE_FEATURES)) {
        this.props.exitDrawModeCallback();
      }
      this.cancelEdit(this.myDrawMode !== this.DRAWMODE.BOX);
      // TODO: is it OK to only use a single [Esc] to remove the last vertex AND exit draw mode?
      if (this.myDrawMode === this.DRAWMODE.POLYGON && this.props.exitDrawModeCallback) {
        this.props.exitDrawModeCallback();
      }
    }
  }

  componentDidMount () {
    window.addEventListener('beforeunload', this.componentCleanup);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentCleanup () { // this will hold the cleanup code
    window.removeEventListener('beforeunload', this.componentCleanup); // remove the event handler for normal unmounting
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

  componentWillUnmount () {
    this.componentCleanup();
  }

  featureHasChanged (text) {
    this.validatePolys(text === 'cancelEdit');
    if (this.props.updateGeojson && this.geojson) {
      this.props.updateGeojson(cloneDeep(this.geojson), text);
    }
  }

  /* Converts string input into right drawmode */
  handleDrawMode (_drawMode) {
    if (_drawMode) {
      let drawMode = _drawMode.toUpperCase();
      if (drawMode === 'POINT') { this.myDrawMode = this.DRAWMODE.POINT; }
      if (drawMode === 'MULTIPOINT') { this.myDrawMode = this.DRAWMODE.MULTIPOINT; }
      if (drawMode === 'BOX') { this.myDrawMode = this.DRAWMODE.BOX; }
      if (drawMode === 'POLYGON') { this.myDrawMode = this.DRAWMODE.POLYGON; }
    }
  }

  /* istanbul ignore next */
  componentWillReceiveProps (nextProps) {
    if (nextProps.geojson) {
      this.geojson = cloneDeep(nextProps.geojson);
    }

    /* Handle toggle edit */
    if (nextProps.isInEditMode === false && this.myEditMode !== this.EDITMODE.EMPTY) {
      this.cancelEdit(true); /* Throw away last vertice */
      if (this.myEditMode === this.EDITMODE.DELETE_FEATURES) {
        this.myEditMode = this.EDITMODE.EMPTY;
        return;
      }
    }

    /* Handle toggle delete */
    if (nextProps.isInDeleteMode === true) {
      this.myEditMode = this.EDITMODE.DELETE_FEATURES;
    } else if (this.myEditMode === this.EDITMODE.DELETE_FEATURES) {
      this.myEditMode = this.EDITMODE.EMPTY;
    }
    if (nextProps.isInEditMode === false && nextProps.isInDeleteMode === false) {
      this.myEditMode = this.EDITMODE.EMPTY;
    }

    /* Handle drawmode */
    this.handleDrawMode(nextProps.drawMode);
  }

  /* istanbul ignore next */
  render () {
    const { webmapjs } = this.props;
    if (this.disabled === undefined) {
      this.disabled = this.props.isInDeleteMode;
    }

    if (webmapjs !== undefined && this.listenersInitialized !== true) {
      this.listenersInitialized = true;
      webmapjs.addListener('beforecanvasdisplay', this.adagucBeforeDraw, true);
      webmapjs.addListener('beforemousemove', this.adagucMouseMove, true);
      webmapjs.addListener('beforemousedown', this.adagucMouseDown, true);
      webmapjs.addListener('beforemouseup', this.adagucMouseUp, true);
      this.disabled = false;
    }
    return (<div />);
  }
}

AdagucMapDraw.propTypes = {
  webmapjs: PropTypes.object,
  geojson: PropTypes.object,
  drawMode: PropTypes.string,
  deletePolygonCallback: PropTypes.func,
  exitDrawModeCallback: PropTypes.func,
  isInEditMode: PropTypes.bool,
  isInDeleteMode: PropTypes.bool,
  featureNrToEdit: PropTypes.number,
  hoverFeatureCallback: PropTypes.func,
  updateGeojson: PropTypes.func
};

AdagucMapDraw.defaultProps = {
  isInEditMode: false,
  isInDeleteMode: false,
  webmapjs: undefined,
  featureNrToEdit: 0
};
