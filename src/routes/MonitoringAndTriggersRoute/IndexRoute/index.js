import TasksContainer from '../../../containers/TasksContainer';
import Inspector from '../../../components/Inspector';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: false
  };
};

const mapStateToLeftSideBarProps = (state) => {
  return { title: 'leftSideBar Monitoring' };
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'main Monitoring' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar Monitoring' };
};

// Sync route definition
export default () => ({
  title: 'Monitoring & Triggers',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
