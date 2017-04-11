import React, { Component, PropTypes } from 'react';
import { default as Adaguc } from '../routes/ADAGUC/components/Adaguc';
import { default as Panel } from './Panel';
import { Row, Col } from 'reactstrap';

export class SinglePanel extends Component {
  render () {
    const { title, adagucProperties, dispatch, actions, master, mapId } = this.props;
    const { activeMapId } = adagucProperties;
    return (<Panel title={title} mapMode={adagucProperties.mapMode} mapId={mapId} dispatch={dispatch} actions={actions} className={mapId === activeMapId ? 'activePanel' : ''}>
      <Adaguc adagucProperties={adagucProperties} mapId={mapId} dispatch={dispatch} actions={actions} master={master} active={mapId === activeMapId} />
    </Panel>);
  }
}
class MapPanel extends Component {
  render () {
    const { title, adagucProperties, dispatch, actions } = this.props;
    const spaceTitle = ' ';
    switch (adagucProperties.layout) {
      case 'dual':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={0} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
            </Col>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={1} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
          </Row>
        );
      case 'quaduneven':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={0} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel title={title || spaceTitle} mapId={1} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel title={title || spaceTitle} mapId={2} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel title={title || spaceTitle} mapId={3} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
              </Row>
            </Col>
          </Row>
        );
      case 'quadcol':
        return (<Row style={{ flex: 1 }}>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={0} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
            </Col>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={1} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
          </Col>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={2} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
            <Col xs='6'>
              <SinglePanel title={title || spaceTitle} mapId={3} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} />
            </Col>
          </Col>
        </Row>);
      case 'single':
      default:
        return (
          <SinglePanel title={title} mapId={0} adagucProperties={adagucProperties} dispatch={dispatch} actions={actions} master />
        );
    }
  }
}
SinglePanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  adagucProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  master: PropTypes.bool,
  mapId: PropTypes.number.isRequired
};
MapPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  adagucProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired
};

export default MapPanel;
