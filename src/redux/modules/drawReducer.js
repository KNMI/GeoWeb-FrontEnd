import { createAction, handleActions } from 'redux-actions';
import cloneDeep from 'lodash.clonedeep';
const ADAGUCMAPDRAW_UPDATEFEATURE = 'ADAGUCMAPDRAW_UPDATEFEATURE';
const ADAGUCMEASUREDISTANCE_UPDATE = 'ADAGUCMEASUREDISTANCE_UPDATE';
const SET_GEOJSON = 'SET_GEOJSON';
const ADAGUCMAPDRAW_EDIT_POINT = 'ADAGUCMAPDRAW_EDIT_POINT';
const ADAGUCMAPDRAW_EDIT_BOX = 'ADAGUCMAPDRAW_EDIT_BOX';
const ADAGUCMAPDRAW_EDIT_POLYGON = 'ADAGUCMAPDRAW_EDIT_POLYGON';
const ADAGUCMAPDRAW_SET_FEATURE_NR = 'ADAGUCMAPDRAW_SET_FEATURE_NR';
const SET_FEATURE = 'SET_FEATURE';

const updateFeature = createAction(ADAGUCMAPDRAW_UPDATEFEATURE);
const setGeoJSON = createAction(SET_GEOJSON);
const measureDistanceUpdate = createAction(ADAGUCMEASUREDISTANCE_UPDATE);
const setFeatureEditPoint = createAction(ADAGUCMAPDRAW_EDIT_POINT);
const setFeatureEditBox = createAction(ADAGUCMAPDRAW_EDIT_BOX);
const setFeatureEditPolygon = createAction(ADAGUCMAPDRAW_EDIT_POLYGON);
const setFeatureNr = createAction(ADAGUCMAPDRAW_SET_FEATURE_NR);
const setFeature = createAction(SET_FEATURE);

const INITIAL_STATE = {
  adagucMapDraw: {
    geojson: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: []
          },
          properties: {
            'stroke': '#000',
            'stroke-width': 2,
            'stroke-opacity': 1,
            'fill': '#F00',
            'fill-opacity': 0.3
          }
        },
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: []
          },
          properties: {
            'stroke': '#000000',
            'stroke-width': 2,
            'stroke-opacity': 1,
            'fill': '#00F',
            'fill-opacity': 0.3
          }
        }
      ]
    },
    drawMode: 'POLYGON',
    featureNrToEdit: 0
  },
  measureDistance: {
    isInEditMode: false
  }
};

export const actions = {
  updateFeature,
  setGeoJSON,
  setFeature,
  measureDistanceUpdate,
  setFeatureEditPoint,
  setFeatureEditBox,
  setFeatureEditPolygon,
  setFeatureNr
};

export default handleActions({
  [SET_FEATURE]: (state, { payload }) => {
    const { coordinates, selectionType, featureFunction } = payload;
    console.log(featureFunction);
    const stateCpy = cloneDeep(state);
    const feature = stateCpy.adagucMapDraw.geojson.features.find((geo) => geo.properties.featureFunction === featureFunction);
    console.log(feature);
    if (!feature) {
      return state;
    }
    feature.properties.selectionType = selectionType;
    feature.geometry.coordinates = coordinates;
    return stateCpy;
  },
  [ADAGUCMAPDRAW_EDIT_BOX]: (state, { payload }) => {
    return (
      { ...state,
        adagucMapDraw: {
          ...state.adagucMapDraw,
          drawMode: 'POINT'
        }
      }
    );
  },
  [ADAGUCMAPDRAW_EDIT_BOX]: (state, { payload }) => {
    return (
      { ...state,
        adagucMapDraw: {
          ...state.adagucMapDraw,
          drawMode: 'BOX'
        }
      }
    );
  },
  [ADAGUCMAPDRAW_EDIT_POLYGON]: (state, { payload }) => {
    return (
      { ...state,
        adagucMapDraw: {
          ...state.adagucMapDraw,
          drawMode: 'POLYGON'
        }
      }
    );
  },
  [ADAGUCMAPDRAW_SET_FEATURE_NR]: (state, { payload }) => {
    return (
      { ...state,
        adagucMapDraw: {
          ...state.adagucMapDraw,
          featureNrToEdit: payload
        }
      }
    );
  },
  [ADAGUCMAPDRAW_UPDATEFEATURE]: (state, { payload }) => (
    { ...state,
      adagucMapDraw: { ...state.adagucMapDraw, geojson: payload },
      measureDistance: { ...state.measureDistance, isInEditMode: false } }
  ),

  [ADAGUCMEASUREDISTANCE_UPDATE]: (state, { payload }) => ({ ...state, measureDistance: { distance: payload.distance, bearing: payload.bearing } }),

  [SET_GEOJSON]: (state, { payload }) => ({ ...state, adagucMapDraw: { ...state.adagucMapDraw, geojson: payload } })
}, INITIAL_STATE);
