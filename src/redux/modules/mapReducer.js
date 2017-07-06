import {createAction, handleActions} from 'redux-actions'
import {MAP_STYLES} from '../../constants/map_styles'

const INITIAL_STATE = {
  mapCreated: false,
  activeMapId: 0,
  layout: 'single',
  mapMode: 'pan',
  projectionName: 'EPSG:3857',
  boundingBox: {
    title: 'Netherlands',
    bbox: [
      314909.3659069278,
      6470493.345653814,
      859527.2396033217,
      7176664.533565958
    ]
  }
}
// Actions
const CREATE_MAP = 'CREATE_MAP'
const SET_CUT = 'SET_CUT'
const SET_MAP_STYLE = 'SET_MAP_STYLE'
const SET_MAP_MODE = 'SET_MAP_MODE'
const SET_LAYOUT = 'SET_LAYOUT'
const SET_ACTIVE_PANEL = 'SET_ACTIVE_PANEL'

const createMap = createAction(CREATE_MAP)
const setCut = createAction(SET_CUT)
const setMapStyle = createAction(SET_MAP_STYLE)
const setMapMode = createAction(SET_MAP_MODE)
const setLayout = createAction(SET_LAYOUT)
const setActivePanel = createAction(SET_ACTIVE_PANEL)

const getNumPanels = (name) => {
  let numPanels = 0
  if (/quad/.test(name)) {
    numPanels = 4
  } else if (/triple/.test(name)) {
    numPanels = 3
  } else if (/dual/.test(name)) {
    numPanels = 2
  } else {
    numPanels = 1
  }
  return numPanels
}

export const actions = {
  createMap,
  setCut,
  setMapStyle,
  setMapMode,
  setLayout,
  setActivePanel
}

export default handleActions({
  [CREATE_MAP]: (state) => {
    return {...state, mapCreated: true}
  },
  [SET_CUT]: (state, {payload}) => {
    return {...state, boundingBox: payload}
  },
  [SET_MAP_STYLE]: (state, {payload}) => {
    return {...state, mapType: MAP_STYLES[payload]}
  },
  [SET_MAP_MODE]: (state, {payload}) => {
    return {...state, mapMode: payload}
  },
  [SET_LAYOUT]: (state, {payload}) => {
    const numPanels = getNumPanels(payload)
    const layout = numPanels === 1 ? 'single' : payload
    const activeMapId = state.activeMapId < numPanels ? state.activeMapId : 0
    return {...state, layout, activeMapId}
  },
  [SET_ACTIVE_PANEL]: (state, {payload}) => {
    const numPanels = getNumPanels(state.layout)
    const activeMapId = payload < numPanels ? payload : 0
    return {...state, activeMapId}
  }
}, INITIAL_STATE)
