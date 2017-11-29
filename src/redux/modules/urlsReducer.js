import { handleActions } from 'redux-actions';

const INITIAL_STATE = {
  urls: {
    'BACKEND_SERVER_URL': 'http://localhost:8080',
    'WEBSERVER_URL': 'http://localhost',
    'BACKEND_SERVER_XML2JSON': 'http://localhost:8080/XML2JSON?'
  }

};

export default handleActions({}, INITIAL_STATE);
