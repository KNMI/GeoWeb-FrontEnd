import { createAction, handleActions } from 'redux-actions';
import { MAP_STYLES } from '../../constants/map_styles';

const INITIAL_STATE = {
  mapCreated: false,
  activeMapId: 0,
  layout: 'single',
  mapMode: 'pan',
  projection: {
    code: 'EPSG:3857',
    name: 'Mercator'
  },
  boundingBox: {
    title: 'Netherlands',
    bbox: [
      314909.3659069278,
      6470493.345653814,
      859527.2396033217,
      7176664.533565958
    ]
  }
};
// const INITIAL_STATE1 = {
//   mapCreated: false,
//   activeMapId: 0,
//   layout: 'single',
//   mapMode: 'pan',
//   projectionName: 'EPSG:4326',
//   boundingBox: {
//     title: 'Netherlands',
//     bbox: [
//       -180,
//       -90,
//       180,
//       90
//     ]
//   }
// };
// const INITIAL_STATE2 = {
//   mapCreated: false,
//   activeMapId: 0,
//   layout: 'single',
//   mapMode: 'pan',
//   projectionName: 'EPSG:28992',
//   boundingBox: {
//     title: 'Netherlands',
//     bbox: [
//       -533300.398890045,
//       106728.523934,
//       798551.4130350449,
//       900797.90076
//     ]
//   }
// };
// Actions
const CREATE_MAP = 'CREATE_MAP';
const SET_CUT = 'SET_CUT';
const SET_PROJECTION = 'SET_PROJECTION';
const SET_MAP_STYLE = 'SET_MAP_STYLE';
const SET_MAP_MODE = 'SET_MAP_MODE';
const SET_LAYOUT = 'SET_LAYOUT';
const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL';

const createMap = createAction(CREATE_MAP);
const setCut = createAction(SET_CUT);
const setMapStyle = createAction(SET_MAP_STYLE);
const setMapMode = createAction(SET_MAP_MODE);
const setLayout = createAction(SET_LAYOUT);
const setActivePanel = createAction(SET_ACTIVE_PANEL);
const setProjection = createAction(SET_PROJECTION);

const getNumPanels = (name) => {
  let numPanels = 0;
  if (/quad/.test(name)) {
    numPanels = 4;
  } else if (/triple/.test(name)) {
    numPanels = 3;
  } else if (/dual/.test(name)) {
    numPanels = 2;
  } else {
    numPanels = 1;
  }
  return numPanels;
};

export const actions = {
  createMap,
  setCut,
  setMapStyle,
  setMapMode,
  setLayout,
  setActivePanel,
  setProjection
};

export default handleActions({
  [CREATE_MAP]: state => ({ ...state, mapCreated: true }),
  [SET_CUT]: (state, { payload }) => ({ ...state, boundingBox: { title: payload.title, bbox: payload.bbox }, projection: payload.projection }),
  [SET_MAP_STYLE]: (state, { payload }) => ({ ...state, mapType: MAP_STYLES[payload] }),
  [SET_MAP_MODE]: (state, { payload }) => ({ ...state, mapMode: payload }),
  [SET_PROJECTION]: (state, { payload }) => ({ ...state, projection: { name: payload.title, code: payload.code }, boundingBox: { title: 'Custom', bbox: payload.bbox } }),
  [SET_LAYOUT]: (state, { payload }) => {
    const numPanels = getNumPanels(payload);
    const layout = numPanels === 1 ? 'single' : payload;
    const activeMapId = state.activeMapId < numPanels ? state.activeMapId : 0;
    return { ...state, layout, activeMapId };
  },
  [SET_ACTIVE_PANEL]: (state, { payload }) => {
    const numPanels = getNumPanels(state.layout);
    const activeMapId = payload < numPanels ? payload : 0;
    return { ...state, activeMapId };
  }
}, INITIAL_STATE);
