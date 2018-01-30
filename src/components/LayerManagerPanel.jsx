import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { hashHistory } from 'react-router';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as TimeComponent } from './ADAGUC/TimeComponent';
import { default as Panel } from './Panel';
import { Row, Col, Button, Modal, ModalBody, Input, Label, ListGroup, ListGroupItem, ModalFooter } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { GetServiceByName } from '../utils/getServiceByName';

var elementResizeEvent = require('element-resize-event');

class LayerManagerPanel extends Component {
  constructor (props) {
    super(props);
    this.setResizeListener = this.setResizeListener.bind(this);
    this.filterSourcesAndLayers = this.filterSourcesAndLayers.bind(this);
    this.renderLayerChooser = this.renderLayerChooser.bind(this);
    this.toggleLayerChooser = this.toggleLayerChooser.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.handleButtonClickNextPrev = this.handleButtonClickNextPrev.bind(this);
    this.handleDurationUpdate = this.handleDurationUpdate.bind(this);
    this.goToNow = this.goToNow.bind(this);
    this.toggleControls = this.toggleControls.bind(this);
    this.toggleFullscreen = this.toggleFullscreen.bind(this);
    this.state = {
      width: 0,
      height: 0,
      inputValue: this.props.adagucProperties.animationSettings.duration,
      initialized: false,
      showControls: true
    };
  }

  componentDidUpdate (prevProps) {
    const { dispatch, layerActions, layers, adagucProperties } = this.props;
    const { sources } = adagucProperties;
    const prevSources = prevProps.adagucProperties.sources;

    if (prevSources === sources) {
      return;
    }
    // By default add Countries overlay layer to each panel
    // The call [...Array(a.length).keys()] generates an array [0, 1, 2, ..., a.length - 1]
    if (!sources || (Object.keys(sources).length === 0 && sources.constructor === Object)) {
      return;
    }
    const source = GetServiceByName(sources, 'OVL');
    if (source) {
      [...Array(layers.panels.length).keys()].map((id) => {
        dispatch(layerActions.addOverlaysLayer({
          activeMapId: id,
          layer: {
            service: source,
            title: 'OVL_EXT',
            name: 'countries',
            label: 'Countries'
          }
        }));
      });
    }
  }

  toggleControls (evt) {
    this.setState({ showControls: !this.state.showControls });
    evt.preventDefault();
  }

