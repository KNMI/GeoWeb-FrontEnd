import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import SigmetCategory from '../components/SigmetCategory';
import Panel from '../components/Panel';
import cloneDeep from 'lodash.clonedeep';
import axios from 'axios';
import PropTypes from 'prop-types';
import { hashHistory } from 'react-router';
import moment from 'moment';
const ITEMS = [
  {
    title: 'Open issued SIGMETs',
    ref:   'active-sigmets',
    icon: 'folder-open',
    source: 'active=true',
    isGetType: true,
    editable: false
  },
  {
    title: 'Open archived SIGMETs',
    ref:  'archived-sigmets',
    icon: 'archive',
    source: 'active=false&status=CANCELLED',
    isGetType: true,
    editable: false
  },
  {
    title: 'Open concept SIGMETs',
    ref:   'concept-sigmets',
    icon: 'folder-open-o',
    source: 'active=false&status=PRODUCTION',
    isGetType: true,
    editable: false
  },
  {
    title: 'Create new SIGMET',
    ref:   'add-sigmet',
    icon: 'star-o',
    source: '',
    isGetType: false,
    editable: true
  }
];
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

class SigmetsContainer extends Component {
  constructor (props) {
    super(props);
    const GET_SIGMETS_URL = this.props.urls.BACKEND_SERVER_URL + '/sigmet/getsigmetlist?';
    const SET_SIGMET_URL = this.props.urls.BACKEND_SERVER_URL + '/sigmet/storesigmet';

    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    this.renderMoreItems = this.renderMoreItems.bind(this);
    this.updateAllComponents = this.updateAllComponents.bind(this);
    let isOpenCategory = {};
    ITEMS.map((item, index) => {
      isOpenCategory[item.ref] = false;
      item.source = (item.isGetType ? GET_SIGMETS_URL : SET_SIGMET_URL) + item.source;
    });
    this.state = { isOpen: true, selectedItem: {}, isOpenCategory: isOpenCategory, closingCategory: [] };
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/sigmet/getsigmetphenomena').then((result) => {
      this.setState({ phenomena: result.data });
    }).catch((error) => {
      console.error(error);
      const phenomena = [
        { 'phenomenon':{ 'name':'Thunderstorm', 'code':'TS', 'layerpreset':'sigmet_layer_TS' },
          'variants':[{ 'name':'Obscured', 'code':'OBSC' }, { 'name':'Embedded', 'code':'EMBD' }, { 'name':'Frequent', 'code':'FRQ' }, { 'name':'Squall line', 'code':'SQL' }],
          'additions':[{ 'name':'with hail', 'code':'GR' }]
        },
        { 'phenomenon':{ 'name':'Turbulence', 'code':'SEV_TURB', 'layerpreset':'sigmet_layer_SEV_TURB' },
          'variants':[],
          'additions':[]
        },
        { 'phenomenon':{ 'name':'Severe Icing', 'code':'SEV_ICE', 'layerpreset':'sigmet_layer_SEV_ICE' },
          'variants':[],
          'additions':[{ 'name':'due to freezing rain', 'code':'FRZA' }]
        },
        { 'phenomenon':{ 'name':'Duststorm', 'code':'HVY_DS', 'layerpreset':'sigmet_layer_DS' },
          'variants':[],
          'additions':[]
        },
        { 'phenomenon':{ 'name':'Sandstorm', 'code':'HVY_SS', 'layerpreset':'sigmet_layer_SS' },
          'variants':[],
          'additions':[]
        },
        { 'phenomenon':{ 'name':'Radioactive cloud', 'code':'RDOACT_CLD', 'layerpreset':'sigmet_layer_RDOACT_CLD' },
          'variants':[],
          'additions':[]
        }
      ];
      this.setState({ phenomena: phenomena });
    });
    axios.get(this.props.urls.BACKEND_SERVER_URL + '/sigmet/getsigmetparameters').then((result) => {
      this.setState({ parameters: result.data });
    }).catch((error) => {
      console.error(error);
    });
  }

  toggle (evt) {
    const geo = this.state.isOpen ? EMPTY_GEO_JSON : (this.state.selectedItem.geojson || EMPTY_GEO_JSON);
    this.setState({ isOpen: !this.state.isOpen });
    this.drawSIGMET(geo);
    evt.preventDefault();
  }

  toggleCategory (category) {
    const newIsOpenCategory = cloneDeep(this.state.isOpenCategory);
    const newClosingCategory = cloneDeep(this.state.closingCategory);
    for (let catKey in newIsOpenCategory) {
      if (catKey === category && !newIsOpenCategory[catKey]) {
        newIsOpenCategory[catKey] = true;
      } else {
        newIsOpenCategory[catKey] = false;
        if (this.state.isOpenCategory[catKey]) {
          newClosingCategory.push(catKey);
        }
      }
    }
    this.setState({ isOpenCategory: newIsOpenCategory, closingCategory: newClosingCategory });
    setTimeout(() => this.setState({ closingCategory: [] }), 350);
  }

  renderMoreItems (evt) {
    const nodelist = evt.target.querySelectorAll('.Sigmet');
    const lastItem = nodelist.item(nodelist.length - 1);

    if (lastItem.getBoundingClientRect().top < evt.target.getBoundingClientRect().bottom) {
      console.log('Should render more items');
    }
  }

  select (category, index, geo) {
    if (this.state.selectedItem.category === category && this.state.selectedItem.index === index) {
      this.drawSIGMET(EMPTY_GEO_JSON);
      this.setState({ selectedItem: {} });
      return false;
    } else {
      this.drawSIGMET(geo);
      this.setState({ selectedItem: { category: category, index: index, geojson: geo } });
      return true;
    }
  }

  drawSIGMET (geojson) {
    this.props.dispatch(this.props.drawActions.setGeoJSON(geojson));
  }

  updateAllComponents () {
    this.setState({ latestUpdateTime: moment.utc().format() });
  }

  render () {
    const maxSize = 520;
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
      <Button style={{ marginLeft: '0.5rem' }} onClick={() => hashHistory.push('/')} color='primary'><Icon name={'times'} /></Button>
    </Row>;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper' style={{ minWidth: this.state.isOpen ? maxSize - 32 : 'unset', maxHeight: '100%' }}>
              {ITEMS.map((item, index) =>
                <SigmetCategory phenomenonMapping={this.state.phenomena || []} adagucProperties={this.props.adagucProperties}
                  key={index} title={item.title} parentCollapsed={!this.state.isOpen} drawProperties={this.props.drawProperties}
                  mapActions={this.props.mapActions} panelsActions={this.props.panelsActions}
                  icon={item.icon} source={item.source} editable={item.editable} latestUpdateTime={this.state.latestUpdateTime}
                  isOpen={this.state.isOpen && this.state.isOpenCategory[item.ref]}
                  isClosing={this.state.closingCategory.includes(item.ref)}
                  scrollAction={this.renderMoreItems}
                  selectedIndex={typeof this.state.selectedItem.index !== 'undefined' && this.state.selectedItem.category === item.ref ? this.state.selectedItem.index : -1}
                  selectMethod={(index, geo, cat = item.ref) => this.select(cat, index, geo)} toggleMethod={(evt, cat = item.ref) => this.toggleCategory(cat)}
                  dispatch={this.props.dispatch} actions={this.props.actions}
                  parameters={this.state.parameters || {}} updateAllComponents={this.updateAllComponents}
                  sources={this.props.sources} isGetType={item.isGetType} />
              )}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

SigmetsContainer.propTypes = {
  adagucProperties: PropTypes.object,
  drawActions: PropTypes.object,
  drawProperties: PropTypes.object,
  mapActions: PropTypes.object,
  panelsActions: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  urls: PropTypes.shape({
    BACKEND_SERVER_URL: PropTypes.string
  }),
  sources: PropTypes.object
};

export default SigmetsContainer;
