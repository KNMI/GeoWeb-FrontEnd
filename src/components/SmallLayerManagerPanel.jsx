import React, { Component, PropTypes } from 'react';
import { default as LayerManager } from '../routes/ADAGUC/components/LayerManager';
import { default as MapAnimationControlsContainer } from '../containers/MapAnimationControlsContainer';
import { default as Panel } from './Panel';
import { Row, Col, Button } from 'reactstrap';
import { Icon } from 'react-fa';
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

  render () {
    const { title, dispatch, actions, adagucProperties } = this.props;
    return (
      <Panel title={title} style={{ background: '#EEF' }}>
        <Row style={{ flex: 1 }}>
          <LayerManager wmjslayers={adagucProperties.wmjslayers} dispatch={dispatch} actions={actions} />
          <Col />
          <Col xs='auto' style={{ flexDirection: 'column' }}>
            <Row style={{ flexDirection: 'row-reverse', paddingBottom: '0.33rem' }}>
              <Button onClick={this.toggle} color='primary' title={this.state.showControls ? 'Hide controls' : 'Show controls'}>
                <Icon name={this.state.showControls ? 'eye-slash' : 'eye'} />
              </Button>
            </Row>
            <Row style={{ flex: 1 }} />
            <Row >
              {this.state.showControls ? <MapAnimationControlsContainer adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} /> : ''}
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
