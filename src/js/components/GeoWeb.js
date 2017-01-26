import React from "react";
import ADAGUC from "./ADAGUC.js";
import Menu from "./Menu.js";

export default class GeoWeb extends React.Component {	
	constructor(){
		super();
		this.state = {
			layer: "Harmonie"
		}
		this.handle_change_layer = this.handle_change_layer.bind(this);
	}

	handle_change_layer(e){
		console.log(this);
		if(this.state.layer === "Harmonie")
			this.setState({layer: "radar"});
		else{
			this.setState({layer: "Harmonie"});

		}
	}

	render()
	{
    	const projection_name = "EPSG:3857";
    	const bounding_box = [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958];
    	// const dataset = 'Harmonie';
    	const map_type = 'mws';

		return (<div>
				    <Menu onLayerChange={this.handle_change_layer} />
					<ADAGUC projection_name={projection_name} bounding_box={bounding_box} dataset={this.state.layer} map_type={map_type}/>
				</div>
);
	}
}
