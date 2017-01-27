import React from "react";

class MenuItem extends React.Component {
	constructor(){
		super();
	}

	button_click(e){
		switch(e.target.id)
		{
			case 'change_datalayer_button':
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
		var emoji_style = {
			fontFamily: 'Symbola',
			fontSize: '150%',
		}
		if(this.props.type === 'button')
			return <button style={button_style} onClick={this.button_click.bind(this)} class="btn btn-primary" id={this.props.id}>{this.props.content}</button>
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
			return <MenuItem key={i} type={key} onMapTypeChange={this.props.onMapTypeChange} onLayerChange={this.props.onLayerChange} id={value.split(' ').join('_').toLowerCase().concat('_' + key)} content={value} />;
		});
		return <div id="menu"> {menu_item_components} <span id='debug'></span></div>;
	}
}
