import React from "react";
import {render} from "react-dom";
// var Menu = require('react-burger-menu').slide;
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import reducer from './reducers/index'
import GeoWeb from "./components/GeoWeb";

// let store = createStore(reducer);
// use this one for react dev tools
let store = createStore(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
console.log(store.getState())

render(
	<Provider store={store}>
		<GeoWeb />
	</Provider>, 
	document.getElementById('app')
);
