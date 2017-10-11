import React, { Component } from 'react';
import Adaguc from './ADAGUC/Adaguc';
import Panel from './Panel';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import ProgtempComponent from './ProgtempComponent';
import { MODEL_LEVEL_URL } from '../constants/default_services';
import axios from 'axios';
import moment from 'moment';
export class SinglePanel extends Component {
  constructor () {
    super();
    this.state = {
      model: 'HARMONIE'
    };
  }
  componentWillMount () {
    let refUrl;
    switch (this.state.model.toUpperCase()) {
      default:
        refUrl = `${MODEL_LEVEL_URL}SERVICE=WMS&VERSION=1.3.0&REQUEST=GetReferenceTimes&LAYERS=air_pressure__at_ml`;
        break;
    }
    return axios.get(refUrl).then((r) => this.setState({ referenceTime: moment.utc(r.data[0]) }));
  }

  render () {
    const { title, mapProperties, dispatch, mapActions, mapId, drawProperties, layers, adagucProperties } = this.props;
    const { activeMapId } = mapProperties;
    if (mapId % 2 === 0) {
      return (<Panel mapActions={mapActions} title={title} mapMode={mapProperties.mapMode} mapId={mapId} dispatch={dispatch} className={mapId === activeMapId ? 'activePanel' : ''}>
        <Adaguc drawActions={this.props.drawActions} layerActions={this.props.layerActions} mapProperties={mapProperties}
          adagucActions={this.props.adagucActions} adagucProperties={adagucProperties} layers={layers} drawProperties={drawProperties}
          mapId={mapId} dispatch={dispatch} mapActions={this.props.mapActions} active={mapId === activeMapId} />
      </Panel>);
    } else {
      const { cursor } = this.props.adagucProperties;
      const adaStart = moment.utc(this.props.adagucProperties.timeDimension).startOf('hour');
      if (this.state.referenceTime && this.state.model && cursor) {
        return <Panel>
          <ProgtempComponent location={cursor ? cursor.location : null} referenceTime={this.state.referenceTime}
            selectedModel={this.state.model} time={adaStart} style={{ height: '100%', width: '100%', marginLeft: '-3.6rem', marginRight: '1.4rem' }} />
        </Panel>;
      }
      return <div />;
    }
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
          <Row style={{ flex: 1 }}>
            <Col xs='12'>
              <SinglePanel mapId={0} {...this.props} />
            </Col>
          </Row>
        );
    }
  }
}
SinglePanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  mapProperties: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  mapActions: PropTypes.object.isRequired,
  drawProperties: PropTypes.object.isRequired,
  layers: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object.isRequired,
  mapId: PropTypes.number.isRequired,
  drawActions: PropTypes.object.isRequired,
  layerActions: PropTypes.object.isRequired,
  adagucActions: PropTypes.object.isRequired
};
MapPanel.propTypes = {
  mapProperties: PropTypes.object.isRequired
};

export default MapPanel;
