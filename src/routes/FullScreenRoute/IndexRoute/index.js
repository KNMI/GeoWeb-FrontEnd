import MapPanel from '../../../components/MapPanel'
import Empty from '../../../components/Empty'
import SmallLayerManagerPanel from '../../../components/SmallLayerManagerPanel'
import {connect} from 'react-redux'
import {actions as mapActions} from '../../../redux/modules/mapReducer'
import {actions as adagucActions} from '../../../redux/modules/adagucReducer'
import {actions as layerActions} from '../../../redux/modules/layerReducer'
import {actions as drawActions} from '../../../redux/modules/drawReducer'

const mapStateToMapProps = (state) => {
  return {
    drawProperties: {...state.drawProperties},
    mapProperties: {...state.mapProperties},
    adagucProperties: {...state.adagucProperties},
    layers: {...state.layers}
  }
}

const mapStateToLayerManagerProps = (state) => {
  return {
    adagucProperties: state.adagucProperties,
    layers: state.layers,
    mapProperties: state.mapProperties
  }
}

const mapDispatchToMainViewportProps = function (dispatch) {
  return ({
    dispatch: dispatch,
    mapActions: mapActions,
    adagucActions: adagucActions,
    layerActions: layerActions,
    drawActions: drawActions
  })
}

const mapStateToEmptyProps = () => {
  return {}
}

// Sync route definition
export default () => ({
  title: 'Full screen',
  components: {
    header: connect(mapStateToEmptyProps)(Empty),
    leftSideBar: connect(mapStateToEmptyProps)(Empty),
    secondLeftSideBar: connect(mapStateToEmptyProps)(Empty),
    map: connect(mapStateToMapProps, mapDispatchToMainViewportProps)(MapPanel),
    layerManager: connect(mapStateToLayerManagerProps, mapDispatchToMainViewportProps)(SmallLayerManagerPanel),
    rightSideBar: connect(mapStateToEmptyProps)(Empty)
  }
})
