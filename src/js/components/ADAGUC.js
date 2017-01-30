import React from "react";
import {connect} from "react-redux";
import {OSM_STYLE, MWS_STYLE} from "../constants/map_styles";
import {HARMONIE, RADAR} from "../constants/datasets";
class ADAGUC extends React.Component 
{
  constructor() {
    super();
    this.do_func = this.do_func.bind(this);
    this.resize_func = this.resize_func.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.set_active_baselayer = this.set_active_baselayer.bind(this);
    this.map_styles = [OSM_STYLE, MWS_STYLE]
  }
  baselayers = [];

    currentLatestDate = undefined;
    currentBeginDate = undefined;

    updateAnimation(layer){
      var timeDim = layer.getDimension('time');
      var numTimeSteps = timeDim.size();

      var num_steps_back = 12;
      if(timeDim.getValueForIndex(numTimeSteps-1) != this.currentLatestDate){
        this.currentLatestDate = timeDim.getValueForIndex(numTimeSteps-1);
        this.currentBeginDate = timeDim.getValueForIndex(numTimeSteps - num_steps_back);
        $('#debug').html("Latest date: "+this.currentLatestDate);
        var dates = [];
        for(var j=numTimeSteps - num_steps_back;j < numTimeSteps;++j){
          dates.push({name:timeDim.name, value:timeDim.getValueForIndex(j)});
        }
        this.webMapJS.draw(dates);
      }
      setTimeout(function(){layer.parseLayer(this.updateAnimation,true);},10000);
  };

  do_func(layer){
      
      this.webMapJS.setAnimationDelay(200);
      this.updateAnimation(layer); 
      layer.onReady = undefined;
  }

  resize_func(){
      this.webMapJS.setSize($(window).width(),$(document).height() - 43)
  }

  set_active_baselayer(){
      this.baselayers.map((layer) => layer.enabled = layer.name === this.props.map_type);
  }

  createMap(dom_element)
  {
    if(dom_element === null || this.props.map_created === true){
      return ;
      // TODO unmount -- should unmount and cleanup now
    }
    console.log('crfeate')
    var username = 'terpstra';
    var url = ['http://localhost/~', username, '/adagucviewer/webmapjs'].join('');
    this.webMapJS = new WMJSMap(dom_element);
    this.webMapJS.setBaseURL(url);
    $( window ).resize(this.resize_func);
    this.webMapJS.setSize($( window ).width(),$( document ).height() - 43);
    // Add both possible base layers
    Object.keys(this.map_styles).map((key) => {
      this.baselayers.push(new WMJSLayer(this.map_styles[key]));
    }); 
    // Set the initial projection
    this.webMapJS.setProjection(this.props.projection_name);
    this.webMapJS.setBBOX(this.props.bounding_box.join());

    this.webMapJS.setBaseLayers(this.baselayers);
    this.props.dispatch({type: 'MAP_CREATED'});
  }

  componentDidUpdate(prev_props, prev_state){
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    var {dataset} = this.props;
    console.log('componentDidUpdate');
    if(!prev_state || !prev_state.map_created || dataset !== prev_props.dataset)
    {
        // Create the new layer
        var new_data_layer = new WMJSLayer(dataset === 'Harmonie' ? HARMONIE : RADAR);
        // Stop the old animation
        this.webMapJS.stopAnimating();
        // Start the animation of th new layer
        new_data_layer.onReady = this.do_func;
        // Remove all present layers
        this.webMapJS.removeAllLayers();
        // And add the new layer
        this.webMapJS.addLayer(new_data_layer);
    }else{
        this.set_active_baselayer();
    }
  }



  render() {  
    return <div id="map" ref={(dom_element) => {this.createMap(dom_element); this.map_component = dom_element}}></div>
  }
}
export default connect()(ADAGUC)
