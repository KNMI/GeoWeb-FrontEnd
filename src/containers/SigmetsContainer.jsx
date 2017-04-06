import React, { Component, PropTypes } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import SigmetCategory from '../components/SigmetCategory';
import Panel from '../components/Panel';
import cloneDeep from 'lodash/cloneDeep';
import { BACKEND_SERVER_URL } from '../routes/ADAGUC/constants/backend';

const GET_SIGMETS_URL = BACKEND_SERVER_URL + '/sigmet/getsigmetlist?';
const SET_SIGMET_URL = BACKEND_SERVER_URL + '/sigmet/storesigmet';
const ITEMS = [
  {
    title: 'Open issued SIGMETs',
    ref:   'active-sigmets',
    icon: 'folder-open',
    source: GET_SIGMETS_URL + 'active=true',
    editable: false
  },
  {
    title: 'Open archived SIGMETs',
    ref:  'archived-sigmets',
    icon: 'archive',
    source: GET_SIGMETS_URL + 'active=false&status=CANCELLED',
    editable: false
  },
  {
    title: 'Open concept SIGMETs',
    ref:   'concept-sigmets',
    icon: 'folder-open-o',
    source: GET_SIGMETS_URL + 'active=false&status=PRODUCTION',
    editable: false
  },
  {
    title: 'Create new SIGMET',
    ref:   'add-sigmet',
    icon: 'star-o',
    source: SET_SIGMET_URL,
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
    this.toggle = this.toggle.bind(this);
    this.select = this.select.bind(this);
    let isOpenCategory = {};
    ITEMS.forEach((item, index) => {
      isOpenCategory[item.ref] = false;
    });
    this.state = { isOpen: true, selectedItem: {}, isOpenCategory: isOpenCategory };
  }

  toggle (evt) {
    const geo = this.state.isOpen ? EMPTY_GEO_JSON : (this.state.selectedItem.geojson || EMPTY_GEO_JSON);
    this.setState({ isOpen: !this.state.isOpen });
    this.drawSIGMET(geo);
    evt.preventDefault();
  }

  toggleCategory (category) {
    console.log('Toggled');
    const newIsOpenCategory = cloneDeep(this.state.isOpenCategory);
    newIsOpenCategory[category] = !newIsOpenCategory[category];
    this.setState({ isOpenCategory: newIsOpenCategory });
  }

  select (category, index, geo) {
    if (typeof this.state.selectedItem.index !== 'undefined' &&
        this.state.selectedItem.category === category && this.state.selectedItem.index === index) {
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
    this.props.dispatch(this.props.actions.setGeoJSON({ geojson: geojson }));
  }

  render () {
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
    </Row>;
    return (
      <Col className='SigmetsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={400}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper'>
              {ITEMS.map((item, index) =>
                <SigmetCategory adagucProperties={this.props.adagucProperties}
                  key={index} title={item.title} parentCollapsed={!this.state.isOpen}
                  icon={item.icon} source={item.source} editable={item.editable}
                  isOpen={this.state.isOpen && this.state.isOpenCategory[item.ref]}
                  selectedIndex={typeof this.state.selectedItem.index !== 'undefined' && this.state.selectedItem.category === item.ref ? this.state.selectedItem.index : -1}
                  selectMethod={(index, geo) => this.select(item.ref, index, geo)} toggleMethod={() => this.toggleCategory(item.ref)} />
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
  dispatch: PropTypes.func,
  actions: PropTypes.object
};

export default SigmetsContainer;
