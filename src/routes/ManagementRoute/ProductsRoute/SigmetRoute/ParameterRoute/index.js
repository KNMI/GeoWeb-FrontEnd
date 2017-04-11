import SigmetParameterManagementPanel from '../../../../../components/Management/SigmetParameterManagementPanel';
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
  path: 'parameters',
  title: 'Parameters',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(SigmetParameterManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
});
