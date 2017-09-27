import React, { Component } from 'react';
import { Button, ButtonGroup, Input, Col, Row, Badge, Card, CardHeader, CardBlock, CardFooter } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import Icon from 'react-fa';
import axios from 'axios';
import cloneDeep from 'lodash.clonedeep';
import isEmpty from 'lodash.isempty';
import CollapseOmni from '../components/CollapseOmni';
import SwitchButton from 'react-switch-button/lib/react-switch-button.js';
import 'react-switch-button/dist/react-switch-button.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import DateTimePicker from 'react-datetime';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import SortableComponent from '../components/SortableTable';

import PropTypes from 'prop-types';
import { BOUNDING_BOXES } from '../constants/bounding_boxes';
import { HARMONIE_URL, HARMONIE_ML_URL, OVERLAY_URL, OBSERVATIONS_URL, RADAR_URL, LIGHTNING_URL, SATELLITE_URL } from '../constants/default_services';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const DATE_FORMAT = 'YYYY MMM DD - ';
const TIME_FORMAT = 'HH:mm UTC';
const DATE_TIME_FORMAT = 'YYYY MMM DD - HH:mm UTC';
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
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: []
      },
      properties: {
        prop0: 'value0'
      }
    }
  ]
};
const EMPTY_SIGMET = {
  geojson                   : EMPTY_GEO_JSON,
  phenomenon                : '',
  obs_or_forecast           : {
    obs                     : true
  },
  level                     : {
    lev1                    : {
      value                 : 100.0,
      unit                  : 'FL'
    }
  },
  movement                  : {
    stationary              : true
  },
  change                    : 'NC',
  forecast_position         : '',
  issuedate                 : '',
  validdate                 : moment().utc().format(),
  validdate_end              : moment().utc().add(4, 'hour').format(),
  firname                   : '',
  location_indicator_icao   : '',
  location_indicator_mwo    : 'EHDB',
  uuid                      : '00000000-0000-0000-0000-000000000000',
  status                    : 'PRODUCTION'
};

const FALLBACK_PARAMS = {
  maxhoursofvalidity      : 4,
  hoursbeforevalidity     : 4,
  firareas                : [
    {
      location_indicator_icao   : 'EHAA',
      firname                   : 'AMSTERDAM FIR',
      areapreset                : 'NL_FIR'
    }
  ],
  location_indicator_wmo  :'EHDB'
};

