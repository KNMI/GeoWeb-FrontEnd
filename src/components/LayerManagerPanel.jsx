import React, { Component, PropTypes } from 'react';
import { default as LayerManager } from '../routes/ADAGUC/components/LayerManager';
import { default as TimeComponent } from '../routes/ADAGUC/components/TimeComponent';
import { default as Panel } from './Panel';
import { Row } from 'reactstrap';
class MapPanel extends Component {
  render () {
    const { title, dispatch, actions, adagucProperties } = this.props;
    console.log(adagucProperties);
    return (
      <Panel title={title} className='mapPanel'>
        <Row style={{ flex: 1 }}>
          <TimeComponent wmjslayers={adagucProperties.wmjslayers} dispatch={dispatch} actions={actions} />
          <LayerManager wmjslayers={adagucProperties.wmjslayers} dispatch={dispatch} actions={actions} />
        </Row>
      </Panel>
    );
  }
}

MapPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // adagucProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object
};

export default MapPanel;
