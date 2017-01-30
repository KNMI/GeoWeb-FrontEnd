import React from "react";
import { Provider } from 'react-redux'

class MenuItem extends React.Component {
	constructor(){
		super();
	}

	button_click(e){
		switch(e.target.id)
		{
			case 'change_datalayer_button':
				// Provider.store.dispatch({type: 'CHANGE_DATASET'});
				this.props.onLayerChange(e);
				break;
			case 'change_map_type_button':
				this.props.onMapTypeChange(e);
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

export default class Menu extends React.Component {	
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
			return <MenuItem {...this.props} key={i} type={key} id={value.split(' ').join('_').toLowerCase().concat('_' + key)} content={value} />;
		});
		return <div id="menu"> {menu_item_components} <span id='debug'></span></div>;
	}
}
