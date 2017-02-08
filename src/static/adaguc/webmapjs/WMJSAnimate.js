var WMJSAnimate = function (_map) {
  _map.animationDelay = 100;

  var callBack = _map.getListener();
  var imageStore = _map.getImageStore();
  var _this = this;

  var divAnimationInfo = document.createElement('div');
  $(divAnimationInfo).mouseout(function () {
    _map.mouseHoverAnimationBox = false;
  });

  function removeAllChilds (element) {
    try {
      if (element.hasChildNodes()) {
        while (element.childNodes.length >= 1) {
          element.removeChild(element.firstChild);
        }
      }
    } catch (e) {}
  }

  var drawAnimationBar = function (h) { };// drawAnimationBar

  var animate = function () {
    //         if(controlsBusy == true)return;
    if (_map.isAnimating == false) return;
    if (_map.animateBusy == true) return;

    var animationStep = _map.animationList[_map.currentAnimationStep];
    if (!animationStep) {
      error('No animation step for ' + _map.currentAnimationStep);
      return;
    }
      // _map.animateBusy = true;

      // console.log("draw on animation");
      // console.log("Showing animationstep "+_map.currentAnimationStep);
    _map.setDimension(animationStep.name, animationStep.value);
    _map._pdraw();
    _map.animateBusy = false;
    drawAnimationBar();
  };// animate

  var myAnimationTimer = 0;
  var animateLoop = function () {
    if (_map.isAnimating == false) {
      _map.isAnimatingLoopRunning = false;
      return;
    }
    _map.animationTimer.init(50, animateLoop);
    _this.checkAnimation();
    myAnimationTimer--; if (myAnimationTimer > 0) return;

    var animationDelay = _map.animationDelay;
    if (_map.currentAnimationStep == 0) {
      animationDelay = animationDelay * 3;// 800;
    }
    if (_map.currentAnimationStep == _map.animationList.length - 1) {
      animationDelay = animationDelay * 5;// 800;
    }
    myAnimationTimer = animationDelay / 50;
    // console.log("animate:"+myAnimationTimer);

    if (_map.mouseHoverAnimationBox === false) {
      animate();

      var nextStep = _map.currentAnimationStep + 1;
      if (nextStep >= _map.animationList.length) {
        nextStep = 0;
      }

      var continueAnimation = false;
      var numReady = 0;

      var animationStep = _map.animationList[nextStep];
      _map.setDimension(animationStep.name, animationStep.value);
      _map.animationList[nextStep].requests = _map.getWMSRequests();
      animationStep = _map.animationList[_map.currentAnimationStep];
      _map.setDimension(animationStep.name, animationStep.value);
      for (var i = 0; i < _map.animationList[nextStep].requests.length; i++) {
        var url = _map.animationList[nextStep].requests[i];
        var image = _map.getImageStore().getImageForSrc(url);
        if (image && image.isLoaded()) {
          numReady++;
        } else {
          myAnimationTimer = 0;
          console.log('LOADING: ' + nextStep);
//           if(image){
//             console.log("LOADING IMAGE: "+image.isLoading());
//           }else{
//             console.log("LOADING !" );
//           }
        }
      }
      if (numReady == _map.animationList[nextStep].requests.length) {
        continueAnimation = true;
      }

      if (continueAnimation) {
        _map.currentAnimationStep = nextStep;
      }
    }
  };

  _map.isAnimatingLoopRunning = false;

  _this.checkAnimation = function () {
    if (_map.isAnimating == false) {
      _map.isAnimatingLoopRunning = false;
      return;
    }
    if (!_map.animationTimer) {
      _map.animationTimer = new WMJSTimer();
    }
    drawAnimationBar();

    callBack.triggerEvent('onnextanimationstep', _map);

    if (_map.mouseHoverAnimationBox === false) {
        // _map.setDimension(animationStep.name,animationStep.value);
        // animationStep.imagesInPrefetch = _map.prefetch(animationStep.requests);

      var maxSimultaneousLoads = 2;

      var getNumImagesLoading = imageStore.getNumImagesLoading();
        // console.log("checkAnimation:getNumImagesLoading:"+getNumImagesLoading );
      if (getNumImagesLoading < maxSimultaneousLoads) {
        var numberPreCacheSteps = 6;// _map.animationList.length;
        if (_map.animationList.length > 0) {
          for (var j = 0; j < numberPreCacheSteps; j++) {
            var index = j + _map.currentAnimationStep;
            while (index < 0)index += _map.animationList.length;
            while (index >= _map.animationList.length)index -= _map.animationList.length;
            if (index < 0)index = 0;

            if (index >= 0) {
              var animationStep = _map.animationList[index];
              _map.setDimension(animationStep.name, animationStep.value);
              _map.animationList[index].requests = _map.getWMSRequests();
              animationStep = _map.animationList[_map.currentAnimationStep];
              _map.setDimension(animationStep.name, animationStep.value);

              _map.animationList[index].imagesInPrefetch = _map.prefetch(_map.animationList[index].requests);

//             if(_map.animationList[index].imagesInPrefetch.length>0){
//               console.log("prefetching "+index);
//             }

              getNumImagesLoading += _map.animationList[index].imagesInPrefetch.length;// imageStore.getNumImagesLoading();
              if (getNumImagesLoading > maxSimultaneousLoads - 1) break;
            }
          }
        }
      // http://bhw485.knmi.nl:8080/adagucviewer/index.dev.html?srs=EPSG%3A4326&bbox=49.41506772034526,-27.289267215532217,171.950217903172,27.587258866345476&service=http%3A%2F%2Fbirdexp07.knmi.nl%2Fcgi-bin%2Fplieger%2Fhimawari.cgi%3F&layer=tiled%24image%2Fpng%24true%24auto%2Frgba%241%240&selected=0&dims=time$2016-11-14T07:50:00Z&baselayers=naturalearth2$ne_10m_admin_0_countries_simplified
      }
    }

    if (_map.isAnimatingLoopRunning == false) {
      _map.isAnimatingLoopRunning = true;
      animateLoop();
    }
  };

  _map.stopAnimating = function () {
    if (_map.isAnimating == false) return;
    divAnimationInfo.style.display = 'none';
    _map.isAnimating = false;
    _map.animateBusy = false;
    _map.rebuildMapDimensions();
    callBack.triggerEvent('onstopanimation', _map);
  };

  _map.currentAnimationStep = 0;
  _map.animationList = undefined;
  _map.isAnimating = false;

  _map.setAnimationDelay = function (delay) {
    if (delay < 1)delay = 1;
    _map.animationDelay = delay;
  };

  divAnimationInfo.style.zIndex = 10000;
  divAnimationInfo.style.background = 'none';
  divAnimationInfo.style.position = 'absolute';
  divAnimationInfo.style.border = 'none';
  divAnimationInfo.style.margin = '0px';
  divAnimationInfo.style.padding = '0px';
      // divAnimationInfo.style.border     = '1px solid #888';
  divAnimationInfo.style.lineHeight = '14px';
  divAnimationInfo.style.fontFamily = '"Courier New", "Lucida Console", Monospace';
  divAnimationInfo.style.fontSize = '10px';
  _map.getBaseElement().append(divAnimationInfo);
};
