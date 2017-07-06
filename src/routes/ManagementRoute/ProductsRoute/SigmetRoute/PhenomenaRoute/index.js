import ProgtempManagementPanel from '../../../../../components/Management/ProgtempManagementPanel'
import TitleBarContainer from '../../../../../containers/TitleBarContainer'
import SidebarContainer from '../../../../../containers/Management/SidebarContainer'
import Empty from '../../../../../components/Empty'
import {connect} from 'react-redux'
// import actions from '../../../../../actions/adaguc';

const mapStateToMapProps = (state) => {
  return {adagucProperties: state.adagucProperties}
}
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
    recentTriggers: state.recentTriggers
  }
}

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch
    // actions: actions
  })
}

// Sync route definition
export default () => ({
  path: 'phenomena',
  title: 'Fenomenen',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: SidebarContainer,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(ProgtempManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
})
