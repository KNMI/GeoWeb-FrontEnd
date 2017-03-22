import TasksContainer from '../../../../containers/TasksContainer';
import Inspector from '../../../../components/Inspector';
import TitleBarContainer from '../../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: false
  };
};

const mapStateToLeftSideBarProps = (state) => {
  return { title: 'leftSideBar Create SIGMET' };
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'main Create SIGMET' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar Create SIGMET' };
};

// Sync route definition
export default () => ({
  path: 'create_sigmet',
  title: 'Create SIGMET',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
