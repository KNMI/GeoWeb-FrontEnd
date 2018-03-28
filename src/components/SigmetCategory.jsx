import React, { Component } from 'react';
import { Button, ButtonGroup, Col, Row, Badge, Card, CardHeader, CardBlock, Alert, Input, InputGroupAddon, InputGroup } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import Icon from 'react-fa';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import isEmpty from 'lodash.isempty';
import isEqual from 'lodash.isequal';
import update from 'immutability-helper';
import CollapseOmni from '../components/CollapseOmni';
import SwitchButton from 'lyef-switch-button';
import 'lyef-switch-button/css/main.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import DateTimePicker from 'react-datetime';

import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import PropTypes from 'prop-types';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { GetServiceByName } from '../utils/getServiceByName';

import { BACKEND_SERVER_URL } from '../static/urls.json';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const DATE_FORMAT = 'DD MMM YYYY';
const TIME_FORMAT = 'HH:mm UTC';
const DATE_TIME_FORMAT = 'DD MMM YYYY HH:mm UTC';
const SEPARATOR = '_';
const TAG_NAMES = {
  DIV: 'div',
  SPAN: 'span'
};
const UNIT_M = 'm';
const UNIT_FL = 'FL';
const UNIT_FT = 'ft';
const EMPTY_GEO_JSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: []
      },
      properties: {
        'sigmettype':'start',
        'stroke': '#a734d7',
        'stroke-width': 5,
        'stroke-opacity': 1,
        'fill': '#33cc00',
        'fill-opacity': 0.5
      }
    },
    { type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: []
      },
      properties: {
        'sigmettype':'end',
        'stroke': '#000000',
        'stroke-width': 2,
        'stroke-opacity': 1,
        'fill': '#FF8888',
        'fill-opacity': 1.0
      }
    }
  ]
};
const EMPTY_SIGMET = {
  geojson: EMPTY_GEO_JSON,
  phenomenon: '',
  obs_or_forecast: {
    obs: true
  },
  level: {
    lev1: {
      value: 100.0,
      unit: 'FL'
    }
  },
  movement: {
    stationary: true
  },
  change: 'NC',
  forecast_position: '',
  issuedate: '',
  validdate: moment().utc().format(),
  validdate_end: moment().utc().add(4, 'hour').format(),
  firname: 'AMSTERDAM FIR',
  location_indicator_icao: 'EHAA',
  location_indicator_mwo: 'EHDB',
  uuid: '00000000-0000-0000-0000-000000000000',
  status: 'PRODUCTION'
};

const FALLBACK_PARAMS = {
  maxhoursofvalidity: 4,
  hoursbeforevalidity: 4,
  firareas: [
    {
      location_indicator_icao: 'EHAA',
      firname: 'AMSTERDAM FIR',
      areapreset: 'NL_FIR'
    }
  ],
  location_indicator_wmo: 'EHDB'
};

class SigmetCategory extends Component {
  constructor (props) {
    super(props);
    this.onObsOrFcstClick = this.onObsOrFcstClick.bind(this);
    this.handleSigmetClick = this.handleSigmetClick.bind(this);
    this.handleActionClick = this.handleActionClick.bind(this);
    this.saveSigmet = this.saveSigmet.bind(this);
    this.deleteDrawing = this.deleteDrawing.bind(this);
    this.publishSigmet = this.publishSigmet.bind(this);
    this.savedSigmetCallback = this.savedSigmetCallback.bind(this);
    this.getExistingSigmets = this.getExistingSigmets.bind(this);
    this.gotExistingSigmetsCallback = this.gotExistingSigmetsCallback.bind(this);
    this.getDirections = this.getDirections.bind(this);
    this.getChanges = this.getChanges.bind(this);
    this.setSelectedMovement = this.setSelectedMovement.bind(this);
    this.setSelectedDirection = this.setSelectedDirection.bind(this);
    this.setSpeed = this.setSpeed.bind(this);
    this.setChange = this.setChange.bind(this);
    this.setTops = this.setTops.bind(this);
    this.state = {
      isOpen: props.isOpen,
      isClosing: props.isClosing,
      list: [EMPTY_SIGMET],
      renderRange: false,
      lowerUnit: UNIT_FL
    };
  }

  // get Human Readable Text for Code
  getHRT4code (code) {
    const { phenomenonMapping } = this.props;
    const UNKNOWN = 'Unknown';
    if (!phenomenonMapping) {
      return UNKNOWN;
    }
    if (typeof code === 'undefined') {
      return UNKNOWN;
    }
    const codeFragments = code.split(SEPARATOR);
    if (codeFragments.length < 2) {
      return UNKNOWN;
    }
    let result = '';
    let variantIndex;
    let additionIndex;
    let effectiveMapping = cloneDeep(phenomenonMapping).filter((item) => code.startsWith(item.phenomenon.code));
    if (effectiveMapping.length === 1) {
      if (effectiveMapping[0].phenomenon.code === code) {
        effectiveMapping[0].variants = [];
        effectiveMapping[0].additions = [];
      }
    } else {
      effectiveMapping = cloneDeep(phenomenonMapping).map((item) => {
        if (item.variants.length > 0) {
          variantIndex = item.variants.findIndex((variant) => codeFragments[0].startsWith(variant.code));
          if (variantIndex > -1) {
            item.variants = [item.variants[variantIndex]];
            return item;
          }
        } else if (item.phenomenon.code.startsWith(codeFragments[0])) {
          return item;
        }
      }).filter((item) => typeof item !== 'undefined').filter((item) => {
        if (item.variants.length > 0) {
          return codeFragments[1].startsWith(item.phenomenon.code);
        } else {
          return true;
        }
      }).map((item) => {
        if (item.additions.length > 0) {
          additionIndex = item.additions.findIndex((addition) => codeFragments[1].endsWith(addition.code));
          if (additionIndex > -1) {
            item.additions = [item.additions[additionIndex]];
            return item;
          } else if (codeFragments.length > 2) {
            additionIndex = item.additions.findIndex((addition) => codeFragments[2].endsWith(addition.code));
            if (additionIndex > -1) {
              item.additions = [item.additions[additionIndex]];
              return item;
            }
          }
        }
        item.additions = [];
        return item;
      });
    }
    if (effectiveMapping.length === 1) {
      if (effectiveMapping[0].variants.length === 1) {
        result = effectiveMapping[0].variants[0].name + ' ' + effectiveMapping[0].phenomenon.name.toLowerCase();
      } else if (effectiveMapping[0].variants.length === 0) {
        result = effectiveMapping[0].phenomenon.name;
      } else {
        result = UNKNOWN;
      }
      if (effectiveMapping[0].additions.length === 1) {
        result += ' ' + effectiveMapping[0].additions[0].name;
      }
      return result;
    }
    return UNKNOWN;
  }

