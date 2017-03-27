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
  return { title: 'leftSideBar SIGMET' };
};

const mapStateToEmptyProps = (state) => {
  return {};
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'createSigmet SIGMET' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar SIGMET' };
};

// Sync route definition
export default () => ({
  path: 'create_sigmet',
  title: 'Create SIGMET',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
