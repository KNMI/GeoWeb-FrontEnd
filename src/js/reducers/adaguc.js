import {CREATE_MAP, TOGGLE_MAPSTYLE, TOGGLE_DATA} from "../actions/ADAGUC_actions"
import {HARMONIE, RADAR} from "../constants/datasets"
import {OSM_STYLE, MWS_STYLE} from "../constants/map_styles"
const default_state = {
  adaguc_properties: {
    layer: HARMONIE,
    map_type: OSM_STYLE,
    bounding_box: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958],
    projection_name: "EPSG:3857",
    map_created: false
  },
}

const adaguc = (state = default_state, action) => {
  switch (action.type) {
    case TOGGLE_DATA:
      const new_adaguc_state_layer = Object.assign({}, state.adaguc_properties, {layer: state.adaguc_properties.layer === HARMONIE ? RADAR : HARMONIE});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_layer});
    case TOGGLE_MAPSTYLE:
      const new_adaguc_state_map = Object.assign({}, state.adaguc_properties, {map_type: state.adaguc_properties.map_type === OSM_STYLE ? MWS_STYLE : OSM_STYLE});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_map});
    case CREATE_MAP:
      const new_adaguc_state_create = Object.assign({}, state.adaguc_properties, {map_created: true});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_create});
    default:
      return state
  }
}

export default adaguc