  getPhenomena () {
    const { phenomenonMapping } = this.props;
    let result = [];
    if (Array.isArray(phenomenonMapping)) {
      phenomenonMapping.forEach((item) => {
        if (item.variants.length === 0) {
          const res = {
            name: item.phenomenon.name,
            code: item.phenomenon.code,
            layerpreset: item.phenomenon.layerpreset
          };
          item.additions.forEach((addition) => {
            result.push({
              name: res.name + ' ' + addition.name,
              code: res.code + SEPARATOR + addition.code,
              layerpreset: item.phenomenon.layerpreset
            });
          });
          result.push(res);
        } else {
          item.variants.forEach((variant) => {
            const res = {
              name: variant.name + ' ' + item.phenomenon.name.toLowerCase(),
              code: variant.code + SEPARATOR + item.phenomenon.code,
              layerpreset: item.phenomenon.layerpreset
            };
            item.additions.forEach((addition) => {
              result.push({
                name: res.name + ' ' + addition.name,
                code: res.code + addition.code,
                layerpreset: item.phenomenon.layerpreset
              });
            });
            result.push(res);
          });
        }
      });
    }
    return result;
  }

  getParameters () {
    let { parameters } = this.props;
    if (isEmpty(parameters)) {
      parameters = FALLBACK_PARAMS;
    }
    return parameters;
  }

  /**
   * Gets Cardinal, intercardinal and named points for directions of wind
   */
  getDirections () {
    return [
      { shortName: 'N', longName: 'North' },
      { shortName: 'NNE', longName: 'North-Northeast' },
      { shortName: 'NE', longName: 'Northeast' },
      { shortName: 'ENE', longName: 'East-Northeast' },
      { shortName: 'E', longName: 'East' },
      { shortName: 'ESE', longName: 'East-Southeast' },
      { shortName: 'SE', longName: 'Southeast' },
      { shortName: 'SSE', longName: 'South-Southeast' },
      { shortName: 'S', longName: 'South' },
      { shortName: 'SSW', longName: 'South-Southwest' },
      { shortName: 'SW', longName: 'Southwest' },
      { shortName: 'WSW', longName: 'West-Southwest' },
      { shortName: 'W', longName: 'West' },
      { shortName: 'WNW', longName: 'West-Northwest' }
    ];
  }

  /**
   * Gets change types
   */
  getChanges () {
    return [
      { shortName: 'WKN', longName: 'Weakening' },
      { shortName: 'NC', longName: 'No change' },
      { shortName: 'INTSF', longName: 'Intensifying' }
    ];
  }

  hasTagName (element, tagName) {
    return element.tagName.toLowerCase() === tagName;
  }

  handleSigmetClick (evt, index) {
    let shouldContinue = false;
    if (!this.props.editable) {
      shouldContinue = true;
    } else if (this.props.selectedIndex !== 0) {
      shouldContinue = true;
    } else if (this.hasTagName(evt.target, TAG_NAMES.DIV) && evt.target.classList.contains('row')) {
      shouldContinue = true;
    } else if (this.hasTagName(evt.target, TAG_NAMES.SPAN) && evt.target.classList.contains('badge')) {
      shouldContinue = true;
    }

    if (shouldContinue) {
      this.props.selectMethod(index, this.state.list[index].geojson);
    }
  }

  handleActionClick (action, sigmetPart) {
    console.log(`Selection method for SIGMET part ${sigmetPart} is called`);
    switch (action) {
      case 'select-point':
      case 'select-region':
      case 'select-shape':
      case 'select-fir':
        console.log(`Selection method ${action} not yet implemented`);
        break;
      case 'delete-selection':
        this.deleteDrawing();
        break;
      default:
        console.log(`Selection method ${action} unknown and not implemented`);
    }
  }

  onObsOrFcstClick (obsSelected) {
    const newList = cloneDeep(this.state.list);
    newList[0].obs_or_forecast.obs = obsSelected;
    this.setState({ list: newList });
  }

  saveSigmet (evt) {
    evt.preventDefault();
    const newList = cloneDeep(this.state.list);
    newList[0].geojson = this.props.drawProperties.geojson;
    this.setState({ list: newList });
    axios({
      method: 'post',
      url: this.props.source,
      withCredentials: true,
      responseType: 'json',
      data: newList[0]
    }).then(src => {
      this.savedSigmetCallback(src);
    }).catch(error => {
      this.couldntSaveSigmetCallback(error.response);
    });
  }

  deleteDrawing () {
    const newList = cloneDeep(this.state.list);
    newList[0].geojson = EMPTY_GEO_JSON;
    this.setState({ list: newList });
    // TODO: call reducer to update redux state
  }

  publishSigmet (uuid) {
    axios({
      method: 'post',
      url: BACKEND_SERVER_URL + '/sigmet/publishsigmet?uuid=' + uuid,
      withCredentials: true
    }).then((src) => {
      this.props.updateAllComponents();
    });
  }

