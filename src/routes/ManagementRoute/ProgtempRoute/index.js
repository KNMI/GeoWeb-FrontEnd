import ProgtempManagementPanel from '../../../components/Management/ProgtempManagementPanel';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import Empty from '../../../components/Empty';
import { connect } from 'react-redux';
import { actions } from '../../ADAGUC/modules/adaguc';

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
  path: 'product/progtemp',
  title: 'Progtemp Manager',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: Empty,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(ProgtempManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
});
