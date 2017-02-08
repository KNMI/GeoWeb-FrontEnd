export const CREATE_MAP = 'CREATE_MAP';
export const SET_DATA = 'SET_DATA';
export const SET_MAP_STYLE = 'SET_MAP_STYLE';
export const SET_CUT = 'SET_CUT';
export const TOGGLE_TURBO = 'TOGGLE_TURBO';

export function createMap () {
  return { type: CREATE_MAP };
}
export function setData (data) {
  return { type: SET_DATA, payload: data };
}
export function setMapStyle (style) {
  return { type: SET_MAP_STYLE, payload: style };
}
export function setCut (cut) {
  return { type: SET_CUT, payload: cut };
}
