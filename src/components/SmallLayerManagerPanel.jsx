import React, { Component } from 'react';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as MapAnimationControlsContainer } from '../containers/MapAnimationControlsContainer';
import { default as Panel } from './Panel';
import { Row, Col, Button } from 'reactstrap';
import { Icon } from 'react-fa';
import { hashHistory } from 'react-router';
import PropTypes from 'prop-types';

class SmallLayerManagerPanel extends Component {
  constructor (props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = { showControls: true };
  }

  toggle (evt) {
    this.setState({ showControls: !this.state.showControls });
    evt.preventDefault();
  }

  toggleFullscreen (evt) {
    if (document.mozCancelFullscreen) {
      document.mozCancelFullScreen();
    } else {
      document.webkitCancelFullScreen();
    }
    hashHistory.goBack();
  };

  render () {
    const { title, dispatch, actions, adagucProperties, layers,mapProperties } = this.props;
    return (
      <Panel title={title} style={{ background: '#EEF' }}>
        <Row style={{ flex: 1 }}>
          <LayerManager wmjslayers={layers.wmjsLayers} dispatch={dispatch} layerActions={this.props.layerActions} adagucActions={this.props.adagucActions} activeMapId={mapProperties.activeMapId} />
          <Col />
          <Col xs='auto' className='SmallLayerManagerPanel' style={{ flexDirection: 'column' }}>
            <Row style={{ flexDirection: 'row', paddingBottom: '0.33rem' }}>
              <Col />
              <Col />
              <Button onClick={this.toggle} color='primary' title={this.state.showControls ? 'Hide controls' : 'Show controls'}>
                <Icon name={this.state.showControls ? 'eye-slash' : 'eye'} />
              </Button>
              <Button onClick={this.toggleFullscreen} color='primary' title='Exit full screen mode'>
                <Icon name='compress' />
              </Button>
            </Row>
            <Row style={{ flex: 1 }} />
            <Row >
              {this.state.showControls ? <MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={dispatch} adagucActions={this.props.adagucActions} mapActions={this.props.mapActions} activeMapId={mapProperties.activeMapId} layerActions={this.props.layerActions} /> : ''}
            </Row>
          </Col>
        </Row>
      </Panel>
    );
  }
}

SmallLayerManagerPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object
};

export default SmallLayerManagerPanel;
