import React, { PureComponent } from 'react';
import Adaguc from './ADAGUC/Adaguc';
import Panel from './Panel';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';
import TimeseriesComponent from './TimeseriesComponent';
import ProgtempComponent from './ProgtempComponent';
import axios from 'axios';
import moment from 'moment';
import { ReadLocations } from '../utils/admin';
import { GetServiceByNamePromise } from '../utils/getServiceByName';

export class SinglePanel extends PureComponent {
  constructor () {
    super();
    this.renderPanelContent = this.renderPanelContent.bind(this);
    this.state = {
      isLoading: false,
      error: null
    };
  }

  componentWillUpdate (nextProps) {
    if (this.props.adagucProperties.cursor !== nextProps.adagucProperties.cursor) {
      this.setState({ isLoading: true });
    }
  }

  renderPanelContent (type) {
    const { mapProperties, dispatch, mapId, drawProperties, layers, adagucProperties, urls } = this.props;
    const { activeMapId } = mapProperties;
    const { cursor } = this.props.adagucProperties;
    const adaStart = moment.utc(this.props.adagucProperties.timeDimension).startOf('hour');

    switch (type.toUpperCase()) {
      case 'TIMESERIES':
        return <TimeseriesComponent urls={urls} layout={mapProperties.layout} location={cursor ? cursor.location : null} referenceTime={this.props.referenceTime}
          selectedModel={this.props.model} time={adaStart} id={'timeseries' + mapId} />;
      case 'PROGTEMP':
        return <ProgtempComponent urls={urls} layout={mapProperties.layout} location={cursor ? cursor.location : null} referenceTime={this.props.referenceTime}
          selectedModel={this.props.model} loadingDone={() => this.setState({ isLoading: false })} onError={(error) => {
            console.log(error);
            if (this.state.error !== error) {
              this.setState({ error });
            }
          }} time={adaStart} style={{ height: '100%', width: '100%', marginLeft: '-3.6rem', marginRight: '1.4rem' }} />;
      default:
        return <Adaguc drawActions={this.props.drawActions} layerActions={this.props.layerActions} mapProperties={mapProperties}
          adagucActions={this.props.adagucActions} adagucProperties={adagucProperties} layers={layers} drawProperties={drawProperties}
          mapId={mapId} urls={urls} dispatch={dispatch} mapActions={this.props.mapActions} active={mapId === activeMapId} />;
    }
  }

  render () {
    const { title, mapProperties, dispatch, mapActions, mapId, layers, layerActions, adagucActions } = this.props;
    const { activeMapId } = mapProperties;
    const type = layers.panels[mapId].type;
    const { cursor } = this.props.adagucProperties;

    let text;
    if (this.state.isLoading) {
      text = 'Loading...';
    } else {
      if (this.state.error) {
        text = this.state.error;
      } else {
        text = cursor ? cursor.location : null;
      }
    }

    return (<Panel layout={mapProperties.layout} adagucActions={adagucActions} locations={this.props.progtempLocations} location={text} dispatch={dispatch}
      layerActions={layerActions} type={type} mapActions={mapActions} title={title} mapMode={mapProperties.mapMode} mapId={mapId}
      className={mapId === activeMapId && type === 'ADAGUC' ? 'activePanel' : ''} referenceTime={this.props.referenceTime}>
      {this.renderPanelContent(type)}
    </Panel>);
  }
}

class MapPanel extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      model: 'Harmonie36'
    };
    ReadLocations(`${this.props.urls.BACKEND_SERVER_URL}/admin/read`, (data) => {
      if (data) {
        this.progtempLocations = data;
      } else {
        console.error('get progtemlocations failed');
      }
    });
  }
  componentWillMount () {
    GetServiceByNamePromise(this.props.urls.BACKEND_SERVER_URL, 'Harmonie36').then(
      (serviceURL) => {
        // console.log('MapPanel.jsx serviceURL:' + serviceURL);
        try {
          let referenceTimeRequestURL = serviceURL + '&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetReferenceTimes&LAYERS=air_temperature__at_2m';
          return axios.get(referenceTimeRequestURL).then((r) => {
            // console.log('MapPanel.jsx SUCCESS', moment.utc(r.data[0]).format());
            this.setState({ referenceTime: moment.utc(r.data[0]) });
          });
        } catch (e) {
          console.error('ERROR: unable to fetch ' + serviceURL);
        }
      },
      (e) => {
        console.error(e);
      }
    );
  }

  componentDidUpdate (prevProps) {
    const getNumPanels = (name) => {
      let numPanels = 0;
      if (/quad/.test(name)) {
        numPanels = 4;
      } else if (/triple/.test(name)) {
        numPanels = 3;
      } else if (/dual/.test(name)) {
        numPanels = 2;
      } else {
        numPanels = 1;
      }
      return numPanels;
    };

    const { layers, mapProperties, dispatch, mapActions } = this.props;
    const { activeMapId } = mapProperties;
    const { panels } = layers;

    const numPanels = getNumPanels(mapProperties.layout);
    // Get all visibile panels that are currently adaguc with their id in the original array
    const adagucPanels = (panels.map((panel, index) => { return { panel, index }; }).slice(0, numPanels).filter((p) => p.panel.type === 'ADAGUC'));
    if (adagucPanels.length > 0 && panels[activeMapId].type !== 'ADAGUC') {
      dispatch(mapActions.setActivePanel(adagucPanels[0].index));
    }
  }
  render () {
    const { mapProperties } = this.props;
    switch (mapProperties.layout) {
      case 'dual':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
            <Col xs='6'>
              <SinglePanel mapId={1} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
          </Row>
        );
      case 'quaduneven':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={1} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={2} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={3} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
            </Col>
          </Row>
        );
      case 'tripleuneven':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={1} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={2} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
            </Col>
          </Row>
        );
      case 'triplecolumn':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
            <Col xs='6'>
              <Col xs='6'>
                <SinglePanel mapId={1} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Col>
              <Col xs='6'>
                <SinglePanel mapId={2} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Col>
            </Col>
          </Row>
        );
      case 'quad':
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={2} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
            </Col>
            <Col xs='6' style={{ flexDirection: 'column' }}>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={1} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
              <Row style={{ flex: 1 }}>
                <SinglePanel mapId={3} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
              </Row>
            </Col>
          </Row>
        );

      case 'quadcol':
        return (<Row style={{ flex: 1 }}>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
            <Col xs='6'>
              <SinglePanel mapId={1} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
          </Col>
          <Col xs='6'>
            <Col xs='6'>
              <SinglePanel mapId={2} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
            <Col xs='6'>
              <SinglePanel mapId={3} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
            </Col>
          </Col>
        </Row>);
      case 'single':
      default:
        return (
          <Row style={{ flex: 1 }}>
            <Col xs='12'>
              <SinglePanel mapId={0} {...this.props} referenceTime={this.state.referenceTime} progtempLocations={this.progtempLocations} model={this.state.model} />
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
  mapProperties: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object.isRequired
};

export default MapPanel;
