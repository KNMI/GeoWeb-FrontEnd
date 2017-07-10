import TasksContainer from '../../../containers/TasksContainer';
import TriggersContainer from '../../../containers/TriggersContainer';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import MapActionsContainer from '../../../containers/MapActionsContainer';
import LayerManagerPanel from '../../../components/LayerManagerPanel';
import MapPanel from '../../../components/MapPanel';
import { connect } from 'react-redux';

const mapStateToHeaderProps = state => ({
  title: 'header',
  layout: state.adagucProperties.layout,
  layers: state.adagucProperties.layers,
  bbox: state.adagucProperties.boundingBox.bbox,
  notifications: state.notifications,
  recentTriggers: state.recentTriggers,
  adagucProperties: state.adagucProperties,
  isLoggedIn: state.adagucProperties.user.isLoggedIn,
  userName: state.adagucProperties.user.userName,
  roles: state.adagucProperties.user.roles
});

const mapStateToSidebarProps = state => ({
  adagucProperties: state.adagucProperties,
  recentTriggers: state.recentTriggers
});

const mapStateToMapProps = state => ({
  adagucProperties: state.adagucProperties,
  recentTriggers: state.recentTriggers
});

const mapStateToLayerManagerProps = state => ({ adagucProperties: state.adagucProperties });

const mapStateToRightSideBarProps = state => ({ adagucProperties: state.adagucProperties });

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch
  });
};

// Sync route definition
export default () => ({
  title: 'Monitoring & Triggers',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToSidebarProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(TriggersContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
