import TasksContainer from '../../../containers/TasksContainer';
import Inspector from '../../../components/Inspector';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = (state) => {
  return {
    title: 'header',
    isLoggedIn: true,
    userName: 'Wim'
  };
};

const mapStateToLeftSideBarProps = (state) => {
  return { title: 'leftSideBar' };
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'mainViewport' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar' };
};

// Sync route definition
export default () => ({
  title: 'Layout Test',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(TasksContainer),
    mainViewport: connect(mapStateToMainViewportProps)(Inspector),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
