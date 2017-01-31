const default_state = {
  adaguc_properties: {
    layer: "Harmonie",
    map_type: "mwsmap",
    bounding_box: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958],
    projection_name: "EPSG:3857",
    map_created: false
  },
}

const adaguc = (state = default_state, action) => {
  switch (action.type) {
    case 'LAYER_CHANGE':
      const new_adaguc_state_layer = Object.assign({}, state.adaguc_properties, {layer: state.adaguc_properties.layer === 'Harmonie' ? 'Radar' : 'Harmonie'});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_layer});
    case 'MAP_CHANGE':
      const new_adaguc_state_map = Object.assign({}, state.adaguc_properties, {map_type: state.adaguc_properties.map_type === 'mwsmap' ? 'streetmap' : 'mwsmap'});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_map});
    case 'MAP_CREATED':
      const new_adaguc_state_create = Object.assign({}, state.adaguc_properties, {map_created: true});
      return Object.assign({}, state, {adaguc_properties: new_adaguc_state_create});
    default:
      return state
  }
}

export default adaguc
