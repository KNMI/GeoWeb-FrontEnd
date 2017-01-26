import React from "react";

class MenuItem extends React.Component {
	constructor(){
		super();
	}

	button_click(e){
		this.props.onLayerChange(e);
	}

	render(){
		console.log(this.props);
		return <button onClick={this.button_click.bind(this)} class="btn btn-primary" id={this.props.id}>{this.props.content}</button>
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
			'Change datalayer'
		];

		const menu_item_components = menu_items.map((menu_item, i) => 
			<MenuItem key={i} onLayerChange={this.props.onLayerChange} id={menu_item.split(' ').join('_').toLowerCase().concat('_button')} content={menu_item} />);
		return <div id="menu"> {menu_item_components} </div>;
	}
}
