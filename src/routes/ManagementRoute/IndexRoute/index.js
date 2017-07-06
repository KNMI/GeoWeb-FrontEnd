import TitleBarContainer from '../../../containers/TitleBarContainer'
import SidebarContainer from '../../../containers/Management/SidebarContainer'
import ManagementPanel from '../../../components/Management/ManagementPanel'
import Empty from '../../../components/Empty'
import {connect} from 'react-redux'
import {actions as mapActions} from '../../../redux/modules/mapReducer'
import {actions as adagucActions} from '../../../redux/modules/adagucReducer'
import {actions as layerActions} from '../../../redux/modules/layerReducer'
import {actions as userActions} from '../../../redux/modules/userReducer'
import {actions as drawActions} from '../../../redux/modules/drawReducer'

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
  title: 'Management',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: ManagementPanel,
    map: Empty,
    layerManager: Empty,
    rightSideBar: Empty
  }
})
