import { CREATE_MAP, SET_MAP_STYLE, SET_DATA, SET_CUT } from '../actions/ADAGUC_actions';
import { DATASETS } from '../constants/datasets';
import { MAP_STYLES } from '../constants/map_styles';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
const defaultState = {
  singleLayout: true,
  adagucProperties: {
    layer: DATASETS[0],
    mapType: MAP_STYLES[1],
    boundingBox: BOUNDING_BOXES[0],
    projectionName: 'EPSG:3857',
    mapCreated: false
  }
};

const adagucReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_DATA:
      const newData = DATASETS[action.payload - 1];
      if (newData === state.adagucProperties.layer) {
        return state;
      }

      const newAdagucStateLayer = Object.assign({}, state.adagucProperties, { layer: newData });
      return Object.assign({}, state, { adagucProperties: newAdagucStateLayer });
    case SET_MAP_STYLE:
      const newStyle = MAP_STYLES[action.payload - 1];
      if (newStyle === state.adagucProperties.mapType) {
        return state;
      }
      const newAdagucStateMap = Object.assign({}, state.adagucProperties, { mapType: newStyle });
      return Object.assign({}, state, { adagucProperties: newAdagucStateMap });
    case CREATE_MAP:
      const newAdagucCreateMap = Object.assign({}, state.adagucProperties, { mapCreated: true });
      return Object.assign({}, state, { adagucProperties: newAdagucCreateMap });
    case SET_CUT:
      const newAdagucBoundingBox = Object.assign({}, state.adagucProperties, { boundingBox: BOUNDING_BOXES[action.payload - 1] });
      return Object.assign({}, state, { adagucProperties: newAdagucBoundingBox });

    default:
      return state;
  }
};

export default adagucReducer;
