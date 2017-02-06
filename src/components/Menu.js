import React from 'react';
import { DropdownButton } from 'react-bootstrap';

import { connect } from 'react-redux';
import { setData, setMapStyle, setCut } from '../actions/ADAGUC_actions';

class MI extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick (e) {
    const numId = parseInt(e.target.id);
    if (isNaN(numId) || numId < 1) {
      return new Error('ID parameter is not a valid number.');
    }
    const { dispatch, parentId } = this.props;
    switch (parentId) {
      case 'ddb-data':
        dispatch(setData(numId));
        break;
      case 'ddb-map':
        dispatch(setMapStyle(numId));
        break;
      case 'ddb-cut':
        dispatch(setCut(numId));
        break;
      default:
        console.log('WTF...');
        break;
    }
  }

  render () {
    return <li><a id={this.props.eventKey} onClick={this.handleClick}>{this.props.children}</a></li>;
  }
}
MI.propTypes = {
  parentId: React.PropTypes.string,
  dispatch: React.PropTypes.func,
  eventKey: React.PropTypes.string,
  children: React.PropTypes.string
};

const MenuItem = connect()(MI);

MenuItem.proptypes = {
  parentId: React.PropTypes.string.isRequired
};

export default class Menu extends React.Component {
  render () {
    const { store } = this.props;
    return <div id='innermenu'>
      <DropdownButton bsStyle='primary' bsSize='large' title='Dataset' key='1' id='ddb-data'>
        <MenuItem store={store} eventKey='1' id='harmonie_flux_button' parentId='ddb-data'>HARMONIE Flux</MenuItem>
        <MenuItem store={store} eventKey='2' id='harmonie_air_temp_button' parentId='ddb-data'>HARMONIE Air temp</MenuItem>
        <MenuItem store={store} eventKey='3' id='radar_button' parentId='ddb-data'>Radar</MenuItem>
      </DropdownButton><br />
      <DropdownButton bsStyle='primary' bsSize='large' title='Map Style' key='2' id='ddb-map'>
        <MenuItem store={store} eventKey='1' id='mws_button' parentId='ddb-map'>MWS</MenuItem>
        <MenuItem store={store} eventKey='2' id='osm_button' parentId='ddb-map'>OpenStreetMap</MenuItem>
      </DropdownButton><br />
      <DropdownButton bsStyle='primary' bsSize='large' title='Uitsnede' key='3' id='ddb-cut'>
        <MenuItem store={store} eventKey='1' id='cut_nl_button' parentId='ddb-cut'>Nederland</MenuItem>
        <MenuItem store={store} eventKey='2' id='cut_nl_sea_button' parentId='ddb-cut'>NL + Noordzee</MenuItem>
        <MenuItem store={store} eventKey='3' id='cut_western_europe_button' parentId='ddb-cut'>West Europa</MenuItem>
        <MenuItem store={store} eventKey='4' id='cut_europe_button' parentId='ddb-cut'>Europa</MenuItem>
        <MenuItem store={store} eventKey='5' id='cut_bonaire_button' parentId='ddb-cut'>Bonaire</MenuItem>
        <MenuItem store={store} eventKey='6' id='cut_saba_eust_button' parentId='ddb-cut'>Saba & St. Eustatius</MenuItem>
        <MenuItem store={store} eventKey='7' id='cut_saba_eust_button' parentId='ddb-cut'>Noord Amerika</MenuItem>
        <MenuItem store={store} eventKey='8' id='cut_saba_eust_button' parentId='ddb-cut'>Afrika</MenuItem>
        <MenuItem store={store} eventKey='9' id='cut_saba_eust_button' parentId='ddb-cut'>Azie</MenuItem>
        <MenuItem store={store} eventKey='10' id='cut_saba_eust_button' parentId='ddb-cut'>Australi&euml;</MenuItem>
      </DropdownButton>

    </div>;
  }
}

Menu.propTypes = {
  adagucProperties: React.PropTypes.object,
  store: React.PropTypes.object
};
