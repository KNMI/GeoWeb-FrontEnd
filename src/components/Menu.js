import React from 'react';
import { DropdownButton } from 'react-bootstrap';

import { connect } from 'react-redux';
import { setData, setMapStyle } from '../actions/ADAGUC_actions';

class MI extends React.Component {
  constructor () {
    super();
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick (e) {
    const num_id = parseInt(e.target.id);
    if (isNaN(num_id) || num_id < 1) {
      // ERROR!
    }
    if (this.props.parentId === 'ddb-data') {
      this.props.dispatch(setData(num_id));
    } else {
      this.props.dispatch(setMapStyle(num_id));
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
      <DropdownButton bsStyle='primary' title='Dataset' key='1' id='ddb-data'>
        <MenuItem store={store} eventKey='1' id='harmonie_flux_button' parentId='ddb-data'>HARMONIE Flux</MenuItem>
        <MenuItem store={store} eventKey='2' id='harmonie_air_temp_button' parentId='ddb-data'>HARMONIE Air temp</MenuItem>
        <MenuItem store={store} eventKey='3' id='radar_button' parentId='ddb-data'>Radar</MenuItem>
      </DropdownButton>
      <DropdownButton bsStyle='primary' title='Map Style' key='2' id='ddb-map'>
        <MenuItem store={store} eventKey='1' id='mws_button' parentId='ddb-map'>MWS</MenuItem>
        <MenuItem store={store} eventKey='2' id='osm_button' parentId='ddb-map'>OpenStreetMap</MenuItem>
      </DropdownButton>
    </div>;
  }
}

Menu.propTypes = {
  adagucProperties: React.PropTypes.object,
  store: React.PropTypes.object
};
