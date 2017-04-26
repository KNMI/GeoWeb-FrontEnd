import TasksContainer from '../../../containers/TasksContainer';
import MapActionsContainer from '../../../containers/MapActionsContainer';
import MapPanel from '../../../components/MapPanel';
import LayerManagerPanel from '../../../components/LayerManagerPanel';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import Empty from '../../../components/Empty';
import { connect } from 'react-redux';
import actions from '../../../actions/adaguc';
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
    recentTriggers: state.recentTriggers,
    adagucProperties: state.adagucProperties
  };
};

const mapStateToSidebarProps = (state) => {
  return {
    recentTriggers: state.recentTriggers
  };
};

const mapStateToEmptyProps = () => {
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
  title: 'Layout Test',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToSidebarProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
