import TasksContainer from '../../../containers/TasksContainer';
import MapActionsContainer from '../../../containers/MapActionsContainer';
import MapPanel from '../../../components/MapPanel';
import LayerManagerPanel from '../../../components/LayerManagerPanel';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';
import { actions } from '../../ADAGUC/modules/adaguc';
const mapStateToHeaderProps = (state) => {
  console.log(state);
  return {
    title: 'header',
    isLoggedIn: state.adagucProperties.user.isLoggedIn,
    userName: state.adagucProperties.user.userName
  };
};

const mapStateToLeftSideBarProps = (state) => {
  return { };
};

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapStateToLayerManagerProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};
const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

const mapStateToRightSideBarProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

// Sync route definition
export default () => ({
  title: 'Layout Test',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(TasksContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
