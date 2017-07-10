import TasksContainer from '../../../containers/TasksContainer';
import Inspector from '../../../components/Inspector';
import Empty from '../../../components/Empty';
import TitleBarContainer from '../../../containers/TitleBarContainer';
import { connect } from 'react-redux';

const mapStateToHeaderProps = state => ({
  title: 'header',
  layout: state.adagucProperties.layout,
  layers: state.adagucProperties.layers,
  bbox: state.adagucProperties.boundingBox.bbox,
  notifications: state.notifications,
  recentTriggers: state.recentTriggers,
  adagucProperties: state.adagucProperties,
  isLoggedIn: state.adagucProperties.user.isLoggedIn,
  userName: state.adagucProperties.user.userName,
  roles: state.adagucProperties.user.roles
});

const mapStateToLeftSideBarProps = () => ({ title: 'leftSideBar Reports & Logs' });

const mapStateToEmptyProps = () => ({});

const mapStateToMainViewportProps = () => ({ title: 'main Reports & Logs' });

const mapStateToRightSideBarProps = () => ({ title: 'rightSideBar Reports & Logs' });

// Sync route definition
export default () => ({
  title: 'Reports & Logs',
  components: {
    header: connect(mapStateToHeaderProps)(TitleBarContainer),
    leftSideBar: connect(mapStateToLeftSideBarProps)(Inspector),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    mainViewport: connect(mapStateToMainViewportProps)(TasksContainer),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
