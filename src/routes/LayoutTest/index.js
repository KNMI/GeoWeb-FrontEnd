import TasksContainer from '../../containers/TasksContainer';
import Inspector from '../../components/Inspector';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return { title: 'header' };
};

const mapStateToLeftSideBarProps = (state) => {
  return { title: 'leftSideBar' };
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'layouttest' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar' };
};

// Sync route definition
export default () => ({
  path: 'layouttest',
  components : {
    header: connect(mapStateToHeaderProps)(Inspector),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
