import React from "react";
import ADAGUC from "./ADAGUC.js";
import Menu from "./Menu.js";
import { connect } from 'react-redux'


class GeoWeb extends React.Component {	
	constructor(){
		super();
		// this.state = {
		// 	layer: "Harmonie",
		// 	map_type: "mwsmap",
		// 	bounding_box: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958],
		// 	projection_name: "EPSG:3857"
		// }
		// this.handle_change_layer = this.handle_change_layer.bind(this);
		// this.handle_map_type_change = this.handle_map_type_change.bind(this);


	}

	// handle_change_layer(e){
	// 	if(this.state.layer === "Harmonie")
	// 		this.setState({layer: "Radar"});
	// 	else{
	// 		this.setState({layer: "Harmonie"});

	// 	}
	// }

	// handle_map_type_change(e) {
	// 	if(this.state.map_type === "mwsmap")
	// 		this.setState({map_type: "streetmap"});
	// 	else
	// 		this.setState({map_type: "mwsmap"});
	// }

	render()
	{

		// TODO: if menu is on top then the pointer location in the ADAGUC viewer is wrong
		return <div>
					<ADAGUC {...this.props}  />
				    <Menu />
				</div>
	}
}


const mapStateToProps = (state, ownProps) => {
  return state.adaguc.adaguc_properties;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch(setVisibilityFilter(ownProps.filter))
    }
  }
}
export default connect(mapStateToProps,
  mapDispatchToProps
)(GeoWeb)
