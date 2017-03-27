import TasksContainer from '../../../containers/TasksContainer';
import Inspector from '../../../components/Inspector';
import Empty from '../../../components/Empty';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: false
  };
};

const mapStateToLeftSideBarProps = (state) => {
  return { title: 'leftSideBar Checklist' };
};

const mapStateToEmptyProps = (state) => {
  return {};
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'main Checklist' };
};

const mapStateToRightSideBarProps = (state) => {
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
