import React, { Component, PropTypes } from 'react';
import { Button, Col, Row, Badge, Card, CardHeader, CardBlock, Alert, ButtonGroup, Input } from 'reactstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import Moment from 'react-moment';
import Icon from 'react-fa';
import axios from 'axios';
import cloneDeep from 'lodash/cloneDeep';
import CollapseOmni from '../components/CollapseOmni';

const TIME_FORMAT = 'YYYY MMM DD - HH:mm';
// const shortTIME_FORMAT = 'HH:mm';
const SEPARATOR = '_';
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
  validdate                 : '',
  firname                   : '',
  location_indicator_icao   : 'EHAA',
  location_indicator_mwo    : 'EHDB',
  uuid                      : '00000000-0000-0000-0000-000000000000',
  status                    : 'PRODUCTION'
};
const PHENOMENON_MAPPING = [
  {
    'phenomenon': { 'name': 'Thunderstorm', 'code': 'TS' },
    'variants': [
      { 'name': 'Obscured', 'code': 'OBSC' },
      { 'name': 'Embedded', 'code': 'EMBD' },
      { 'name': 'Frequent', 'code': 'FRQ' },
      { 'name': 'Squall line', 'code': 'SQL' }
    ],
    'additions': [
      { 'name': 'with hail', 'code': 'GR' }
    ]
  },
  {
    'phenomenon': { 'name': 'Turbulence', 'code': 'TURB' },
    'variants': [
      { 'name': 'Severe', 'code': 'SEV' }
    ],
    'additions': []
  },
  {
    'phenomenon': { 'name': 'Icing', 'code': 'ICE' },
    'variants': [
      { 'name': 'Severe', 'code': 'SEV' }
    ],
    'additions': [
      { 'name': 'due to freezing rain', 'code': '(FZRA)' }
    ]
  },
  {
    'phenomenon': { 'name': 'Duststorm', 'code': 'DS' },
    'variants': [
      { 'name': 'Heavy', 'code': 'HVY' }
    ],
    'additions': []
  },
  {
    'phenomenon': { 'name': 'Sandstorm', 'code': 'SS' },
    'variants': [
      { 'name': 'Heavy', 'code': 'HVY' }
    ],
    'additions': []
  },
  {
    'phenomenon': { 'name': 'Radioactive cloud', 'code': 'RDOACT CLD' },
    'variants': [],
    'additions': []
  }
];

class SigmetCategory extends Component {
  constructor (props) {
    super(props);
    this.onObsOrFcstClick = this.onObsOrFcstClick.bind(this);
    this.setPhenomenon = this.setPhenomenon.bind(this);
    this.handleSigmetClick = this.handleSigmetClick.bind(this);
    this.saveSigmet = this.saveSigmet.bind(this);
    this.savedSigmetCallback = this.savedSigmetCallback.bind(this);
    this.getHRS4code = this.getHRT4code.bind(this);
    this.getExistingSigmets = this.getExistingSigmets.bind(this);
    this.gotExistingSigmetsCallback = this.gotExistingSigmetsCallback.bind(this);
    this.state = { isOpen: props.isOpen, list: [] };
  }

