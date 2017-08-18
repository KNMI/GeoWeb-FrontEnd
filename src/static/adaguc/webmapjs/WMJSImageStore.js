
var WMJSImageStore = function (maxNumberOfImages, _type, options) {
  // console.log("Creating new Imagestore");
  // this.images = [];
  this.imagesbysrc = {};
  this.imageLife = 0;
  var imageLifeCounter = 0;
  var _this = this;
  var type = _type;
  var loadEventCallbackList = []; // Array of callbacks, as multiple instances can register listeners

  var imageLoadEventCallback = function (_img) {
    for (var j = 0; j < loadEventCallbackList.length; j++) {
      loadEventCallbackList[j](_img);
    }
  };

  var getKeys = function (obj) {
    if (!Object.keys) {
      var keys = [];
      var k;
      for (k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          keys.push(k);
        }
      }
      return keys;
    } else {
      return Object.keys(obj);
    }
  };

  /**
   * Check if we have similar images with the same source in the pipeline
   */
  _this.getImageForSrc = function (src) {
    if (_this.imagesbysrc[src]) {
      return _this.imagesbysrc[src];
    }
    return undefined;
  };

  _this.clear = function () {
    for (var property in _this.imagesbysrc) {
      if (_this.imagesbysrc.hasOwnProperty(property)) {
        _this.imagesbysrc[property].clear();
      }
    }
  };

  _this.addLoadEventCallback = function (callback) {
    loadEventCallbackList.push(callback);
  };

  _this.getNumImagesLoading = function () {
    var numLoading = 0;
    for (var property in _this.imagesbysrc) {
      if (_this.imagesbysrc.hasOwnProperty(property)) {
        if (_this.imagesbysrc[property].isLoading()) {
          numLoading++;
        }
      }
    }
    return numLoading;
  };

  _this.getImage = function (src) {
    /** Check if we have an image in the pipeline **/
    var image = _this.getImageForSrc(src);
    if (image !== undefined) {
      image.imageLife = imageLifeCounter++;
      // console.log("Found image");
      return image;
    }

    // console.log('_this.imagesbysrc.length' + Object.keys(_this.imagesbysrc).length);
    // console.log('_this.images.length' + _this.images.length);

    /** Create or reuse an image **/
    if (getKeys(_this.imagesbysrc).length < maxNumberOfImages) {
      // console.log("Creating new image: "+this.images.length);
      // console.log(type);
      image = new WMJSImage(src, imageLoadEventCallback, type, options);
      image.setSource(src);
      image.KVP = WMJSKVP(src);
      _this.imagesbysrc[src] = image;
      image.imageLife = imageLifeCounter++;
      return image;
    } else {
      // We have to reuse an image
      // error("Reusing image");
      var imageId = -1;
      var minImageLife = imageLifeCounter;
      for (var property in _this.imagesbysrc) {
        if (_this.imagesbysrc.hasOwnProperty(property)) {
          let img = _this.imagesbysrc[property];
          // //console.log(j+"): isloading: ["+_this.images[j].isLoading()+"] isloading: ["+_this.images[j].isLoaded()+"] imageLife: ["+_this.images[j].imageLife+"]");
          if (img.isLoading() === false && img.isLoaded() === true) {
            if (minImageLife >= img.imageLife) {
              minImageLife = img.imageLife;
              imageId = property;
            }
          }
        }
      }
      console.log('Reusing image ' + imageId + ' with lifetime ' + minImageLife);
      if (imageId === -1) {
        console.error('not enough cache for ' + type);
        imageId = 0;
        return;
      }

      image = _this.imagesbysrc[imageId];
      delete _this.imagesbysrc[imageId];
      image.clear();
      image.setSource(src);
      image.KVP = WMJSKVP(src);
      _this.imagesbysrc[src] = image;
      image.imageLife = imageLifeCounter++;
      return image;
    }
  };
};
