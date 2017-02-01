import {CREATE_MAP, SET_MAP_STYLE, SET_DATA, TOGGLE_TURBO} from "../actions/ADAGUC_actions";
import {DATASETS} from "../constants/datasets";
import {MAP_STYLES} from "../constants/map_styles";
const default_state = {
  single_layout: true,
  adaguc_properties: {
    layer: DATASETS[0],
    map_type: MAP_STYLES[1],
    bounding_box: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958],
    projection_name: "EPSG:3857",
    map_created: false
  },
};

const adaguc = (state = default_state, action) => {
  switch (action.type) {
    case SET_DATA:
      const new_data = DATASETS[action.payload - 1];
      if(new_data === state.adaguc_properties.layer)
        return state;

      const new_adaguc_state_layer = Object.assign({}, state.adaguc_properties, {layer: new_data});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_layer});
    case SET_MAP_STYLE:
      const new_style = MAP_STYLES[action.payload - 1];
      if(new_style === state.adaguc_properties.map_type)
        return state;
      const new_adaguc_state_map = Object.assign({}, state.adaguc_properties, {map_type: new_style});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_map});
    case CREATE_MAP:
      const new_adaguc_state_create = Object.assign({}, state.adaguc_properties, {map_created: true});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_create});
    case TOGGLE_TURBO:
      const new_adaguc_state_turbo = Object.assign({}, state.adaguc_properties, {map_created: false});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_turbo}, {single_layout: !state.single_layout});

    default:
      return state;
  }
};

export default adaguc;
