import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Popover, InputGroup,
Input,
InputGroupButton, PopoverTitle, PopoverContent, ButtonGroup, TabContent, TabPane, Nav, NavItem, NavLink, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import Panel from '../components/Panel';
import { BOUNDING_BOXES } from '../routes/ADAGUC/constants/bounding_boxes';
import { Icon } from 'react-fa';
import classnames from 'classnames';
import { Typeahead } from 'react-bootstrap-typeahead';
import CanvasComponent from '../routes/ADAGUC/components/CanvasComponent';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';
import axios from 'axios';
var moment = require('moment');
class MapActionContainer extends Component {
  constructor (props) {
    super(props);
    // Toggles
    this.togglePopside = this.togglePopside.bind(this);
    this.toggleProgtempPopover = this.toggleProgtempPopover.bind(this);
    // Button handlers
    this.toggleAnimation = this.toggleAnimation.bind(this);
    this.toggleLayerChooser = this.toggleLayerChooser.bind(this);
    this.goToNow = this.goToNow.bind(this);
    this.setView = this.setView.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
    this.handleAddSource = this.handleAddSource.bind(this);
    this.setChosenLocation = this.setChosenLocation.bind(this);

    // Render functions
    this.renderPopOver = this.renderPopOver.bind(this);
    this.renderLayerChooser = this.renderLayerChooser.bind(this);
    // Helper
    this.generateMap = this.generateMap.bind(this);
    this.handleAddLayer = this.handleAddLayer.bind(this);
    this.getLayerName = this.getLayerName.bind(this);
    this.handleSourceClick = this.handleSourceClick.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
    this.renderSourceSelector = this.renderSourceSelector.bind(this);
    this.renderPresetSelector = this.renderPresetSelector.bind(this);
    this.setPreset = this.setPreset.bind(this);
    this.getServices = this.getServices.bind(this);
    this.padLeft = this.padLeft.bind(this);
    this.renderProgtempData = this.renderProgtempData.bind(this);
    this.modifyData = this.modifyData.bind(this);
    // State
    this.state = {
      collapse: false,
      popoverOpen: false,
      layerChooserOpen: false,
      activeTab: '1',
      canvasWidth: 480,
      canvasHeight: 670
    };
    this.progtempLocations = [
      {
        name: 'EHAM',
        x: 4.77,
        y: 52.30
      }, {
        name: 'EHRD',
        x: 4.42,
        y: 51.95
      }, {
        name: 'EHTW',
        x: 6.98,
        y: 52.28
      }, {
        name: 'EHBK',
        x: 5.76,
        y: 50.95
      }, {
        name: 'EHFS',
        x: 3.68,
        y: 51.46
      }, {
        name: 'EHDB',
        x: 5.18,
        y: 52.12
      }, {
        name: 'EHGG',
        x: 6.57,
        y: 53.10
      }, {
        name: 'EHKD',
        x: 4.74,
        y: 52.93
      }, {
        name: 'EHAK',
        x: 3.81,
        y: 55.399
      }, {
        name: 'EHDV',
        x: 2.28,
        y: 53.36
      }, {
        name: 'EHFZ',
        x: 3.94,
        y: 54.12
      }, {
        name: 'EHFD',
        x: 4.67,
        y: 54.83
      }, {
        name: 'EHHW',
        x: 6.04,
        y: 52.037
      }, {
        name: 'EHKV',
        x: 3.68,
        y: 53.23
      }, {
        name: 'EHMG',
        x: 4.93,
        y: 53.63
      }, {
        name: 'EHMA',
        x: 5.94,
        y: 53.54
      }, {
        name: 'EHQE',
        x: 4.15,
        y: 52.92
      }, {
        name: 'EHPG',
        x: 3.3416,
        y: 52.36
      }
    ];
  }
  padLeft (nr, n, str) {
    return Array(n - String(nr).length + 1).join(str || '0') + nr;
  }

