import TasksContainer from '../../../../containers/TasksContainer';
import SigmetsContainer from '../../../../containers/SigmetsContainer';
import MapActionsContainer from '../../../../containers/MapActionsContainer';
import MapPanel from '../../../../components/MapPanel';
import LayerManagerPanel from '../../../../components/LayerManagerPanel';
import TitleBarContainer from '../../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = state => ({
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
});

const mapStateToEmptyProps = () => ({});

const mapStateToSidebarProps = state => ({
  recentTriggers: state.recentTriggers
});
const mapStateToMapProps = state => ({ adagucProperties: state.adagucProperties });

const mapStateToLayerManagerProps = state => ({ adagucProperties: state.adagucProperties });

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch
  });
};

const mapStateToRightSideBarProps = state => ({ adagucProperties: state.adagucProperties });

// Sync route definition
export default () => ({
  path: 'create_sigmet',
  title: 'Create SIGMET',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToSidebarProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToEmptyProps)(SigmetsContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
