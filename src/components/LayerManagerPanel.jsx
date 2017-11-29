import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as TimeComponent } from './ADAGUC/TimeComponent';
import { default as Panel } from './Panel';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';

var elementResizeEvent = require('element-resize-event');

class LayerManagerPanel extends PureComponent {
  constructor (props) {
    super(props);
    this.setResizeListener = this.setResizeListener.bind(this);
    this.state = {
      width: 0,
      height: 0,
      initialized: false
    };
  }

  setResizeListener (panel) {
    if (panel && !this.state.initialized) {
      elementResizeEvent(panel, () => {
        this.setState({ width: panel.clientWidth, height: panel.clientHeight });
      });
      this.setState({ initialized: true });
    }
  }
  shouldComponentUpdate (nextProps, nextState) {
    return this.state.width !== nextState.width ||
           this.state.height !== nextState.height ||
           this.props.adagucProperties.timeDimension !== nextProps.adagucProperties.timeDimension ||
           this.props.layers.wmjsLayers !== nextProps.layers.wmjsLayers;
  }

  render () {
    const { title, dispatch, adagucProperties, layers, mapProperties } = this.props;
    return (
      <Panel title={title}>
        <Row style={{ flex: 1 }}>
          <TimeComponent activeMapId={mapProperties.activeMapId} width={this.state.width} height={this.state.height} timedim={adagucProperties.timeDimension}
            wmjslayers={layers.wmjsLayers} dispatch={dispatch} adagucActions={this.props.adagucActions} ref={(panel) => this.setResizeListener(ReactDOM.findDOMNode(panel))} />
          <LayerManager wmjslayers={layers.wmjsLayers} dispatch={dispatch} layerActions={this.props.layerActions}
            adagucActions={this.props.adagucActions} activeMapId={mapProperties.activeMapId} />
        </Row>
      </Panel>
    );
  }
}

LayerManagerPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dispatch: PropTypes.func.isRequired,
  layers: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object,
  mapProperties: PropTypes.object,
  adagucActions: PropTypes.object,
  layerActions: PropTypes.object
};

export default LayerManagerPanel;
