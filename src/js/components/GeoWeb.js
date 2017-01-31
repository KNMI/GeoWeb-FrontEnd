import React from "react";
import ADAGUC from "./ADAGUC.js";
import Menu from "./Menu.js";
import { connect } from 'react-redux'


class GeoWeb extends React.Component {	
	constructor(){
		super();
	}

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
  return {  }
}
export default connect(mapStateToProps,
  mapDispatchToProps
)(GeoWeb)
