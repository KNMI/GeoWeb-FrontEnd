

var WMJSImageStore = function(maxNumberOfImages,_loadEventCallback,_type){
  //console.log("Creating new Imagestore");
  this.images = [];
  this.imagesbysrc={};
  this.imageLife = 0;
  var imageLifeCounter = 0;
  var _this = this;
  var type = _type;
  var loadEventCallback = _loadEventCallback;
  
  
  
  /**
   * Check if we have similar images with the same source in the pipeline
   */
  _this.getImageForSrc = function(src){
    if(_this.imagesbysrc[src]){
      return _this.imagesbysrc[src];
    }
    return undefined;
  };
  
  _this.clear = function(){
     for(var j=0;j<_this.images.length;j++){
      _this.images[j].clear();
    }
  }
  
  
  _this.setLoadEventCallback = function(callback){
    loadEventCallback = callback;
//     for(var j=0;j<_this.images.length;j++){
//       _this.images[j].setLoadEventCallback(callback);
//     }
  };
  
  _this.getNumImagesLoading = function(){
    var numLoading = 0;
    for(var j=0;j<_this.images.length;j++){
      if(_this.images[j].isLoading())numLoading++;
    }
    return numLoading;
  };

  _this.getImage = function(src){
    
    
    
    /** Check if we have an image in the pipeline **/
    var image = _this.getImageForSrc(src);
    if(image!=undefined){
      image.imageLife = imageLifeCounter++;
      //console.log("Found image");
      return image;
    }
    
    /** Create or reuse an image **/
    if(_this.images.length<maxNumberOfImages){
      //console.log("Creating new image: "+this.images.length);
      //console.log(type);
      var image = new WMJSImage(src,loadEventCallback,type);
      image.setSource(src);
      image.KVP = WMJSKVP(src);
      _this.imagesbysrc[src]=image;
      image.imageLife = imageLifeCounter++;
      
      
      
      _this.images.push(image);
      
      return image;
    }else{
      //We have to reuse an image
      //error("Reusing image");
      var imageId = -1;
      var minImageLife = imageLifeCounter;
      for(var j=0;j<_this.images.length;j++){
        ////console.log(j+"): isloading: ["+_this.images[j].isLoading()+"] isloading: ["+_this.images[j].isLoaded()+"] imageLife: ["+_this.images[j].imageLife+"]");
        if(_this.images[j].isLoading() == false && _this.images[j].isLoaded() == true){
          
          if(minImageLife >= _this.images[j].imageLife){
            minImageLife = _this.images[j].imageLife;
            imageId=j;
          }
        }
      }
      //console.log("Reusing image "+imageId+" with lifetime "+minImageLife);
      if(imageId == -1){
        alert("not enough cache for "+type);
        imageId = 0;
        return ;
      }
      
      var image = _this.images[imageId];
      if(_this.imagesbysrc[image.srcToLoad]){
        delete _this.imagesbysrc[image.srcToLoad];
      }
      image.setSource(src);
      image.KVP = WMJSKVP(src);
      _this.imagesbysrc[src]=image;
      image.imageLife = imageLifeCounter++;
      return image;
    }
  };
};
