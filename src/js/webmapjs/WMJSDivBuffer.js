

var WMJSDivBuffer = function(webmapJSCallback,_type,_imageStore,w,h){
  //console.log("WMJSDivBuffer created");
  var _this = this;
  this.div=$(document.createElement('div'));
  
  
  
  var imageStore =_imageStore;
  this.ready = true;
  this.hidden = true;
  this.layers = [];
  var width = w;
  var height = h;
  var imageWidth = w;
  var imageHeight = w;
  var type = _type;
  
  if(type=='imagebuffer'){
    this.div.addClass("wmjsimagebuffer");
  }
  if(type=='legendbuffer'){
    this.div.addClass("wmjslegendbuffer");
  }
  
  this.div.addClass("WMJSDivBuffer-noselect");
  
  this.imageLoadComplete = function(image){
    statDivBufferImageLoaded();
    webmapJSCallback.triggerEvent("onimageload");
  };
  
  

  
  var statDivBufferImageLoaded = function(){
    //console.log("WMJSDivBuffer:statDivBufferImageLoaded");
    
    for(var j=0;j<_this.layers.length;j++){
      if(_this.layers[j].isLoaded() == false){
        return;
      }
    }
    //console.log("WMJSDivBuffer:statDivBufferImageLoaded OK!");
    _this.finishedLoading();

  };
  
  
  var defaultImage = new WMJSImage("webmapjs/img/stoploading.png",function(){console.log("fake image loaded");statDivBufferImageLoaded();},type);
  this.hide = function(){
    //console.log("WMJSDivBuffer:hide");
    _this.hidden = true;
    _this.div.hide();
    _this.layers = [];

  };
  
  this.display = function(){
     //console.log("======= WMJSDivBuffer:display");
    if(_this.hidden == false)return;
    _this.hidden = false;
    _this.div.empty();
    for(var j=0;j<_this.layers.length;j++){
     // _this.layers[j].setPosition(0,0);
      _this.layers[j].setSize(width,height);
      if(_this.layers[j].hasError() == false){
        //console.log(_this.layers[j].getSrc());
        _this.div.append(_this.layers[j].getElement());
      }else{
          error("<a target=\'_blank\' href='"+_this.layers[j].getSrc()+"'>"+_this.layers[j].getSrc()+"</a>",false);
      }
    }
    
    
    
    _this.div.show();
  };
  
  this.finishedLoading = function(){
//     console.log("======= WMJSDivBuffer:finishedLoading");
    if(_this.ready)return;
    _this.ready=true;
    try{
      if(isDefined(_this.onLoadReadyFunction)){
        _this.onLoadReadyFunction(_this);
      }
    }catch(e){
      error("Exception in Divbuffer::finishedLoading: "+e);
    }
 
  
  };
  
  this.setPosition = function(x,y){
    if(isNaN(x)||isNaN(y)){
      x=0;y=0;
    }
    _this.div.css({top: y, left: x});
//      for(var j=0;j<this.layers.length;j++){
//       this.layers[j].setPosition(x,y);
//     }
  };
  
  this.setSize = function(w,h){
    imageWidth = w;
    imageHeight = h;
    _this.div.width(w);
    _this.div.height(h);
    for(var j=0;j<this.layers.length;j++){
      this.layers[j].setSize(w,h);
    }
  };
  
  this.resize = function(w,h){
    width=w;
    height=h;
    imageWidth=w;
    imageHeight=h;
    _this.setSize(w,h);
    _this.div.width(w);
    _this.div.height(h);

  };
  
  this.load = function(callback){
    if(_this.ready==false){
      //console.log(" ===== Still busy ====== ");
      return;
    }
    _this.ready = false;
    
    
    
    //console.log("WMJSDivBuffer:load");
    //this.setPosition(0,0);
    if(callback){this.onLoadReadyFunction = callback;}else _this.onLoadReadyFunction = function(){}
    _this.nrLoading = 0;
    //console.log("WMJSDivBuffer:this.layers.length = "+this.layers.length);
    
    for(var j=0;j<this.layers.length;j++){
      _this.layers[j].loadThisOne = false;

      if(_this.layers[j].isLoaded()==false){
        _this.layers[j].loadThisOne = true;
        _this.nrLoading++;
      }
    }
    //console.log("WMJSDivBuffer.nrLoading = "+this.nrLoading +" nrImages = "+this.layers.length );
    if(this.nrLoading==0){
      statDivBufferImageLoaded();
    }else{
      if(type=='imagebuffer'){debug("GetMap:");}
      if(type=='legendbuffer'){debug("GetLegendGraphic:");}
      for(var j=0;j<this.layers.length;j++){
        if(this.layers[j].loadThisOne == true){
          debug("<a target=\'_blank\' href='"+this.layers[j].getSrc()+"'>"+this.layers[j].getSrc()+"</a>",false);
        }
      }
      
      for(var j=0;j<this.layers.length;j++){
        if(this.layers[j].loadThisOne == true){
          //console.log("WMJSDivBuffer.loading = "+this.layers[j].getSrc());
          this.layers[j].load();
        }
      }
    }
  };
  
  this.setSrc = function (layerIndex,imageSource,width,height){
    if(!isDefined(imageSource)){console.log("undefined");return;}
    while(layerIndex>=this.layers.length){
        this.layers.push(defaultImage);
        
    }
    var image = imageStore.getImage(imageSource);
    //image.setPosition(0,0);
    //image.setSize(width,height);
    image.setZIndex(layerIndex);
    //console.log("set image "+layerIndex);
    this.layers[layerIndex]=image;
  };
  

  this.setOpacity = function (layerIndex,opacity){
    if(layerIndex>=this.layers.length){
      error("setOpacity :invalid id");
      return;
    }
    var op=parseFloat(opacity);
    this.layers[layerIndex].setOpacity(op);
  };
  
   this.getBuffer = function(){
    return _this.div;
  };
};
  
