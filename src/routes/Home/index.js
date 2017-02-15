import { connect } from 'react-redux';
import TitleBar from '../../components/TitleBar';
import DataSelector from '../../components/DataSelector';
import Inspector from '../../components/Inspector';
// import GeoWeb from '../../containers/GeoWeb';

const mapStateToHeaderProps = function (store) {
  return {
    title: store.header.title
  };
};

const mapStateToLeftSideBarProps = function (store) {
  return {
    title: store.leftSideBar.title
  };
};

const mapStateToMainViewportProps = function (store) {
  return {
    title: store.mainViewport.title
  };
};

const mapStateToRightSideBarProps = function (store) {
  return {
    title: store.rightSideBar.title
  };
};

export default (store) => ({
  title: 'Start here',
  components: {
    header: connect(mapStateToHeaderProps)(TitleBar),
    leftSideBar: connect(mapStateToLeftSideBarProps)(DataSelector),
    mainViewport: connect(mapStateToMainViewportProps)(TitleBar),
    rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
  }
});
