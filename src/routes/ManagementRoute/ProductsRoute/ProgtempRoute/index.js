import ProgtempManagementPanel from '../../../../components/Management/ProgtempManagementPanel';
import TitleBarContainer from '../../../../containers/TitleBarContainer';
import Empty from '../../../../components/Empty';
import { connect } from 'react-redux';
import { actions as adagucActions } from '../../../../redux/modules/adagucReducer';
import { actions as userActions } from '../../../../redux/modules/userReducer';

const mapStateToMapProps = state => ({ adagucProperties: state.adagucProperties });
const mapStateToHeaderProps = state => ({
  title: 'header',
  user: { ...state.userProperties },
  layout: state.mapProperties.layout,
  layers: state.layers,
  projectionName: state.mapProperties.projectionName,
  bbox: state.mapProperties.boundingBox.bbox,
  notifications: state.notifications,
  recentTriggers: state.recentTriggers,
  adagucProperties: state.adagucProperties,
  userActions,
  adagucActions
});

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch
    // actions: actions
  });
};

// Sync route definition
export default () => ({
  path: 'progtemp',
  title: 'Progtemp Manager',
  components: {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: Empty,
    secondLeftSideBar: Empty,
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(ProgtempManagementPanel),
    layerManager: Empty,
    rightSideBar: Empty
  }
});
