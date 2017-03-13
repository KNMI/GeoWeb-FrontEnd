import React from 'react';

export const ADAGUCMAPDRAW_EDITING = 'ADAGUCMAPDRAW_EDITING';
export const ADAGUCMAPDRAW_DELETE = 'ADAGUCMAPDRAW_DELETE';
export const ADAGUCMAPDRAW_UPDATEFEATURE = 'ADAGUCMAPDRAW_UPDATEFEATURE';

/* istanbul ignore next */
const AdagucMapDraw = React.createClass({
  propTypes: {
    webmapjs  : React.PropTypes.object,
    geojson   : React.PropTypes.object,
    dispatch  : React.PropTypes.func.isRequired,
    isInEditMode  : React.PropTypes.bool,
    isInDeleteMode  : React.PropTypes.bool
  },
  getDefaultProps () {
    return {
      isInEditMode:false,
      isInDeleteMode:false,
      webmapjs:undefined,
      geojson: { 'type': 'FeatureCollection',
        'features': [
          { 'type': 'Feature',
            'geometry': {
              'type': 'Polygon',
              'coordinates': []
            },
            'properties': {
              'prop0': 'value0',
              'prop1': { 'this':  'that' }
            }
          }
        ]
      }
    };
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
    /* adagucBeforeDraw is an event callback function which is triggered
     just before adagucviewer will flip the back canvas buffer to the front.
     You are free to draw anything you like on the canvas.
    */

    let featureIndex = 0; /* Current selected feature from GeoJSON */

    let feature = this.props.geojson.features[featureIndex];

    /* Loop through all polygons of the same feature */
    for (let polygonIndex = 0; polygonIndex < feature.geometry.coordinates.length; polygonIndex++) {
      let featureCoords = feature.geometry.coordinates[polygonIndex];

      let XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
      /* Only draw if there is stuff to show */
      if (XYCoords.length > 0) {
        /* Draw polygons and calculate center of poly */
        let middle = { x:0, y:0 };
        ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.fillStyle = '#F88'; ctx.beginPath();
        for (let j = 0; j < XYCoords.length; j++) {
          let coord = XYCoords[j];
          if (j === 0)ctx.moveTo(coord.x, coord.y); else ctx.lineTo(coord.x, coord.y);
          middle.x += coord.x;
          middle.y += coord.y;
        }
        ctx.closePath(); ctx.globalAlpha = 0.6; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
        middle.x = parseInt(middle.x / XYCoords.length);
        middle.y = parseInt(middle.y / XYCoords.length);

        if (this.props.isInEditMode === true) {
          /* Higlight selected edge of a polygon, previousely detected by mouseover event */
          if (this.snappedPolygonIndex === polygonIndex && this.selectedEdge !== -1) {
            ctx.strokeStyle = '#FF0';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(XYCoords[this.selectedEdge].x, XYCoords[this.selectedEdge].y);
            ctx.lineTo(
              XYCoords[(this.selectedEdge + 1) % XYCoords.length].x,
              XYCoords[(this.selectedEdge + 1) % XYCoords.length].y);
            ctx.stroke();
          }
        }

        /* Function for drawing vertices with several styles */
        let drawVertice = (coord, selected, middle) => {
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
          ctx.globalAlpha = 1.0;
          ctx.fillRect(coord.x - w / 2, coord.y - w / 2, w, w);
          ctx.strokeRect(coord.x - w / 2, coord.y - w / 2, w, w);
          ctx.strokeRect(coord.x - 0.5, coord.y - 0.5, 1, 1);
        };

        /* Draw all vertices on the edges of the polygons */
        for (let j = 0; j < XYCoords.length; j++) {
          drawVertice(XYCoords[j], this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === j);
        }

        if (this.props.isInEditMode === true) {
          /* Draw middle vertice for the poly if poly covers an area, e.g. when it contains more than three points */
          if (XYCoords.length >= 3) {
            drawVertice(middle, this.snappedPolygonIndex === polygonIndex && this.mouseIsOverVertexNr === -2, true);
          }
        }
      }
    }
  },
  adagucMouseMove (event) {
    /* adagucMouseMove is an event callback function which is triggered when the mouse moves over the map
      This event is only triggered if the map is in hover state.
      E.g. when the map is dragging/panning, this event is not triggerd
    */
    if (this.props.isInEditMode === false) return;
    let featureIndex = 0;
    let feature = this.props.geojson.features[featureIndex];
    let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];

    const { webmapjs } = this.props;
    let { mouseX, mouseY, mouseDown } = event;
    this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });

    /* The mouse is hovering a vertice, and the mousedown is into effect, move vertice accordingly */
    if (featureCoords !== undefined && this.editMode !== 'deletefeatures') {
      if ((mouseDown === true && this.mouseIsOverVertexNr !== -1) || this.editMode === 'addpolygon') {
        /* Transpose polygon vertex */
        if (this.mouseIsOverVertexNr >= 0) {
          featureCoords[this.mouseIsOverVertexNr][0] = this.mouseGeoCoord.x;
          featureCoords[this.mouseIsOverVertexNr][1] = this.mouseGeoCoord.y;
          if (this.editMode !== 'addpolygon') {
            this.somethingWasDragged = 'vertex';
          }
        }
        /* In case middle point is selected, transpose whole polygon */
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
            if (this.editMode !== 'addpolygon') {
              this.somethingWasDragged = 'polygon';
            }
          }
        }
        webmapjs.draw();
        return false;
      }
    }

    /* Function which calculates the distance between two points */
    let distance = (a, b) => {
      return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    };

    /* Function which calculates if a point is between two other points */
    let isBetween = (a, c, b) => {
      let da = distance(a, c) + distance(c, b);
      let db = distance(a, b);
      if (Math.abs(da - db) < 1) return true; else return false;
    };

    /* Checks if mouse is in proximity of given coordinate */
    let checkDist = (coord, polygonIndex) => {
      let d = distance(coord, { x:mouseX, y:mouseY });
      if (d < 8) {
        this.snappedGeoCoords = { ...this.mouseGeoCoord };
        this.snappedPolygonIndex = polygonIndex;
        return true;
      }
      return false;
    };

    /* Check if the mouse hovers any vertice of any polygon */
    let foundVertex = -1;
    this.mouseIsOverVertexNr = -1;
    for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
      let featureCoords = feature.geometry.coordinates[polygonIndex];
      if (featureCoords !== undefined) {
        /* Get all vertexes */
        let XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
        let middle = { x:0, y:0 };
        /* Snap to the vertex closer than specified pixels */
        for (let j = 0; j < XYCoords.length; j++) {
          let coord = XYCoords[j];
          middle.x += coord.x;
          middle.y += coord.y;
          if (checkDist(coord, polygonIndex)) {
            foundVertex = j;
            break;
          }
        }
        middle.x = parseInt(middle.x / XYCoords.length);
        middle.y = parseInt(middle.y / XYCoords.length);
        /* Check if the mouse hovers the middle vertex */
        if (foundVertex === -1 && checkDist(middle, polygonIndex)) {
          foundVertex = -2; /* -2 Means middle of polygon */
        }

        this.mouseIsOverVertexNr = foundVertex;

        if (this.mouseIsOverVertexNr !== -1) {
          /* We found a vertex */
          this.selectedEdge = -1; /* We found a vertex, not an edge: reset it */
          webmapjs.setCursor('move');
          webmapjs.draw();
          return false;
        }
      }
    }

    webmapjs.setCursor();

    /* Check if the mouse hovers an edge of a polygon */
    this.selectedEdge = -1;
    if (this.editMode !== 'deletefeatures') {
      for (let polygonIndex = feature.geometry.coordinates.length - 1; polygonIndex >= 0; polygonIndex--) {
        let featureCoords = feature.geometry.coordinates[polygonIndex];
        if (featureCoords !== undefined) {
          /* Get all vertexes */
          let XYCoords = this.convertGeoCoordsToScreenCoords(featureCoords);
          for (let j = 0; j < XYCoords.length; j++) {
            let startV = XYCoords[j];
            let stopV = XYCoords[(j + 1) % XYCoords.length];
            if (isBetween(startV, { x:mouseX, y:mouseY }, stopV)) {
              this.selectedEdge = j;
              this.snappedPolygonIndex = polygonIndex;
              break;
            }
          }
        }
      }
    }

    if (this.selectedEdge !== -1) {
      webmapjs.draw();
      return false;
    }

    if (this.editMode === 'addpolygon') {
      return false;
    }

    /* We did not find anything under the mousecursor,
      return true means that the map will continue with its own mousehandling
    */
    if (this.mouseIsOverVertexNr === -1 && this.selectedEdge === -1) {
      webmapjs.draw();
      return true; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
    }
  },
  adagucMouseDown (event) {
    if (this.props.isInEditMode === false) return;
    this.somethingWasDragged = false;
    const { webmapjs } = this.props;
    let { mouseX, mouseY } = event;

    if (this.mouseIsOverVertexNr !== -1 && this.editMode === '') {
      return false;
    }
    /* Insert a new vertex into an edge, e.g a line is clicked and a point is added */
    if (this.selectedEdge !== -1 && this.editMode !== 'deletefeatures') {
      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });
      let featureIndex = 0;
      let feature = this.props.geojson.features[featureIndex];
      let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
      if (featureCoords === undefined) return false;
      featureCoords.splice(this.selectedEdge + 1, 0, [this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      this.featureHasChanged('insert vertex into line');
      this.adagucMouseMove(event);
      return false;
    }

    /* This is trigged when a new polygon is created. Two points are added at once */
    if (this.editMode === '') {
      this.editMode = 'addpolygon';
      let featureIndex = 0;
      let feature = this.props.geojson.features[featureIndex];
      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });

      if (feature.geometry.coordinates === undefined) {
        feature.geometry.coordinates = [];
      }
      if (feature.geometry.coordinates[0] === undefined) {
        feature.geometry.coordinates[0] = [];
      } else {
        feature.geometry.coordinates.push([]);
      }
      this.snappedPolygonIndex = feature.geometry.coordinates.length - 1;
      let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
      featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      this.featureHasChanged('new poly created');
      this.mouseIsOverVertexNr = featureCoords.length - 1;
      webmapjs.draw();
      return false;
    }

    /* This is triggered when new points are added during the addpolygon mode. One point is added per time */
    if (this.editMode === 'addpolygon') {
      this.mouseGeoCoord = webmapjs.getLatLongFromPixelCoord({ x:mouseX, y:mouseY });
      let featureIndex = 0;
      let feature = this.props.geojson.features[featureIndex];
      let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
      featureCoords.push([this.mouseGeoCoord.x, this.mouseGeoCoord.y]);
      this.featureHasChanged('vertex added to polygon');
      this.mouseIsOverVertexNr = featureCoords.length - 1;
      this.adagucMouseMove(event);
      return false;
    }

    return false; /* False means that this component will take over entire controll.
                     True means that it is still possible to pan and drag the map while editing */
  },
  deleteFeature () {
    /* Deletes any features under the mousecursor */
    const { webmapjs } = this.props;
    if (this.mouseIsOverVertexNr !== -1) {
      let featureIndex = 0;
      let feature = this.props.geojson.features[featureIndex];
      let featureCoords = feature.geometry.coordinates[this.snappedPolygonIndex];
      if (featureCoords === undefined) {
        return;
      }
      if (this.mouseIsOverVertexNr !== -2) {
        /* Remove edge of polygon */
        if (featureCoords.length <= 3) {
          /* Remove the polygon completely if it can not have an area */
          feature.geometry.coordinates.splice(this.snappedPolygonIndex, 1);
        } else {
          /* Remove edge of polygon */
          featureCoords.splice(this.mouseIsOverVertexNr, 1);
        }
      } else {
        /* Remove the polygon completely */
        feature.geometry.coordinates.splice(this.snappedPolygonIndex, 1);
      }
      this.featureHasChanged('deleteFeature');
      this.selectedEdge = -1;
      this.mouseIsOverVertexNr = -1;
      webmapjs.draw();
    }
  },
  adagucMouseUp (event) {
    if (this.props.isInEditMode === false) return;

    if (this.somethingWasDragged !== false) {
      this.featureHasChanged('A ' + this.somethingWasDragged + ' was dragged');
    }

    /* Delete a vertex or feature on mouseUp */
    if (this.editMode === 'deletefeatures') {
      this.deleteFeature();
      return false;
    }

    if (this.mouseIsOverVertexNr !== -1 || this.selectedEdge !== -1) {
      return false;
    }

    if (this.editMode === 'addpolygon') {
      return false;
    }
  },
  cancelEdit (cancelLastPoint) {
    console.log('cancelEdit');
    if (this.props.isInEditMode === false) return;
    const { webmapjs } = this.props;

    /* When in addpolygon mode, finish the polygon */
    if (this.editMode === 'addpolygon') {
      this.editMode = '';
      if (this.snappedPolygonIndex !== -1) {
        let featureIndex = 0;
        if (this.props.geojson.features[featureIndex].geometry.coordinates[this.snappedPolygonIndex].length > 0) {
          if (cancelLastPoint === true) {
            this.props.geojson.features[featureIndex].geometry.coordinates[this.snappedPolygonIndex].pop();
          }
          if (this.props.geojson.features[featureIndex].geometry.coordinates[this.snappedPolygonIndex].length < 3) {
            this.props.geojson.features[featureIndex].geometry.coordinates.pop();
          }
          this.featureHasChanged('cancelEdit');
          webmapjs.draw();
        }
      }
    } else {
      /* When in standard mode or deletefeatures mode, remove any vertex under the mousecursor */
      if (this.editMode === '' || this.editMode === 'deletefeatures') {
        this.deleteFeature();
      }
    }
  },
  handleKeyDown (event) {
    switch (event.keyCode) {
      case 27: /* ESCAPE_KEY */
        this.cancelEdit(true);
        break;
      default:
        break;
    }
  },
  componentWillMount () {
    document.addEventListener('keydown', this.handleKeyDown);
    this.editMode = '';
  },
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
  },
  featureHasChanged (text) {
    this.props.dispatch({ type: ADAGUCMAPDRAW_UPDATEFEATURE, payload: { geojson: this.props.geojson, text: text } });
  },
  componentDidMount () {
  },
  componentWillReceiveProps (nextProps) {
     /* Handle toggle edit */
    if (nextProps.isInEditMode === false && this.editMode !== '') {
      this.cancelEdit(true); /* Throw away last vertice */
      if (this.editMode === 'deletefeatures') {
        this.editMode = '';
        if (nextProps.isInDeleteMode === true) {
          this.props.dispatch({ type: ADAGUCMAPDRAW_DELETE, payload: { isInDeleteMode:false } });
        }
        return;
      }
    }

    /* Handle toggle delete */
    if (nextProps.isInDeleteMode === true) {
      this.editMode = 'deletefeatures';
      if (nextProps.isInEditMode === false) {
        /* Editmode should be switched on when deletemode is entered */
        this.props.dispatch({ type: ADAGUCMAPDRAW_EDITING, payload: { isInEditMode:true } });
      }
    } else {
      if (this.editMode === 'deletefeatures') {
        this.editMode = '';
      }
    }
    if (this.props.webmapjs) {
      this.props.webmapjs.draw();
    }
    if (nextProps.isInEditMode === false && nextProps.isInDeleteMode === false) {
      this.editMode = '';
    }
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
      }
      webmapjs.draw();
    }
    return (<div />);
  }
});

export default AdagucMapDraw;
