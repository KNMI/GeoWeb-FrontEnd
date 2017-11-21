import { handleActions } from 'redux-actions';

const INITIAL_STATE = {
  urls: {
    'BACKEND_SERVER_URL': 'http://birdexp07.knmi.nl:8080',
    'WEBSERVER_URL': 'http://birdexp07.knmi.nl',
    'BACKEND_SERVER_XML2JSON': 'http://birdexp07.knmi.nl:8080/XML2JSON?'
  }

};

export default handleActions({}, INITIAL_STATE);
