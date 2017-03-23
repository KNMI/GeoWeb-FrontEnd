import MapPanel from '../../../components/MapPanel';
import Empty from '../../../components/Empty';
import SmallLayerManagerPanel from '../../../components/SmallLayerManagerPanel';
import { connect } from 'react-redux';
import { actions } from '../../ADAGUC/modules/adaguc';

const mapStateToMapProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapStateToLayerManagerProps = (state) => {
  return { adagucProperties: state.adagucProperties };
};

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    actions: actions
  });
};

const mapStateToEmptyProps = (state) => {
  return {};
};

// Sync route definition
export default () => ({
  title: 'Full screen',
  components : {
    header: connect(mapStateToEmptyProps)(Empty),
    leftSideBar: connect(mapStateToEmptyProps)(Empty),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(SmallLayerManagerPanel),
    rightSideBar: connect(mapStateToEmptyProps)(Empty)
  }
});
