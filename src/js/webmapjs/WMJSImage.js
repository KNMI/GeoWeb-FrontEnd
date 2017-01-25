/*
 * WMJSImage
  * image.this.srcToLoad the source to load
  * image._srcLoaded the loaded source
  */

var WMJSImage = function(src,callback,__type){
  var _this = this;
  this.srcToLoad=src;
  var _srcLoaded = "undefined image";
  var _isLoaded = false;
  var _isLoading = false;
  var _hasError = false;
  var _type = __type;
  var _opacity = 1;
  var loadEventCallback = callback;
  
  
  
  _this.isLoaded = function(){
    if(_isLoading)return false;
    return _isLoaded;
  }
  
  _this.isLoading = function(){
    return _isLoading;
  }

  _this.checkIfThisSourceIsSet = function(src){
     if(_srcLoaded == src || this.srcToLoad == src){
       return true;
     }
     return false;
  };
  /**
   * Set source of image, does not load yet.
   */
  _this.setSource = function(src){
    if(_isLoading){
      //console.log("-------------------------> Source set while still loading!!! ");
      return;
    }
    this.srcToLoad = src;
    if(_srcLoaded==this.srcToLoad){
      _isLoaded = true;
      return;
    }
    
    //console.log("Setting loaded to false");
    _isLoaded = false;
    //_isLoading = false;
  };
  
  _this.clear = function(){
    _srcLoaded = "undefined image";
    this.srcToLoad = "";
    _isLoaded = false;
    _isLoading = false;
    _hasError = false;
  };
  
  
  _this.getSrc = function(){
    return this.srcToLoad;
  }

  _this.hasError = function(){
    return _hasError;
  };
  
  /**
   * 
   * Load image *
   */
  _this.load = function(){
    //console.log("WMJSImage:load "+this.srcToLoad);
    
    
    _hasError = false;
    if(_isLoaded == true){
       //console.log("==== Already isloaded ==== :"+_isLoaded);
       loadEvent(_this);
       return;
    }
    _isLoading = true;
    
    
    if(this.srcToLoad == _srcLoaded){
      //console.log("==== Already loaded ==== :"+this.srcToLoad);
      loadEvent(_this);
      return;
    }
    
    el.load(function() {
      loadEvent(_this,false);
    });
    el.error( function() {
      loadEvent(_this,true);
    });
    el.attr("src", this.srcToLoad+"&"+Math.random());
  };
  

  
  //var setImageProps = function(image){
    
  var loadEvent= function(image,hasError){
    if(_isLoading == false && _isLoaded == true){
      //console.log("---------------->Skipping WMJSImage:loadEvent");
      return;
    }
    //console.log("WMJSImage:ready "+this.srcToLoad);
    //console.log("WMJSImage:loadEvent");
    _hasError = hasError
    _isLoading=false;
    _isLoaded=true;
    _srcLoaded = this.srcToLoad;
    if(isDefined(loadEventCallback)){
      loadEventCallback(_this);
    }
  };

//   _this.setLoadEventCallback = function(callback){
//     loadEventCallback = callback;
//   };
//   
  _this.setOpacity = function(__opacity){
    _opacity=parseFloat(__opacity);
    el.css('opacity', _opacity);
  };

  _this.getOpacity = function(opacity){
    return _opacity;
  };
  
  _this.setPosition = function(x, y){
//     if(_type == 'wmjsimagebuffer'){
      el.css({top: parseInt(y)+'px', left: parseInt(x)+'px', position:'absolute'});
//     }
  };
  
  _this.setSize = function(w,h){
    
    w = parseInt(w);
    h= parseInt(h)
    if(w == 0 || h == 0)return;
    if(isNaN(w)||isNaN(h))return;
    //console.log("Set size " +w+","+h);
     el.width(parseInt(w)+'px');
     el.height(parseInt(h)+'px');
  };
  
  _this.setZIndex = function(z){
     el.zIndex = z;
     //el.css({position:'absolute'});
  };
  
  _this.getElement = function(){
    return el;
  };
  

 
  var el=$(document.createElement('img'));
//    el.css('border', "solid 2px red");
  //console.log(_type);
  if(_type == 'wmjsimagebuffer'){
    el.left='0px';
    el.top='0px';
    el.css({position:'absolute'});
  }else{
    //console.log('relative')
    el.css({'position':'relative'});
  }
  el.onselectstart = function(){return false;};
  el.ondrag = function(){return false;};
  

  
 
  
  return _this;
};