  sigmetLayers (p) {
    const HARMONIE_URL = GetServiceByName(this.props.sources, 'Harmonie36');
    const OVERLAY_URL = GetServiceByName(this.props.sources, 'OVL');
    const OBSERVATIONS_URL = GetServiceByName(this.props.sources, 'OBS');
    const RADAR_URL = GetServiceByName(this.props.sources, 'RADAR');
    const LIGHTNING_URL = GetServiceByName(this.props.sources, 'LGT');
    const SATELLITE_URL = GetServiceByName(this.props.sources, 'SAT');
    const HARMONIE_ML_URL = GetServiceByName(this.props.sources, 'Harmonie36');
    switch (p) {
      case 'sigmet_layer_TS':
        return (
          {
            area: {
              bottom: BOUNDING_BOXES[1].bbox[1],
              top: BOUNDING_BOXES[1].bbox[3],
              crs: 'EPSG:3857'
            },
            display: {
              npanels: 4,
              type: 'quaduneven'
            },
            panelsProperties: [
              [
                {
                  service: HARMONIE_URL,
                  title: 'Harmonie36',
                  name: 'precipitation_flux',
                  label: 'Prec: Precipitation rate',
                  opacity: 1,
                  enabled: true,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ],
              [
                {
                  service: OBSERVATIONS_URL,
                  title: 'OBS',
                  name: '10M/ww',
                  label: 'wawa Weather Code (ww)',
                  enabled: true,
                  opacity: 1,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ],
              [
                {
                  service: RADAR_URL,
                  title: 'RADAR',
                  name: 'precipitation',
                  label: 'Neerslag',
                  opacity: 1,
                  enabled: true,
                  overlay: false
                }, {
                  service: LIGHTNING_URL,
                  title: 'LGT',
                  name: 'LGT_NL25_LAM_05M',
                  label: 'LGT_NL25_LAM_05M',
                  enabled: true,
                  opacity: 1,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ],
              [
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ]
            ]
          }
        );

      case 'sigmet_layer_SEV_TURB':
        return (
          {
            area: {
              bottom: BOUNDING_BOXES[1].bbox[1],
              top: BOUNDING_BOXES[1].bbox[3],
              crs: 'EPSG:3857'
            },
            display: {
              npanels: 4,
              type: 'quaduneven'
            },
            panelsProperties: [
              [
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  overlay: true
                },
                {
                  service: HARMONIE_ML_URL,
                  title: 'ADAGUC WMS Service for Geoweb',
                  name: 'wind__at_ml',
                  label: 'Wind flags (ML)',
                  opacity: 1,
                  enabled: true,
                  modellevel: 17,
                  style: 'Windbarbs_mps/barbshaded',
                  styleTitle: 'Wind barbs+sh',
                  overlay: false
                }
              ], [], [],
              [
                {
                  service: OBSERVATIONS_URL,
                  title: 'OBS',
                  name: '10M/derived/windforce',
                  label: 'Wind force',
                  opacity: 1,
                  enabled: true,
                  style: 'bftalldiscvec/barb',
                  styleTitle: 'bftalldiscvec/barb',
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  overlay: true
                }
              ]
            ]
          }
        );
      case 'sigmet_layer_SEV_ICE':
        return (
          {
            area: {
              bottom: BOUNDING_BOXES[1].bbox[1],
              top: BOUNDING_BOXES[1].bbox[3],
              crs: 'EPSG:3857'
            },
            display: {
              npanels: 4,
              type: 'quaduneven'
            },
            panelsProperties: [
              [
                {
                  service: SATELLITE_URL,
                  title: 'SAT',
                  name: 'HRVIS',
                  label: 'HRVIS',
                  opacity: 1,
                  enabled: true,
                  overlay: false
                },
                {
                  service: RADAR_URL,
                  title: 'RADAR',
                  name: 'precipitation_eur',
                  label: 'Neerslag EUR',
                  opacity: 1,
                  overlay: false
                }
              ], [], [],
              [
                {
                  service: OBSERVATIONS_URL,
                  title: 'OBS',
                  name: '10M/td',
                  label: 'Dew Point Temperature 1.5m 1 Min Average (td)',
                  opacity: 1,
                  enabled: true,
                  style: 'auto/nearest',
                  styleTitle: 'auto/nearest',
                  overlay: false
                },
                {
                  service: OBSERVATIONS_URL,
                  title: 'OBS',
                  name: '10M/ta',
                  label: 'Air Temperature 1 Min Average (ta)',
                  opacity: 1,
                  enabled: true,
                  style: 'temperaturedisc/point',
                  styleTitle: 'temperaturedisc/point',
                  overlay: false
                }
              ]
            ]
          }
        );

      default:
        return (
          {
            area: {
              bottom: BOUNDING_BOXES[1].bbox[1],
              top: BOUNDING_BOXES[1].bbox[3],
              crs: 'EPSG:3857'
            },
            display: {
              npanels: 4,
              type: 'quaduneven'
            },
            panelsProperties: [
              [
                {
                  service: HARMONIE_URL,
                  title: 'Harmonie36',
                  name: 'precipitation_flux',
                  label: 'Prec: Precipitation rate',
                  opacity: 1,
                  enabled: true,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ],
              [
                {
                  service: OBSERVATIONS_URL,
                  title: 'OBS',
                  name: '10M/ww',
                  label: 'wawa Weather Code (ww)',
                  enabled: true,
                  opacity: 1,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ],
              [
                {
                  service: RADAR_URL,
                  title: 'RADAR',
                  name: 'precipitation',
                  label: 'Neerslag',
                  opacity: 1,
                  enabled: true,
                  overlay: false
                }, {
                  service: LIGHTNING_URL,
                  title: 'LGT',
                  name: 'LGT_NL25_LAM_05M',
                  label: 'LGT_NL25_LAM_05M',
                  enabled: true,
                  opacity: 1,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ],
              [
                {
                  service: SATELLITE_URL,
                  title: 'SAT',
                  name: 'HRV-COMB',
                  label: 'RGB-HRV-COMB',
                  enabled: true,
                  opacity: 1,
                  overlay: false
                },
                {
                  service: OVERLAY_URL,
                  title: 'OVL',
                  name: 'FIR_DEC_2013_EU',
                  label: 'FIR areas',
                  enabled: true,
                  overlay: true
                }
              ]
            ]
          }
        );
    }
  };

  setSelectedPhenomenon (phenomenonList) {
    if (phenomenonList.length === 0) {
      return;
    }
    const onlyObj = phenomenonList[0];
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].phenomenon = onlyObj.code;
    this.setState({ list: listCpy });
    /* const preset = this.sigmetLayers(onlyObj.layerpreset);
    this.props.dispatch(this.props.panelsActions.setPanelLayout(preset.display.type));
    this.props.dispatch(this.props.panelsActions.setPresetLayers(preset.panelsProperties));
    this.props.dispatch(this.props.mapActions.setCut({ name: 'Custom', bbox: [preset.area.left || 570875, preset.area.bottom, preset.area.right || 570875, preset.area.top] })); */
  }

  setSelectedFir (firList) {
    let firObj;
    if (firList.length === 0) {
      firObj = { firname: null, location_indicator_icao: null };
    } else {
      firObj = firList[0];
    }
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].firname = firObj.firname;
    listCpy[0].location_indicator_icao = firObj.location_indicator_icao;
    this.setState({ list: listCpy });
  }

  setSelectedObservedForecast (isObserved) {
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].obs_or_forecast = { obs: isObserved };
    this.setState({ list: listCpy });
  }

  setSelectedForecastPosition (forecastPosition) {
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].forecast_position = forecastPosition.utc().format();
    this.setState({ list: listCpy });
  }

  setSelectedValidFromMoment (validFrom) {
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].validdate = validFrom.utc().format();
    this.setState({ list: listCpy });
  }

