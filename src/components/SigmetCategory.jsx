import React, { Component } from 'react';
import { Button, ButtonGroup, Col, Row, Badge, Card, CardHeader, CardBlock } from 'reactstrap';
import Moment from 'react-moment';
import moment from 'moment';
import Icon from 'react-fa';
import axios from 'axios';
import { cloneDeep, isEmpty } from 'lodash';
import CollapseOmni from '../components/CollapseOmni';
import SwitchButton from 'react-switch-button';
import 'react-switch-button/dist/react-switch-button.css';
import { Typeahead } from 'react-bootstrap-typeahead';
import DateTimePicker from 'react-datetime';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import PropTypes from 'prop-types';
const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const DATE_FORMAT = 'YYYY MMM DD - ';
const TIME_FORMAT = 'HH:mm UTC';
const DATE_TIME_FORMAT = 'YYYY MMM DD - HH:mm UTC';
const SEPARATOR = '_';
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
  validdate_end              : moment().add(4, 'hour'),
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

class SigmetCategory extends Component {
  constructor (props) {
    super(props);
    this.onObsOrFcstClick = this.onObsOrFcstClick.bind(this);
    this.handleSigmetClick = this.handleSigmetClick.bind(this);
    this.saveSigmet = this.saveSigmet.bind(this);
    this.savedSigmetCallback = this.savedSigmetCallback.bind(this);
    this.getHRS4code = this.getHRT4code.bind(this);
    this.getExistingSigmets = this.getExistingSigmets.bind(this);
    this.gotExistingSigmetsCallback = this.gotExistingSigmetsCallback.bind(this);
    this.setTops = this.setTops.bind(this);
    this.state = {
      isOpen: props.isOpen,
      list: [],
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

  handleSigmetClick (index) {
    this.props.selectMethod(index, this.state.list[index].geojson);
  }

  onObsOrFcstClick (obsSelected) {
    const newList = cloneDeep(this.state.list);
    newList[0].obs_or_forecast.obs = obsSelected;
    this.setState({ list: newList });
  }

  saveSigmet (evt) {
    evt.preventDefault();
    const newList = cloneDeep(this.state.list);
    newList[0].geojson = this.props.adagucProperties.adagucmapdraw.geojson;
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
      this.savedSigmetCallback(error.response);
    });
  }

