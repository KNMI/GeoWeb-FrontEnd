import { createAction, handleActions } from 'redux-actions';

const ADAGUCMAPDRAW_UPDATEFEATURE = 'ADAGUCMAPDRAW_UPDATEFEATURE';
const ADAGUCMEASUREDISTANCE_UPDATE = 'ADAGUCMEASUREDISTANCE_UPDATE';
const SET_GEOJSON = 'SET_GEOJSON';
const ADAGUCMAPDRAW_EDIT_POINT = 'ADAGUCMAPDRAW_EDIT_POINT';
const ADAGUCMAPDRAW_EDIT_BOX = 'ADAGUCMAPDRAW_EDIT_BOX';
const ADAGUCMAPDRAW_EDIT_POLYGON = 'ADAGUCMAPDRAW_EDIT_POLYGON';
const ADAGUCMAPDRAW_SET_FEATURE_NR = 'ADAGUCMAPDRAW_SET_FEATURE_NR';

const updateFeature = createAction(ADAGUCMAPDRAW_UPDATEFEATURE);
const setGeoJSON = createAction(SET_GEOJSON);
const measureDistanceUpdate = createAction(ADAGUCMEASUREDISTANCE_UPDATE);
const setFeatureEditPoint = createAction(ADAGUCMAPDRAW_EDIT_POINT);
const setFeatureEditBox = createAction(ADAGUCMAPDRAW_EDIT_BOX);
const setFeatureEditPolygon = createAction(ADAGUCMAPDRAW_EDIT_POLYGON);
const setFeatureNr = createAction(ADAGUCMAPDRAW_SET_FEATURE_NR);

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
  measureDistanceUpdate,
  setFeatureEditPoint,
  setFeatureEditBox,
  setFeatureEditPolygon,
  setFeatureNr
};

export default handleActions({
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