  setSelectedValidUntilMoment (validUntil) {
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].validdate_end = validUntil.utc().format();
    this.setState({ list: listCpy });
  }

  setSelectedMovement (evt) {
    const isStationary = !evt.target.checked;
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].movement.stationary = isStationary;
    this.setState({ list: listCpy });
  }

  setSelectedDirection (dir) {
    if (Array.isArray(dir) && dir.length === 1) {
      const direction = dir[0].shortName;
      let listCpy = cloneDeep(this.state.list);
      listCpy[0].movement.dir = direction;
      this.setState({ list: listCpy });
    }
  }

  setSpeed (evt) {
    if (!isNaN(evt.target.value)) {
      const speed = evt.target.value;
      let listCpy = cloneDeep(this.state.list);
      listCpy[0].movement.speed = speed;
      this.setState({ list: listCpy });
    }
  }

  setChange (chg) {
    if (Array.isArray(chg) && chg.length === 1) {
      const change = chg[0].shortName;
      let listCpy = cloneDeep(this.state.list);
      listCpy[0].change = change;
      this.setState({ list: listCpy });
    }
  }

  getExistingSigmets () {
    axios({
      method: 'get',
      url: this.props.source,
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      this.gotExistingSigmetsCallback(src);
    }).catch(error => {
      this.gotExistingSigmetsCallback(error.response);
    });
  }

  setEmptySigmet () {
    this.setState({ list: [EMPTY_SIGMET] });
  }

  gotExistingSigmetsCallback (message) {
    let sigmetsList = message && message.data && message.data.sigmets ? message.data.sigmets : [];
    sigmetsList.forEach((sigmet) => {
      sigmet.phenomenonHRT = this.getHRT4code(sigmet.phenomenon);
    });
    this.setState({ list: sigmetsList });
  }

  savedSigmetCallback (message) {
    this.props.toggleMethod(null, 'concept-sigmets');
    this.props.selectMethod(0, this.state.list[0].geojson, 'concept-sigmets');

    this.setState({ isOpen: false, list: [EMPTY_SIGMET] });
    this.props.updateAllComponents();
  }

  couldntSaveSigmetCallback (message) {
    console.error('Error while trying to save SIGMET', message);
    if (this.props.selectedIndex === 0) {
      this.props.selectMethod(0);
    }
  }

  componentWillMount () {
    if (this.props.editable) {
      this.setEmptySigmet();
    } else {
      this.getExistingSigmets(this.props.source);
    }
  }

  componentWillReceiveProps (nextProps) {
    if (typeof nextProps.isOpen !== 'undefined') {
      this.setState({ isOpen: nextProps.isOpen });
    }
    if (typeof nextProps.isClosing !== 'undefined') {
      this.setState({ isClosing: nextProps.isClosing });
    }
    if (nextProps.hasOwnProperty('drawProperties') && typeof nextProps.drawProperties === 'object' &&
        nextProps.drawProperties.hasOwnProperty('geojson') && nextProps.drawProperties.geojson &&
        !isEqual(nextProps.drawProperties.geojson, EMPTY_GEO_JSON) &&
        Array.isArray(this.state.list) && this.state.list.length > 0) {
      const newList = cloneDeep(this.state.list);
      newList[0].geojson = this.props.drawProperties.geojson;
      this.setState({ list: newList });
    }
    if (this.props.editable && Array.isArray(this.state.list) && this.state.list.length > 0 &&
        this.state.list[0].validdate) {
      const curVal = moment(this.state.list[0].validdate).utc();
      const nowVal = moment().utc();
      if (curVal.isBefore(nowVal, 'minute')) {
        const newList = update(this.state.list, {
          0: {
            validdate: { $set: nowVal.format() }
          }
        });
        this.setState({ list: newList });
      }
    }
  }

  componentWillUpdate (nextProps) {
    if (this.props.latestUpdateTime !== nextProps.latestUpdateTime && this.props.isGetType === true) {
      this.getExistingSigmets(this.props.source);
    }
  }

  marks (flightLevelValues, unit) {
    let retObj = {
      0: 'Surface',
      400: 'Above'
    };

    switch (unit) {
      case UNIT_M:
        const prettyNumbers = flightLevelValues.map((val) => Math.round((val * 30.48) / 500) * 500);
        prettyNumbers.map((val) => { retObj[Math.round(val / 30.48)] = val + ' ' + UNIT_M; });
        break;
      case UNIT_FT:
        flightLevelValues.map((val) => { retObj[val] = val * 100 + ' ' + UNIT_FT; });
        break;
      case UNIT_FL:
      default:
        flightLevelValues.map((val) => { retObj[val] = UNIT_FL + ' ' + val; });
        break;
    }
    return retObj;
  };

  tooltip (flightLevel, unit) {
    if (flightLevel === 400) {
      return 'Above';
    }
    if (flightLevel === 0) {
      return 'Surface';
    }
    switch (unit) {
      case UNIT_M:
        return Math.round((flightLevel * 30.48) / 100) * 100 + ' ' + UNIT_M;
      case UNIT_FT:
        return flightLevel * 100 + ' ' + UNIT_FT;
      case UNIT_FL:
        return UNIT_FL + ' ' + flightLevel;
      default:
        break;
    }
  };

  showLevels (level) {
    if (!level.lev1) {
      return '';
    }
    let result = '';
    switch (level.lev1.unit) {
      case 'SFC':
        if (!level.lev2) {
          return '';
        }
        result = 'Between surface and ';
        if (level.lev2.unit === UNIT_FL) {
          result += UNIT_FL + level.lev2.value;
        } else {
          result += level.lev2.value + level.lev2.unit === UNIT_M ? 'm' : 'ft';
        }
        return result;
      case 'TOP':
        return 'Tops at FL' + level.lev1.value;
      case 'TOP_ABV':
        return 'Tops above FL' + level.lev1.value;
      case 'ABV':
        return 'Above FL' + level.lev1.value;
    }

    if (!level.lev2) {
      let result = 'At ';
      if (level.lev1.unit === UNIT_FL) {
        result += 'FL' + level.lev1.value;
      } else {
        result += level.lev1.value + level.lev1.unit === UNIT_M ? 'm' : 'ft';
      }
      return result;
    } else {
      let result = 'Between ';
      if (level.lev1.unit === UNIT_FL) {
        result += 'FL' + level.lev1.value + ' and FL' + level.lev2.value;
      } else if (level.lev1.unit === UNIT_M) {
        result += level.lev1.value + 'm and ' + level.lev2.value + 'm';
      } else {
        result += level.lev1.value + 'ft and ' + level.lev2.value + 'ft';
      }
      return result;
    }
  }

  setTops (evt) {
    let newPartialState = { tops: evt.target.checked };
    if (newPartialState.tops) {
      newPartialState['lowerUnit'] = UNIT_FL;
    }
    this.setState(newPartialState);
  }

  setSigmetLevel (value) {
    let listCpy = cloneDeep(this.state.list);
    if (value.length === 0) {
      return;
    }
    if (value.length === 1) {
      // Slider was used
      const val = value[0];
      const isTop = this.state.tops;
      if (isTop) {
        listCpy[0].level.lev1 = { unit: 'TOP', value: val };
      } else {
        switch (this.state.lowerUnit) {
          case UNIT_M:
            const meterVal = Math.round((val * 30.48) / 100) * 100;
            listCpy[0].level.lev1 = { unit: 'M', value: meterVal };
            break;
          case UNIT_FT:
            const feetVal = val * 100;
            listCpy[0].level.lev1 = { unit: 'FT', value: feetVal };
            break;
          case UNIT_FL:
          default:
            listCpy[0].level.lev1 = { unit: 'FL', value: val };
            break;
        }
      }
    } else {
      // value.length === 2
      const lowerVal = value[0];
      const upperVal = value[1];
      if (lowerVal >= upperVal) {
        return;
      }
      if (lowerVal === 0) {
        // SFC
        listCpy[0].level.lev1 = { unit: 'SFC', value: 0 };
        switch (this.state.lowerUnit) {
          case UNIT_M:
            const meterVal = Math.round((lowerVal * 30.48) / 100) * 100;
            listCpy[0].level.lev2 = { unit: 'M', value: meterVal };
            break;
          case UNIT_FT:
            const feetVal = lowerVal * 100;
            listCpy[0].level.lev2 = { unit: 'FT', value: feetVal };
            break;
          case UNIT_FL:
          default:
            listCpy[0].level.lev2 = { unit: 'FL', value: lowerVal };
            break;
        }
      } else if (upperVal === 400) {
        // Above
        listCpy[0].level.lev1 = { unit: this.state.tops ? 'TOP_ABV' : 'ABV', value: 0 };
        switch (this.state.lowerUnit) {
          case UNIT_M:
            break;
          case UNIT_FT:
            break;
          case UNIT_FL:
          default:
            listCpy[0].level.lev2 = { unit: 'FL', value: lowerVal };
            break;
        }
      } else {
        // Between
        switch (this.state.lowerUnit) {
          case UNIT_M:
            const lowerMeterVal = Math.round((lowerVal * 30.48) / 100) * 100;
            const upperMeterVal = Math.round((upperVal * 30.48) / 100) * 100;
            listCpy[0].level.lev1 = { unit: 'M', value: lowerMeterVal };
            listCpy[0].level.lev2 = { unit: 'M', value: upperMeterVal };
            break;
          case UNIT_FT:
            const lowerFeetVal = lowerVal * 100;
            const upperFeetVal = upperVal * 100;
            listCpy[0].level.lev1 = { unit: 'FT', value: lowerFeetVal };
            listCpy[0].level.lev2 = { unit: 'FT', value: upperFeetVal };
            break;
          case UNIT_FL:
          default:
            listCpy[0].level.lev1 = { unit: 'FL', value: lowerVal };
            listCpy[0].level.lev2 = { unit: 'FL', value: upperVal };
            break;
        }
      }
    }
    this.setState({ list: listCpy });
  }

  renderLevelSelection (editable, item) {
    const markValues = this.marks([50, 100, 150, 200, 250, 300, 350], this.state.lowerUnit);
    const handle = (params) => {
      const { value, dragging, index, ...restProps } = params;
      return (
        <Tooltip
          prefixCls='rc-slider-tooltip'
          overlay={this.tooltip(value, this.state.lowerUnit)}
          visible={dragging}
          placement='top'
          key={index}
        >
          <Handle {...restProps} />
        </Tooltip>
      );
    };

    if (editable) {
      return (<Row>
        <Col xs='9' style={{ flexDirection: 'column' }}>
          <Row />
          <Row />
          <Row>
            <Col xs={{ size: 3, offset: 1 }}>
              <Badge>Tops</Badge>
            </Col>
            <Col xs='8' style={{ justifyContent: 'center' }}>
              <SwitchButton id='topswitch' name='topswitch' labelLeft='Off' labelRight='On&nbsp;' isChecked={this.state.tops} action={(evt) => this.setTops(evt)} align='center' />
            </Col>
          </Row>
          <Row>
            <Col xs={{ size: 3, offset: 1 }}>
              <Badge>Levels</Badge>
            </Col>
            <Col xs='8' style={{ justifyContent: 'center' }}>
              <SwitchButton id='dualsingleswitch' name='dualsingleswitch' labelRight='Extent' labelLeft='Single'
                isChecked={this.state.renderRange} action={(evt) => this.setState({ renderRange: evt.target.checked })} align='center' />
            </Col>
          </Row>
          <Row style={{ flex: 'none', padding: '0.5rem 0' }}>
            <Col xs={{ size: 3, offset: 1 }}>
              <Badge>Units</Badge>
            </Col>
            <Col xs={{ size: 6, offset: 1 }} style={{ justifyContent: 'center' }}>
              <ButtonGroup>
                <Button color='primary' onClick={() => this.setState({ lowerUnit: UNIT_FT })} active={this.state.lowerUnit === UNIT_FT} disabled={this.state.tops}>{UNIT_FT}</Button>
                <Button color='primary' onClick={() => this.setState({ lowerUnit: UNIT_M })} active={this.state.lowerUnit === UNIT_M} disabled={this.state.tops}>{UNIT_M}</Button>
                <Button color='primary' onClick={() => this.setState({ lowerUnit: UNIT_FL })} active={this.state.lowerUnit === UNIT_FL} disabled={this.state.tops}>{UNIT_FL}</Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row />
        </Col>
        <Col xs='3'>
          <Row style={{ padding: '1rem 0' }}>
            {this.state.renderRange
              ? <Range step={10} allowCross={false} min={0} max={400} marks={markValues} vertical
                onChange={(v) => this.setSigmetLevel(v)} tipFormatter={value => this.tooltip(value, this.state.lowerUnit)} />
              : <Slider step={10} allowCross={false} min={0} max={400} marks={markValues} vertical onChange={(v) => this.setSigmetLevel([v])} handle={handle} />
            }
          </Row>
        </Col>
      </Row>);
    }
    return (<Col>
      {this.showLevels(item.level)}
    </Col>);
  }

  render () {
    const { title, icon, parentCollapsed, editable, selectedIndex, toggleMethod, scrollAction, drawProperties } = this.props;
    const notifications = !editable ? this.state.list.length : 0;
    // Show a warning in case there is no drawing yet, so both the this.state.list and the this.props.drawProperties are empty
    const showDrawWarningFromState = !this.state.list.length > 0 || !this.state.list[0].hasOwnProperty('geojson') || !this.state.list[0].geojson.hasOwnProperty('features') ||
      !this.state.list[0].geojson.features.length > 0 || !this.state.list[0].geojson.features[0].hasOwnProperty('geometry') ||
      !this.state.list[0].geojson.features[0].geometry.hasOwnProperty('coordinates') || !this.state.list[0].geojson.features[0].geometry.coordinates.length > 0;
    const showDrawWarningFromProps = !drawProperties || !drawProperties.hasOwnProperty('geojson') || !drawProperties.geojson.hasOwnProperty('features') ||
      !drawProperties.geojson.features.length > 0 || !drawProperties.geojson.features[0].hasOwnProperty('geometry') ||
      !drawProperties.geojson.features[0].geometry.hasOwnProperty('coordinates') || !drawProperties.geojson.features[0].geometry.coordinates.length > 0;
    let maxSize = this.state.list ? 550 * this.state.list.slice(0, 5).length : 0;
    if (editable) {
      maxSize = 1020;
    }
    const sourceless = Object.keys(this.props.sources || {}).length === 0;
    const now = moment().utc();
    const availablePhenomena = this.getPhenomena();
    const availableFirs = this.getParameters().firareas;
    const availableChanges = this.getChanges();
    const availableDirections = this.getDirections();
    const drawActions = [
      {
        title: 'Select point',
        action: 'select-point',
        icon: 'circle'
      },
      {
        title: 'Select region',
        action: 'select-region',
        icon: 'retweet'
      },
      {
        title: 'Select shape',
        action: 'select-shape',
        icon: 'pencil'
      },
      {
        title: 'Select entire FIR',
        action: 'select-fir',
        icon: 'globe'
      },
      {
        title: 'Delete selection',
        action: 'delete-selection',
        icon: 'trash'
      }
    ];

    return (
      <Card className='row accordion' style={{ flex: (this.state.isOpen || this.state.isClosing) ? 'auto' : null, minWidth: 0, flexWrap: 'nowrap' }}>
        {parentCollapsed
          ? <CardHeader className='row' style={{ minHeight: '2.5rem' }}>
            <Col xs='auto'>
              <Icon name={icon} />
            </Col>
            <Col xs='auto'>&nbsp;</Col>
            <Col xs='auto'>
              {notifications > 0 ? <Badge color='danger' pill className='collapsed'>{notifications}</Badge> : null}
            </Col>
          </CardHeader>
          : <CardHeader onClick={maxSize > 0 ? toggleMethod : null} className={maxSize > 0 ? 'row' : 'row disabled'} title={title} style={{ minHeight: '2.5rem' }}>
            <Col xs='auto'>
              <Icon name={icon} />
            </Col>
            <Col style={{ marginLeft: '0.9rem' }}>
              {title}
            </Col>
            <Col xs='auto'>
              {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
            </Col>
          </CardHeader>
        }
        <Row style={{ flex: 'auto', overflowY: 'auto' }} onScroll={scrollAction}>
          <CollapseOmni className='CollapseOmni col' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
            <CardBlock>
              {(this.state.isOpen || this.state.isClosing)
                ? <Row>
                  <Col className='btn-group-vertical' style={{ minWidth: 0, flexGrow: 1, minHeight: maxSize }}>
                    {this.state.list.slice(0, 5).map((item, index) => {
                      const selectedPhenomenon = availablePhenomena.filter((ph) => ph.code === item.phenomenon).shift();
                      const selectedFir = availableFirs.filter((fr) => fr.firname === item.firname).shift();
                      const selectedDirection = availableDirections.filter((dr) => dr.shortName === item.movement.dir).shift();
                      const selectedChange = availableChanges.filter((ch) => ch.shortName === item.change).shift();
                      return <Button tag='div' className={'Sigmet row' + (selectedIndex === index ? ' active' : '')}
                        key={index} onClick={(evt) => { this.handleSigmetClick(evt, index); }} title={item.phenomenonHRT} >
                        <Row style={editable ? { minHeight: '2rem' } : null}>
                          <Col xs='3'>
                            <Badge color='success'>What</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <Typeahead disabled={sourceless} filterBy={['name', 'code']} labelKey='code'
                                options={availablePhenomena} placeholder={sourceless ? 'Loading phenomena ⏳' : 'Select phenomenon'}
                                onChange={(phenomenonList) => this.setSelectedPhenomenon(phenomenonList)}
                                selected={selectedPhenomenon ? [selectedPhenomenon] : []}
                                clearButton />
                              : <span style={{ fontWeight: 'bold' }}>{item.phenomenon}</span>
                            }
                          </Col>
                        </Row>
                        <Row style={editable ? { marginTop: '0.19rem', minHeight: '2rem' } : null}>
                          <Col xs={{ size: 9, offset: 3 }}>
                            {editable
                              ? <SwitchButton id='obsfcstswitch' name='obsfcstswitch'
                                labelRight='Observed' labelLeft='Forecast' isChecked={item.obs_or_forecast.obs} action={(evt) => this.setSelectedObservedForecast(evt.target.checked)} />
                              : <span>{item.obs_or_forecast.obs ? 'Observed' : 'Forecast'}</span>
                            }
                          </Col>
                        </Row>
                        <Row style={editable ? { paddingTop: '0.19rem', minHeight: '2rem' } : { paddingTop: '0.19rem' }}>
                          <Col xs={{ size: 2, offset: 1 }}>
                            <Badge>At</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc
                                onChange={(at) => this.setSelectedForecastPosition(at)}
                                inputProps={item.obs_or_forecast.obs ? { disabled: true } : null}
                                isValidDate={(curr, selected) => curr.isAfter(now.subtract(1, 'day')) &&
                                  curr.isBefore(now.add(this.getParameters().hoursbeforevalidity, 'hour'))}
                                timeConstraints={{
                                  hours: {
                                    min: now.hour(),
                                    max: (now.hour() + this.getParameters().hoursbeforevalidity)
                                  }
                                }}
                                viewMode='time'
                                value={item.forecast_position ? moment.utc(item.forecast_position) : now}
                              />
                              : <Moment format={DATE_TIME_FORMAT} date={item.forecast_position} />
                            }
                          </Col>
                        </Row>
                        <Row className='section' style={{ minHeight: '1.75rem' }}>
                          <Col xs='3'>
                            <Badge color='success'>Valid</Badge>
                          </Col>
                        </Row>
                        <Row style={editable ? { paddingTop: '0.19rem', minHeight: '2rem' } : { paddingTop: '0.19rem' }}>
                          <Col xs={{ size: 2, offset: 1 }}>
                            <Badge>From</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc
                                onChange={(validFrom) => this.setSelectedValidFromMoment(validFrom)}
                                isValidDate={(curr, selected) => curr.isAfter(now.subtract(1, 'day')) &&
                                  curr.isBefore(now.add(this.getParameters().hoursbeforevalidity, 'hour'))}
                                timeConstraints={{
                                  hours: {
                                    min: now.hour(),
                                    max: (now.hour() + this.getParameters().hoursbeforevalidity)
                                  }
                                }}
                                viewMode='time'
                                value={moment.utc(item.validdate) || now}
                              />
                              : <Moment format={DATE_TIME_FORMAT} date={item.validdate} />
                            }
                          </Col>
                        </Row>
                        <Row style={editable ? { paddingTop: '0.19rem', minHeight: '2.5rem' } : { paddingTop: '0.19rem' }}>
                          <Col xs={{ size: 2, offset: 1 }}>
                            <Badge>Until</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <DateTimePicker style={{ width: '100%' }} dateFormat={DATE_FORMAT} timeFormat={TIME_FORMAT} utc
                                onChange={(validUntil) => this.setSelectedValidUntilMoment(validUntil)}
                                isValidDate={(curr, selected) => curr.isAfter(moment.utc(item.validdate).subtract(1, 'day')) &&
                                  curr.isBefore(moment.utc(item.validdate).add(this.getParameters().maxhoursofvalidity, 'hour'))}
                                timeConstraints={{
                                  hours: {
                                    min: moment.utc(item.validdate).hour(),
                                    max: (moment.utc(item.validdate).hour() + this.getParameters().maxhoursofvalidity)
                                  }
                                }}
                                viewMode='time'
                                value={moment.utc(item.validdate_end) || moment.utc(item.validdate).add(this.getParameters().maxhoursofvalidity, 'hour')} />
                              : <Moment format={DATE_TIME_FORMAT} date={item.validdate_end} />
                            }
                          </Col>
                        </Row>
                        <Row className='section' style={editable ? { minHeight: '2.5rem' } : null}>
                          <Col xs='3'>
                            <Badge color='success'>Where</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <Typeahead style={{ width: '100%' }} filterBy={['firname', 'location_indicator_icao']} labelKey='firname'
                                options={availableFirs} onChange={(firList) => this.setSelectedFir(firList)}
                                selected={selectedFir ? [selectedFir] : []} placeholder={'Select FIR'}
                                clearButton />
                              : <span>{item.firname || 'no firname provided yet'}</span>
                            }
                          </Col>
                        </Row>
                        <Row style={editable ? { minHeight: '2.5rem' } : null}>
                          <Col xs={{ size: 9, offset: 3 }}>
                            {item.location_indicator_icao}
                          </Col>
                        </Row>
                        {editable
                          ? <Row className='section' style={{ minHeight: '3.685rem', marginBottom: '0.33rem' }}>
                            {drawActions.map((actionItem, index) =>
                              <Col xs={{ size: 'auto', offset: index === 0 ? 3 : null }} key={index} style={{ padding: '0 0.167rem' }}>
                                <Button color='primary' active={actionItem.action === 'mapProperties.mapMode'} disabled={actionItem.disabled || null}
                                  id={actionItem.action + '_button'} title={actionItem.title} onClick={() => this.handleActionClick(actionItem.action, 'where')} style={{ width: '3rem' }}>
                                  <Icon name={actionItem.icon} />
                                </Button>
                              </Col>)
                            }
                          </Row>
                          : ''
                        }
                        {selectedIndex > -1 && editable && (showDrawWarningFromState && showDrawWarningFromProps)
                          ? <Row style={{ flex: 'none', padding: '0.5rem 0 0.5rem 0.12rem', maxWidth: '28.7rem' }}>
                            <Col>
                              <Alert color='danger' style={{ display: 'block', margin: '0', whiteSpace: 'normal', padding: '0.75rem' }}>
                                Please use one of the selection tools above to indicate on the map where the phenomenon is
                                {item.obs_or_forecast.obs ? ' observed.' : ' expected to occur.'}
                              </Alert>
                            </Col>
                          </Row>
                          : ''
                        }
                        <Row className='section' style={editable ? { minHeight: '14rem' } : null}>
                          <Col xs={editable ? { size: 12 } : { size: 9, offset: 3 }}>
                            {this.renderLevelSelection(editable, item)}
                          </Col>
                        </Row>
                        <Row className='section' style={{ minHeight: '2.5rem' }}>
                          <Col xs='3'>
                            <Badge color='success'>Progress</Badge>
                          </Col>
                          <Col xs='9'>
                            {/* dir: {N,NNE,NE,ENE,E,ESE,SE,SSE,S,SSW,SW,WSW,W,WNW} */}
                            {/* speed: int */}
                            {editable
                              ? <SwitchButton id='movementswitch' name='movementswitch'
                                labelRight='Move' labelLeft='Stationary' isChecked={!item.movement.stationary} action={this.setSelectedMovement} />
                              : <span>{item.movement.stationary ? 'Stationary' : 'Move'}</span>
                            }

                          </Col>
                        </Row>
                        <Row style={editable ? { marginTop: '0.19rem', minHeight: '2rem' } : null}>
                          <Col xs={{ size: 2, offset: 1 }}>
                            <Badge title='Direction'>Direction</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <Typeahead style={{ width: '100%' }} filterBy={['shortName', 'longName']} labelKey='longName' disabled={item.movement.stationary}
                                options={availableDirections} placeholder={item.movement.stationary ? null : 'Select direction'}
                                onChange={(dir) => this.setSelectedDirection(dir)}
                                selected={selectedDirection ? [selectedDirection] : []}
                                clearButton />
                              : <span>{selectedDirection ? selectedDirection.longName : (!item.movement.stationary ? 'No direction selected' : null)}</span>
                            }
                          </Col>
                        </Row>
                        <Row style={editable ? { marginTop: '0.19rem', minHeight: '2rem' } : null}>
                          <Col xs={{ size: 2, offset: 1 }}>
                            <Badge>Speed</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <InputGroup>
                                <Input onChange={this.setSpeed} defaultValue='0' type='number' step='1' disabled={item.movement.stationary} />
                                <InputGroupAddon>KT</InputGroupAddon>
                              </InputGroup>
                              : <span>{item.movement.speed ? `${item.movement.speed} KT` : null }</span>
                            }
                          </Col>
                        </Row>
                        {editable
                          ? <Row className='section' style={{ minHeight: '3.685rem', marginBottom: '0.33rem' }}>
                            {drawActions.map((actionItem, index) =>
                              <Col xs={{ size: 'auto', offset: index === 0 ? 3 : null }} key={index} style={{ padding: '0 0.167rem' }}>
                                <Button color='primary' active={actionItem.action === 'mapProperties.mapMode'} disabled={actionItem.disabled || null}
                                  id={actionItem.action + '_button'} title={actionItem.title} onClick={() => this.handleActionClick(actionItem.action, 'progress')} style={{ width: '3rem' }}>
                                  <Icon name={actionItem.icon} />
                                </Button>
                              </Col>)
                            }
                          </Row>
                          : ''
                        }
                        <Row className='section' style={editable ? { marginTop: '0.19rem', minHeight: '2.5rem' } : null}>
                          <Col xs='3'>
                            <Badge color='success'>Change</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? <Typeahead style={{ width: '100%' }} filterBy={['shortName', 'longName']} labelKey='longName'
                                options={availableChanges} placeholder={'Select change'}
                                onChange={(chg) => this.setChange(chg)}
                                selected={selectedChange ? [selectedChange] : []}
                                clearButton />
                              : <span>{selectedChange ? selectedChange.longName : 'No change selected'}</span>
                            }
                          </Col>
                        </Row>
                        <Row>
                          <Col xs={{ size: 9, offset: 3 }}>
                            {item.forecast_position}
                          </Col>
                        </Row>
                        <Row className='section' style={{ minHeight: '2.5rem' }}>
                          <Col xs='3'>
                            <Badge color='success'>Issued at</Badge>
                          </Col>
                          <Col xs='9'>
                            {editable
                              ? '(not yet published)'
                              : <Moment format={DATE_TIME_FORMAT} date={item.issuedate} />
                            }
                          </Col>
                        </Row>
                        <Row style={{ minHeight: '2.5rem' }}>
                          <Col xs={{ size: 9, offset: 3 }}>
                            {item.location_indicator_mwo}
                          </Col>
                        </Row>
                        {!editable
                          ? <Row>
                            <Col xs={{ size: 2, offset: 1 }}>
                              <Badge>Sequence</Badge>
                            </Col>
                            <Col xs='6'>
                              {(!isNaN(item.sequence) && item.sequence !== -1) ? item.sequence : '(not yet published)'}
                            </Col>
                          </Row>
                          : null
                        }
                        {editable
                          ? <Row className='section' style={{ minHeight: '3.185rem' }}>
                            <Col xs={{ size: 3, offset: 9 }}>
                              <Button color='primary' disabled={selectedIndex === -1} onClick={this.saveSigmet} >Create</Button>
                            </Col>
                          </Row>
                          : ''
                        }
                        {!editable
                          ? <Row className='section' style={{ minHeight: '3.185rem' }}>
                            <Col xs={{ size: 3, offset: 9 }}>
                              <Button disabled={item.status === 'PUBLISHED'} color='primary' onClick={() => this.publishSigmet(item.uuid)}>Publish</Button>
                            </Col>
                          </Row>
                          : ''
                        }
                      </Button>;
                    })}
                  </Col>
                </Row>
                : null}
            </CardBlock>
          </CollapseOmni>
        </Row>
      </Card>);
  }
}

