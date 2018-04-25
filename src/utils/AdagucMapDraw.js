import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Enum from 'es6-enum';
export default class AdagucMapDraw extends PureComponent {
  constructor (props) {
    super(props);
    this.EDITMODE = Enum('EMPTY', 'DELETE_FEATURES', 'ADD_FEATURE');
    this.DRAWMODE = Enum('POLYGON', 'BOX', 'MULTIPOINT', 'POINT');
    this.VERTEX = Enum('NONE', 'MIDDLE_POINT_OF_FEATURE');
    this.EDGE = Enum('NONE');
    this.FEATURE = Enum('NONE');
    this.SNAPPEDPOYLYGON = Enum('NONE');
    this.DRAGMODE = Enum('NONE', 'VERTEX', 'FEATURE');
    this.editMode = this.EDITMODE.EMPTY;
    this.drawMode = this.DRAWMODE.MULTIPOINT;
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
    this.textPositions = [];
    this.mouseOverPolygonCoordinates = [];
    this.pointNumber = 0;
    this.defaultPolyProps = {
      'stroke': '#',
      'stroke-width': 0.4,
      'stroke-opacity': 1,
      'fill': '#33cc00',
      'fill-opacity': 1
    };
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

  drawVertice (ctx, _coord, selected, middle, isInEditMode) {
    let w = 7;
    let coord = { x: parseInt(_coord.x), y: parseInt(_coord.y) };
    if (isInEditMode === false) {
      /* Standard style, no editing, just display location of vertices */
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#000';
      ctx.lineWidth = 1.0;
      w = 5;
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

  /* istanbul ignore next */
  drawPolygon (ctx, XYCoords, featureIndex, polygonIndex) {
    const feature = this.props.geojson.features[featureIndex];
    if (!feature) return;
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
      middle.x += coord.x;
      middle.y += coord.y;
    }
    ctx.closePath();

    ctx.globalAlpha = polyProps['fill-opacity'] || this.defaultPolyProps['fill-opacity'];
    ctx.fill();
    ctx.globalAlpha = polyProps['stroke-opacity'] || this.defaultPolyProps['stroke-opacity'];
    ctx.stroke();

    let test = ctx.isPointInPath(this.mouseX, this.mouseY);
    if (test) {
      this.mouseOverPolygonCoordinates = XYCoords;
    }
    middle.x = parseInt(middle.x / XYCoords.length);
    middle.y = parseInt(middle.y / XYCoords.length);

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

    middle.nr = XYCoords.length;

    return middle;
  }

  /* istanbul ignore next */
  adagucBeforeDraw (ctx) {
    /* adagucBeforeDraw is an event callback function which is triggered
     just before adagucviewer will flip the back canvas buffer to the front.
     You are free to draw anything you like on the canvas.
    */

    if (!this.props.geojson || !this.props.geojson.features || !this.props.geojson.features.length) return;
    this.textPositions = [];
    this.mouseOverPolygonCoordinates = [];
    /* Current selected feature from GeoJSON */
    for (let featureIndex = 0; featureIndex < this.props.geojson.features.length; featureIndex++) {
      const feature = this.props.geojson.features[featureIndex];

      const featureType = feature.geometry.type;
      let totalmiddle = { x: 0, y: 0, nr: 0 };

      if (featureType === 'Point') {
        let featureCoords = feature.geometry.coordinates;
        const XYCoords = this.getPixelCoordFromGeoCoord([featureCoords]);
        if (XYCoords.length === 0) {
          continue;
        }
        for (let j = 0; j < XYCoords.length; j++) {
          this.drawVertice(ctx, XYCoords[j],
            this.mouseIsOverVertexNr === j && this.props.featureNrToEdit === featureIndex,
            false,
            this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
        }
      }

      if (featureType === 'MultiPoint') {
        let featureCoords = feature.geometry.coordinates;
        const XYCoords = this.getPixelCoordFromGeoCoord(featureCoords);
        if (XYCoords.length === 0) {
          continue;
        }
        for (let j = 0; j < XYCoords.length; j++) {
          this.drawVertice(ctx, XYCoords[j],
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
            totalmiddle.x += middle.x * middle.nr;
            totalmiddle.y += middle.y * middle.nr;
            totalmiddle.nr += middle.nr;
            if (this.props.isInEditMode) {
              /* Draw all vertices on the edges of the polygons */
              for (let j = 0; j < XYCoords.length; j++) {
                this.drawVertice(ctx,
                  XYCoords[j],
                  this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === j && this.props.featureNrToEdit === featureIndex,
                  false,
                  this.props.isInEditMode && this.props.featureNrToEdit === featureIndex);
              }

              if (this.props.isInEditMode === true && XYCoords.length >= 3) {
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
          if (feature.properties && feature.properties.NUTS_ID) {
            this.textPositions.push({ x:mx, y:my, text: feature.properties.NUTS_ID });
          }
        }
      } else {
        /* Loop through all polygons of the same feature */
        for (let polygonIndex = 0; polygonIndex < feature.geometry.coordinates.length; polygonIndex++) {
          const featureCoords = feature.geometry.coordinates[polygonIndex];

          const XYCoords = this.getPixelCoordFromGeoCoord(featureCoords);
          /* Only draw if there is stuff to show */
          if (XYCoords.length === 0) {
            continue;
          }

          const middle = this.drawPolygon(ctx, XYCoords, featureIndex, polygonIndex);

          if (feature.properties && feature.properties.NUTS_ID) {
            this.textPositions.push({ x:middle.x, y:middle.y, text: feature.properties.NUTS_ID });
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

            if (this.props.isInEditMode === true && XYCoords.length >= 3) {
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
    if ((this.mouseIsOverVertexNr === this.VERTEX.NONE &&
      this.snappedPolygonIndex === this.SNAPPEDPOYLYGON.NONE &&
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

    /* Draw labels */
    for (let j = 0; j < this.textPositions.length; j++) {
      const { x, y, text } = this.textPositions[j];
      ctx.fillStyle = 'black';
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
    if (VERTEX < 8) {
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
    return { selectedEdge: this.EDGE.NONE, snappedPolygonIndex: this.SNAPPEDPOYLYGON.NONE };
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
    if (this.editMode !== this.EDITMODE.ADD_FEATURE) {
      this.somethingWasDragged = this.DRAGMODE.FEATURE;
    }
  }

  /* istanbul ignore next */
  transposeVertex (featureCoords) {
    if (this.editMode !== this.EDITMODE.ADD_FEATURE) {
      this.somethingWasDragged = this.DRAGMODE.VERTEX;
    }

    if (this.drawMode === this.DRAWMODE.MULTIPOINT) {
      return;
    }

    if (this.drawMode === this.DRAWMODE.BOX && featureCoords.length === 4) {
      if (this.mouseIsOverVertexNr === 0) {
        featureCoords[1][0] = this.mouseGeoCoord.x;
        featureCoords[3][1] = this.mouseGeoCoord.y;
      }
      if (this.mouseIsOverVertexNr === 1) {
        featureCoords[0][0] = this.mouseGeoCoord.x;
        featureCoords[2][1] = this.mouseGeoCoord.y;
      }
      if (this.mouseIsOverVertexNr === 2) {
        featureCoords[1][1] = this.mouseGeoCoord.y;
        featureCoords[3][0] = this.mouseGeoCoord.x;
      }
      if (this.mouseIsOverVertexNr === 3) {
        featureCoords[0][1] = this.mouseGeoCoord.y;
        featureCoords[2][0] = this.mouseGeoCoord.x;
      }
    }

    featureCoords[this.mouseIsOverVertexNr][0] = this.mouseGeoCoord.x;
    featureCoords[this.mouseIsOverVertexNr][1] = this.mouseGeoCoord.y;
  }

  /* istanbul ignore next */
  moveVertex (featureCoords, mouseDown) {
    if (!featureCoords) {
      return;
    }

    const vertexSelected = mouseDown === true && this.mouseIsOverVertexNr !== this.VERTEX.NONE;

    if (vertexSelected || this.editMode === this.EDITMODE.ADD_FEATURE) {
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

    if (feature.geometry.type === 'MultiPoint') {
      this.snappedPolygonIndex = this.SNAPPEDPOYLYGON.NONE;
      for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
        const featureCoords = feature.geometry.coordinates[polygonIndex];
        if (featureCoords === undefined) {
          continue;
        }
        /* Get all vertexes */
        const XYCoords = this.convertGeoCoordsToScreenCoords([featureCoords]);
        if (this.checkDist(XYCoords[0], polygonIndex, mouseX, mouseY)) {
          console.log('jo');
          this.mouseIsOverVertexNr = polygonIndex;
          this.pointNumber = polygonIndex;
          return;
        }
      }
      return;
    }

    for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
      const featureCoords = feature.geometry.coordinates[polygonIndex];
      if (featureCoords === undefined) {
        continue;
      }
      /* Get all vertexes */
      const XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
      const middle = { x: 0, y: 0 };
      /* Snap to the vertex closer than specified pixels */
      for (let j = 0; j < XYCoords.length; j++) {
        const coord = XYCoords[j];
        middle.x += coord.x;
        middle.y += coord.y;

        if (this.checkDist(coord, polygonIndex, mouseX, mouseY)) {
          foundVertex = j;
          break;
        }
      }
      middle.x = parseInt(middle.x / XYCoords.length);
      middle.y = parseInt(middle.y / XYCoords.length);
      /* Check if the mouse hovers the middle vertex */
      if (foundVertex === this.VERTEX.NONE && this.checkDist(middle, polygonIndex, mouseX, mouseY)) {
        foundVertex = this.VERTEX.MIDDLE_POINT_OF_FEATURE;
      }

      this.mouseIsOverVertexNr = foundVertex;
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

    const feature = this.props.geojson.features[this.props.featureNrToEdit];
    const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];

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
    if (this.editMode !== this.EDITMODE.DELETE_FEATURES) {
      const retObj = this.hoverEdge(feature.geometry.coordinates, mouseX, mouseY);
      this.selectedEdge = retObj.selectedEdge;
      this.snappedPolygonIndex = retObj.snappedPolygonIndex;
    }

    if (this.selectedEdge !== this.EDGE.NONE) {
      webmapjs.draw('AdagucMapDraw::adagucMouseMove');
      return false;
    }

    if (this.editMode === this.EDITMODE.ADD_FEATURE) {
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
    this.doubleClickTimer.timer = setTimeout(checkTimeOut, 600);

    /* No double click detected, return false */
    return false;
  }

  adagucMouseDoubleClick (event) {
    this.handleKeyDown({ keyCode: 27 });
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

    if (this.editMode === this.EDITMODE.ADD_FEATURE && this.drawMode === this.DRAWMODE.BOX) {
      return this.adagucMouseDoubleClick(event);
    }

    this.somethingWasDragged = this.DRAGMODE.NONE;
    const { webmapjs } = this.props;
    const { mouseX, mouseY } = event;

    if (this.mouseIsOverVertexNr !== this.VERTEX.NONE && this.editMode === this.EDITMODE.EMPTY) {
      return false;
    }

    /* Insert a new vertex into an edge, e.g a line is clicked and a point is added */
    if (this.selectedEdge !== this.EDGE.NONE &&
        this.editMode !== this.EDITMODE.DELETE_FEATURES &&
        this.drawMode !== this.DRAWMODE.BOX) {
      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
      const feature = this.props.geojson.features[this.props.featureNrToEdit];
      const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
      if (featureCoords === undefined) {
        return false;
      }
      featureCoords.splice(this.selectedEdge + 1, 0, [this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      this.featureHasChanged('insert vertex into line');
      this.adagucMouseMove(event);
      return false;
    }

    /* This is trigged when a new polygon is created. Two points are added at once */
    if (this.editMode === this.EDITMODE.EMPTY) {
      this.editMode = this.EDITMODE.ADD_FEATURE;
      const feature = this.props.geojson.features[this.props.featureNrToEdit];
      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });

      if (this.drawMode === this.DRAWMODE.POINT || this.drawMode === this.DRAWMODE.MULTIPOINT) {
        /* Create points */
        console.log('create point');
        if (feature.geometry.coordinates === undefined) {
          feature.geometry.coordinates = [];
        }
        if (this.drawMode === this.DRAWMODE.POINT) {
          const featureCoords = feature.geometry.coordinates;
          featureCoords[0] = this.mouseGeoCoord.x;
          featureCoords[1] = this.mouseGeoCoord.y;
          this.pointNumber = 0;
          this.snappedPolygonIndex = this.SNAPPEDPOYLYGON.NONE;
        }
        if (this.drawMode === this.DRAWMODE.MULTIPOINT) {
          const featureCoords = feature.geometry.coordinates;
          featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
          this.pointNumber = featureCoords.length;
          this.snappedPolygonIndex = this.SNAPPEDPOYLYGON.NONE;
        }
      } else {
        /* Create poly's and boxes */
        if (feature.geometry.coordinates === undefined) {
          feature.geometry.coordinates = [];
        }
        if (feature.geometry.coordinates[0] === undefined) {
          feature.geometry.coordinates[0] = [];
        } else {
          feature.geometry.coordinates.push([]);
        }
        this.snappedPolygonIndex = feature.geometry.coordinates.length - 1;
        const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);

        /* This is triggered when a bounding box is created. Four points are added at once */
        if (this.drawMode === this.DRAWMODE.BOX) {
          featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
          featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        }

        this.featureHasChanged('new poly created');

        if (this.drawMode === this.DRAWMODE.BOX) {
          this.mouseIsOverVertexNr = 2;
        } else {
          this.mouseIsOverVertexNr = featureCoords.length - 1;
        }
      }
      webmapjs.draw('AdagucMapDraw::adagucMouseDown');

      return false;
    }

    // console.log('this.editMode ', this.editMode);
    // console.log('this.snappedPolygonIndex ', this.snappedPolygonIndex);
    /* This is triggered when new points are added during the addmultipoint mode. One point is added per time */

    if (this.drawMode === this.DRAWMODE.MULTIPOINT) {
      if (this.editMode === this.EDITMODE.ADD_FEATURE && this.pointNumber !== this.SNAPPEDPOYLYGON.NONE) {
        this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
        const feature = this.props.geojson.features[this.props.featureNrToEdit];
        feature.geometry.coordinates.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
        this.featureHasChanged('point added to multipoint');
        this.pointNumber = feature.geometry.coordinates.length;
        console.log(this.pointNumber);
        this.adagucMouseMove(event);
        return false;
      }
    }

    /* This is triggered when new points are added during the addpolygon mode. One point is added per time */
    if (this.editMode === this.EDITMODE.ADD_FEATURE && this.snappedPolygonIndex !== this.SNAPPEDPOYLYGON.NONE) {
      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x: mouseX, y: mouseY });
      const feature = this.props.geojson.features[this.props.featureNrToEdit];
      const featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
      featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      this.featureHasChanged('vertex added to polygon');
      this.mouseIsOverVertexNr = featureCoords.length - 1;
      this.adagucMouseMove(event);
      return false;
    }

    return false; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
  }

  deletePolygon (index) {
    const feature = this.props.geojson.features[this.props.featureNrToEdit];
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
    const feature = this.props.geojson.features[this.props.featureNrToEdit];
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
        featureCoords.splice(this.mouseIsOverVertexNr, 1);
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
    if (this.editMode === this.EDITMODE.DELETE_FEATURES) {
      this.deleteFeature();
      return false;
    }

    if (this.mouseIsOverVertexNr !== this.VERTEX.NONE || this.selectedEdge !== this.EDGE.NONE) {
      return false;
    }

    if (this.editMode === this.EDITMODE.ADD_FEATURE) {
      return false;
    }
  }
  /* istanbul ignore next */
  cancelEdit (cancelLastPoint) {
    if (this.props.isInEditMode === false) {
      return;
    }
    const { webmapjs, geojson } = this.props;

    /* When in addpolygon mode, finish the polygon */
    if (this.editMode === this.EDITMODE.ADD_FEATURE) {
      this.editMode = this.EDITMODE.EMPTY;
      if (this.snappedPolygonIndex === this.SNAPPEDPOYLYGON.NONE) {
        return;
      }

      const feature = geojson.features[this.props.featureNrToEdit];
      const { geometry } = feature;
      const coordinates = geometry.coordinates;
      const polygon = coordinates[this.snappedPolygonIndex];

      if (polygon.length === 0) {
        return;
      }
      if (cancelLastPoint === true) {
        polygon.pop();
      }
      if (polygon.length < 3) {
        coordinates.pop();
      }
      this.featureHasChanged('cancelEdit');
      webmapjs.draw('AdagucMapDraw::cancelEdit');
    } else {
      /* When in standard mode or deletefeatures mode, remove any vertex under the mousecursor */
      if (this.editMode === this.EDITMODE.EMPTY || this.editMode === this.EDITMODE.DELETE_FEATURES) {
        this.deleteFeature();
      }
    }
  }

  /* istanbul ignore next */
  handleKeyDown (event) {
    const ESCAPE_KEY = 27;
    if (event.keyCode === ESCAPE_KEY) {
      if (this.props.exitDrawModeCallback && (this.editMode === this.EDITMODE.EMPTY || this.editMode === this.EDITMODE.DELETE_FEATURES)) {
        this.props.exitDrawModeCallback();
      }
      this.cancelEdit(this.drawMode !== this.DRAWMODE.BOX);
    }
  }
  componentWillMount () {
    document.addEventListener('keydown', this.handleKeyDown);
  }
  componentWillUnMount () {
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
  featureHasChanged (text) {
    const { dispatch, actions } = this.props;
    // console.log(JSON.stringify(this.props.geojson, null, 2));
    dispatch(actions.updateFeature(this.props.geojson, text));
  }
  /* istanbul ignore next */
  componentWillReceiveProps (nextProps) {
    /* Handle toggle edit */
    if (nextProps.isInEditMode === false && this.editMode !== this.EDITMODE.EMPTY) {
      this.cancelEdit(true); /* Throw away last vertice */
      if (this.editMode === this.EDITMODE.DELETE_FEATURES) {
        this.editMode = this.EDITMODE.EMPTY;
        return;
      }
    }

    /* Handle toggle delete */
    if (nextProps.isInDeleteMode === true) {
      this.editMode = this.EDITMODE.DELETE_FEATURES;
    } else if (this.editMode === this.EDITMODE.DELETE_FEATURES) {
      this.editMode = this.EDITMODE.EMPTY;
    }
    if (nextProps.isInEditMode === false && nextProps.isInDeleteMode === false) {
      this.editMode = this.EDITMODE.EMPTY;
    }

    /* Handle drawmode */
    if (nextProps.drawMode) {
      if (nextProps.drawMode === 'POINT') { this.drawMode = this.DRAWMODE.POINT; }
      if (nextProps.drawMode === 'MULTIPOINT') { this.drawMode = this.DRAWMODE.MULTIPOINT; }
      if (nextProps.drawMode === 'BOX') { this.drawMode = this.DRAWMODE.BOX; }
      if (nextProps.drawMode === 'POLYGON') { this.drawMode = this.DRAWMODE.POLYGON; }
    }
  }

  /* istanbul ignore next */
  render () {
    const { webmapjs } = this.props;
    if (this.disabled === undefined) {
      this.disabled = this.props.isInDeleteMode;
    }

    if (webmapjs !== undefined && this.listenersInitialized === undefined) {
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
  actions: PropTypes.object,
  drawMode: PropTypes.string,
  deletePolygonCallback: PropTypes.func,
  exitDrawModeCallback: PropTypes.func,
  dispatch: PropTypes.func.isRequired,
  isInEditMode: PropTypes.bool,
  isInDeleteMode: PropTypes.bool,
  featureNrToEdit: PropTypes.number
};

AdagucMapDraw.defaultProps = {
  isInEditMode: false,
  isInDeleteMode: false,
  webmapjs: undefined,
  featureNrToEdit: 0
};
