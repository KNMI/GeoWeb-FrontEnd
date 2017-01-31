import React from "react";
import { connect } from 'react-redux'
import {toggle_data, toggle_mapstyle} from "../actions/ADAGUC_actions"
class MenuItem_faux extends React.Component {
	constructor(){
		super();
	}

	button_click(e){
		switch(e.target.id)
		{
			case 'change_datalayer_button':
				this.props.dispatch(toggle_data());
				break;
			case 'change_map_type_button':
				this.props.dispatch(toggle_mapstyle());
				break;
		}
	}

	render(){
		var button_style = {
			marginRight: '5px'
		};
		var {type, id, content} = this.props;
		if(type === 'button')
			return <button style={button_style} onClick={this.button_click.bind(this)} class="btn btn-primary" id={id}>{content}</button>
	}
}

const MenuItem = connect()(MenuItem_faux);

class Menu extends React.Component {	
	constructor(){
		super();
	}

	render()
	{
		// add to array here to add a button
		const menu_items = [
			{'button': 'Change datalayer'},
			{'button': 'Change map type'},
		];
		const menu_item_components = menu_items.map((menu_item, i) => {
			var key = Object.keys(menu_item)[0];
			var value = menu_item[key];
			const id = value.split(' ').join('_').toLowerCase().concat('_' + key);
			return <MenuItem {...this.props} key={i} type={key} id={id} content={value} />;
		});
		return <div id="menu"> {menu_item_components} <span id='debug'></span></div>;
	}
}
export default connect()(Menu)
