import React from "react";
import {connect} from "react-redux";
import {create_map} from "../actions/ADAGUC_actions"
class ADAGUC extends React.Component 
{
  constructor() {
    super();
    this.do_func = this.do_func.bind(this);
    this.resize_func = this.resize_func.bind(this);
    this.updateAnimation = this.updateAnimation.bind(this);
    this.set_active_baselayer = this.set_active_baselayer.bind(this);
  }
  currentLatestDate = undefined;
  currentBeginDate = undefined;

  updateAnimation(layer){
    var timeDim = layer.getDimension('time');
    var numTimeSteps = timeDim.size();

    var num_steps_back = Math.min(timeDim.size(), 25);
    this.currentLatestDate = timeDim.getValueForIndex(numTimeSteps-1);
    this.currentBeginDate = timeDim.getValueForIndex(numTimeSteps - num_steps_back);
    $('#debug').html("Latest date: "+this.currentLatestDate);
    var dates = [];
    for(var j=numTimeSteps - num_steps_back;j < numTimeSteps;++j){
      dates.push({name:timeDim.name, value:timeDim.getValueForIndex(j)});
    }
    this.webMapJS.draw(dates);
    setTimeout(function(){layer.parseLayer(this.updateAnimation,true);},10000);
  }

  do_func(layer){
    this.webMapJS.setAnimationDelay(200);
    this.updateAnimation(layer); 
    layer.onReady = undefined;
  }

  resize_func(){
    this.webMapJS.setSize(($(document).width()-300)/2,$(document).height() / 2);
  }

  set_active_baselayer(){
    this.baselayers.map((layer) => layer.enabled = layer.name === this.props.map_type.name);
  }

  createMap(dom_element)
  {
    if(dom_element === null || this.props.map_created === true){
      return ;
      // TODO unmount -- should unmount and cleanup now
    }
    var username = 'terpstra';
    var url = ['http://localhost/~', username, '/adagucviewer/webmapjs'].join('');
    this.webMapJS = new WMJSMap(dom_element);
    this.webMapJS.setBaseURL(url);
    $( window ).resize(this.resize_func);
   // this.webMapJS.setSize($( window ).width(),$( document ).height() - 43);
        this.webMapJS.setSize(($(document).width()-300)/2,$(document).height() / 2);

    // Set the initial projection
    this.webMapJS.setProjection(this.props.projection_name);
    this.webMapJS.setBBOX(this.props.bounding_box.join());
    this.webMapJS.setBaseLayers([new WMJSLayer(this.props.map_type)]);
    this.props.dispatch(create_map());
  }

  componentDidUpdate(prev_props, prev_state){
    // The first time, the map needs to be created. This is when in the previous state the map creation boolean is false
    // Otherwise only change when a new dataset is selected
    var {layer} = this.props;
    if(!prev_props.map_created || layer !== prev_props.layer)
    {
      var new_data_layer = new WMJSLayer(layer);
      // Stop the old animation
      this.webMapJS.stopAnimating();
      // Start the animation of th new layer
      new_data_layer.onReady = this.do_func;
      // Remove all present layers
      this.webMapJS.removeAllLayers();
      // And add the new layer
      this.webMapJS.addLayer(new_data_layer);
      // console.log("switched layers");
    }else{
      this.webMapJS.setBaseLayers([new WMJSLayer(this.props.map_type)]);
    }
  }

  render() {  
    return <div id={this.props.id} ref={(dom_element) => {this.createMap(dom_element); this.map_component = dom_element}}></div>
  }
}
export default connect()(ADAGUC)
