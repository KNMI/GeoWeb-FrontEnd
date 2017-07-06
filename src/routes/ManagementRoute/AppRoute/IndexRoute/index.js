import AppManagementPanel from '../../../../components/Management/AppManagementPanel'
import TitleBarContainer from '../../../../containers/TitleBarContainer'
import SidebarContainer from '../../../../containers/Management/SidebarContainer'
import Empty from '../../../../components/Empty'
import {connect} from 'react-redux'
import {actions as mapActions} from '../../../../redux/modules/mapReducer'
import {actions as adagucActions} from '../../../../redux/modules/adagucReducer'
import {actions as layerActions} from '../../../../redux/modules/layerReducer'
import {actions as drawActions} from '../../../../redux/modules/drawReducer'
import {actions as userActions} from '../../../../redux/modules/userReducer'

const mapStateToMapProps = (state) => {
  return {
    adagucProperties: state.adagucProperties,
    user: {...state.userProperties}
  }
}

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

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    mapActions: mapActions,
    adagucActions: adagucActions,
    layerActions: layerActions,
    drawActions: drawActions
  })
}

// Sync route definition
export default () => ({
  title: 'Application',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(AppManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
})
