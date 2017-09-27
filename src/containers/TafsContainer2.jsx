import React, { Component } from 'react';
import { Button, Col, Row } from 'reactstrap';
import Icon from 'react-fa';
import CollapseOmni from '../components/CollapseOmni';
import TafCategory from '../components/TafCategory';
import Panel from '../components/Panel';
import cloneDeep from 'lodash.clonedeep';
import { TAFS_URL } from '../constants/backend';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Link } from 'react-router';

const ITEMS = [
  {
    title: 'Open active TAFs',
    ref:   'active-tafs',
    icon: 'folder-open',
    source: TAFS_URL + '/tafs?active=false',
    editable: true
  },
  {
    title: 'Open concept TAFs',
    ref:   'concept-tafs',
    icon: 'folder-open-o',
    source: TAFS_URL + '/tafs?active=false&status=concept',
    editable: true
  },
  {
    title: 'Create new TAF',
    ref:   'add-taf',
    icon: 'star-o',
    editable: true
  }
];

class TafsContainer extends Component {
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
    this.setState({ isOpen: !this.state.isOpen });
    evt.preventDefault();
  }

  toggleCategory (category) {
    const newIsOpenCategory = cloneDeep(this.state.isOpenCategory);
    newIsOpenCategory[category] = !newIsOpenCategory[category];
    this.setState({ isOpenCategory: newIsOpenCategory });
  }

  select (category, index, geo) {
    if (this.state.selectedItem.category === category && this.state.selectedItem.index === index) {
      this.setState({ selectedItem: {} });
      return false;
    } else {
      this.setState({ selectedItem: { category: category, index: index, geojson: geo } });
      return true;
    }
  }

  render () {
    const maxSize = 1000;
    let title = <Row>
      <Button color='primary' onClick={this.toggle} title={this.state.isOpen ? 'Collapse panel' : 'Expand panel'}>
        <Icon name={this.state.isOpen ? 'angle-double-left' : 'angle-double-right'} />
      </Button>
      <Button color='primary' tag={Link} to='/' style={{ marginLeft: '0.25rem', visibility: this.state.isOpen ? 'visible' : 'hidden' }}>
        Exit
      </Button>
    </Row>;
    return (
      <Col className='TafsContainer'>
        <CollapseOmni className='CollapseOmni' isOpen={this.state.isOpen} isHorizontal minSize={64} maxSize={maxSize}>
          <Panel className='Panel' title={title}>
            <Col xs='auto' className='accordionsWrapper' style={{ width: this.state.isOpen ? maxSize - 32 : 32 }}>
              {ITEMS.map((item, index) =>
                <TafCategory phenomenonMapping={this.state.phenomena || []} adagucProperties={this.props.adagucProperties}
                  key={index} title={item.title} parentCollapsed={!this.state.isOpen} drawProperties={this.props.drawProperties}
                  mapActions={this.props.mapActions} layerActions={this.props.layerActions}
                  icon={item.icon} source={item.source} editable={item.editable} latestUpdateTime={this.state.latestUpdateTime}
                  isOpen
                  selectedIndex={typeof this.state.selectedItem.index !== 'undefined' && this.state.selectedItem.category === item.ref ? this.state.selectedItem.index : -1}
                  selectMethod={(index, geo) => this.select(item.ref, index, geo)} toggleMethod={() => this.toggleCategory(item.ref)}
                  dispatch={this.props.dispatch} actions={this.props.actions}
                  parameters={this.state.parameters || {}} />
              )}
            </Col>
          </Panel>
        </CollapseOmni>
      </Col>
    );
  }
}

TafsContainer.propTypes = {
  adagucProperties: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object
};

export default TafsContainer;
