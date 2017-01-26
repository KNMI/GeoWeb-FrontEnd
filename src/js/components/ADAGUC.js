import React from "react";

export default class ADAGUC extends React.Component 
{
  constructor() {
    super();
    this.state = {
      map_created: false
    }
  }
  map_styles = {
    base_layer_osm_params: {
      service:"http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?",
      name:"streetmap",
      title:"World base layer",
      format:"image/gif",
      enabled:true,
    },
    base_layer_mws_params: {
      service:"http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?",
      name:"mwsmap",
      transparent: false,
      title:"World base layer",
      format:"image/png",
      enabled:true,
    },
  }; 

  dataset_params = {
    harmonie_layer_params: {
      title:'Harmonie forecasts',
      thumbnail:'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
      service:'http://geoservices.knmi.nl/cgi-bin/HARM_N25.cgi?',
      name:'air_temperature__at_2m',
      // name: 'precipitation_flux'
    },
    radar_layer_params: {
      service: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
      name: 'RADNL_OPER_R___25PCPRR_L3_COLOR',
    }
  };
    currentLatestDate = undefined;
    currentBeginDate = undefined;

      updateAnimation = function(layer){
        console.log("asdf")
        var timeDim = layer.getDimension('time');
        var numTimeSteps = timeDim.size();

        if(timeDim.getValueForIndex(numTimeSteps-1) != this.currentLatestDate){
          this.currentLatestDate = timeDim.getValueForIndex(numTimeSteps-1);
          this.currentBeginDate = timeDim.getValueForIndex(numTimeSteps-12);
          //$('#debug').html("Latest date: "+currentLatestDate);
          
          var dates = [];
          for(var j=numTimeSteps-12;j<numTimeSteps;j++){
            dates.push({name:'time', value:timeDim.getValueForIndex(j)});
          }
          this.wmjs.draw(dates);
          console.log(dates);
        }
        setTimeout(function(){layer.parseLayer(this.updateAnimation,true);},10000);
    };

  createMap(dom_element)
  {
    if(dom_element === null || this.state.map_created === true){
      return ;
      // TODO unmount -- should unmount and cleanup now
    }
    // console.log(this.props)

    console.log("hier create map")
    var username = 'terpstra';
    var url = ['http://localhost/~', username, '/adagucviewer/webmapjs'].join('');
    var webMapJS = new WMJSMap(dom_element);
    webMapJS.setBaseURL(url);
    $( window ).resize(function() {
      webMapJS.setSize($( window ).width(),$( document ).height())
      webMapJS.draw();
    });
    webMapJS.setSize($( window ).width(),$( document ).height());
    var baseLayer = new WMJSLayer(this.props.map_type === 'mws' ? this.map_styles.base_layer_mws_params : this.map_styles.base_layer_osm_params); 
    var datalayer = new WMJSLayer(this.props.dataset === 'Harmonie' ? this.dataset_params.harmonie_layer_params : this.dataset_params.radar_layer_params);



    // // EWWW
    var _this = this;
    datalayer.onReady = function(layer){
      webMapJS.setProjection(_this.props.projection_name);
      webMapJS.setBBOX(_this.props.bounding_box.join());
      
      webMapJS.setAnimationDelay(200);
      // if(_this.props.animate)
      // {
        _this.updateAnimation(layer);  
        webMapJS.draw();
      // }
      // else
      // {
        // var timeDim = layer.getDimension('time');
        // var j = timeDim.size() - 1;
        // webMapJS.draw({name:'time', value:timeDim.getValueForIndex(j)}); 
      // }
      layer.onReady = undefined;
    };
    
    

    webMapJS.setBaseLayers([baseLayer]);
    webMapJS.addLayer(datalayer);
    // return webMapJS;
    this.setState({map_created: true});
    this.wmjs = webMapJS;
  }

  componentDidUpdate(prev_prop, prev_state){
    // var layers =  this.wmjs.getLayers();
    console.log(this.props.dataset);
    var datalayer = new WMJSLayer(this.props.dataset === 'Harmonie' ? this.dataset_params.harmonie_layer_params : this.dataset_params.radar_layer_params);
    var currentLatestDate = undefined;
    var currentBeginDate = undefined;

    // // EWWW
    var _this = this;

    datalayer.onReady = function(layer){
      console.log("ready");
      _this.wmjs.setProjection(_this.props.projection_name);
      _this.wmjs.setBBOX(_this.props.bounding_box.join());
      
      _this.wmjs.setAnimationDelay(200);
      // if(_this.props.animate)
      // {
        _this.updateAnimation(layer);  
        _this.wmjs.draw();
      // }
      // else
      // {
        // var timeDim = layer.getDimension('time');
        // var j = timeDim.size() - 1;
        // webMapJS.draw({name:'time', value:timeDim.getValueForIndex(j)}); 
      // }
      layer.onReady = undefined;
    };
    this.wmjs.removeAllLayers();
    this.wmjs.addLayer(datalayer);
  }



  render() {  
    return <div id="map" ref={(dom_element) => {this.createMap(dom_element); this.map_component = dom_element}}></div>
  }
}