class TafCategory extends Component {
  constructor (props) {
    super(props);
    this.onObsOrFcstClick = this.onObsOrFcstClick.bind(this);
    this.handleSigmetClick = this.handleSigmetClick.bind(this);
    this.saveSigmet = this.saveSigmet.bind(this);
    this.savedSigmetCallback = this.savedSigmetCallback.bind(this);
    this.getExistingSigmets = this.getExistingSigmets.bind(this);
    this.gotExistingSigmetsCallback = this.gotExistingSigmetsCallback.bind(this);
    this.setTops = this.setTops.bind(this);
    this.state = {
      isOpen: props.isOpen,
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
    let effectiveMapping = cloneDeep(phenomenonMapping).filter((item) => item.phenomenon.code === code);
    if (effectiveMapping.length !== 1) {
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
    return result;
  }

  getParameters () {
    let { parameters } = this.props;
    if (isEmpty(parameters)) {
      parameters = FALLBACK_PARAMS;
    }
    return parameters;
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

  sigmetLayers (p) {
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
            layers: [
              [
                {
                  service: HARMONIE_URL,
                  title: 'HARM_N25_EXT',
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
            layers: [
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
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OBS.cgi?',
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
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.OVL.cgi?',
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
            layers: [
              [
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.SAT.cgi?',
                  title: 'SAT',
                  name: 'HRVIS',
                  label: 'HRVIS',
                  opacity: 1,
                  enabled: true,
                  overlay: false
                },
                {
                  service: 'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.RADAR.cgi?',
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
            layers: [
              [
                {
                  service: HARMONIE_URL,
                  title: 'HARM_N25_EXT',
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
    const preset = this.sigmetLayers(onlyObj.layerpreset);
    this.props.dispatch(this.props.mapActions.setLayout(preset.display.type));
    this.props.dispatch(this.props.layerActions.setPreset(preset.layers));
    this.props.dispatch(this.props.mapActions.setCut({ name: 'Custom', bbox: [570875, preset.area.bottom, 570875, preset.area.top] }));
  }

  setSelectedFir (firList) {
    if (firList.length === 0) {
      return;
    }
    const firObj = firList[0];
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
    this.setState({ isOpen: false, list: [EMPTY_SIGMET] });
    if (this.props.selectedIndex === 0) {
      this.props.selectMethod(0);
    }
  }

  couldntSaveSigmetCallback (message) {
    console.log('Error while trying to save SIGMET', message);
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

  render () {
    const { title, icon, parentCollapsed, editable, selectedIndex, toggleMethod } = this.props;
    const notifications = !editable ? this.state.list.length : 0;
    let maxSize = this.state.list ? 500 * this.state.list.length : 0;
    if (editable) {
      maxSize = 900;
    }

    return (
      <Card className='row accordion'>
        {parentCollapsed ? <CardHeader>
          <Col xs='auto'>
            <Icon name={icon} />
          </Col>
          <Col xs='auto'>&nbsp;</Col>
          <Col xs='auto'>
            {notifications > 0 ? <Badge color='danger' pill className='collapsed'>{notifications}</Badge> : null}
          </Col>
        </CardHeader>
          : <CardHeader onClick={maxSize > 0 ? toggleMethod : null} className={maxSize > 0 ? null : 'disabled'} title={title}>
            <Col xs='auto'>
              <Icon name={icon} />
            </Col>
            <Col style={{ marginLeft: '0.9rem' }}>
              {title}
            </Col>
            <Col xs='auto'>
              {notifications > 0 ? <Badge color='danger' pill>{notifications}</Badge> : null}
            </Col>
          </CardHeader>}
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} minSize={0} maxSize={maxSize}>
          <CardBlock>
            <Row>
              <Col className='btn-group-vertical'>
                {this.state.list.map((item, index) =>
                  <div style={{ backgroundColor:'#DDD' }} tag='div' className={'TafStyle row' + (selectedIndex === index ? ' active' : '')}
                    key={index} onClick={(evt) => { this.handleSigmetClick(evt, index); }} title={item.phenomenonHRT} >
                    <Row>
                      <Col xs='2'>
                        <Badge >Location</Badge>
                      </Col>
                      <Col xs='2'>
                        { editable
                          ? <Typeahead style={{ width: '100%' }} filterBy={['name']} labelKey='name' disabled='disabled'
                            options={[ { name: 'EHAM' }, { name: 'EHRD' } ]} onClick={(evt) => console.log(evt)} defaultSelected={['EHAM']} />
                          : <span style={{ fontWeight: 'bold' }}>&lt;&lt;ICAO location&gt;&gt;</span>
                        }
                      </Col>
                      <Col xs='2'>
                        <Badge color='success'>Valid period</Badge>
                      </Col>
                      <Col xs='1'>
                        <Badge>From</Badge>
                      </Col>
                      <Col xs='2'>
                        <Input disabled value={moment().utc().add(1, 'hour').format('DD-MM-YYYY HH:00')} />
                      </Col>
                      <Col xs='1'>
                        <Badge>Until</Badge>
                      </Col>
                      <Col xs='2'>
                        <Input disabled value={moment().utc().add(31, 'hour').format('DD-MM-YYYY HH:00')} />
                      </Col>
                    </Row>
                    <SortableComponent />
                  </div>
                )}
              </Col>
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>);
  }
}

TafCategory.propTypes = {
  isOpen        : PropTypes.bool,
  title         : PropTypes.string.isRequired,
  icon          : PropTypes.string,
  source        : PropTypes.string,
  editable      : PropTypes.bool,
  selectedIndex : PropTypes.number,
  selectMethod  : PropTypes.func,
  toggleMethod  : PropTypes.func,
  parameters    : PropTypes.object,
  parentCollapsed   : PropTypes.bool,
  phenomenonMapping : PropTypes.array,
  dispatch          : PropTypes.func,
  mapActions        : PropTypes.object,
  layerActions      : PropTypes.object
};

export default TafCategory;