import React, { PureComponent } from 'react';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as TimeComponent } from './ADAGUC/TimeComponent';
import { default as Panel } from './Panel';
import { Row } from 'reactstrap';
import PropTypes from 'prop-types';
class LayerManagerPanel extends PureComponent {
  render () {
    const { title, dispatch, adagucProperties, layers, mapProperties } = this.props;
    return (
      <Panel title={title}>
        <Row style={{ flex: 1 }}>
          <TimeComponent timedim={adagucProperties.timeDimension} wmjslayers={layers.wmjsLayers} dispatch={dispatch} adagucActions={this.props.adagucActions} />
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
