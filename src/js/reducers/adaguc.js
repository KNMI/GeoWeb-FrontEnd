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
    case 'CHANGE_DATASET':
      return [
        ...state,
        message: "hi"
      ]
    case 'CHANGE_MAP':
    return [
      ...state,
      message: "bye"
    ]
    case 'MAP_CREATED':
    console.log('received event')
      console.log('state:',state)
      const new_adaguc_state = Object.assign({}, state.adaguc_properties, {map_created: true});
      const new_state = Object.assign({}, state, {adaguc_properties: new_adaguc_state});
      console.log('new_state:',new_state)
      return new_state;
    default:
      return state
  }
}

export default adaguc