  setSelectedPhenomenon (phenomenonList) {
    if (phenomenonList.length === 0) {
      return;
    }
    const onlyObj = phenomenonList[0];
    let listCpy = cloneDeep(this.state.list);
    listCpy[0].phenomenon = onlyObj.code;
    this.setState({ list: listCpy });
    this.props.dispatch(this.props.actions.setPreset(onlyObj.layerpreset));
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
    this.setState({ isOpen: false });
    this.props.selectMethod(0);
    this.props.updateParent();
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
              <SwitchButton name='topswitch' label='Off' labelRight='On&nbsp;' defaultChecked={this.state.tops} onChange={this.setTops} align='center' />
            </Col>
          </Row>
          <Row>
            <Col xs={{ size: 3, offset: 1 }}>
              <Badge>Levels</Badge>
            </Col>
            <Col xs='8' style={{ justifyContent: 'center' }}>
              <SwitchButton name='dualsingleswitch' mode='select' labelRight='Extent' label='Single'
                defaultChecked={this.state.renderRange} onChange={(evt) => this.setState({ renderRange: evt.target.checked })} align='center' />
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
    const { title, icon, parentCollapsed, editable, selectedIndex, toggleMethod } = this.props;
    const notifications = !editable ? this.state.list.length : 0;
    let maxSize = this.state.list ? 500 * this.state.list.length : 0;
    if (editable) {
      maxSize = 900;
    }

    // const maxSize = editable ? 800 : this.state.list ? Math.min(250 * this.state.list.length, 600) : 0;
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
                  <Button tag='div' className={'Sigmet row' + (selectedIndex === index ? ' active' : '')}
                    key={index} onClick={() => { this.handleSigmetClick(index); }} title={item.phenomenonHRT} >
                    <Row style={editable ? { minHeight: '2rem' } : null}>
                      <Col xs='3'>
                        <Badge color='success'>What</Badge>
                      </Col>
                      <Col xs='9'>
                        { editable
                         ? <Typeahead style={{ width: '100%' }} filterBy={['name', 'code']} labelKey='name'
                           options={this.getPhenomena()} onChange={(phenomenonList) => this.setSelectedPhenomenon(phenomenonList)} />
                         : <span style={{ fontWeight: 'bold' }}>{item.phenomenonHRT}</span>
                        }
                      </Col>
                    </Row>
                    <Row style={editable ? { marginTop: '0.19rem', minHeight: '2rem' } : null}>
                      <Col xs={{ size: 9, offset: 3 }}>
                        { editable
                         ? <SwitchButton name='obsfcstswitch' mode='select'
                           labelRight='Observed' label='Forecast' defaultChecked={item.obs_or_forecast.obs} onChange={(evt) => this.setSelectedObservedForecast(evt.target.checked)} />
                         : <span>{item.obs_or_forecast.obs ? 'Observed' : 'Forecast'}</span>
                        }
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>When</Badge>
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
                            isValidDate={(curr, selected) => curr.isAfter(moment().subtract(1, 'day')) &&
                              curr.isBefore(moment().add(this.getParameters().hoursbeforevalidity, 'hour'))}
                            timeConstraints={{ hours: {
                              min: moment().hour(),
                              max: (moment().hour() + this.getParameters().hoursbeforevalidity)
                            } }} />
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
                            isValidDate={(curr, selected) => curr.isAfter(moment(this.state.list[0].validdate).subtract(1, 'day')) &&
                              curr.isBefore(moment(this.state.list[0].validdate).add(this.getParameters().maxhoursofvalidity, 'hour'))}
                            timeConstraints={{ hours: {
                              min: moment(this.state.list[0].validdate).hour(),
                              max: (moment(this.state.list[0].validdate).hour() + this.getParameters().maxhoursofvalidity)
                            } }} />
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
                          options={this.getParameters().firareas} onChange={(firList) => this.setSelectedFir(firList)} />
                        : <span>{item.firname || '--'}</span>
                      }
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ size: 9, offset: 3 }}>
                        {item.location_indicator_icao}
                      </Col>
                    </Row>
                    <Row className='section' style={editable ? { minHeight: '14rem' } : null}>
                      <Col xs={editable ? { size: 12 } : { size: 9, offset: 3 }}>
                        {this.renderLevelSelection(editable, item)}
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>Progress</Badge>
                      </Col>
                      <Col xs='9'>
                        {item.movement.stationary ? 'Stationary' : 'Move' }
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ size: 9, offset: 3 }}>
                        {item.change === 'NC' ? 'No change' : '' }
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ size: 9, offset: 3 }}>
                        {item.forecast_position}
                      </Col>
                    </Row>
                    <Row className='section'>
                      <Col xs='3'>
                        <Badge color='success'>Issued at</Badge>
                      </Col>
                      <Col xs='9'>
                        {editable
                          ? '--'
                          : <Moment format={DATE_TIME_FORMAT} date={item.issuedate} />
                        }
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ size: 9, offset: 3 }}>
                        {item.location_indicator_mwo}
                      </Col>
                    </Row>
                    {editable
                      ? ''
                      : <Row>
                        <Col xs={{ size: 3, offset: 3 }}>
                          <Badge>Sequence</Badge>
                        </Col>
                        <Col xs='6'>
                          {item.sequence}
                        </Col>
                      </Row>
                    }
                    {editable
                      ? <Row style={{ minHeight: '2.5rem' }}>
                        <Col xs={{ size: 3, offset: 9 }}>
                          <Button color='primary' onClick={this.saveSigmet} >Save</Button>
                        </Col>
                      </Row>
                      : ''
                    }
                  </Button>
                )}
              </Col>
            </Row>
          </CardBlock>
        </CollapseOmni>
      </Card>);
  }
}

SigmetCategory.propTypes = {
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
  adagucProperties  : PropTypes.object,
  phenomenonMapping : PropTypes.array,
  dispatch          : PropTypes.func,
  actions           : PropTypes.object,
  updateParent      : PropTypes.func,
  latestUpdateTime  : PropTypes.string
};

export default SigmetCategory;
