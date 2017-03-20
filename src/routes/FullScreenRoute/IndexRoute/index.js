import MapPanel from '../../../components/MapPanel';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';
import { actions } from '../../ADAGUC/modules/adaguc';
const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: state.adagucProperties.user.isLoggedIn,
    userName: state.adagucProperties.user.userName
  };
};

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

// Sync route definition
export default () => ({
  title: 'Full screen',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: 'div',
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: 'div',
    rightSideBar: 'div'
  }
});
