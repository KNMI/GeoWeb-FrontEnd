import React from "react";
import { DropdownButton } from 'react-bootstrap';

import { connect } from 'react-redux'
import {set_data, set_map_style} from "../actions/ADAGUC_actions"

class MI extends React.Component {
	constructor() {
		super(); 
		this.handle_click = this.handle_click.bind(this);

	}
	handle_click(e) {
		if(this.props.parent_id === 'ddb-data')
		{
			console.log(e.target.id);
			this.props.dispatch(set_data(e.target.id));
		}
		else{
			this.props.dispatch(set_map_style(e.target.id));
		}

	}

	render() {
		return <li><a id={this.props.eventKey} onClick={this.handle_click}>{this.props.children}</a></li>
	}
}

const MenuItem = connect()(MI)

export default class Menu extends React.Component {	
	constructor(){
		super();
	}


	render()
	{
		return <div id="innermenu">
			<DropdownButton bsStyle='primary' title='Dataset' key='1' id='ddb-data'>
				<MenuItem eventKey="1" id="harmonie_flux_button" parent_id='ddb-data'>HARMONIE Flux</MenuItem>
				<MenuItem eventKey="2" id="harmonie_air_temp_button" parent_id='ddb-data'>HARMONIE Air temp</MenuItem>
				<MenuItem eventKey="3" id="radar_button" parent_id='ddb-data'>Radar</MenuItem>
			</DropdownButton>
			<DropdownButton bsStyle='primary' title='Map Style' key='2' id='ddb-map'>
				<MenuItem eventKey="1" id="mws_button" parent_id='ddb-map'>MWS</MenuItem>
				<MenuItem eventKey="2" id="osm_button" parent_id='ddb-map'>OpenStreetMap</MenuItem>
			</DropdownButton>
			</div>
	}
}

