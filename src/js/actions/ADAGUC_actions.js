export const CREATE_MAP = 'CREATE_MAP'
export const TOGGLE_DATA = 'TOGGLE_DATA'
export const TOGGLE_MAPSTYLE = 'TOGGLE_MAPSTYLE'

export function create_map() {
	return {type: CREATE_MAP}
}
export function toggle_data() {
	return {type: TOGGLE_DATA}
}
export function toggle_mapstyle() {
	return {type: TOGGLE_MAPSTYLE}
}
