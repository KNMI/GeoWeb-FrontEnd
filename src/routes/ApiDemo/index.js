import TitleBar from '../../components/TitleBar';
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

