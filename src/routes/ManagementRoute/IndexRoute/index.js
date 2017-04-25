import TitleBarContainer from '../../../containers/TitleBarContainer';
import SidebarContainer from '../../../containers/Management/SidebarContainer';
import ManagementPanel from '../../../components/Management/ManagementPanel';
import Empty from '../../../components/Empty';
import { connect } from 'react-redux';
import actions from '../../../actions/adaguc';

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: state.adagucProperties.user.isLoggedIn,
    userName: state.adagucProperties.user.userName,
    roles: state.adagucProperties.user.roles,
    layout: state.adagucProperties.layout,
    layers: state.adagucProperties.layers,
    bbox: state.adagucProperties.boundingBox.bbox,
    notifications: state.notifications,
    recentTriggers: state.recentTriggers
  };
};

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

// Sync route definition
export default () => ({
  title: 'Management',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: ManagementPanel,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(Empty),
    layerManager: Empty,
    rightSideBar: Empty
  }
});
