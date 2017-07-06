import ProductsManagementPanel from '../../../../components/Management/ProductsManagementPanel'
import TitleBarContainer from '../../../../containers/TitleBarContainer'
import SidebarContainer from '../../../../containers/Management/SidebarContainer'
import Empty from '../../../../components/Empty'
import {connect} from 'react-redux'
import {actions as adagucActions} from '../../../../redux/modules/adagucReducer'
import {actions as userActions} from '../../../../redux/modules/userReducer'

const mapStateToMapProps = (state) => {
  return {adagucProperties: state.adagucProperties}
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
    dispatch: dispatch
  })
}

// Sync route definition
export default () => ({
  title: 'Products',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(ProductsManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
})