  getServices () {
    const { dispatch, actions } = this.props;
    const defaultURLs = ['getServices', 'getOverlayServices'].map((url) => BACKEND_SERVER_URL + '/' + url);
    const allURLs = [...defaultURLs];
    axios.all(allURLs.map((req) => axios.get(req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => dispatch(actions.createMap([...services.data, ...JSON.parse(localStorage.getItem('geoweb')).personal_urls], overlays.data[0])))
    ).catch((e) => console.log('Error!: ', e.response));
  }

  handleAddSource (e) {
    var url = document.querySelector('#sourceurlinput').value;
    let items = JSON.parse(localStorage.getItem('geoweb'));
    // eslint-disable-next-line no-undef
    var getCap = WMJSgetServiceFromStore(url);
    getCap.getCapabilities((e) => {
      const newServiceObj = {
        name: getCap.name ? getCap.name : getCap.title,
        title: getCap.title,
        service: getCap.service,
        abstract: getCap.abstract
      };
      if (!items['personal_urls']) {
        items['personal_urls'] = [newServiceObj];
      } else {
        items['personal_urls'].push(newServiceObj);
      }
      localStorage.setItem('geoweb', JSON.stringify(items));
      this.getServices();
      getCap.getLayerObjectsFlat((layers) => this.props.dispatch(this.props.actions.addLayer({ ...layers[0], service: getCap.service })));
      this.toggleLayerChooser();
    });
  }

  handleActionClick (action) {
    if (action === 'progtemp') {
      this.setState({ progTempPopOverOpen: true });
    } else {
      this.setState({ progTempPopOverOpen: false });
    }
    this.props.dispatch(this.props.actions.setMapMode(action));
  }
  handleAddLayer (e) {
    const addItem = e[0];
    if (!this.state.overlay) {
      this.props.dispatch(this.props.actions.addLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label, opacity: 1 }));
    } else {
      this.props.dispatch(this.props.actions.addOverlayLayer({ service: this.state.selectedSource.service, title: this.state.selectedSource.title, name: addItem.id, label: addItem.label }));
    }
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false,
      action: null,
      layers: null
    });
  }

  generateMap (layers) {
    let layerobjs = [];
    for (var i = 0; i < layers.length; ++i) {
      layerobjs.push({ id: layers[i].name, label: layers[i].text });
    }
    this.setState({
      layers: layerobjs,
      activeTab: '3'
    });
  }
  handleSourceClick (e) {
    const { adagucProperties } = this.props;
    const { sources } = adagucProperties;
    let selectedSource = sources.data.filter((source) => source.name === e.currentTarget.id);
    if (!selectedSource || selectedSource.length === 0) {
      selectedSource = sources.overlay.filter((source) => source.name === e.currentTarget.id);
      this.setState({ overlay: true });
    } else {
      this.setState({ overlay: false });
    }
    const selectedService = selectedSource[0];

    // eslint-disable-next-line no-undef
    var srv = WMJSgetServiceFromStore(selectedService.service);
    this.setState({ selectedSource: selectedService });
    srv.getLayerObjectsFlat((layers) => this.generateMap(layers), (err) => { throw new Error(err); });
  }

  toggleLayerChooser () {
    this.setState({ layerChooserOpen: !this.state.layerChooserOpen });
  }
  toggleAnimation () {
    const { dispatch, actions } = this.props;
    dispatch(actions.toggleAnimation());
  }
  togglePopside () {
    this.setState({ popoverOpen: !this.state.popoverOpen });
  }
  toggleProgtempPopover () {
    this.setState({ progTempPopOverOpen: !this.state.progTempPopOverOpen });
  }
  goToNow () {
    const { dispatch, actions } = this.props;
    // eslint-disable-next-line no-undef
    let currentDate = getCurrentDateIso8601();
    dispatch(actions.setTimeDimension(currentDate.toISO8601()));
  }
  setView (e) {
    const { dispatch, actions } = this.props;
    dispatch(actions.setCut(BOUNDING_BOXES[e.currentTarget.id]));
    this.setState({ popoverOpen: false });
  }
  renderPopOver () {
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
  getLayerName (layer) {
    if (layer) {
      switch (layer.title) {
        case 'OBS':
          return 'Observations';
        case 'SAT':
          return 'Satellite';
        case 'LGT':
          return 'Lightning';
        case 'HARM_N25_EXT':
          return 'HARMONIE (EXT)';
        case 'HARM_N25':
          return 'HARMONIE';
        case 'OVL':
          return 'Overlay';
        case 'RADAR_EXT':
          return 'Radar (EXT)';
        default:
          return layer.title;
      }
    }
    return '';
  }
  toggleTab (e) {
    const id = (e.currentTarget.id);
    if (id.includes('tab')) {
      this.setState({ activeTab:  id.slice(3) });
    }
  }

  renderSourceSelector () {
    const { adagucProperties } = this.props;
    const { sources } = adagucProperties;
    return <div>{sources.data.map((src, i) => <Button id={src.name} key={i} onClick={this.handleSourceClick}>{this.getLayerName(src)}</Button>)}
      {sources.overlay.map((src, i) => <Button id={src.name} key={i} onClick={this.handleSourceClick}>{this.getLayerName(src)}</Button>)}</div>;
  }
  renderPresetSelector () {
    return <Button onClick={this.setPreset}>SIGMET Thunderstorm</Button>;
  }

  renderURLInput () {
    return (
      <InputGroup>
        <Input id='sourceurlinput' placeholder='Add your own source' />
        <InputGroupButton>
          <Button color='primary' onClick={this.handleAddSource}>Add</Button>
        </InputGroupButton>
      </InputGroup>
    );
  }

  setPreset () {
    const { dispatch, actions } = this.props;
    dispatch(actions.prepareSIGMET());
    this.setState({
      layerChooserOpen: false,
      activeTab: '1',
      selectedSource: null,
      overlay: false,
      action: null,
      layers: null,
      presetUnit: null
    });
  }

  renderBaseProgtemp (canvasWidth, canvasHeight) {
    var canvasBG = document.getElementById('bijvoetCanvas');
    // eslint-disable-next-line no-undef
    drawProgtempBg(canvasBG, canvasWidth, canvasHeight);
  }

  modifyData (data, referenceTime, timeOffset) {
    console.log(timeOffset);
    function fetchData (data, referenceTime, timeOffset, name) {
      let selectedData = data.filter((obj) => obj.name === name)[0].data;
      selectedData = (selectedData[Object.keys(selectedData)[timeOffset]]);
      let selectedObjs = Object.keys(selectedData).map((key) => parseFloat(selectedData[key][Object.keys(selectedData[key])[0]]));
      return selectedObjs;
    }

    function getWindInfo (windX, windY) {
      let toRadians = (deg) => {
        return (deg / 180) * Math.PI;
      };
      let toDegrees = (rad) => {
        return (((rad / Math.PI) * 180) + 360) % 360;
      };

      let windSpeed = [];
      let windDirection = [];
      for (var i = 0; i < windX.length; ++i) {
        windSpeed.push(Math.sqrt(windX[i] * windX[i] + windY[i] * windY[i]));
        windDirection.push(toDegrees(toRadians(270) - Math.atan2(windY[i], windX[i])));
      }
      return { windSpeed, windDirection };
    }

    function computeTwTv (T, Td, pressure) {
      let Tw = [];
      let Tv = [];
      for (var i = 0; i < T.length; ++i) {
        // eslint-disable-next-line no-undef
        Tw = calc_Tw(T[i], Td[i], pressure[i]);
        // eslint-disable-next-line no-undef
        Tv = calc_Tv(T[i], Td[i], pressure[i]);
      }
      return { Tw, Tv };
    }
    let pressureData = fetchData(data, referenceTime, timeOffset, 'air_pressure__at_ml');
    let airTemp = fetchData(data, referenceTime, timeOffset, 'air_temperature__at_ml');
    let windXData = fetchData(data, referenceTime, timeOffset, 'x_wind__at_ml');
    let windYData = fetchData(data, referenceTime, timeOffset, 'y_wind__at_ml');
    let { windSpeed, windDirection } = getWindInfo(windXData, windYData);
    let dewTemp = fetchData(data, referenceTime, timeOffset, 'dewpoint_temperature__at_ml');
    let { Tw, Tv } = computeTwTv(airTemp, dewTemp, pressureData);
    return { PSounding: pressureData, TSounding: airTemp, TdSounding: dewTemp, ddSounding: windDirection, ffSounding: windSpeed, TwSounding: Tw, TvSounding: Tv };
  }
  renderProgtempData (canvasWidth, canvasHeight, timeOffset) {
    if (!this.progtempData) {
      return;
    }
    if (timeOffset < 0 || timeOffset > 48) {
      return;
    }
    var canvas = document.getElementById('canvasOverlay');
    if (!canvas) {
      return;
    }
    const { PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding, TvSounding } = this.modifyData(this.progtempData, this.referenceTime, timeOffset);
    // eslint-disable-next-line no-undef
    drawProgtemp(canvas, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding, TvSounding);
    // eslint-disable-next-line no-undef
    plotHodo(canvas, canvasWidth, canvasHeight, PSounding, TSounding, TdSounding, ddSounding, ffSounding, TwSounding);
  }
  setChosenLocation (loc) {
    this.props.dispatch(this.props.actions.progtempLocation(loc[0]));
  }
  renderProgtempPopover (adagucTime) {
    function convertMinSec (loc) {
      function padLeft (nr, n, str) {
        return Array(n - String(nr).length + 1).join(str || '0') + nr;
      }

      const behindComma = (loc - Math.floor(loc));

      const minutes = behindComma * 60;
      const seconds = Math.floor((minutes - Math.floor(minutes)) * 60);

      return Math.floor(loc) + ':' + padLeft(Math.floor(minutes), 2, '0') + ':' + padLeft(seconds, 2, '0');
    }
    const maxWidth = this.state.canvasWidth + 'px';
    const maxHeight = this.state.canvasHeight + 'px';
    const offset = '-' + this.state.canvasHeight + 'px';
    const { progtemp } = this.props.adagucProperties;
    const now = moment(moment.utc().format('YYYY-MM-DDTHH:mm:ss'));
    const timeOffset = Math.floor(moment.duration(adagucTime.diff(now)).asHours()).toString();
    return (
      <Popover placement='left' isOpen={this.state.progTempPopOverOpen} target='progtemp_button'>
        {progtemp && progtemp.location
          ? <PopoverTitle>Location: {progtemp.location.name ? progtemp.location.name : convertMinSec(progtemp.location.x) + ', ' + convertMinSec(progtemp.location.y)}</PopoverTitle>
          : <div />
        }
        <PopoverContent style={{ maxWidth: maxWidth, maxHeight: maxHeight }}>
          <CanvasComponent id='bijvoetCanvas' style={{ display: 'block' }} width={this.state.canvasWidth}
            height={this.state.canvasHeight} onRenderCanvas={() => this.renderBaseProgtemp(this.state.canvasWidth, this.state.canvasHeight)} />
          <CanvasComponent id='canvasOverlay' style={{ marginTop: offset, display: 'block' }}
            width={this.state.canvasWidth} height={this.state.canvasHeight}
            onRenderCanvas={() => this.renderProgtempData(this.state.canvasWidth, this.state.canvasHeight, timeOffset)} />
          <div className='canvasLoadingOverlay' ref='canvasLoadingOverlay' />
          <Typeahead onChange={this.setChosenLocation} options={this.progtempLocations} labelKey='name' />
        </PopoverContent>
      </Popover>
    );
  }

  renderLayerChooser () {
    return (<Modal id='addLayerModal' isOpen={this.state.layerChooserOpen} toggle={this.toggleLayerChooser}>
      <ModalHeader>Choose Layer</ModalHeader>
      <Nav tabs>
        <NavItem>
          <NavLink id='tab1' className={classnames({ active: this.state.activeTab === '1' })} onClick={(e) => { this.toggleTab(e); }}>
            (1) - Select Action
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab2' className={classnames({ active: this.state.activeTab === '2' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            {this.state.action ? (this.state.action === 'addLayer' ? '(2) - Select Source' : (this.state.action === 'selectPreset' ? '(2) - Select Preset' : '(2) - Enter URL')) : ''}
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink id='tab3' className={classnames({ active: this.state.activeTab === '3' })} onClick={(e) => { this.toggleTab(e); }} disabled={!this.state.selectedSource}>
            {this.state.action ? (this.state.action === 'addLayer' ? '(3) - Select ' + this.getLayerName(this.state.selectedSource) + ' Layer' : '') : ''}
          </NavLink>
        </NavItem>
      </Nav>

      <ModalBody>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId='1'>
            <ButtonGroup>
              <Button onClick={() => this.setState({ action: 'addLayer', activeTab: '2' })}>Add Layer</Button>
              <Button onClick={() => this.setState({ action: 'selectPreset', activeTab: '2' })}>Select Preset</Button>
              <Button onClick={() => this.setState({ action: 'addCustomData', activeTab: '2' })}>Add Custom data</Button>
            </ButtonGroup>
          </TabPane>

          <TabPane tabId='2'>
            {this.state.action === 'addLayer'
              ? this.renderSourceSelector()
              : this.state.action === 'selectPreset'
              ? this.renderPresetSelector()
              : this.renderURLInput()}
          </TabPane>
          <TabPane tabId='3'>
            <Typeahead onChange={this.handleAddLayer} options={this.state.layers ? this.state.layers : []} autofocus />
          </TabPane>
        </TabContent>
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={this.toggleLayerChooser}>Cancel</Button>
      </ModalFooter>
    </Modal>);
  }
  toggleCanvas () {
    var canvas = this.refs.canvasLoadingOverlay;
    const attribute = canvas.getAttribute('class');
    console.log(attribute);
    if (!attribute || attribute === 'canvasLoadingOverlay') {
      canvas.setAttribute('class', 'canvasLoadingOverlay canvasDisabled');
    } else {
      canvas.setAttribute('class', 'canvasLoadingOverlay');
    }
  }
  componentWillReceiveProps (nextProps) {
    const { adagucProperties } = nextProps;
    const { layers, wmjslayers, progtemp } = adagucProperties;
    if (wmjslayers.layers.length > 0 && layers.datalayers.filter((layer) => layer.title.includes('HARM')).length > 0) {
      const harmlayer = wmjslayers.layers.filter((layer) => layer.service.includes('HARM'))[0];
      this.referenceTime = harmlayer.getDimension('reference_time').currentValue;
      // this.referenceTime = '2017-03-23T09:00:00';
    }
    if (progtemp && this.props.adagucProperties.progtemp !== progtemp) {
      const { location } = progtemp;
      const harmlayer = wmjslayers.layers.filter((layer) => layer.service.includes('HARM'))[0];
      const refTime = harmlayer.getDimension('reference_time').currentValue;
      if (location && (refTime !== this.referenceTime || !this.props.adagucProperties.progtemp ||
        !this.props.adagucProperties.location || location !== this.props.adagucProperties.progtemp.location)) {
        this.referenceTime = refTime;
        // this.referenceTime = '2017-03-23T09:00:00';
        const url = `http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.HARM_N25_ML.cgi?SERVICE=WMS&&SERVICE=WMS&VERSION=1.3.0
&REQUEST=GetPointValue&LAYERS=&QUERY_LAYERS=air_pressure__at_ml,y_wind__at_ml,x_wind__at_ml,dewpoint_temperature__at_ml,air_temperature__at_ml
&CRS=EPSG%3A4326&INFO_FORMAT=application/json&time=*&DIM_reference_time=` + this.referenceTime + `&x=` + location.x + `&y=` + location.y + `&DIM_modellevel=*`;
        console.log(url);
        this.toggleCanvas();
        axios.get(url).then((res) => {
          if (res.data.includes('No data available')) {
            console.log('no data');
            this.toggleCanvas();
            return;
          }
          console.log(res.data);
          this.toggleCanvas();
          this.progtempData = res.data;
          this.renderProgtempData(this.state.canvasWidth, this.state.canvasHeight, Math.floor(moment.duration(moment.utc(adagucProperties.timedim).diff(moment.utc(this.referenceTime))).asHours()));
        });
      }
    }
    if (this.props.adagucProperties.timedim !== adagucProperties.timedim) {
      const diff = Math.floor(moment.duration(moment.utc(adagucProperties.timedim).diff(moment.utc(this.referenceTime))).asHours());
      this.renderProgtempData(this.state.canvasWidth, this.state.canvasHeight, diff);
    }
  }
  render () {
    const { title, adagucProperties } = this.props;
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
        icon: 'line-chart',
        disabled: true
      },
      {
        title: 'Show progtemp',
        action: 'progtemp',
        icon: 'bolt',
        onClick: 'progtemp'
      }
    ];
    return (
      <Col className='MapActionContainer'>
        {this.renderLayerChooser()}
        {this.renderPopOver()}
        {this.renderProgtempPopover(moment.utc(adagucProperties.timedim))}
        <Panel className='Panel' title={title}>
          {items.map((item, index) =>
            <Button color='primary' key={index} active={adagucProperties.mapMode === item.action} disabled={item.disabled || null}
              className='row' id={item.action + '_button'} title={item.title} onClick={() => this.handleActionClick(item.action)}>
              <Icon name={item.icon} />
            </Button>)}
          <Row style={{ flex: 1 }} />
          <Button onClick={this.toggleLayerChooser} color='primary' className='row' title='Choose layers'>
            <Icon name='bars' />
          </Button>
          <Button onClick={this.toggleAnimation} color='primary' className='row' title='Play animation'>
            <Icon name={this.props.adagucProperties.animate ? 'pause' : 'play'} />
          </Button>
          <Button onClick={this.goToNow} color='primary' className='row' title='Go to current time'>
            <Icon name='clock-o' />
          </Button>
          <Button onClick={this.togglePopside} id='setAreaButton' color='primary' className='row' title='Set area'>
            <Icon name='flag' />
          </Button>
        </Panel>
      </Col>
    );
  }
}

MapActionContainer.propTypes = {
  title: PropTypes.string,
  dispatch: PropTypes.func.isRequired,
  actions: PropTypes.object.isRequired,
  adagucProperties: PropTypes.object
};

export default MapActionContainer;
