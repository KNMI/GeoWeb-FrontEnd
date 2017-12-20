import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { default as LayerManager } from './ADAGUC/LayerManager';
import { default as TimeComponent } from './ADAGUC/TimeComponent';
import { default as Panel } from './Panel';
import { Row, Col, Button, Modal, ModalBody, Input, Label, ListGroup, ListGroupItem, ModalFooter } from 'reactstrap';
import { Icon } from 'react-fa';
import PropTypes from 'prop-types';
import cloneDeep from 'lodash.clonedeep';

var elementResizeEvent = require('element-resize-event');

class LayerManagerPanel extends PureComponent {
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
    this.state = {
      width: 0,
      height: 0,
      inputValue: this.props.adagucProperties.animationSettings.duration,
      initialized: false
    };
  }
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
          opacity: 1,
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
    if (direction === 'up')
      nextTime = timeDimension.getValueForIndex(index + 1);
    else
      nextTime = timeDimension.getValueForIndex(index - 1);
    dispatch(adagucActions.setTimeDimension(nextTime));
  }
  handleDurationUpdate(e) {
    this.setState({ inputValue: e.target.value });
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.inputValue !== this.state.inputValue &&
        this.state.inputValue !== '' && !isNaN(this.state.inputValue) &&
        this.props.adagucProperties.animationSettings.duration !== this.state.inputValue) {
      this.props.dispatch(this.props.adagucActions.setAnimationLength(parseInt(this.state.inputValue)));

      if (this.state.wasAnimating && !this.props.adagucProperties.animationSettings.animate) {
        this.setState({ wasAnimating: false });
        this.props.dispatch(this.props.adagucActions.toggleAnimation());
      }
    }
    if (this.state.inputValue === '' && prevState.inputValue !== '' &&
        this.props.adagucProperties.animationSettings.animate) {
      this.setState({ wasAnimating: true });
      this.props.dispatch(this.props.adagucActions.toggleAnimation());
    }
  }

  render () {
    const { title, dispatch, adagucProperties, layers, mapProperties, adagucActions } = this.props;
    const { sources, animationSettings } = adagucProperties;
    return (
      <Panel title={title}>
        <Row style={{ flex: 1 }}>
          {this.renderLayerChooser(this.props.adagucProperties.sources)}
          <Col xs='auto' style={{ flexDirection: 'column-reverse', marginRight: '.33rem' }}>
            <Row style={{ alignItems: 'center' }}>
              <Button style={{ width: '3rem', marginRight: '0.25rem' }} onClick={() => { this.props.dispatch(this.props.adagucActions.toggleAnimation()); }} color='primary' className='row' title='Play animation'>
                <Icon name={this.props.adagucProperties.animationSettings.animate ? 'pause' : 'play'} />
              </Button>
              <Button style={{ width: '3rem', marginRight: '0.5rem' }} onClick={this.goToNow} color='primary' className='row' title='Go to current time'>
                <Icon name='clock-o' />
              </Button>
              <Row>
                <Input style={{ maxWidth: '7rem' }} value={this.state.inputValue} onChange={this.handleDurationUpdate}
                placeholder="Duration" type="number" step="1" min="0" ref={elm=>{this.durationInput=elm}}/>
              </Row>
            </Row>
            <Row style={{ marginBottom: '.33rem' }}>
              <Button className='row' color='primary' style={{ width: '3rem', marginRight: '0.25rem' }} onClick={() => this.handleButtonClickNextPrev('down')}>
                <Icon name='step-backward' />
              </Button>
              <Button className='row' color='primary' style={{ width: '3rem', marginRight: '0.5rem' }} onClick={() => this.handleButtonClickNextPrev('up')}>
                <Icon name='step-forward' />
              </Button>
            </Row>
            <Row />
          </Col>
          <Col style={{ flex: 1, flexDirection: 'column-reverse' }}>
            <Row style={{ flex: 1 }}>
              <TimeComponent activeMapId={mapProperties.activeMapId} width={this.state.width} panel={layers.panels[mapProperties.activeMapId]} height={this.state.height} timedim={adagucProperties.timeDimension}
                wmjslayers={layers.wmjsLayers} layerActions={this.props.layerActions} dispatch={dispatch} adagucActions={this.props.adagucActions} ref={(panel) => this.setResizeListener(ReactDOM.findDOMNode(panel))} />
              <LayerManager wmjslayers={layers.wmjsLayers} dispatch={dispatch} layerActions={this.props.layerActions}
                adagucActions={this.props.adagucActions} baselayer={layers.baselayer} panel={layers.panels[mapProperties.activeMapId]} activeMapId={mapProperties.activeMapId} />
            </Row>
            <Row />
          </Col>
          <Col xs='auto' style={{ flexDirection: 'column-reverse', marginLeft: '.66rem' }}>
            <Row>
              <Button disabled={Array.isArray(sources) || Object.keys(sources).length === 0} onClick={this.toggleLayerChooser}
                color='primary' className='row' title='Add layers'>
                <Icon name='plus' />
              </Button>
            </Row>
            <Row />
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
