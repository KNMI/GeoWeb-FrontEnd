import TasksContainer from '../../../containers/TasksContainer';
import Inspector from '../../../components/Inspector';
import Empty from '../../../components/Empty';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: false,
    notifications: state.notifications,
    discardedNotifications: state.discardedNotifications
  };
};

const mapStateToLeftSideBarProps = () => {
  return { title: 'leftSideBar Checklist' };
};

const mapStateToEmptyProps = () => {
  return {};
};

const mapStateToMainViewportProps = () => {
  return { title: 'main Checklist' };
};

const mapStateToRightSideBarProps = () => {
  return { title: 'rightSideBar Checklist' };
};

// Sync route definition
export default () => ({
  title: 'Checklist shift',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
