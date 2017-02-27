import { connect } from 'react-redux';
import TitleBar from '../../components/TitleBar';
import DataSelector from '../../components/DataSelector';
import Inspector from '../../components/Inspector';
import ADAGUC from '../ADAGUC/components/Adaguc';
import { actions } from '../ADAGUC/modules/adaguc';

const mapStateToLeftSideBarProps = function (store) {
  return {
    adagucProperties: store.adagucProperties,
    menuItems: store.menuItems
  };
};

const mapStateToMainViewportProps = function (store) {
  return {
    adagucProperties: store.adagucProperties
  };
};

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

const mapStateToRightSideBarProps = function (store) {
  return {
    title: store.rightSideBar.title
  };
};

export default (store) => {
  return {
    title: 'Start here',
    components: {
      header: TitleBar,
      leftSideBar: connect(mapStateToLeftSideBarProps, mapDispatchToMainViewportProps)(DataSelector),
      mainViewport: connect(mapStateToMainViewportProps, mapDispatchToMainViewportProps)(ADAGUC),
      rightSideBar: connect(mapStateToRightSideBarProps)(Inspector)
    }
  };
};
