import TasksContainer from '../../containers/TasksContainer'
import MapActionsContainer from '../../containers/MapActionsContainer'
import MapPanel from '../../components/MapPanel'
import LayerManagerPanel from '../../components/LayerManagerPanel'
import TitleBarContainer from '../../containers/TitleBarContainer'
import Empty from '../../components/Empty'
import {actions as mapActions} from '../../redux/modules/mapReducer'
import {actions as adagucActions} from '../../redux/modules/adagucReducer'
import {actions as layerActions} from '../../redux/modules/layerReducer'
import {actions as userActions} from '../../redux/modules/userReducer'
import {actions as drawActions} from '../../redux/modules/drawReducer'
import {connect} from 'react-redux'
// import actions from '../../actions/adaguc';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    user: {...state.userProperties},
    layout: state.mapProperties.layout,
    layers: state.layers,
    projectionName: state.mapProperties.projectionName,
    bbox: state.mapProperties.boundingBox.bbox,
    notifications: state.notifications,
    recentTriggers: state.recentTriggers,
    adagucProperties: state.adagucProperties,
    userActions: userActions,
    adagucActions: adagucActions
  }
}

const mapStateToEmptyProps = () => {
  return {}
}

const mapStateToSidebarProps = (state) => {
  return {
    recentTriggers: state.recentTriggers,
    adagucProperties: state.adagucProperties
  }
}

const mapStateToMapProps = (state) => {
  return {
    drawProperties: {...state.drawProperties},
    mapProperties: {...state.mapProperties},
    adagucProperties: {...state.adagucProperties},
    layers: {...state.layers}
  }
}

const mapStateToLayerManagerProps = (state) => {
  return {
    adagucProperties: state.adagucProperties,
    layers: state.layers,
    mapProperties: state.mapProperties
  }
}
const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    mapActions: mapActions,
    adagucActions: adagucActions,
    layerActions: layerActions,
    drawActions: drawActions
  })
}

const mapStateToRightSideBarProps = (state) => {
  return {
    adagucProperties: state.adagucProperties,
    mapProperties: state.mapProperties,
    layers: state.layers,
    user: state.userProperties
  }
}

// Sync route definition
export default () => ({
  title: 'GeoWeb',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToSidebarProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
})
