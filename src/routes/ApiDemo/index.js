import TitleBar from '../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToMainViewportProps = (state) => {
  return { title: 'apiroute' };
};

// Sync route definition
export default () => ({
  path: 'apidemo',
  components : {
    mainViewport: connect(mapStateToMainViewportProps)(TitleBar)
  }
});

