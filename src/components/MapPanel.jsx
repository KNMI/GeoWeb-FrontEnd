import React, { Component, PropTypes } from 'react';
import { default as Adaguc } from '../routes/ADAGUC/components/Adaguc';
import { default as Panel } from './Panel';

class MapPanel extends Component {
  render () {
    const { title, adagucProperties, dispatch, actions } = this.props;
    return (
      <Panel title={title} className='mapPanel'>
        <Adaguc adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
      </Panel>
    );
  }
}

MapPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  adagucProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default MapPanel;
