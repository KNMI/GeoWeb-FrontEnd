import { connect } from 'react-redux';
import TitleBar from '../../components/TitleBar';
import ADAGUC from '../ADAGUC/components/Adaguc';
import { actions } from '../ADAGUC/modules/adaguc';

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

export default (store) => {
  return {
    title: 'Geoweb',
    components: {
      header: connect(mapStateToMainViewportProps, mapDispatchToMainViewportProps)(TitleBar),
      leftSideBar: 'div',
      mainViewport: connect(mapStateToMainViewportProps, mapDispatchToMainViewportProps)(ADAGUC),
      rightSideBar: 'div'
    }
  };
};
