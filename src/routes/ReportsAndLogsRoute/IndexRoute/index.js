import TasksContainer from '../../../containers/TasksContainer';
import Inspector from '../../../components/Inspector';
import Empty from '../../../components/Empty';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: false,
    layout: state.adagucProperties.layout,
    layers: state.adagucProperties.layers,
    bbox: state.adagucProperties.boundingBox.bbox,
    notifications: state.notifications,
    recentTriggers: state.recentTriggers
  };
};

const mapStateToLeftSideBarProps = () => {
  return { title: 'leftSideBar Reports & Logs' };
};

const mapStateToEmptyProps = () => {
  return {};
};

const mapStateToMainViewportProps = () => {
  return { title: 'main Reports & Logs' };
};

const mapStateToRightSideBarProps = () => {
  return { title: 'rightSideBar Reports & Logs' };
};

// Sync route definition
export default () => ({
  title: 'Reports & Logs',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
