import SigmetManagementPanel from '../../../../../components/Management/SigmetManagementPanel';
import TitleBarContainer from '../../../../../containers/TitleBarContainer';
import SidebarContainer from '../../../../../containers/Management/SidebarContainer';
import Empty from '../../../../../components/Empty';
import { connect } from 'react-redux';
import { actions } from '../../../../ADAGUC/modules/adaguc';

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};
const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: state.adagucProperties.user.isLoggedIn,
    userName: state.adagucProperties.user.userName,
    roles: state.adagucProperties.user.roles
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
  title: 'SIGMET Manager',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(SigmetManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
});
