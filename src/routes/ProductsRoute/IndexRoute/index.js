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
  return { title: 'leftSideBar Products' };
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'main Products' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar Products' };
};

// Sync route definition
export default () => ({
  title: 'Products',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