  toggleFullscreen (evt) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else {
      document.msExitFullscreen();
    }
    hashHistory.goBack();
  };

  goToNow () {
    const { dispatch, adagucActions } = this.props;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(adagucActions.setTimeDimension(currentDate.toISO8601()));
  }

  toggleLayerChooser () {
    this.setState({ layerChooserOpen: !this.state.layerChooserOpen, filter: '' });
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
          opacity: 0.8,
          active: false
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

  setResizeListener (panel) {
    if (panel) {
      if (!this.state.initialized) {
        elementResizeEvent(panel, () => {
          this.setState({ width: panel.clientWidth, height: panel.clientHeight });
        });
        this.setState({ initialized: true, width: panel.clientWidth, height: panel.clientHeight });
      }
    }
  }

  filterSourcesAndLayers (data, filter) {
    // If there's no filter just return the data
    if (filter === '') {
      return data;
    }

    const filterSource = (source, filter) => {
      let matchesFilter = false;
      if (!source) {
        return false;
      }

      if (source.name) {
        matchesFilter = matchesFilter || source.name.toLowerCase().indexOf(filter) !== -1;
      }

      if (source.title) {
        matchesFilter = matchesFilter || source.title.toLowerCase().indexOf(filter) !== -1;
      }

      if (source.abstract) {
        matchesFilter = matchesFilter || source.abstract.toLowerCase().indexOf(filter) !== -1;
      }

      return matchesFilter;
    };

    // Don't delete sources whom match the filter
    const protectedKeys = Object.keys(data).filter((key) => key.toLowerCase().indexOf(filter) !== -1 || filterSource(data[key].source, filter));

    // For each source....
    Object.keys(data).map((key) => {
      const vals = data[key].layers;
      if (vals) {
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
      }
    });
    // Filter all sources that have no layers that match the filter
    // except if the source itself is matched by the filter
    const keys = Object.keys(data);
    keys.map((key) => {
      if (!data[key].layers || (data[key].layers.length === 0 && !protectedKeys.includes(key))) {
        delete data[key];
      }
    });

    return data;
  }

  renderLayerChooser (data) {
    // Filter the layers and sources by a string filter
    const filteredData = this.filterSourcesAndLayers(cloneDeep(data), this.state.filter);

    let activeSourceVisible = this.state.activeSource && Object.keys(filteredData).includes(this.state.activeSource.name);
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
            placeholder='Filter&hellip;' onChange={(a) => { this.setState({ filter: a.target.value }); }} />
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
                  Object.keys(filteredData).map((source) => {
                    return <ListGroupItem
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
                      disabled={!filteredData[source] || !filteredData[source].layers}
                      tag='a' href='#'
                      active={this.state.activeSource && source === this.state.activeSource.name}
                      onClick={(evt) => { evt.stopPropagation(); evt.preventDefault(); this.setState({ activeSource: filteredData[source].source }); }}>{source}</ListGroupItem>;
                  })
                }
              </ListGroup>
            </Col>
            <Col xs='7' style={{ maxHeight: '25rem', height: '25rem', paddingLeft: '1rem', overflowY: 'auto' }}>
              {
                activeSourceVisible
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

  handleButtonClickNextPrev (direction) {
    const { layers, mapProperties, adagucProperties, adagucActions, dispatch } = this.props;
    const panel = layers.panels[mapProperties.activeMapId];
    let i = 0;
    if (panel.layers.length === 0) {
      // move one hour?
      return;
    }
    for (; i < panel.layers.length; ++i) {
      if (panel.layers[i].active) {
        break;
      }
    }
    const activeWMJSLayer = layers.wmjsLayers.layers[i];
    if (!activeWMJSLayer) {
      // move one hour?
      return;
    }

    const currentTime = adagucProperties.timeDimension;
    const timeDimension = activeWMJSLayer.getDimension('time');
    const closestTime = timeDimension.getClosestValue(currentTime, true);
    const index = timeDimension.getIndexForValue(closestTime);
    let nextTime;
    if (direction === 'up') {
      nextTime = timeDimension.getValueForIndex(index + 1);
    } else {
      nextTime = timeDimension.getValueForIndex(index - 1);
    }
    dispatch(adagucActions.setTimeDimension(nextTime));
  }
  handleDurationUpdate (e) {
    const newVal = e.target.value;
    const { dispatch, adagucActions, adagucProperties } = this.props;
    if (newVal === '' || newVal === null || newVal === undefined || newVal === '0' || newVal === 0) {
      if (adagucProperties.animationSettings.animate) {
        dispatch(adagucActions.toggleAnimation());
      }
      dispatch(adagucActions.setAnimationLength(null));
    } else {
      const newValInt = parseInt(newVal);
      dispatch(adagucActions.setAnimationLength(newValInt));
      if (!adagucProperties.animationSettings.animate) {
        dispatch(adagucActions.toggleAnimation());
      }
    }
  }

  render () {
    const { title, dispatch, adagucProperties, layers, mapProperties, adagucActions } = this.props;
    const { sources, animationSettings } = adagucProperties;
    const isFullScreen = hashHistory.getCurrentLocation().pathname === '/full_screen';
    return (
      <Panel title={title} className='LayerManagerPanel'>
        <Row style={{ flex: 1 }}>
          {this.renderLayerChooser(this.props.adagucProperties.sources)}
          <Col xs='auto' style={{ flexDirection: 'column-reverse', marginRight: '.66rem' }}>
            {this.state.showControls
              ? <Row>
                <Col xs='auto'>
                  <Button onClick={() => { this.props.dispatch(this.props.adagucActions.toggleAnimation()); }}
                    color='primary' title='Play animation'>
                    <Icon name={animationSettings.animate ? 'pause' : 'play'} />
                  </Button>
                </Col>
                <Col xs='auto'>
                  <Button onClick={this.goToNow} color='primary' title='Go to current time'>
                    <Icon name='clock-o' />
                  </Button>
                </Col>
                <Col xs='auto'>
                  <Input style={{ maxWidth: '7rem', marginLeft: '0.17rem' }} value={this.props.adagucProperties.animationSettings.duration || ''} onChange={this.handleDurationUpdate}
                    placeholder='No. hours' type='number' step='1' min='0' ref={elm => { this.durationInput = elm; }} />
                </Col>
              </Row>
              : null }
            {this.state.showControls
              ? <Row style={{ marginBottom: '.33rem' }}>
                <Col xs='auto'>
                  <Button color='primary' onClick={() => this.handleButtonClickNextPrev('down')}>
                    <Icon name='step-backward' />
                  </Button>
                </Col>
                <Col xs='auto'>
                  <Button color='primary' onClick={() => this.handleButtonClickNextPrev('up')}>
                    <Icon name='step-forward' />
                  </Button>
                </Col>
                <Col xs='auto'>
                  <Label style={{ marginTop: '1.5rem', marginBottom: '-1.5rem', marginLeft: '0.17rem' }}>Duration</Label>
                </Col>
              </Row>
              : null}
            <Row />
          </Col>
          <Col style={{ flex: 1, flexDirection: 'column-reverse' }}>
            <Row style={{ flex: 1 }}>
              <TimeComponent activeMapId={mapProperties.activeMapId} width={this.state.width} panel={layers.panels[mapProperties.activeMapId]}
                height={this.state.height} timedim={adagucProperties.timeDimension}
                wmjslayers={layers.wmjsLayers} layerActions={this.props.layerActions}
                dispatch={dispatch} adagucActions={adagucActions} ref={(panel) => this.setResizeListener(ReactDOM.findDOMNode(panel))} />
              <LayerManager wmjslayers={layers.wmjsLayers} dispatch={dispatch} layerActions={this.props.layerActions}
                adagucActions={adagucActions} baselayer={layers.baselayer} panel={layers.panels[mapProperties.activeMapId]} activeMapId={mapProperties.activeMapId} />
            </Row>
            <Row />
          </Col>
          <Col xs='auto' style={{ flexDirection: 'column-reverse', marginLeft: '.66rem' }}>
            {this.state.showControls
              ? <Row>
                <Col />
                <Col xs='auto'>
                  <Button disabled={Array.isArray(sources) || Object.keys(sources).length === 0} onClick={this.toggleLayerChooser}
                    color='primary' title='Add layers'>
                    <Icon name='plus' />
                  </Button>
                </Col>
              </Row>
              : null }
            {isFullScreen
              ? <Row style={{ marginBottom: '.33rem' }}>
                <Col xs='auto'>
                  <Button onClick={this.toggleControls} color='primary' title={this.state.showControls ? 'Hide controls' : 'Show controls'}>
                    <Icon name={this.state.showControls ? 'eye-slash' : 'eye'} />
                  </Button>
                </Col>
                <Col xs='auto'>
                  <Button onClick={this.toggleFullscreen} color='primary' title='Exit full screen mode'>
                    <Icon name='compress' />
                  </Button>
                </Col>
              </Row>
              : null }
            <Row style={{ flex: 1 }} />
          </Col>
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
