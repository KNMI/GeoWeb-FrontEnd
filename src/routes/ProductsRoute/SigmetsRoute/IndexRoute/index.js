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
  return { title: 'leftSideBar SIGMETs' };
};

const mapStateToMainViewportProps = (state) => {
  return { title: 'main SIGMETs' };
};

const mapStateToRightSideBarProps = (state) => {
  return { title: 'rightSideBar SIGMETs' };
};

// Sync route definition
export default () => ({
  title: 'SIGMETs',
  components : {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
