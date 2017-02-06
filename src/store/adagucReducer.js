import { CREATE_MAP, SET_MAP_STYLE, SET_DATA } from '../actions/ADAGUC_actions';
import { DATASETS } from '../constants/datasets';
import { MAP_STYLES } from '../constants/map_styles';
const defaultState = {
  singleLayout: true,
  adagucProperties: {
    layer: DATASETS[0],
    mapType: MAP_STYLES[1],
    boundingBox: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958],
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

    default:
      return state;
  }
};

export default adagucReducer;
