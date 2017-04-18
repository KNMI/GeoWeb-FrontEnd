import TasksContainer from '../../../containers/TasksContainer';
import ProductsContainer from '../../../containers/ProductsContainer';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import MapActionsContainer from '../../../containers/MapActionsContainer';
import LayerManagerPanel from '../../../components/LayerManagerPanel';
import MapPanel from '../../../components/MapPanel';
import { actions } from '../../../actions/adaguc';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: false
  };
};

const mapStateToEmptyProps = (state) => {
  return {};
};

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapStateToLayerManagerProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapStateToRightSideBarProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

// Sync route definition
export default () => ({
  title: 'Products',
  components : {
    header: connect(mapStateToHeaderProps, mapDispatchToMainViewportProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToEmptyProps)(TasksContainer),
    secondLeftSideBar: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(ProductsContainer),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(LayerManagerPanel),
    rightSideBar: connect(mapStateToRightSideBarProps, mapDispatchToMainViewportProps)(MapActionsContainer)
  }
});
