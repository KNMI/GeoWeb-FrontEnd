import { createAction, handleActions } from 'redux-actions';

const ADAGUCMAPDRAW_UPDATEFEATURE = 'ADAGUCMAPDRAW_UPDATEFEATURE';
const ADAGUCMEASUREDISTANCE_UPDATE = 'ADAGUCMEASUREDISTANCE_UPDATE';
const SET_GEOJSON = 'SET_GEOJSON';

const updateFeature = createAction(ADAGUCMAPDRAW_UPDATEFEATURE);
const setGeoJSON = createAction(SET_GEOJSON);
const measureDistanceUpdate = createAction(ADAGUCMEASUREDISTANCE_UPDATE);

const INITIAL_STATE = {
  geojson: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: []
        },
        properties: {
          'stroke': '#a734d7',
          'stroke-width': 5,
          'stroke-opacity': 1,
          'fill': '#33cc00',
          'fill-opacity': 0.5
        }
      },
      { type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: []
        },
        properties: {
          'stroke': '#000000',
          'stroke-width': 2,
          'stroke-opacity': 1,
          'fill': '#FF8888',
          'fill-opacity': 1.0
        }
      }
    ]
  },
  drawMode: 'POLYGON',
  measureDistance: {
    isInEditMode: false
  }
};

export const actions = {
  updateFeature,
  setGeoJSON,
  measureDistanceUpdate
};

export default handleActions({

  [ADAGUCMAPDRAW_UPDATEFEATURE]: (state, { payload }) => ({ ...state, geojson: payload, measureDistance: { ...state.measureDistance, isInEditMode: false } }),

  [ADAGUCMEASUREDISTANCE_UPDATE]: (state, { payload }) => ({ ...state, measureDistance: { distance: payload.distance, bearing: payload.bearing } }),

  [SET_GEOJSON]: (state, { payload }) => ({ ...state, geojson: payload })
}, INITIAL_STATE);
