import React, { PureComponent } from 'react';
import { Button, Col, Row, Popover, PopoverContent, ButtonGroup, Modal, ModalBody, ModalFooter, ListGroup, ListGroupItem } from 'reactstrap';
import Panel from '../components/Panel';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { Icon } from 'react-fa';
import ProgtempPopoverComponent from '../components/ProgtempPopoverComponent';
import TimeseriesPopoverComponent from '../components/TimeseriesPopoverComponent';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
var moment = require('moment');

class MapActionContainer extends PureComponent {
  constructor (props) {
    super(props);
    // Toggles
    this.togglePopside = this.togglePopside.bind(this);
    this.toggleProgtempPopover = this.toggleProgtempPopover.bind(this);
    // Button handlers
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.toggleLayerChooser = this.toggleLayerChooser.bind(this);
    this.goToNow = this.goToNow.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);

    // Render functions
    this.renderLayerChooser = this.renderLayerChooser.bind(this);
    this.renderTimeseriesPopover = this.renderTimeseriesPopover.bind(this);
    // Helper
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.renderLayerChooser = this.renderLayerChooser.bind(this);

    // State
    this.state = {
      collapse: false,
      popoverOpen: false,
      layerChooserOpen: false,
      activeTab: '1',
      getCapBusy: false,
      filter: ''
    };
  }

  handleActionClick (action) {
    let toggleProgtemp = false;
    let toggleTimeseries = false;
    const { dispatch, mapActions } = this.props;
    if (action === 'progtemp' && this.state.progTempPopOverOpen) {
      this.setState({ progTempPopOverOpen: false });
      toggleProgtemp = true;
    }
    if (action === 'timeseries' && this.state.timeSeriesPopOverOpen) {
      this.setState({ timeSeriesPopOverOpen: false });
      toggleTimeseries = true;
    }
    if (toggleProgtemp || toggleTimeseries) {
      dispatch(mapActions.setMapMode('pan'));
      return;
    }
    if (action === 'progtemp') {
      this.setState({ progTempPopOverOpen: true });
    } else {
      this.setState({ progTempPopOverOpen: false });
    }
    if (action === 'timeseries') {
      this.setState({ timeSeriesPopOverOpen: true });
    } else {
      this.setState({ timeSeriesPopOverOpen: false });
    }
    dispatch(mapActions.setMapMode(action));
  }
  handleAddLayer (addItem) {
    const { dispatch, layerActions, mapProperties } = this.props;
    if (this.state.activeSource.goal !== 'OVERLAY') {
      dispatch(layerActions.addLayer({
        activeMapId: mapProperties.activeMapId,
        layer: {
          service: this.state.activeSource.service,
          title: this.state.activeSource.title,
          name: addItem.name,
          label: addItem.text,
          opacity: 1
        }
      }));
    } else {
      dispatch(layerActions.addOverlaysLayer({
        activeMapId: mapProperties.activeMapId,
        layer: {
          service: this.state.activeSource.service,
          title: this.state.activeSource.title,
          name: addItem.name,
          label: addItem.text }
      }));
    }
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      activeSource: null,
      action: null,
      layers: null,
      filter: ''
    });
  }

  componentDidUpdate (prevProps, prevState) {
    if (!prevState.layerChooserOpen && this.state.layerChooserOpen) {
      document.getElementById('filterInput').focus();
    }
  }

  toggleLayerChooser () {
    this.setState({ layerChooserOpen: !this.state.layerChooserOpen });
  }
  toggleAnimation () {
    const { dispatch, adagucActions } = this.props;
    dispatch(adagucActions.toggleAnimation());
  }
  togglePopside () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  toggleProgtempPopover () {
    this.setState({ progTempPopOverOpen: !this.state.progTempPopOverOpen });
  }
  goToNow () {
    const { dispatch, adagucActions } = this.props;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(adagucActions.setTimeDimension(currentDate.toISO8601()));
  }

  renderBBOXPopOver () {
    return (
      <Popover placement='left' isOpen={this.state.popoverOpen} target='setAreaButton' toggle={this.togglePopside}>
        <PopoverContent style={{ height: '15rem', overflow: 'hidden', overflowY: 'scroll' }}>
          <ButtonGroup vertical>
            {BOUNDING_BOXES.map((bbox, i) => <Button key={i} id={i} onClick={this.setView}>{bbox.title}</Button>)}
          </ButtonGroup>
        </PopoverContent>
      </Popover>
    );
  }

  renderProgtempPopover (adagucTime) {
    if (this.state.progTempPopOverOpen) {
      const { dispatch, adagucActions, layers, mapProperties } = this.props;
      return <ProgtempPopoverComponent urls={this.props.urls} mapProperties={mapProperties} layers={layers} adagucProperties={this.props.adagucProperties}
        isOpen={this.state.progTempPopOverOpen} dispatch={dispatch} adagucActions={adagucActions} />;
    }
  }

  renderTimeseriesPopover (adagucTime) {
    if (this.state.timeSeriesPopOverOpen) {
      const { dispatch } = this.props;
      return <TimeseriesPopoverComponent urls={this.props.urls} mapProperties={this.props.mapProperties} layers={this.props.layers} adagucProperties={this.props.adagucProperties}
        adagucActions={this.props.adagucActions} isOpen={this.state.timeSeriesPopOverOpen} dispatch={dispatch} />;
    }
  }

  filterSourcesAndLayers (data, filter) {
    // If there's no filter just return the data
    if (filter === '') {
      return data;
    }

    // Don't delete sources whom match the filter
    const protectedKeys = Object.keys(data).filter((key) => key.toLowerCase().indexOf(filter) !== -1);

    // For each source....
    Object.keys(data).map((key) => {
      const vals = data[key].layers;
      // Delete all layers that do not match the filter
      const filteredLayers = vals.filter((layer) => layer.name.toLowerCase().indexOf(filter) !== -1 ||
                                                    layer.text.toLowerCase().indexOf(filter) !== -1);

      // If the source itself is matched by the filter
      if (protectedKeys.includes(key)) {
        // but some layers match it too, return those.
        // else we return all layers in the matched source
        if (filteredLayers.length !== 0) {
          data[key].layers = filteredLayers;
        }
      } else {
        // Else filter the layers
        data[key].layers = filteredLayers;
      }
    });
    // Filter all sources that have no layers that match the filter
    // except if the source itself is matched by the filter
    const keys = Object.keys(data);
    keys.map((key) => {
      if (data[key].layers.length === 0 && !protectedKeys.includes(key)) {
        delete data[key];
      }
    });
    return data;
  }

  renderLayerChooser (data) {
    // Filter the layers and sources by a string filter
    const filteredData = this.filterSourcesAndLayers(cloneDeep(data), this.state.filter);

    // If the result is merely one filter, select it by default
    if (Object.keys(filteredData).length === 1 && !this.state.activeSource) {
      this.setState({ activeSource: filteredData[Object.keys(filteredData)[0]].source });
    }
    return (
      <Modal style={{ width: '60rem', minWidth: '60rem', maxHeight: '20rem' }} id='addLayerModal' isOpen={this.state.layerChooserOpen} toggle={this.toggleLayerChooser}>
        <div className='modal-header'>
          <h4 className='modal-title'>
            Add Layer
          </h4>
          <input id='filterInput' style={{ width: '25rem' }} className='form-control'
            placeholder='Filter&hellip;' onChange={(a) => { this.setState({ activeSource: null, filter: a.target.value }); }} />
        </div>
        <ModalBody>
          <Row style={{ borderBottom: '1px solid #eceeef' }}>
            <Col xs='5' style={{ paddingLeft: 0 }}>
              <h5>Sources</h5>
            </Col>
            <Col xs='7' style={{ paddingLeft: '1rem' }}>
              <h5>Layers in source</h5>
            </Col>
          </Row>
          <Row style={{ paddingTop: '1rem', paddingRight: 0, overflowY: 'hidden' }}>
            <Col xs='5' style={{ paddingLeft: 0, borderRight: '1px solid #eceeef', overflowY: 'auto' }}>
              <ListGroup>
                {
                  Object.keys(filteredData).map((source) =>
                    <ListGroupItem
                      style={{
                        maxHeight: '2.5em',
                        padding: '1rem',
                        width: '100%',
                        paddingTop: '0.5rem',
                        display: 'inline-block',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                      }}
                      tag='a' href='#'
                      active={this.state.activeSource && source === this.state.activeSource.name}
                      onClick={(evt) => { evt.stopPropagation(); evt.preventDefault(); this.setState({ activeSource: filteredData[source].source }); }}>{source}</ListGroupItem>)
                }
              </ListGroup>
            </Col>
            <Col xs='7' style={{ maxHeight: '25rem', height: '25rem', paddingLeft: '1rem', overflowY: 'auto' }}>
              {
                this.state.activeSource
                  ? <ListGroup>
                    {filteredData[this.state.activeSource.name].layers.map((layer) =>
                      <ListGroupItem style={{ maxHeight: '2.5em' }} tag='a' href='#'
                        onClick={(evt) => { evt.stopPropagation(); evt.preventDefault(); this.handleAddLayer({ ...layer, service: this.state.activeSource.service }); }}>{layer.text}</ListGroupItem>)}
                  </ListGroup>
                  : <div style={{ fontStyle: 'italic' }}>Select a source from the left to view its layers</div>
              }
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Button color='secondary' onClick={this.toggleLayerChooser}>Cancel</Button>
        </ModalFooter>
      </Modal>);
  }

  render () {
    const { title, adagucProperties, mapProperties } = this.props;
    const { sources } = adagucProperties;
    const items = [
      {
        title: 'Pan / zoom',
        action: 'pan',
        icon: 'hand-stop-o'
      },
      {
        title: 'Zoom to rectangle',
        action: 'zoom',
        icon: 'search-plus'
      },
      {
        title: 'Draw polygon',
        action: 'draw',
        icon: 'pencil'
      },
      {
        title: 'Delete drawing point',
        action: 'delete',
        icon: 'trash'
      },
      {
        title: 'Measure distance',
        action: 'measure',
        icon: 'arrows-h'
      },
      {
        title: 'Show time series',
        action: 'timeseries',
        icon: 'line-chart',
        onClick: 'timeseries'
      },
      {
        title: 'Show progtemp',
        action: 'progtemp',
        icon: 'bullseye',
        onClick: 'progtemp'
      }
    ];

    return (
      <Col className='MapActionContainer'>
        {this.renderLayerChooser(this.props.adagucProperties.sources)}
        {this.renderProgtempPopover(moment.utc(adagucProperties.timeDimension))}
        {this.renderTimeseriesPopover()}
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={mapProperties.mapMode === item.action} disabled={item.disabled || null}
              className='row' id={item.action + '_button'} title={item.title} onClick={() => this.handleActionClick(item.action)}>
              <Icon name={item.icon} />
            </Button>)}
          <Row style={{ flex: 1 }} />
          <Button disabled={Array.isArray(sources) || Object.keys(sources).length === 0} onClick={this.toggleLayerChooser} color='primary' className='row' title='Add layers'>
            <Icon name='plus' />
          </Button>
          <Button onClick={this.toggleAnimation} color='primary' className='row' title='Play animation'>
            <Icon name={this.props.adagucProperties.animate ? 'pause' : 'play'} />
          </Button>
          <Button onClick={this.goToNow} color='primary' className='row' title='Go to current time'>
            <Icon name='clock-o' />
          </Button>
        </Panel>
      </Col>
    );
  }
}

MapActionContainer.propTypes = {
  title: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  mapProperties: PropTypes.object,
  adagucProperties: PropTypes.object,
  adagucActions: PropTypes.object,
  layers: PropTypes.object,
  layerActions: PropTypes.object,
  mapActions: PropTypes.object,
  user: PropTypes.object
};

export default MapActionContainer;
