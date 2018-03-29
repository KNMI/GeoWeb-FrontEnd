import { handleActions } from 'redux-actions';

const INITIAL_STATE = {
  urls: {
    'BACKEND_SERVER_URL': 'NOT SET - import me using this.props.urls',
    'BACKEND_SERVER_XML2JSON': 'NOT SET - import me using this.props.urls'
  }
};

export default handleActions({}, INITIAL_STATE);
