import TasksContainer from '../../../../containers/TasksContainer';
import SigmetsContainer from '../../../../containers/SigmetsContainer';
import MapActionsContainer from '../../../../containers/MapActionsContainer';
import MapPanel from '../../../../components/MapPanel';
import LayerManagerPanel from '../../../../components/LayerManagerPanel';
import TitleBarContainer from '../../../../containers/TitleBarContainer';
import { connect } from 'react-redux';
import { actions } from '../../../../actions/adaguc';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: state.adagucProperties.user.isLoggedIn,
    userName: state.adagucProperties.user.userName,
    roles: state.adagucProperties.user.roles
  };
};

const mapStateToEmptyProps = (state) => {
  return {};
};

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapStateToLayerManagerProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

const mapStateToRightSideBarProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

// Sync route definition
export default () => ({
  title: 'SIGMETs',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToEmptyProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(SigmetsContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
