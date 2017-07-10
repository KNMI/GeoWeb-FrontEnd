import { createAction, handleActions } from 'redux-actions';

const LOGIN = 'LOGIN';
const LOGOUT = 'LOGOUT';

const INITIAL_STATE = {
  isLoggedIn: false,
  username: '',
  roles: []
};

const login = createAction(LOGIN);
const logout = createAction(LOGOUT);

export const actions = {
  login,
  logout
};

export default handleActions({
  [LOGIN]: (state, { payload }) => ({ ...state, isLoggedIn: true, username: payload.username, roles: payload.roles ? payload.roles : [] }),
  [LOGOUT]: (state, { payload }) => ({ ...state, isLoggedIn: false, username: '', roles: [] })
}, INITIAL_STATE);
