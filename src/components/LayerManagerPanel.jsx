import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as TimeComponent } from './ADAGUC/TimeComponent';
import { default as Panel } from './Panel';
import { Row } from 'reactstrap';
var elementResizeEvent = require('element-resize-event');

import PropTypes from 'prop-types';
class LayerManagerPanel extends PureComponent {
  constructor (props) {
    super(props);
    this.setResizeListener = this.setResizeListener.bind(this);
  }

  setResizeListener (panel) {
    if (panel && !this.initialized) {
      this.initialized = true;
      elementResizeEvent(panel, () => {
        this.width = panel.clientWidth;
      });
    }
  }

  render () {
    const { title, dispatch, adagucProperties, layers, mapProperties } = this.props;
    return (
      // Discouraged but necessary because we need the underlying dom element to listen to width changes
      <Panel title={title} ref={(panel) => this.setResizeListener(ReactDOM.findDOMNode(panel))}>
        <Row style={{ flex: 1 }}>
          <TimeComponent activeMapId={mapProperties.activeMapId} width={this.width} timedim={adagucProperties.timeDimension} wmjslayers={layers.wmjsLayers} dispatch={dispatch} adagucActions={this.props.adagucActions} />
          <LayerManager wmjslayers={layers.wmjsLayers} dispatch={dispatch} layerActions={this.props.layerActions} adagucActions={this.props.adagucActions} activeMapId={mapProperties.activeMapId} />
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
