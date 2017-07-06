import React, { Component } from 'react';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as TimeComponent } from './ADAGUC/TimeComponent';
import { default as Panel } from './Panel';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';

class LayerManagerPanel extends Component {
  render () {
    const { title, dispatch, actions, adagucProperties, layers, mapProperties } = this.props;
    return (
      <Panel title={title}>
        <Row style={{ flex: 1 }}>
          <TimeComponent timedim={adagucProperties.timeDimension} wmjslayers={layers.wmjsLayers} dispatch={dispatch} actions={this.props.adagucActions} />
          <LayerManager wmjslayers={layers.wmjsLayers} dispatch={dispatch} layerActions={this.props.layerActions} adagucActions={this.props.adagucActions} activeMapId={mapProperties.activeMapId} />
        </Row>
      </Panel>
    );
  }
}

LayerManagerPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object
};

export default LayerManagerPanel;
