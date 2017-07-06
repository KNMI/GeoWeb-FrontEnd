import TasksContainer from '../../../containers/TasksContainer'
import ProductsContainer from '../../../containers/ProductsContainer'
import TitleBarContainer from '../../../containers/TitleBarContainer'
import MapActionsContainer from '../../../containers/MapActionsContainer'
import LayerManagerPanel from '../../../components/LayerManagerPanel'
import MapPanel from '../../../components/MapPanel'
import {connect} from 'react-redux'
import {actions as mapActions} from '../../../redux/modules/mapReducer'
import {actions as adagucActions} from '../../../redux/modules/adagucReducer'
import {actions as layerActions} from '../../../redux/modules/layerReducer'
import {actions as drawActions} from '../../../redux/modules/drawReducer'
import {actions as userActions} from '../../../redux/modules/userReducer'
const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    layout: state.mapProperties.layout,
    layers: state.layers,
    bbox: state.mapProperties.boundingBox.bbox,
    notifications: state.notifications,
    recentTriggers: state.recentTriggers,
    adagucProperties: state.adagucProperties,
    user: {...state.userProperties}
  }
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

const mapStateToRightSideBarProps = (state) => {
  return {
    adagucProperties: state.adagucProperties,
    mapProperties: state.mapProperties,
    layers: state.layers
  }
}

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    mapActions: mapActions,
    adagucActions: adagucActions,
    layerActions: layerActions,
    drawActions: drawActions,
    userActions: userActions
  })
}

// Sync route definition
export default () => ({
  title: 'Products',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToSidebarProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(ProductsContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
})
