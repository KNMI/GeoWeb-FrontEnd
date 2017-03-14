import TasksContainer from '../../../containers/TasksContainer';
import Panel from '../../../components/Panel';
import MapPanel from '../../../components/MapPanel';
import LayerManagerPanel from '../../../components/LayerManagerPanel';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';
import { actions } from '../../ADAGUC/modules/adaguc';
const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: true,
    userName: 'Wim'
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
  return {
    title: 'rightSideBar'
  };
};

// Sync route definition
export default () => ({
  title: 'Layout Test',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(TasksContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps)(Panel)
  }
});
