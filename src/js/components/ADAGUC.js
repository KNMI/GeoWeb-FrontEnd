import React from "react";

import Footer from "./Footer";
import Header from "./Header";

export default class ADAGUC extends React.Component {

  constructor() {
    super();
    this.state = {

      projection_name: "EPSG:3857",
      bounding_box: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958],
      base_layer_params: {
        service:"http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?",
        name:"streetmap",
        title:"World base layer",
        format:"image/gif",
        enabled:true,
      },
      harmonie_layer_params: {
        title:'Harmonie forecasts',
        thumbnail:'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
        service:'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
        name:'air_temperature__at_2m',
      },
      radar_layer_params: {
        service: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
        name: 'RADNL_OPER_R___25PCPRR_L3_COLOR',
      }
    };
  };  

  componentDidMount(){
    var username = 'terpstra';
    var url = ['http://localhost/~', username, '/adagucviewer/webmapjs'].join('');
    var webMapJS = new WMJSMap(document.getElementById('app'));
    webMapJS.setBaseURL(url);
    $( window ).resize(function() {
      webMapJS.setSize($( window ).width(),$( document ).height())
      webMapJS.draw();
    });
    webMapJS.setSize($( window ).width(),$( document ).height())
    
    var baseLayer = new WMJSLayer(this.state.base_layer_params);
    var radarlayer = new WMJSLayer(this.state.radar_layer_params);
    var harmonieLayer = new WMJSLayer(this.state.harmonie_layer_params);
    var currentLatestDate = undefined;
    var currentBeginDate = undefined;

    var updateAnimation = function(layer){
        var timeDim = layer.getDimension('time');
        var numTimeSteps = timeDim.size();

        if(timeDim.getValueForIndex(numTimeSteps-1) != currentLatestDate){
          currentLatestDate = timeDim.getValueForIndex(numTimeSteps-1);
          currentBeginDate = timeDim.getValueForIndex(numTimeSteps-12);
          //$('#debug').html("Latest date: "+currentLatestDate);
          
          var dates = [];
          for(var j=numTimeSteps-12;j<numTimeSteps;j++){
            dates.push({name:'time', value:timeDim.getValueForIndex(j)});
          }
          webMapJS.draw(dates);
        }

        setTimeout(function(){layer.parseLayer(updateAnimation,true);},10000);
    };

    // EWWW
    var _this = this;
    harmonieLayer.onReady = function(layer){
      webMapJS.setProjection(_this.state.projection_name);
      webMapJS.setBBOX(_this.state.bounding_box.join());
      
      webMapJS.setAnimationDelay(200);
      updateAnimation(layer);  
      layer.onReady = undefined;
      webMapJS.draw();
    };
    

    webMapJS.setBaseLayers([baseLayer]);
    webMapJS.addLayer(harmonieLayer);
    webMapJS.draw();
  }

  render() {
    return <div></div>

  }
}
