import TasksContainer from '../../../../containers/TasksContainer';
import SigmetsContainer from '../../../../containers/SigmetsContainer';
import MapActionsContainer from '../../../../containers/MapActionsContainer';
import MapPanel from '../../../../components/MapPanel';
import LayerManagerPanel from '../../../../components/LayerManagerPanel';
import TitleBarContainer from '../../../../containers/TitleBarContainer';
import { connect } from 'react-redux';
import { actions as mapActions } from '../../../../redux/modules/mapReducer';
import { actions as adagucActions } from '../../../../redux/modules/adagucReducer';
import { actions as layerActions } from '../../../../redux/modules/layerReducer';
import { actions as drawActions } from '../../../../redux/modules/drawReducer';
import { actions as userActions } from '../../../../redux/modules/userReducer';

const mapStateToHeaderProps = state => ({
  title: 'header',
  layout: state.mapProperties.layout,
  layers: state.layers,
  bbox: state.mapProperties.boundingBox.bbox,
  notifications: state.notifications,
  recentTriggers: state.recentTriggers,
  adagucProperties: state.adagucProperties,
  user: { ...state.userProperties }
});

const mapStateToSidebarProps = state => ({
  recentTriggers: state.recentTriggers
});

const mapStateToMapProps = state => ({
  drawProperties: { ...state.drawProperties },
  mapProperties: { ...state.mapProperties },
  adagucProperties: { ...state.adagucProperties },
  layers: { ...state.layers }
});

const mapStateToLayerManagerProps = state => ({
  adagucProperties: state.adagucProperties,
  layers: state.layers,
  mapProperties: state.mapProperties
});

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch,
    mapActions,
    adagucActions,
    layerActions,
    drawActions,
    userActions
  });
};

const mapStateToRightSideBarProps = state => ({
  adagucProperties: state.adagucProperties,
  mapProperties: state.mapProperties,
  layers: state.layers
});

// Sync route definition
export default () => ({
  title: 'SIGMETs',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToSidebarProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(SigmetsContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