SigmetCategory.defaultProps = {
  isOpen: false,
  isClosing: false,
  editable: false,
  selectedIndex: 0,
  selectMethod: () => {},
  toggleMethod: () => {},
  parentCollapsed: false,
  phenomenonMapping: [],
  dispatch: () => {},
  updateParent: () => {},
  scrollAction: () => {}
};

SigmetCategory.propTypes = {
  isOpen: PropTypes.bool,
  isClosing: PropTypes.bool,
  title: PropTypes.string.isRequired,
  icon: PropTypes.string,
  source: PropTypes.string,
  editable: PropTypes.bool,
  selectedIndex: PropTypes.number,
  selectMethod: PropTypes.func,
  toggleMethod: PropTypes.func,
  parameters: PropTypes.object,
  parentCollapsed: PropTypes.bool,
  adagucProperties: PropTypes.object,
  phenomenonMapping: PropTypes.array,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  updateParent: PropTypes.func,
  mapActions: PropTypes.object,
  panelsActions: PropTypes.object,
  drawProperties: PropTypes.shape({
    geojson: PropTypes.object
  }),
  sources: PropTypes.object,
  latestUpdateTime: PropTypes.string,
  updateAllComponents: PropTypes.func,
  isGetType: PropTypes.bool,
  scrollAction: PropTypes.func
};

export default SigmetCategory;
