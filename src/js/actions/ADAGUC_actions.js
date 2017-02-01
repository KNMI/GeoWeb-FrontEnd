export const CREATE_MAP = 'CREATE_MAP'
export const SET_DATA = 'SET_DATA'
export const SET_MAP_STYLE = 'SET_MAP_STYLE'
export const TOGGLE_TURBO = 'TOGGLE_TURBO'

export function create_map() {
	return {type: CREATE_MAP};
}
export function set_data(data) {
	return {type: SET_DATA, payload: data};
}
export function set_map_style(style) {
	return {type: SET_MAP_STYLE, payload: style};
}

export function toggle_turbo() {
	return {type: TOGGLE_TURBO};
}
