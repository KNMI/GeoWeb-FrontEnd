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
		{/*return <div><ADAGUC {...this.props}  id="map1"/><Menu /></div>*/}
		return <div>
					<div id="adaguc">
						<table>
							<tbody>
								<tr>
									<td><div><ADAGUC {...this.props}  id="map1"/> </div></td>
									<td><div><ADAGUC {...this.props}  id="map2"/> </div></td>
								</tr>
								<tr>
									<td><div><ADAGUC {...this.props}  id="map3"/> </div></td>
									<td><div><ADAGUC {...this.props}  id="map4"/> </div></td>
								</tr>
							</tbody>
						</table>
					{/*<ADAGUC {...this.props}  id="map1"/>*/}
					</div>
					<div id="menu">
				    	<Menu />
				    </div>
				</div>
	}
}


const mapStateToProps = (state, ownProps) => {
  return state.adaguc.adaguc_properties;
}

// ????
const mapDispatchToProps = (dispatch, ownProps) => {
  return {  }
}
export default connect(mapStateToProps,
  mapDispatchToProps
)(GeoWeb)
