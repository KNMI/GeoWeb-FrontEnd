import React from 'react';
import { DropdownButton } from 'react-bootstrap';

import { connect } from 'react-redux';
// import { setData, setMapStyle, setCut } from '../actions/ADAGUC_actions';

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

    // Execute the appropriate data function passed as prop
    this.props.dataFunc(numId);
  }

  render () {
    return <li><a id={this.props.eventKey} onClick={this.handleClick}>{this.props.children}</a></li>;
  }
}
MI.propTypes = {
  dataFunc: React.PropTypes.func.isRequired,
  parentId: React.PropTypes.string,
  eventKey: React.PropTypes.string,
  children: React.PropTypes.string
};

const MenuItem = connect()(MI);

MenuItem.proptypes = {
  parentId: React.PropTypes.string.isRequired
};

export default class Menu extends React.Component {
  render () {
   // return <div>ey</div>;
    const { setData, setMapStyle, setCut } = this.props;
    return (<div id='innermenu'>
      <DropdownButton bsStyle='primary' bsSize='large' title='Dataset' key='1' id='ddb-data'>
        <MenuItem dataFunc={setData} eventKey='1' id='harmonie_flux_button' parentId='ddb-data'>HARMONIE Flux</MenuItem>
        <MenuItem dataFunc={setData} eventKey='2' id='harmonie_air_temp_button'
          parentId='ddb-data'>HARMONIE Air temp</MenuItem>
        <MenuItem dataFunc={setData} eventKey='3' id='radar_button' parentId='ddb-data'>Radar</MenuItem>
        <MenuItem dataFunc={setData} eventKey='4' id='satellite_ir_button' parentId='ddb-data'>Satellite IR</MenuItem>
        <MenuItem dataFunc={setData} eventKey='5' id='satellite__cinesat_button' parentId='ddb-data'>Satellite CINESAT</MenuItem>
      </DropdownButton><br />
      <DropdownButton bsStyle='primary' bsSize='large' title='Map Style' key='2' id='ddb-map'>
        <MenuItem dataFunc={setMapStyle} eventKey='1' id='mws_button' parentId='ddb-map'>MWS</MenuItem>
        <MenuItem dataFunc={setMapStyle} eventKey='2' id='osm_button' parentId='ddb-map'>OpenStreetMap</MenuItem>
      </DropdownButton><br />
      <DropdownButton bsStyle='primary' bsSize='large' title='Uitsnede' key='3' id='ddb-cut'>
        <MenuItem dataFunc={setCut} eventKey='1' id='cut_nl_button' parentId='ddb-cut'>Nederland</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='2' id='cut_nl_sea_button' parentId='ddb-cut'>NL + Noordzee</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='3' id='cut_western_europe_button' parentId='ddb-cut'>West Europa</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='4' id='cut_europe_button' parentId='ddb-cut'>Europa</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='5' id='cut_bonaire_button' parentId='ddb-cut'>Bonaire</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='6' id='cut_saba_eust_button'
          parentId='ddb-cut'>Saba & St. Eustatius</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='7' id='cut_n_america_button' parentId='ddb-cut'>Noord Amerika</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='8' id='cut_africa_button' parentId='ddb-cut'>Afrika</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='9' id='cut_asia_button' parentId='ddb-cut'>Azie</MenuItem>
        <MenuItem dataFunc={setCut} eventKey='10' id='cut_australia_button' parentId='ddb-cut'>Australi&euml;</MenuItem>
      </DropdownButton>

    </div>);
  }
}

Menu.propTypes = {
  adagucProperties: React.PropTypes.object,
  createMap        : React.PropTypes.func.isRequired,
  setData          : React.PropTypes.func.isRequired,
  setMapStyle      : React.PropTypes.func.isRequired,
  setCut           : React.PropTypes.func.isRequired
};
