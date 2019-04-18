import React, { PureComponent, Component } from 'react';
import ReactDOM from 'react-dom';
import LayerManager from './LayerManager';
import { hashHistory } from 'react-router';
import TimeComponent from './ADAGUC/TimeComponent';
import Panel from './Panel';
import { Row, Col, Button, Modal, ModalBody, Input, Label, ListGroup, ListGroupItem, ModalFooter } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';
import { GetServiceByName } from '../utils/getServiceByName';
var elementResizeEvent = require('element-resize-event');

class LayerManagerPanel extends PureComponent {
  constructor (props) {
    super(props);
    this.setResizeListener = this.setResizeListener.bind(this);
    this.toggleLayerChooser = this.toggleLayerChooser.bind(this);
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
    const { dispatch, panelsActions, panelsProperties, adagucProperties } = this.props;
    const { sources } = adagucProperties;
    const prevSources = prevProps.adagucProperties.sources;

    if (prevSources === sources) {
      return;
    }
    // By default add Countries overlay layer to each panel
    // The call Array.from({ length: a.length }, (item, index) => index) generates an array [0, 1, 2, ..., a.length - 1]
    if (!sources || (Object.keys(sources).length === 0 && sources.constructor === Object)) {
      return;
    }
    const source = GetServiceByName(sources, 'OVL');
    if (source) {
      Array.from({ length: panelsProperties.panels.length }, (item, index) => index).forEach((id) => {
        // eslint-disable-next-line no-undef
        new WMJSLayer({
          service: source,
          title: 'OVL_EXT',
          name: 'countries',
          label: 'Countries',
          keepOnTop: true
        }).parseLayer((layerObj) => {
          dispatch(panelsActions.addOverlaysLayer({
            panelId: id,
            layer: layerObj
          }));
        });
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

  toggleLayerChooser () {
    this.setState({ layerChooserOpen: !this.state.layerChooserOpen });
  }
  handleAddLayer (addItem) {
    const { dispatch, panelsActions, panelsProperties } = this.props;
    if (this.state.activeSource.goal !== 'OVERLAY') {
      // eslint-disable-next-line no-undef
      new WMJSLayer({
        service: this.state.activeSource.service,
        title: this.state.activeSource.title,
        name: addItem.name,
        label: addItem.text,
        keepOnTop: false,
        opacity: 0.8,
        active: false
      }).parseLayer((layerObj) => {
        dispatch(panelsActions.addLayer({
          panelId: panelsProperties.activePanelId,
          layer: layerObj
        }));
      });
    } else {
      // eslint-disable-next-line no-undef
      new WMJSLayer({
        service: this.state.activeSource.service,
        title: this.state.activeSource.title,
        name: addItem.name,
        label: addItem.text,
        keepOnTop: true
      }).parseLayer((layerObj) => {
        dispatch(panelsActions.addOverlaysLayer({
          panelId: panelsProperties.activePanelId,
          layer: layerObj
        }));
      });
    }
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      activeSource: null,
      action: null,
      panelsProperties: null,
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

  render () {
    const { title, dispatch, panelsActions, adagucProperties, panelsProperties, adagucActions } = this.props;
    const { sources, animationSettings } = adagucProperties;
    const { panels, activePanelId } = panelsProperties;
    const currentPanel = panels[activePanelId];
    const isFullScreen = hashHistory.getCurrentLocation().pathname === '/full_screen';

    return (
      <Panel title={title} className='LayerManagerPanel'>
        <LayerChooser toggle={this.toggleLayerChooser} dispatch={dispatch}
          panelsActions={panelsActions} panelsProperties={panelsProperties} open={this.state.layerChooserOpen} data={this.props.adagucProperties.sources} />
        <Row style={{ flex: 1 }}>
          <Col xs='auto'>
            <TimeControls animationSettings={animationSettings} dispatch={dispatch} adagucActions={adagucActions}
              currentTime={adagucProperties.timeDimension} panel={currentPanel} showControls={this.state.showControls} />
          </Col>
          <Col style={{ flex: 1, flexDirection: 'column-reverse' }}>
            <Row style={{ flex: 1 }}>
              <TimeComponent activePanelId={activePanelId} width={this.state.width} panel={panels[activePanelId]}
                height={this.state.height} timedim={adagucProperties.timeDimension}
                panelsActions={panelsActions} dispatch={dispatch} adagucActions={adagucActions} ref={(panel) => this.setResizeListener(ReactDOM.findDOMNode(panel))} />
              <LayerManager panel={panels[activePanelId]} dispatch={dispatch} panelsActions={this.props.panelsActions}
                adagucActions={adagucActions} activePanelId={activePanelId} />
            </Row>
            <Row />
          </Col>
          <LayerMutations toggleFullscreen={this.toggleFullscreen} toggleControls={this.toggleControls} dispatch={dispatch}
            panelsActions={panelsActions} activePanelId={activePanelId} sources={sources} toggleLayerChooser={this.toggleLayerChooser}
            showControls={this.state.showControls} isFullScreen={isFullScreen}
            removeAllLayersEnabled={currentPanel && ((currentPanel.baselayers.length > 2) || (currentPanel.layers.length > 0))} />
        </Row>
      </Panel>
    );
  }
}

class LayerMutations extends PureComponent {
  constructor () {
    super();
    this.resetLayers = this.resetLayers.bind(this);
  }

  resetLayers () {
    const { dispatch, panelsActions, activePanelId, sources } = this.props;
    // This call removes all data layers and all baselayers
    // except the default map
    dispatch(panelsActions.resetLayers());

    // Re-add the countries overlay
    const source = GetServiceByName(sources, 'OVL');
    // eslint-disable-next-line no-undef
    new WMJSLayer({
      service: source,
      title: 'OVL_EXT',
      name: 'countries',
      label: 'Countries',
      keepOnTop: true
    }).parseLayer((layerObj) => {
      dispatch(panelsActions.addOverlaysLayer({
        panelId: activePanelId,
        layer: layerObj
      }));
    });
  }

  render () {
    const { showControls, isFullScreen, currentPanel, sources, toggleControls, toggleLayerChooser, toggleFullscreen } = this.props;
    return (
      <Col xs='auto' style={{ flexDirection: 'column-reverse', marginLeft: '.66rem' }}>

        {showControls
          ? <Row style={{ flexDirection: isFullScreen ? 'row-reverse' : 'inherit' }}>
            <Col style={{ marginRight: 0 }} />
            <Col xs='auto' style={{ marginRight: 0 }}>
              <Button disabled={Array.isArray(sources) || Object.keys(sources).length === 0} onClick={toggleLayerChooser}
                color='primary' title='Add layers'>
                <Icon name='plus' />
              </Button>
            </Col>
            <Col xs='auto' style={{ marginBottom: isFullScreen ? 0 : '0.33rem', marginRight: isFullScreen ? '0.33rem' : 0 }}>
              <Button disabled={!(currentPanel && ((currentPanel.baselayers.length > 2) || (currentPanel.layers.length > 0)))}
                onClick={this.resetLayers} color='primary' title='Remove all layers'>
                <Icon name='trash' />
              </Button>
            </Col>
          </Row>
          : null}
        {isFullScreen
          ? <Row style={{ marginBottom: showControls ? '.33rem' : 0 }}>
            <Col xs='auto'>
              <Button onClick={toggleControls} color='primary' title={showControls ? 'Hide controls' : 'Show controls'}>
                <Icon name={showControls ? 'eye-slash' : 'eye'} />
              </Button>
            </Col>
            <Col xs='auto'>
              <Button onClick={toggleFullscreen} color='primary' title='Exit full screen mode'>
                <Icon name='compress' />
              </Button>
            </Col>
          </Row>
          : null}
        <Row style={{ flex: 1 }} />
      </Col>
    );
  }
}

class LayerChooser extends PureComponent {
  constructor () {
    super();
    this.filterSourcesAndLayers = this.filterSourcesAndLayers.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);

    this.state = {
      filter: ''
    };
  }

  handleAddLayer (addItem) {
    const { dispatch, panelsActions, panelsProperties } = this.props;
    if (this.state.activeSource.goal !== 'OVERLAY') {
      // eslint-disable-next-line no-undef
      new WMJSLayer({
        service: this.state.activeSource.service,
        title: this.state.activeSource.title,
        name: addItem.name,
        label: addItem.text,
        keepOnTop: false,
        opacity: 0.8,
        active: false
      }).parseLayer((layerObj) => {
        dispatch(panelsActions.addLayer({
          panelId: panelsProperties.activePanelId,
          layer: layerObj
        }));
      });
    } else {
      // eslint-disable-next-line no-undef
      new WMJSLayer({
        service: this.state.activeSource.service,
        title: this.state.activeSource.title,
        name: addItem.name,
        label: addItem.text,
        keepOnTop: true
      }).parseLayer((layerObj) => {
        dispatch(panelsActions.addOverlaysLayer({
          panelId: panelsProperties.activePanelId,
          layer: layerObj
        }));
      });
    }
    this.props.toggle();
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
    Object.keys(data).forEach((key) => {
      const vals = data[key].layers;
      if (vals) {
        // Delete all layers that do not match the filter
        const filteredLayers = vals.filter((layer) => (layer.name && layer.name.toLowerCase().indexOf(filter) !== -1) ||
          (layer.text && layer.text.toLowerCase().indexOf(filter) !== -1));

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
    keys.forEach((key) => {
      if (!data[key].layers || (data[key].layers.length === 0 && !protectedKeys.includes(key))) {
        delete data[key];
      }
    });

    return data;
  }

  render () {
    const { data, toggle } = this.props;
    // Filter the panelsProperties and sources by a string filter
    const filteredData = this.filterSourcesAndLayers(cloneDeep(data), this.state.filter ? this.state.filter.toLowerCase() : '');

    let activeSourceVisible = this.state.activeSource && Object.keys(filteredData).includes(this.state.activeSource.name);
    // If the result is merely one filter, select it by default
    if (Object.keys(filteredData).length === 1 && !this.state.activeSource) {
      this.setState({ activeSource: filteredData[Object.keys(filteredData)[0]].source });
    }

    return (<Modal style={{ width: '60rem', minWidth: '60rem', maxHeight: '20rem' }} id='addLayerModal' isOpen={this.props.open} toggle={toggle}>
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
                Object.keys(filteredData).map((source, index) => {
                  return <ListGroupItem key={`layer-add-source-${index}`}
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
                  {filteredData[this.state.activeSource.name].layers.map((layer, index) =>
                    <ListGroupItem key={`layer-add-layer-${index}`} style={{ maxHeight: '2.5em' }} tag='a' href='#'
                      onClick={(evt) => { evt.stopPropagation(); evt.preventDefault(); this.handleAddLayer({ ...layer, service: this.state.activeSource.service }); }}>{layer.text}</ListGroupItem>)}
                </ListGroup>
                : <div style={{ fontStyle: 'italic' }}>Select a source from the left to view its panelsProperties</div>
            }
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
}

class TimeControls extends Component {
  constructor () {
    super();
    this.handleButtonClickNextPrev = this.handleButtonClickNextPrev.bind(this);
    this.goToNow = this.goToNow.bind(this);
    this.handleDurationUpdate = this.handleDurationUpdate.bind(this);
  }

  goToNow () {
    const { dispatch, adagucActions } = this.props;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(adagucActions.setTimeDimension(currentDate.toISO8601()));
  }

  handleDurationUpdate (e) {
    const newVal = e.target.value;
    const { dispatch, adagucActions, animationSettings } = this.props;
    if (newVal === '' || newVal === null || newVal === undefined || newVal === '0' || newVal === 0) {
      if (animationSettings.animate) {
        dispatch(adagucActions.toggleAnimation());
      }
      dispatch(adagucActions.setAnimationLength(null));
    } else {
      const newValInt = parseInt(newVal);
      dispatch(adagucActions.setAnimationLength(newValInt));
      if (!animationSettings.animate) {
        dispatch(adagucActions.toggleAnimation());
      }
    }
  }

  // shouldComponentUpdate (nextProps) {
  //   return this.props.animationSettings !== nextProps.animationSettings;
  // }
  handleButtonClickNextPrev (direction) {
    const { panel, currentTime, dispatch, adagucActions } = this.props;
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
    const activeWMJSLayer = panel.layers[i];
    if (!activeWMJSLayer) {
      // move one hour?
      return;
    }

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
  render () {
    if (this.props.showControls) {
      return (
        <div style={{ flexDirection: 'column-reverse', marginRight: '.66rem' }}>
          <Row>
            <Col xs='auto'>
              <Button onClick={() => {
                this.props.dispatch(this.props.adagucActions.toggleAnimation());
              }} color='primary' title='Play animation'>
                <Icon name={this.props.animationSettings.animate ? 'pause' : 'play'} />
              </Button>
            </Col>
            <Col xs='auto'>
              <Button onClick={this.goToNow} color='primary' title='Go to current time'>
                <Icon name='clock-o' />
              </Button>
            </Col>
            <Col xs='auto'>
              <Input style={{ maxWidth: '7rem', marginLeft: '0.17rem' }} value={this.props.animationSettings.duration || ''} onChange={this.handleDurationUpdate}
                placeholder='No. hours' type='number' step='1' min='0' ref={elm => { this.durationInput = elm; }} />
            </Col>
          </Row>
          <Row style={{ marginBottom: '.33rem' }}>
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
          <Row />
        </div>);
    }
    return null;
  }
}

LayerMutations.propTypes = {
  dispatch: PropTypes.func,
  panelsActions: PropTypes.object,
  activePanelId: PropTypes.number,
  sources: PropTypes.object,
  showControls: PropTypes.bool,
  isFullScreen: PropTypes.bool,
  currentPanel: PropTypes.object,
  toggleControls: PropTypes.func,
  toggleLayerChooser: PropTypes.func,
  toggleFullscreen: PropTypes.func
};

LayerChooser.propTypes = {
  dispatch: PropTypes.func,
  panelsActions: PropTypes.object,
  panelsProperties: PropTypes.object,
  toggle: PropTypes.func,
  data: PropTypes.object,
  open: PropTypes.bool
};

TimeControls.propTypes = {
  dispatch: PropTypes.func,
  showControls: PropTypes.bool,
  adagucActions: PropTypes.shape({
    toggleAnimation: PropTypes.func
  }),
  animationSettings: PropTypes.shape({
    animate: PropTypes.bool,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  panel: PropTypes.object,
  currentTime: PropTypes.string
};

LayerManagerPanel.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  dispatch: PropTypes.func.isRequired,
  panelsProperties: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object,
  adagucActions: PropTypes.shape({
    toggleAnimation: PropTypes.func
  }),
  panelsActions: PropTypes.object,
  animationSettings: PropTypes.shape({
    animate: PropTypes.bool,
    duration: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })
};

export default LayerManagerPanel;
