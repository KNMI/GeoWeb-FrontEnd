import React from "react";
import ReactDOM from "react-dom";
var Menu = require('react-burger-menu').slide;

import GeoWeb from "./components/GeoWeb";

const app = document.getElementById('app');
ReactDOM.render(<GeoWeb />, app);
