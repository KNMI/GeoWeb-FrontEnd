import React, { Component } from 'react';
import { default as Adaguc } from './ADAGUC/Adaguc';
import { default as Panel } from './Panel';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import ResizeAware from 'react-resize-aware';

export class SinglePanel extends Component {
  render () {
    const { title, mapProperties, dispatch, mapActions, mapId, drawProperties, layers, adagucProperties } = this.props;
    const { activeMapId } = mapProperties;
    return (<Panel mapActions={mapActions} title={title} mapMode={mapProperties.mapMode} mapId={mapId} dispatch={dispatch} className={mapId === activeMapId ? 'activePanel' : ''}>
      <ResizeAware style={{ position: 'relative' }}>
        <Adaguc drawActions={this.props.drawActions} layerActions={this.props.layerActions} mapProperties={mapProperties} adagucActions={this.props.adagucActions} adagucProperties={adagucProperties} layers={layers} drawProperties={drawProperties} mapId={mapId} dispatch={dispatch} mapActions={this.props.mapActions} active={mapId === activeMapId} />
      </ResizeAware>
    </Panel>);
  }
}
class MapPanel extends Component {
  render () {
    const { mapProperties } = this.props;
    switch (mapProperties.layout) {
      case 'dual':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} />
            </Col>
            <Col xs='6'>
              <SinglePanel mapId={1} {...this.props} />
            </Col>
          </Row>
        );
      case 'quaduneven':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} />
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={1} {...this.props} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={2} {...this.props} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={3} {...this.props} />
              </Row>
            </Col>
          </Row>
        );
      case 'tripleuneven':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} />
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={1} {...this.props} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={2} {...this.props} />
              </Row>
            </Col>
          </Row>
        );
      case 'quad':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={0} {...this.props} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={2} {...this.props} />
              </Row>
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={1} {...this.props} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={3} {...this.props} />
              </Row>
            </Col>
          </Row>
        );

      case 'quadcol':
        return (<Row style={{ flex: 1 }}>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} />
            </Col>
            <Col xs='6'>
              <SinglePanel mapId={1} {...this.props} />
            </Col>
          </Col>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel mapId={2} {...this.props} />
            </Col>
            <Col xs='6'>
              <SinglePanel mapId={3} {...this.props} />
            </Col>
          </Col>
        </Row>);
      case 'single':
      default:
        return (
          <SinglePanel mapId={0} {...this.props} />
        );
    }
  }
}
SinglePanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  mapProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  mapId: PropTypes.number.isRequired
};
MapPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  mapProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default MapPanel;