  // get Human Readable Text for Code
  getHRT4code (code) {
    if (typeof code === 'undefined') {
      return UNKNOWN;
    }
    const UNKNOWN = 'Unknown';
    const codeFragments = code.split(SEPARATOR);
    if (codeFragments.length < 2) {
      return UNKNOWN;
    }
    let result = '';
    let variantIndex;
    let additionIndex;

    const effectiveMapping = cloneDeep(PHENOMENON_MAPPING).map((item) => {
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
    let result = [];
    PHENOMENON_MAPPING.forEach((item) => {
      item.variants.forEach((variant) => {
        result.push({
          name: variant.name + ' ' + item.phenomenon.name.toLowerCase(),
          code: variant.code + SEPARATOR + item.phenomenon.code
        });
      });
    });
    return result;
  }

  handleSigmetClick (index) {
    console.log('Click', index, this.state.list);
    this.props.selectMethod(index, this.state.list[index].geojson);
  }

  onObsOrFcstClick (obsSelected) {
    const newList = cloneDeep(this.state.list);
    newList[0].obs_or_forecast.obs = obsSelected;
    this.setState({ list: newList });
  }

  setPhenomenon (phenomenon) {
    if (typeof phenomenon === 'undefined') {
      return;
    }
    const newList = cloneDeep(this.state.list);
    newList[0].phenomenon = phenomenon[0].code;
    this.setState({ list: newList });
    // TODO: also get the presets for this phenomenon
  }

  saveSigmet () {
    const newList = cloneDeep(this.state.list);
    newList[0].geojson = this.props.adagucProperties.adagucmapdraw.geojson;
    this.setState({ list: newList });
    axios({
      method: 'post',
      url: this.props.source,
      withCredentials: true,
      responseType: 'json',
      data: JSON.stringify(newList[0])
    }).then(src => {
      this.savedSigmetCallback(src);
    }).catch(error => {
      this.savedSigmetCallback(error.response);
    });
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
    console.log('Got SIGMETs list feedback', message);
    let sigmetsList = message && message.data && message.data.sigmets ? message.data.sigmets : [];
    sigmetsList.forEach((sigmet) => {
      sigmet.phenomenonHRT = this.getHRT4code(sigmet.phenomenon);
    });
    this.setState({ list: sigmetsList });
  }

  savedSigmetCallback (message) {
    console.log('Saved SIGMET feedback', message);
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

   /*renderWhatBlock (editable, item) {
    console.log('What?: ', item);
    console.log('What?: ', editable);
    return (
      <Row>
        <Col xs='2'>
          <Badge color='success' style={{ width: '100%' }}>What</Badge>
        </Col>
        {editable ? <Typeahead className='col' onChange={this.setPhenomenon} options={this.getPhenomena()} labelKey='name' />
        : <Alert color='success' className='col'>
          {item.phenomenonHRT}
        </Alert>}
        {editable ? <ButtonGroup className='col'>
          <Button color='primary' onClick={() => this.onObsOrFcstClick(true)} active={this.state.list[0].obs_or_forecast.obs}>Observed</Button>
          <Button color='primary' onClick={() => this.onObsOrFcstClick(false)} active={!this.state.list[0].obs_or_forecast.obs}>Forecast</Button>
        </ButtonGroup>
        : <Col xs='auto'>{item.obs_or_forecast.obs ? 'Observed' : 'Forecast'}</Col>}
      </Row>);
  }
 renderWhenBlock (editable, item) {
    return (
      <Row>
        <Col xs='2'>
          <Badge color='success' style={{ width: '100%' }}>When</Badge>
        </Col>
        <Col xs='4'>
          <Badge color='warning'>Issue date</Badge>
        </Col>
        <Col xs='auto'>
          {editable ? <div>
            <Input defaultValue='2017 Mar 30' />
            <Input defaultValue='13:37 UTC' />
          </div>
          : <Moment format={TIME_FORMAT} date={item.issuedate} />}
        </Col>
      </Row>);
  }
  renderWhereBlock (editable, item) {
    return (
      <Row>
        <Col xs='2'>
          <Badge color='success' style={{ width: '100%' }}>Where</Badge>
        </Col>
        {editable ? <Input />
        : <Alert className='col'>
          {item.level.lev1 ? item.level.lev1.value + item.level.lev1.unit : ''}
        </Alert>}
        {editable ? <Col />
        : <Col xs='auto'><Button color='primary' onClick={() => this.drawSIGMET({ geojson: item.geojson })}>Show</Button></Col>}
      </Row>);
  }
  renderBlock (editable, item) {
    return <Row className='btn' style={{ flexDirection: 'column' }}>
      <Row>{this.renderWhatBlock(editable, item)}</Row>
      <Row>{this.renderWhenBlock(editable, item)}</Row>
      <Row>{this.renderWhereBlock(editable, item)}</Row>
      {editable ? <Row>
        <Col />
        <Col xs='auto'>
          <Button color='primary' onClick={this.saveSigmet}>Save</Button>
        </Col>
      </Row> : ''}
      <Row>
        <Col>FIR name</Col>
        <Col>Amsterdam FIR</Col>
      </Row>
    </Row>;
  }*/
  render () {
    const { title, icon, parentCollapsed, editable, selectedIndex, toggleMethod } = this.props;
    const notifications = !editable ? this.state.list.length : 0;
    const maxSize = this.state.list ? 150 * this.state.list.length : 0;
    // const maxSize = editable ? 800 : this.state.list ? Math.min(250 * this.state.list.length, 600) : 0;
    console.log('Second Sigmet', this.state.list[1]);
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
                    key={index} onClick={() => { this.handleSigmetClick(index); }}>
                    <Row>
                      <Col xs='auto'>
                        <Badge color='success' style={{ width: '100%' }}>What</Badge>
                      </Col>
                      <Col>
                        {item.phenomenonHRT}
                      </Col>
                      <Col xs='auto'>
                        {item.obs_or_forecast.obs ? 'Observed' : 'Forecast'}
                      </Col>
                    </Row>
                    <Row>
                      <Col xs='auto'>
                        <Badge color='success' style={{ width: '100%' }}>When</Badge>
                      </Col>
                      <Col>
                        <Moment format={TIME_FORMAT} date={item.issuedate} />&nbsp;UTC
                      </Col>
                    </Row>
                    <Row>
                      <Col xs={{ offset: 2 }}>
                        <Moment format={TIME_FORMAT} date={item.validdate} />&nbsp;UTC
                      </Col>
                    </Row>
                    <Row>
                      <Col xs='auto'>
                        <Badge color='success' style={{ width: '100%' }}>Where</Badge>
                      </Col>
                      <Col>
                        {item.level.lev1.value + item.level.lev1.unit}
                      </Col>
                    </Row>
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
  parentCollapsed : PropTypes.bool,
  editable      : PropTypes.bool,
  selectedIndex : PropTypes.number,
  selectMethod  : PropTypes.func,
  toggleMethod  : PropTypes.func,
  adagucProperties: PropTypes.object
};

export default SigmetCategory;
