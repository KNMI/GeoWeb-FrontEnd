/*
 * Name        : WebMapJS.js
 * Author      : MaartenPlieger (plieger at knmi.nl)
 * Version     : 0.5 (June 2011)
 * Description : This is a basic interface for portrayal of OGC WMS services
 * Copyright KNMI
 */

/*
  Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

  Copyright (C) 2011 by Royal Netherlands Meteorological Institute (KNMI)

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/
var WebMapJSMapNo = 0;


var logging = false;

var base = './';
// var xml2jsonrequestURL;
var noimage;

var loadingImageSrc;

var WMSControlsImageSrc;
var mapPinImageSrc;
var scaleBarURL;

var enableConsoleDebugging = false;
var enableConsoleErrors = false;
/**
 * Set base URL of several sources used wihtin webmapjs
 */

var debug = function (message) {
  if (enableConsoleDebugging) { console.log(message); }
};
var error = function (message) {
  if (enableConsoleErrors) { console.log('WebMapJS warning: ', message); }
};

/**
  * Function which checks wether URL contains a ? token. If not, it is assumed that this token was not provided by the user,
  * manually add the token later.
  * @param url The URL to check
  * @return the fixed URL
  */
var WMJScheckURL = function (url) {
  if (!isDefined(url)) return '?';
  url = url.trim();
  if (url.indexOf('?') == -1) {
    url += '?';
  }
  return url;
};

/**
  * WMJSProjection Class
  * Keep all projection information, by a bbox and an srs value.
  */
function WMJSProjection () {
  this.bbox = new WMJSBBOX();
  this.srs = 'EPSG:4326';
};

var legendImageStore; // GLOBAL LEGEND IMAGE STORE
var getMapImageStore; // GLOBAL IMAGE STORE
var bgMapImageStore; // GLOBAL BACKGROUND MAP IMAGE STORE
var maxAnimationSteps = 1000;
legendImageStore = new WMJSImageStore(maxAnimationSteps * 5, 'wmjslegendbuffer');
getMapImageStore = new WMJSImageStore(maxAnimationSteps * 5, 'wmjsimagebuffer');
bgMapImageStore = new WMJSImageStore(5000, 'wmjsimagebuffer', {randomizer:false});
var setBaseURL = function (_baseURL) {
  base = _baseURL;
  //base_plus_dir = base + 'adaguc/webmapjs';
  noimage = base + '/img/blank.gif?';
  loadingImageSrc = base + '/img/ajax-loader.gif';
  WMSControlsImageSrc = base + '/img/mapcontrols.gif';
  mapPinImageSrc = base + '/img/dot.gif';
  if (!isDefined(scaleBarURL)) {
    scaleBarURL = base + '/php/makeScaleBar.php?';
  }
  xml2jsonrequestURL =  base + '/php/xml2jsonrequest.php?'
};
/**
/**
  * WMJSMap class
  */
function WMJSMap (_element, _xml2jsonrequestURL) {

  this.setBaseURL = function (_baseURL) {
    base = _baseURL;
    //base_plus_dir = base + 'adaguc/webmapjs';
    noimage = base + '/img/blank.gif?';
    loadingImageSrc = base + '/img/ajax-loader.gif';
    WMSControlsImageSrc = base + '/img/mapcontrols.gif';
    mapPinImageSrc = base + '/img/dot.gif';
    if (!isDefined(scaleBarURL)) {
      scaleBarURL = base + '/php/makeScaleBar.php?';
    }
  };
  this.setBaseURL(base);

  this.setXML2JSONURL = function (_xml2jsonrequest) {
    xml2jsonrequest = _xml2jsonrequest;
  };

  var mainElement = _element;
  try {
    if (isDefined(_xml2jsonrequestURL)) {
      xml2jsonrequestURL = _xml2jsonrequestURL;
    };
  } catch(e){
    xml2jsonrequestURL = base + '/php/xml2jsonrequest.php?';
  }
  try {
    if (!isDefined(requestProxy)) {};
  } catch (e) {
    requestProxy = base + '/php/MakeRequest.php?';
  }
  try {
    if (!isDefined(scaleBarURL)) {};
  } catch (e) {
    scaleBarURL = base + '/php/makeScaleBar.php?';
  }
  var baseDiv;

  var mainTimeSlider;
  var srs;

  var resizeBBOX = new WMJSBBOX();
  // var origbbox = new WMJSBBOX();
  var defaultBBOX = new WMJSBBOX();
  // var zoomBBOX = new WMJSBBOX();
  var width = 2, height = 2;
  var layers = Array();
  var busy = 0;
  var mapdimensions = [];// Array of Dimension;


  var baseLayers = '';
  var numBaseLayers = 0;
  var _map = this;
  _map.renderer = 'WMJSCanvasBuffer';
  var layersBusy = 0;
  var mapBusy = false;


  var divZoomBox = document.createElement('div');
  var divBoundingBox = document.createElement('div');
  var divMapPin = document.createElement('div');
  var divDimInfo = document.createElement('div');

  var displayLegendInMap = true;
  var messageDiv;
  var timeoffsetContainerDiv;
  var timeoffsetDiv;
  var bbox = new WMJSBBOX(); // Boundingbox that will be used for map loading
  var updateBBOX = new WMJSBBOX(); // Boundingbox to move map without loading anything
  var loadedBBOX = new WMJSBBOX(); // Boundingbox that is used for current map
  var loadingBBOX = new WMJSBBOX(); // Boundingbox that is used when map is loading
  var drawnBBOX = new WMJSBBOX(); // Boundingbox that is used when map is drawn
  var updateSRS = '';

  var legendDivBuffer = [];

  _map.getLegendStore = function () {
    return legendImageStore;
  };

  var divBuffer = [];

  var mapHeader = {
    height:30,
    fill:{
      color:'#EEE',
      opacity:0.4
    },
    hover:{
      color:'#017daf',
      opacity:0.9
    },
    selected:{
      color:'#017daf',
      opacity:1.0
    },
    hoverSelected:{
      color:'#017daf',
      opacity:1.0
    },
    cursorSet:false,
    prevCursor:'default',
    hovering:false
  };

  var currentCursor = 'default';
  var mapIsActivated = false;

  var loadingDiv = $('<div class="WMJSDivBuffer-loading"/>', {});
  var initialized = 0;
  var newSwapBuffer = 0;
  var currentSwapBuffer = 1;
  var suspendDrawing = false;
  // var suspendMapEvents = false;
  var activeLayer;
  // Undo:
  var MaxUndos = 3;
  var NrOfUndos = 0;
  var UndoPointer = 0;
  var DoUndo = 0;
  var DoRedo = 0;
  var NrRedos = 0, NrUndos = 0;
  var WMJSProjection_undo = new Array(MaxUndos);
  var WMJSProjection_tempundo = new Array(MaxUndos);
  for (j = 0; j < MaxUndos; j++) { WMJSProjection_undo[j] = new WMJSProjection(); WMJSProjection_tempundo[j] = new WMJSProjection(); }

  var inlineGetFeatureInfo = true;

  var callBack = new WMJSListener();

  var graphingData;

  this.getGraphingData = function () {
    return this.graphingData;
  };

  this.setGraphingData = function (data) {
    this.graphingData = data;
//    debug("gD: "+dump(data));
  };

  /**
   * Function which make a component ID which is unique over several WebMapJS instances
   * @param the desired id
   * @return the unique id
   */
  var makeComponentId = function (id) {
    if (!mainElement.id) {
      mainElement.id = 'WebMapJSMapNo_' + WebMapJSMapNo;
      WebMapJSMapNo++;
    }
    return mainElement.id + '_' + id;
  };

  this.enableInlineGetFeatureInfo = function (trueOrFalse) {
    inlineGetFeatureInfo = trueOrFalse;
  };

  // Contains the event values for when the mouse was pressed down (used for checking the shiftKey);
  var mouseDownEvent;

  var dialogClosed = function (dialog) {
    for (var j = 0; j < gfiDialogList.length; j++) {
      if (gfiDialogList[j] == dialog) {
        gfiDialogList.splice(j, 1);
        j--;
      }
    }
  };

  this.closeAllGFIDialogs = function () {
    WMJSDialog.closeAllDialogs(gfiDialogList);
  };

  var gfiDialogList = [];

  var onLegendCallbackFunction = function () {
    if (enableConsoleDebugging)console.log('onlegendready called');

    loadLegendInline();
  };

  var loadedLegendUrls = [];
  var currentLegendDivBuffer = 0; // 0 or 1
  var legendBusy = false;

/* Load legend inline of the map */
  var loadLegendInline = function (somethingchanged) {
    if (legendDivBuffer.length < 2) return;
    try {
      if (isDefined(somethingchanged) == false) {
        somethingchanged = false;
      }
      if (legendBusy == true && isDefined(onLegendCallbackFunction)) {
        if (callBack.addToCallback('onlegendready', onLegendCallbackFunction) == true) {
          if (enableConsoleDebugging)console.log('Suspending on onlegendready');
        }
        return;
      }
      legendBusy = true;
      if (displayLegendInMap == true) {
        if (loadedLegendUrls.length != layers.length) {
          somethingchanged = true;
        } else {
          for (var j = 0; j < layers.length; j++) {
            var legendUrl = _map.getLegendGraphicURLForLayer(layers[j]);
            if (isDefined(legendUrl)) {
              if (loadedLegendUrls[j] !== legendUrl) {
                loadedLegendUrls[j] = legendUrl;
                somethingchanged = true;
              }
            }
          }
        }
        if (somethingchanged) {
          loadedLegendUrls = [];
          for (var j = 0; j < layers.length; j++) {
            if (layers[j].enabled !== false) {
              var legendUrl = _map.getLegendGraphicURLForLayer(layers[j]);

              if (isDefined(legendUrl)) {
                loadedLegendUrls[j] = legendUrl;
                var inlineLegendURL = legendUrl;
                legendDivBuffer[currentLegendDivBuffer].setSrc(j, inlineLegendURL);
              }
            }
          }
          var legendDivBufferToLoad = currentLegendDivBuffer;
          currentLegendDivBuffer = 1 - currentLegendDivBuffer;
          try {
            legendDivBuffer[legendDivBufferToLoad].load(function () {
              if (enableConsoleDebugging)console.log('Legend buffer nr' + legendDivBufferToLoad);
              try {
                var maxWidth = 0;
                var maxHeight = 0;
                for (var j = 0; j < legendDivBuffer[legendDivBufferToLoad].layers.length; j++) {
                  var w = legendDivBuffer[legendDivBufferToLoad].layers[j].getElement()[0].width;
                  var h = legendDivBuffer[legendDivBufferToLoad].layers[j].getElement()[0].height;
                  maxWidth += w;
                  if (maxHeight < h)maxHeight = h;
                }
                legendDivBuffer[legendDivBufferToLoad].display();
                legendDivBuffer[1 - legendDivBufferToLoad].hide();
              } catch (e) {
                console.error(e);
              }
              legendBusy = false;
              callBack.triggerEvent('onlegendready');
            });
          } catch (e) {
            console.error(e);
            legendDivBuffer[0].hide();
            legendDivBuffer[1].hide();
            legendBusy = false;
            callBack.triggerEvent('onlegendready');
          }
          return;
        }
      } else {
        legendDivBuffer[0].hide();
        legendDivBuffer[1].hide();
      }
    } catch (e) {
      console.log(e);
    }
    legendBusy = false;
    callBack.triggerEvent('onlegendready');
  };

  var setTimeOffsetValue = '';
  var setMessageValue = '';

  this.setMessage = function (message) {
    if (!message || message === '') {
      setMessageValue = '';
    } else {
      setMessageValue = message;
    }
  };

  this.setTimeOffset = function (message) {
    if (!message || message === '') {
      setTimeOffsetValue = '';
    } else {
      setTimeOffsetValue = message;
    }
  };
  // Is called when the WebMapJS object is created
  function constructor () {
    // console.log('creating new WMJSMAP');
    var baseDivId = makeComponentId('baseDiv');
    jQuery('<div/>', {
      id:baseDivId,
      css:{
        position:'relative',
        overflow:'hidden',
        width:mainElement.style.width,
        height:mainElement.style.height,
        border:'0px  solid black',
        margin:0,
        padding:0,
        clear:'both',
        left:'0px',
        top:'0px'
      }
    }).appendTo(mainElement);
    baseDiv = $('#' + baseDivId);

    baseDiv.css('cursor', 'default');

    mainElement.style.margin = '0px';
    mainElement.style.padding = '0px';
    mainElement.style.border = 'none';// "1px solid gray";
    mainElement.style.lineHeight = '0px';
    mainElement.style.display = 'inline-block';

    // Attach zoombox
    divZoomBox.style.position = 'absolute';
    divZoomBox.style.display = 'none';
    divZoomBox.style.border = '2px dashed #000000';
    divZoomBox.style.margin = '0px';
    divZoomBox.style.padding = '0px';
    divZoomBox.style.lineHeight = '0';
    divZoomBox.style.background = '#AFFFFF';
    divZoomBox.style.opacity = '0.3';               // Gecko
    divZoomBox.style.filter = 'alpha(opacity=30)';  // Windows
    divZoomBox.style.left = '0px';
    divZoomBox.style.top = '0px';
    divZoomBox.style.width = '100px';
    divZoomBox.style.height = '100px';
    divZoomBox.style.zIndex = 1000;
    divZoomBox.oncontextmenu = function () { return false; };
    baseDiv.append(divZoomBox);

    // Attach bbox box
    divBoundingBox.style.position = 'absolute';
    divBoundingBox.style.display = 'none';
    divBoundingBox.style.border = '3px solid #6060FF';
    divBoundingBox.style.margin = '0px';
    divBoundingBox.style.padding = '0px';
    divBoundingBox.style.lineHeight = '0';
    divBoundingBox.style.left = '0px';
    divBoundingBox.style.top = '0px';
    divBoundingBox.style.width = '100px';
    divBoundingBox.style.height = '100px';
    divBoundingBox.style.zIndex = 1000;
    divBoundingBox.oncontextmenu = function () { return false; };
    baseDiv.append(divBoundingBox);

   // return;
    // Attach divMapPin
    divMapPin.style.position = 'absolute';
    divMapPin.style.display = 'none';
    divMapPin.style.border = 'none';
    divMapPin.style.margin = '0px';
    divMapPin.style.padding = '0px';
    divMapPin.style.lineHeight = '0';
    divMapPin.style.background = 'none';
    divMapPin.style.opacity = '1.0';
    divMapPin.style.filter = 'alpha(opacity=100)';
    divMapPin.style.left = '0px';
    divMapPin.style.top = '0px';
    divMapPin.style.width = '100px';
    divMapPin.style.height = '100px';
    divMapPin.style.zIndex = 1000;
    divMapPin.oncontextmenu = function () { return false; };

    baseDiv.append(divMapPin);
    // Attach divDimInfo
    divDimInfo.style.position = 'absolute';
    // divDimInfo.style.lineHeight = '14px';
    divDimInfo.style.zIndex = 1000;
    divDimInfo.style.width = 'auto';
    divDimInfo.style.height = 'auto';
    divDimInfo.style.background = 'none';
    // divDimInfo.style.marginLeft='0px';

    divDimInfo.oncontextmenu = function () { return false; };
    divDimInfo.innerHTML = '';
    baseDiv.append(divDimInfo);

    // Attach loading image

    baseDiv.append(loadingDiv);


//       jQuery('<div/>', {
//         id: makeComponentId('fooslider'),
//         css:{
//           position:'absolute',
//           right:'10px',
//           bottom:'20px',
//           width:'220px',
//           zIndex:3000
//         },
//         mousedown:function(event){
//           event.stopPropagation();
//           preventdefault_event(event);
//         }
//       }).appendTo(baseDiv);

    // jQuery('<div/>', {
    //   id: makeComponentId('buttonzoomin'),
    //   css:{
    //     position:'absolute',
    //     right:'30px',
    //     top:'-8px',
    //     width:'48px',
    //     height:'48px',
    //     margin:'0px',
    //     padding:'0px',
    //     zIndex:3000
    //   },
    //   mousedown:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //   },
    //   click:function () {
    //     _map.zoomIn();
    //   }

    // }).appendTo(baseDiv);

    // var buttonZoomBox = jQuery('<div/>', {
    //   id: makeComponentId('buttonzoombox'),
    //   css:{
    //     position:'absolute',
    //     right:'30px',
    //     top:'42px',
    //     width:'48px',
    //     height:'48px',
    //     margin:'0px',
    //     padding:'0px',
    //     zIndex:3000
    //   },
    //   mousedown:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //   },
    //   click:function () {
    //     _map.setMapModeZoomBoxIn();
    //     buttonZoomBox.iconbutton({ icons: { primary: 'wmjs-icon-zoombox-activated' } });
    //     buttonDragMap.iconbutton({ icons: { primary: 'wmjs-icon-dragpan' } });
    //     // if(mapMode=='zoom'){
    //       // buttonZoomBox.iconbutton({icons: {primary: 'wmjs-icon-zoombox-activated'}});

    //     // }else{
    //       // buttonZoomBox.iconbutton({icons: {primary: 'wmjs-icon-zoombox'}});

    //      // }
    //   }

    // }).appendTo(baseDiv);

    // jQuery('<div/>', {
    //   id: makeComponentId('buttonzoomhome'),
    //   css:{
    //     position:'absolute',
    //     right:'30px',
    //     top:'87px',
    //     width:'48px',
    //     height:'48px',
    //     margin:'0px',
    //     padding:'0px',
    //     zIndex:3000
    //   },
    //   mousedown:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //   },
    //   click:function () {
    //     _map.zoomToLayer();
    //   }

    // }).appendTo(baseDiv);

    /* ONLY VISIBLE IF USERNAME FOR GEONAMES API IS SET */
    if (typeof (defaultUsernameSearch) !== 'undefined') {
      /* Creating the div for the input */
      jQuery('<div/>', {
        id: makeComponentId('searchboxdiv'),
        mousedown:function (event) { event.stopPropagation(); }
      })
      .addClass('webmapjs_searchboxdiv')
      .html('<input class=\'webmapjs_locationfield\' type=\'text\' name=\'searchtextfield\'' +
        ' id=\'searchtextfield\' placeholder=' + I18n.place_search_term.text + ' />', {
          mousedown:function (event) { event.stopPropagation(); preventdefault_event(event); } })
      .appendTo(baseDiv);

      jQuery('<button/>', {
        id: makeComponentId('searchboxbutton'),
        mousedown:function (event) { event.stopPropagation(); },
        click:function () {
          var value = $('#searchtextfield').attr('value');
          _map.searchForLocation(value);
        } })
      .addClass('webmapjs_locationbutton')
      .appendTo(baseDiv);

      /* On Enter */
      $('#searchtextfield').keypress(function (e) {
        if (e.which == 13) {
          var value = $('#searchtextfield').attr('value');
          _map.searchForLocation(value);
          return false;
        }
      });
    }

    // var buttonDragMap = jQuery('<div/>', {
    //   id: makeComponentId('buttondragmap'),
    //   css:{
    //     position:'absolute',
    //     right:'30px',
    //     top:'135px',
    //     width:'48px',
    //     height:'48px',
    //     margin:'0px',
    //     padding:'0px',
    //     zIndex:3000
    //   },
    //   mousedown:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //   },
    //   click:function () {
    //     _map.setMapModePan();
    //      // if(mapMode=='pan'){
    //     buttonDragMap.iconbutton({ icons: { primary: 'wmjs-icon-dragpan-activated' } });
    //     buttonZoomBox.iconbutton({ icons: { primary: 'wmjs-icon-zoombox' } });
    //      // }else{
    //       // buttonDragMap.iconbutton({icons: {primary: 'wmjs-icon-dragpan'}});
    //      // }
    //   }

    // }).appendTo(baseDiv);

    // jQuery('<div/>', {
    //   id: makeComponentId('buttonzoomout'),
    //   css:{
    //     position:'absolute',
    //     right:'30px',
    //     top:'181px',
    //     width:'48px',
    //     height:'48px',
    //     margin:'0px',
    //     padding:'0px',
    //     zIndex:2000
    //   },
    //   mousedown:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //   },
    //   mouseup:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //   },
    //   click:function (event) {
    //     event.stopPropagation();
    //     preventdefault_event(event);
    //     _map.zoomOut();
    //   }

    // }).appendTo(baseDiv);
    $('#' + makeComponentId('buttonzoomout')).click(function (event) {
      event.stopPropagation();
// do something
    });
   // $('#'+makeComponentId('fooslider')).slider();

    $('#' + makeComponentId('buttonzoomin')).iconbutton({ text:false, icons:{ primary:'wmjs-icon-zoomin' } });
    $('#' + makeComponentId('buttonzoomhome')).iconbutton({ text:false, icons:{ primary:'wmjs-icon-zoomhome' } });
    $('#' + makeComponentId('buttonzoombox')).iconbutton({ text:false, icons:{ primary:'wmjs-icon-zoombox' } });
    $('#' + makeComponentId('buttondragmap')).iconbutton({ text:false, icons:{ primary:'wmjs-icon-dragpan-activated' } });
    $('#' + makeComponentId('buttonzoomout')).iconbutton({ text:false, icons:{ primary:'wmjs-icon-zoomout' } });

/*
    for(var j=0;j<2;j++){
      gfiDialogList.push(createDialog({x:Math.random()*600+100,y:Math.random()*600+100}));
    }

*/

    // createDialog('d2',250,250);

    // $( '#'+makeComponentId('dialog1')).dialog('option', 'position', [50, 50] );
    // $( '#'+makeComponentId('dialog1')).dialog('option', 'zIndex', 3000 );
    // $( '#'+makeComponentId('dialog1')).appendTo(baseDiv);

    // $(baseDiv).mousedown( function(e){ _map.mouseDownEvent(e);;});

    // mainElement.style.zIndex=1;
    // mainElement.style.display='block';
    // wegbbaseDiv.style.border='none';//1px solid #444';
    // wegbbaseDiv.style.backgroundColor= '#FFF';

    // Attach events
    attachEvents();

    bbox.left = -180;
    bbox.bottom = -90;
    bbox.right = 180;
    bbox.top = 90;
    srs = 'EPSG:4326';
    _map.setSize(mainElement.style.width, mainElement.style.height);
    // IMAGE buffers
    for (var j = 0; j < 2; j++) {
      let d = new WMJSCanvasBuffer(callBack, 'imagebuffer', getMapImageStore, _map.getWidth(), _map.getHeight());
      getMapImageStore.addLoadEventCallback(d.imageLoadComplete);
      baseDiv.append(d.getBuffer());
      divBuffer.push(d);
    }

    // Legend buffers

    for (var j = 0; j < 2; j++) {
      let d = new WMJSCanvasBuffer(callBack, 'legendbuffer', legendImageStore,  _map.getWidth(), _map.getHeight());
      legendImageStore.addLoadEventCallback(d.imageLoadComplete);
      baseDiv.append(d.getBuffer());
      legendDivBuffer.push(d);
    }

    callBack.addToCallback('draw', _map.draw, true);
    // callBack.addToCallback("drawbuffers",_map.flipBuffers,true);

    wmjsAnimate = new WMJSAnimate(_map);

    bgMapImageStore.addLoadEventCallback(_map.draw);
    let adagucBeforeDraw = (ctx) => {
       if (baseLayers) {
        for (var l = 0; l < baseLayers.length; l++) {
          if (baseLayers[l].enabled) {
            if (baseLayers[l].keepOnTop === false) {
              if (baseLayers[l].type && baseLayers[l].type !== 'twms') continue;
              WMJSTileRenderer(bbox, updateBBOX, srs, width, height, ctx, bgMapImageStore, WMJSTileRendererTileSettings, baseLayers[l].name);
            }
          }
        }
      }
    };

    _map.addListener('beforecanvasstartdraw', adagucBeforeDraw, true);

    let drawTextBG = (ctx, txt, x, y, fontSize) => {
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#FFF';
      ctx.globalAlpha = 0.75;
      const width = ctx.measureText(txt).width;
      ctx.fillRect(x - 8, y - 8, width + 16, parseInt(fontSize) + 14);
      ctx.fillStyle = '#444';
      ctx.globalAlpha = 1.0;
      ctx.fillText(txt, x, y + 2);
    };

    let adagucBeforeCanvasDisplay = (ctx) => {
      // Map header
      ctx.beginPath();
      ctx.rect(0, 0, width, mapHeader.height);
      if (mapIsActivated === false) {
        ctx.globalAlpha = mapHeader.hovering ? mapHeader.hover.opacity : mapHeader.fill.opacity;
        ctx.fillStyle = mapHeader.hovering ? mapHeader.hover.color : mapHeader.fill.color;
      } else {
        ctx.globalAlpha = mapHeader.hovering ? mapHeader.hoverSelected.opacity : mapHeader.selected.opacity;
        ctx.fillStyle = mapHeader.hovering ? mapHeader.hoverSelected.color : mapHeader.selected.color;
      }
      ctx.fill();
      ctx.globalAlpha = 1;

      // Time offset message
      if (setTimeOffsetValue !== '') {
        ctx.font = '20px Helvetica';
        drawTextBG(ctx, setTimeOffsetValue, (width / 2) - 70, height - 26, 20);
      }

      // Set message value
      if (setMessageValue !== '') {
        ctx.font = '15px Helvetica';
        drawTextBG(ctx, setMessageValue, (width / 2) - 70, 2, 15);
      }

      // ScaleBar
      if (showScaleBarInMap === true) {
        let getScaleBarProperties = () => {
          let desiredWidth = 25;
          let realWidth = 0;
          let numMapUnits = 1.0 / 10000000.0;

          let boxWidth = updateBBOX.right - updateBBOX.left;
          let pixelsPerUnit = width / boxWidth;
          if (pixelsPerUnit <= 0) {
            return;
          }

          let a = desiredWidth / pixelsPerUnit;

          let divFactor = 0;
          do {
            numMapUnits *= 10.0;
            divFactor = a / numMapUnits;
            if (divFactor === 0) return;
            realWidth = desiredWidth / divFactor;
          } while (realWidth < desiredWidth);

          do {
            numMapUnits /= 2.0;
            divFactor = a / numMapUnits;
            if (divFactor === 0) return;
            realWidth = desiredWidth / divFactor;
          } while (realWidth > desiredWidth);

          do {
            numMapUnits *= 1.2;
            divFactor = a / numMapUnits;
            if (divFactor === 0) return;
            realWidth = desiredWidth / divFactor;
          } while (realWidth < desiredWidth);

          let roundedMapUnits = numMapUnits;

          let d = Math.pow(10, Math.round(Math.log10(numMapUnits) + 0.5) - 1);

          roundedMapUnits = Math.round(roundedMapUnits / d);
          if (roundedMapUnits < 2.5)roundedMapUnits = 2.5;
          if (roundedMapUnits > 2.5 && roundedMapUnits < 7.5)roundedMapUnits = 5;
          if (roundedMapUnits > 7.5)roundedMapUnits = 10;
          roundedMapUnits = (roundedMapUnits * d);
          divFactor = (desiredWidth / pixelsPerUnit) / roundedMapUnits;
          realWidth = desiredWidth / divFactor;
          return { width:parseInt(realWidth), mapunits: roundedMapUnits };
        };
        let scaleBarProps = getScaleBarProperties();
        if (scaleBarProps) {
          let offsetX = 7.5;
          let offsetY = height - 25.5;
          let scaleBarHeight = 23;
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.fillStyle = '#000';
          ctx.strokeStyle = '#000';
          ctx.font = '9px Helvetica';
          ctx.textBaseline = 'middle';
          for (let j = 0; j < 2; j++) {
            ctx.moveTo(offsetX, scaleBarHeight - 2 - j + offsetY);
            ctx.lineTo(scaleBarProps.width * 2 + offsetX + 1, scaleBarHeight - 2 - j + offsetY);
          }

          let subDivXW = parseInt(Math.round(scaleBarProps.width / 5));
          ctx.lineWidth = 0.5;
          for (let j = 1; j < 5; j++) {
            ctx.moveTo(offsetX + subDivXW * j, scaleBarHeight - 2 + offsetY);
            ctx.lineTo(offsetX + subDivXW * j, scaleBarHeight - 2 - 5 + offsetY);
          }
          ctx.lineWidth = 1.0;
          ctx.moveTo(offsetX, scaleBarHeight - 2 + offsetY);
          ctx.lineTo(offsetX, scaleBarHeight - 2 - 7 + offsetY);
          ctx.moveTo(offsetX + scaleBarProps.width, scaleBarHeight - 2 + offsetY);
          ctx.lineTo(offsetX + scaleBarProps.width, scaleBarHeight - 2 - 7 + offsetY);
          ctx.moveTo(offsetX + scaleBarProps.width * 2 + 1, scaleBarHeight - 2 + offsetY);
          ctx.lineTo(offsetX + scaleBarProps.width * 2 + 1, scaleBarHeight - 2 - 7 + offsetY);

          let units = '';
          if (srs === 'EPSG:3411') units = 'meter';
          if (srs === 'EPSG:3412') units = 'meter';
          if (srs === 'EPSG:3575') units = 'meter';
          if (srs === 'EPSG:4326') units = 'degrees';
          if (srs === 'EPSG:28992') units = 'meter';
          if (srs === 'EPSG:32661') units = 'meter';
          if (srs === 'EPSG:3857') units = 'meter';
          if (srs === 'EPSG:900913') units = 'meter';
          if (srs === 'EPSG:102100') units = 'meter';

          if (units === 'meter') {
            if (scaleBarProps.mapunits > 1000) {
              scaleBarProps.mapunits /= 1000;
              units = 'km';
            }
          }
          ctx.fillText('0', offsetX - 3, 12 + offsetY);

          // valueStr.print("%g",(p.mapunits));
          let valueStr = scaleBarProps.mapunits.toPrecision() + '';
          ctx.fillText(valueStr, offsetX + scaleBarProps.width - valueStr.length * 2.5 + 0, 12 + offsetY);
          valueStr = (scaleBarProps.mapunits * 2).toPrecision() + '';
          ctx.fillText(valueStr, offsetX + scaleBarProps.width * 2 - valueStr.length * 2.5 + 0, 12 + offsetY);
          ctx.fillText(units, offsetX + scaleBarProps.width * 2 + 10, 18 + offsetY);
          ctx.stroke();
        }
      }

      // Mouse projected coords
      ctx.font = '10px Helvetica';
      ctx.textBaseline = 'middle';
      if (isDefined(mouseGeoCoordXY)) {
        let roundingFactor = 1.0 / Math.pow(10, parseInt(Math.log((bbox.right - bbox.left) / width) / Math.log(10)) - 2);
        if (roundingFactor < 1)roundingFactor = 1;
        ctx.fillStyle = '#000000';
        let xText = Math.round(mouseGeoCoordXY.x * roundingFactor) / roundingFactor;
        let yText = Math.round(mouseGeoCoordXY.y * roundingFactor) / roundingFactor;
        let units = '';
        if (srs === 'EPSG:3857') {
          units = 'meter';
        }
        ctx.fillText('CoordXY: (' + xText + ', ' + yText + ') ' + units, 5, height - 50);
      }
      // Mouse latlon coords
      if (isDefined(mouseUpdateCoordinates)) {

        var llCoord = _map.getLatLongFromPixelCoord(mouseUpdateCoordinates);

        if (isDefined(llCoord)) {
          let roundingFactor = 100;
          ctx.fillStyle = '#000000';
          let xText = Math.round(llCoord.x * roundingFactor) / roundingFactor;
          let yText = Math.round(llCoord.y * roundingFactor) / roundingFactor;
          ctx.fillText('Lat/Lon: (' + yText.toFixed(2) + ', ' + xText.toFixed(2) + ') ' + ' degrees', 5, height - 38);
          // ctx.fillText('Lon/Lat: (' + xText.toFixed(2) + ', ' + yText.toFixed(2) + ') ' + ' degrees', 5, height - 26);
        }
      }
      ctx.fillStyle = '#000000';
      ctx.fillText('Map projection: ' + srs, 5, height - 26);
    };


    _map.addListener('beforecanvasdisplay', adagucBeforeCanvasDisplay, true);
    initialized = 1;
  };

  // Set the properties of an image in a divbuffer
  function setElProps (el) {
    el.style.left = '0px';
    el.style.top = '0px';
    el.loadEventDone = false;
    // el.width=undefined;
    // el.height=undefined;
    el.failed = false;
    // el.style.position='absolute';
    // el.style.border='none';
    // el.onselectstart = function(){return false;};
    // el.ondrag = function(){return false;};
    function onload (e) {
      e.currentTarget.removeEventListener('load', onload, false);
      _loadEvent(el);
    }
    function onchange (e) {
      var target = (e || event).srcElement;
      if (!target) return;
      if (/^(complete|loaded)$/i.test(target.readyState)) {
        target.detachEvent('onreadystatechange', onchange);
        _loadEvent(el);
      }
    }
    el.addEventListener ? el.addEventListener('load', onload, false) : el.attachEvent('onreadystatechange', onchange);
    el.onerror = function () {
      if (el.src) {
        if (el.src != noimage) {
          error(el.src);
          el.failed = true;
          if (el.loadEvent)el.loadEvent(el);
        }
      }
    };
    function _loadEvent (el) {
      if (el.loadEventDone == true) return;
      el.loadEventDone = true;
      if (el.loadEvent)el.loadEvent(el);
    }
  }

  /* //Returns all layernames for the getcapabilities in json format
  this.getAllLayerNamesFromGetCapabilities = function(getcapabilitiesjson){
    var layerNames = new Array();
    var jsondata=getcapabilitiesjson;
    if(jsondata==0){
      return;
    }
    try{
    var RootLayer = jsondata.WMT_MS_Capabilities.Capability.Layer;
    }catch(e){
      return;
    }
    var JSONLayers = toArray(RootLayer.Layer);
    function recursivelyFindLayer(JSONLayers){
      for(var j=0;j<JSONLayers.length;j++){
        if(JSONLayers[j].Layer)recursivelyFindLayer(toArray(JSONLayers[j].Layer));else {
          if(JSONLayers[j].Name){
            layerNames.push(JSONLayers[j].Name.value);
          }
        }
      }
    }
    recursivelyFindLayer(JSONLayers);
    return layerNames;

  }
  //For a certain WMS URL, the callback will be called with parameter all layernames
  this.getAllLayerNamesForService = function(service,callback){
    var _intcallback = function(jsondata){
      var layernames = _map.getAllLayerNamesFromGetCapabilities(jsondata);
      callback(layernames);
    }
    _map.getCapabilitiesJSON(service,_intcallback);
  }

  */
  // For a certain WMS URL, the callback will be called with parameter the getcapabilities in json format
  this.getCapabilitiesJSON = function (service, callback) {
    var fail = function (message) {
      error(message);
      callback(message);
    };

    WMJSGetCapabilities(service, true, callback, fail);
  };

//     var dimensionValueCache = Array();//Cache for all current values of dimensions.

  this.rebuildMapDimensions = function () {
    for (var j = 0; j < mapdimensions.length; j++) {
      mapdimensions[j].used = false;
    }

    for (i = 0; i < layers.length; i++) {
      for (var j = 0; j < layers[i].dimensions.length; j++) {
        var dim = layers[i].dimensions[j];
        var mapdim = _map.getDimension(dim.name);
        if (isDefined(mapdim)) {
          mapdim.used = true;
        } else {
          var newdim = dim.clone();
          newdim.used = true;
          mapdimensions.push(newdim);
        }
      }
    }

    for (var j = 0; j < mapdimensions.length; j++) {
      if (mapdimensions[j].used == false) {
        mapdimensions.splice(j, 1);
        j--;
      }
    }
    callBack.triggerEvent('onmapdimupdate');
  };

  this.getLayerByServiceAndName = function (layerService, layerName) {
    for (var j = 0; j < layers.length; j++) {
      var layer = layers[layers.length - j - 1];
      if (layer.name == layerName) {
        if (layer.service == layerService) {
          return layer;
        }
      }
    }
  };

  this.getLayers = function () {
    // Provide layers in reverse order
    var returnlayers = new Array();
    for (var j = 0; j < layers.length; j++) {
      var layer = layers[layers.length - j - 1];
      returnlayers.push(layer);
    }
    return returnlayers;
  };

  this.setLayer = function (layer, getcapdoc) {
    // mapdimensions = new Array(
    return _map.addLayer(layer, getcapdoc, layer);
  };

  /* Indicate weather this map component is active or not */
  this.setActive = function (active) {
    mapIsActivated = active;
  };

  this.setActiveLayer = function (layer) {
    activeLayer = layer;
    loadLegendInline();
    callBack.triggerEvent('onchangeactivelayer');
  };

  // Calculates how many baselayers there are.
  // Useful when changing properties for a divbuffer index (for example setLayerOpacity)
  this.calculateNumBaseLayers = function () {
    numBaseLayers = 0;
    if (baseLayers) {
      for (var l = 0; l < baseLayers.length; l++) {
        if (baseLayers[l].enabled) {
          if (baseLayers[l].keepOnTop == false) {
            numBaseLayers++;
          }
        }
      }
    }
  };

  this.enableLayer = function (layer) {
    layer.enabled = true;
    _map.calculateNumBaseLayers();
    _map.rebuildMapDimensions();
    loadLegendInline(true);
  };
  this.disableLayer = function (layer) {
    layer.enabled = false;
    _map.calculateNumBaseLayers();
    _map.rebuildMapDimensions();
    loadLegendInline(true);
  };
  this.toggleLayer = function (layer) {
    if (layer.enabled == true) {
      layer.enabled = false;
    } else layer.enabled = true;
    _map.calculateNumBaseLayers();
    _map.rebuildMapDimensions();
    loadLegendInline(true);
  };

  this.displayLayer = function (layer, enabled) {
    layer.enabled = enabled;
    _map.calculateNumBaseLayers();
    _map.rebuildMapDimensions();
    loadLegendInline(true);
  };

  function findLayer (layer) {
    if (!layer) return;
    for (var j = 0; j < layers.length; j++) {
      if (layers[j].id == layer.id) {
        return layer;
      }
    }
  }

  function getLayerIndex (layer) {
    if (!layer) return;
    for (var j = 0; j < layers.length; j++) {
      if (layers[j] == layer) {
        return j;
      }
    }
    return -1;
  }

  this.removeAllLayers = function () {
    for (var i = 0; i < layers.length; ++i) {
      layers[i].setAutoUpdate(false);
    }
    layers = [];
    mapdimensions = [];
    callBack.triggerEvent('onlayeradd');
  };

  this.deleteLayer = function (layerToDelete) {
    if (layers.length <= 0) return;
    layerToDelete.setAutoUpdate(false);
    var layerIndex = getLayerIndex(layerToDelete);
    if (layerIndex >= 0) {
      // move everything up with id's higher than this layer
      for (var j = layerIndex; j < layers.length - 1; j++) {
        layers[j] = layers[j + 1];
      }
      layers.length--;

      activeLayer = undefined;
      if (layerIndex >= 0 && layerIndex < layers.length) {
        _map.rebuildMapDimensions();
        _map.setActiveLayer(layers[layerIndex]);
      } else {
        if (layers.length > 0) {
          _map.rebuildMapDimensions();
          _map.setActiveLayer(layers[layers.length - 1]);
        }
      }
    }
    callBack.triggerEvent('onlayerchange');
    _map.rebuildMapDimensions();
  };
  this.moveLayerDown = function (layerToMove) {
    var layerIndex = getLayerIndex(layerToMove);
    if (layerIndex > 0) {
      var layerToMoveDown = layers[layerIndex - 1];
      var layer = layers[layerIndex];
      if (layerToMoveDown && layer) {
        layers[layerIndex] = layerToMoveDown;
        layers[layerIndex - 1] = layer;
      }
    } else {
      try {
        error("moveLayerDown: layer '" + layerToMove.name + "' not found.");
      } catch (e) {
        error('moveLayerDown: layer invalid.');
      }
    }
  };

  this.moveLayerUp = function (layerToMove) {
    var layerIndex = getLayerIndex(layerToMove);
    if (layerIndex < layers.length - 1) {
      var layerToMoveUp = layers[layerIndex + 1];
      var layer = layers[layerIndex];
      if (layerToMoveUp && layer) {
        layers[layerIndex] = layerToMoveUp;
        layers[layerIndex + 1] = layer;
      }
    } else {
      try {
        error("moveLayerUp: layer '" + layerToMove.name + "' not found.");
      } catch (e) {
        error('moveLayerUp: layer invalid.');
      }
    }
  };

  /**
   * @param _layer
   * @param getcapdoc
   * @param layerToReplace
   */
  this.addLayer = function (layer) {
    if (!isDefined(layer)) {
      return;
    }
    layer.parentMaps.push(_map);
    layers.push(layer);
    var done = function (layer) {
      for (var j = 0; j < layer.dimensions.length; j++) {
        var mapDim = _map.getDimension(layer.dimensions[j].name);
        if (isDefined(mapDim)) {
          if (isDefined(mapDim.currentValue)) {
            if (layer.dimensions[j].linked == true) {
              layer.dimensions[j].setClosestValue(mapDim.currentValue);
            }
          }
        }
      }

      _map.rebuildMapDimensions();
      callBack.triggerEvent('onlayeradd');
    };
    layer.parseLayer(done, undefined, 'WMJSLayer::addLayer');
  };

  this.getActiveLayer = function () {
    return activeLayer;
  };

  /**
    * setProjection
    * Set the projection of the current webmap object
    *_srs also accepts a projectionProperty object
    */
  this.setProjection = function (_srs, _bbox) {
    _map.hideMapPin();
    if (!_srs)_srs = 'EPSG:4326';
    if (typeof (_srs) === 'object') {
      _bbox = _srs.bbox;
      _srs = _srs.srs;
    }

    srs = _srs;
    updateSRS = srs;

    if (_map.proj4.srs != srs || !isDefined(this.proj4.projection)) {
      _map.proj4.projection = new Proj4js.Proj(srs);
      _map.proj4.srs = srs;
    }
    // alert(srs+""+_bbox);
    _map.setBBOX(_bbox);
    defaultBBOX.setBBOX(_bbox);
    _map.updateMouseCursorCoordinates();

    callBack.triggerEvent('onsetprojection', [srs, bbox]);
  };

  this.getBBOX = function () {
    return bbox;
  };

  this.getProjection = function (srsName) {
    // if(!srsName){
    return { srs:srs, bbox:bbox };
    // }

    // TODO
  };

  this.getSize = function () {
    return { width:width, height:height };
  };

  this.getWidth = function () {
    return width;
  };

  this.getHeight = function () {
    return height;
  };

  this.repositionLegendGraphic = function (force) {
    if (displayLegendInMap) {
      loadLegendInline(force);
    } else {
      legendDivBuffer[0].hide();
      legendDivBuffer[1].hide();
    }
  };

  this.resizeWidth=-1;
  this.resizeHeight=-1;
  var resizeTimerBusy = false;
  var resizeTimer = new WMJSTimer();
  
  this.setSize = function (w, h) {
    if (enableConsoleDebugging)console.log('setSize', w, h);
    if (parseInt(w) < 4 || parseInt(h) < 4 ) {
      console.log('Skipping setSize', w, h);
      return;
    }
    // return;
    // this._setSize(w - 50, h);
    this.resizeWidth = parseInt(w);
    this.resizeHeight = parseInt(h);
    /**
    Enable following line to enable smooth scaling during resize transitions. Is heavier for browser.
    */
    // _map._setSize((_map.resizeWidth) | 0, (_map.resizeHeight) | 0);

    if (resizeTimerBusy === false) {
      resizeTimerBusy = true;  
      _map._setSize(_map.resizeWidth, _map.resizeHeight);
      return;
    } 
    resizeTimer.init(200, function () {
       resizeTimerBusy = false;
      _map._setSize(_map.resizeWidth, _map.resizeHeight);
      _map.draw('resizeTimer');
    });
  };

  this._setSize = function (w, h) {

    if (!w || !h) return;
    if (parseInt(w) < 4 || parseInt(h) < 4 ) {
      return;
    }

    if (enableConsoleDebugging)console.log('setSize(' + w + ',' + h + ')');
    var projinfo = this.getProjection();
    width = parseInt(w);
    height = parseInt(h);
    if (width < 4 || isNaN(width))width = 4;
    if (height < 4 || isNaN(height))height = 4;
    if (!projinfo.srs || !projinfo.bbox) {
      error('this.setSize: Setting default projection (EPSG:4326 with (-180,-90,180,90)');
      projinfo.srs = 'EPSG:4326';
      projinfo.bbox.left = -180;
      projinfo.bbox.bottom = -90;
      projinfo.bbox.right = 180;
      projinfo.bbox.top = 90;
      _map.setProjection(projinfo.srs, projinfo.bbox);
    }
//       baseDiv.style.width=width+'px';
//       baseDiv.style.height=height+'px';
    baseDiv.css({ width:width, height:height });


    mainElement.style.width = width + 'px';
    mainElement.style.height = height + 'px';
    _map.setBBOX(resizeBBOX);

    _map.repositionMapPin();
    _map.showBoundingBox();
    if (divBuffer.length > 1) {
      divBuffer[0].resize(_map.getWidth(), _map.getHeight());
      divBuffer[1].resize(_map.getWidth(), _map.getHeight());
    }

    if (legendDivBuffer.length > 1) {
      legendDivBuffer[0].resize(_map.getWidth(), _map.getHeight());
      legendDivBuffer[1].resize(_map.getWidth(), _map.getHeight());
    }
    _map.repositionLegendGraphic(true);

    if (divBuffer[currentSwapBuffer]) {
      divBuffer[currentSwapBuffer].display();
    }

    // Fire the onresize event, to notify listeners that something happened.
    callBack.triggerEvent('onresize', [width, height]);
  };

  this.getBBOXandProjString = function (layer) {
    var request = '';
    if (layer.version == WMSVersion.version100 || layer.version == WMSVersion.version111) {
      request += 'SRS=' + URLEncode(srs) + '&';
      request += 'BBOX=' + bbox.left + ',' + bbox.bottom + ',' + bbox.right + ',' + bbox.top + '&';
    }
    if (layer.version == WMSVersion.version130) {
      request += 'CRS=' + URLEncode(srs) + '&';

      if (srs == 'EPSG:4326' && layer.wms130bboxcompatibilitymode == false) {
        request += 'BBOX=' + bbox.bottom + ',' + bbox.left + ',' + bbox.top + ',' + bbox.right + '&';
      } else {
        request += 'BBOX=' + bbox.left + ',' + bbox.bottom + ',' + bbox.right + ',' + bbox.top + '&';
      }
    }
    return request;
  };

  this.isTouchDevice = function () {
    return typeof window.ontouchstart !== 'undefined';
  };

  this.getDimensionRequestString = function (layer) {
    return getMapDimURL(layer);
  };

  this.dateToISO8601 = function (date) {
    function prf (input, width) {
      // print decimal with fixed length (preceding zero's)
      var string = input + '';
      var len = width - string.length;
      var j, zeros = '';
      for (j = 0; j < len; j++)zeros += '0' + zeros;
      string = zeros + string;
      return string;
    }
    var iso = prf(date.getUTCFullYear(), 4) +
        '-' + prf(date.getUTCMonth() + 1, 2) +
            '-' + prf(date.getUTCDate(), 2) +
                'T' + prf(date.getUTCHours(), 2) +
                    ':' + prf(date.getUTCMinutes(), 2) +
                        ':' + prf(date.getUTCSeconds(), 2) + 'Z';
    return iso;
  };

  // Build a valid WMS request for a certain layer
  function buildWMSGetMapRequest (layer) {
    if (!isDefined(layer.name)) return;
    if (!layer.format) { layer.format = 'image/png'; error('layer format missing!'); }
    if (layer.name.length < 1) return;

    // GetFeatureInfo timeseries in the mapview
    if (srs == 'GFI:TIME_ELEVATION') {
      var x = 707;
      var y = 557;
      var _bbox = '29109.947643979103,6500000,1190890.052356021,7200000';
      var _srs = 'EPSG:3857';

      var request = layer.getmapURL;
      request += '&SERVICE=WMS&REQUEST=GetFeatureInfo&VERSION=' + layer.version;

      request += '&LAYERS=' + URLEncode(layer.name);

      var baseLayers = layer.name.split(',');
      request += '&QUERY_LAYERS=' + URLEncode(baseLayers[baseLayers.length - 1]);
      request += '&BBOX=' + _bbox;
      request += '&CRS=' + URLEncode(_srs) + '&';

      request += 'WIDTH=' + width;
      request += '&HEIGHT=' + height;
      if (layer.version == WMSVersion.version100 || layer.version == WMSVersion.version111) {
        request += '&X=' + x;
        request += '&Y=' + y;
      }
      if (layer.version == WMSVersion.version130) {
        request += '&I=' + x;
        request += '&J=' + y;
      }
      request += '&FORMAT=image/gif';
      request += '&INFO_FORMAT=image/png';
      request += '&STYLES=';

      var startDate = _map.dateToISO8601(new Date(bbox.left));
      var stopDate = _map.dateToISO8601(new Date(bbox.right));

      request += '&time=' + startDate + '/' + stopDate;
      request += '&elevation=' + bbox.bottom + '/' + bbox.top;

      return request;
    }

    var request = layer.getmapURL;
    request += '&SERVICE=WMS&';
    request += 'VERSION=' + layer.version + '&';
    request += 'REQUEST=GetMap&';
    request += 'LAYERS=' + URLEncode(layer.name) + '&';
    request += 'WIDTH=' + width + '&';
    request += 'HEIGHT=' + (height) + '&';

    request += _map.getBBOXandProjString(layer);
    request += 'STYLES=' + URLEncode(layer.currentStyle) + '&';
    request += 'FORMAT=' + layer.format + '&';
    if (layer.transparent === true) {
      request += 'TRANSPARENT=TRUE&';
    } else {
      request += 'TRANSPARENT=FALSE&';
    }
     // request+="EXCEPTIONS=INIMAGE&";
    // Handle dimensions
    try {
      request += getMapDimURL(layer);
    } catch (e) {
      return undefined;
    }
    /*
    if(layerDimensionsObject){
      for(var j=0;j<layerDimensionsObject.length;j++){
        if(layerDimensionsObject[j].valid!=false){
          request+='&'+getCorrectWMSDimName(layerDimensionsObject[j].name);
          request+='='+layerDimensionsObject[j].currentValue;
        }else return undefined;
      }
    } */
    // Handle WMS extensions
    request += layer.wmsextensions.url;

    return request;
  }

//     var drawBusy=0;
  this.abort = function () {
    callBack.triggerEvent('onmapready');
    mapBusy = false;
    callBack.triggerEvent('onloadingcomplete');
  };

  this.isBusy = function () {
    if (suspendDrawing == true || mapBusy || layersBusy == 1) {
      return true;
    }
    if (divBuffer[0].ready == false || divBuffer[1].ready == false) return true;
    return false;
  };

  var makeInfoHTML = function () {
    try {
      // Create the layerinformation table
      var infoHTML = '<table class="myTable">';
      var infoHTMLHasValidContent = false;
      // Make first a header with 'Layer' and the dimensions
      infoHTML += '<tr><th>Layer</th>';
      if (mapdimensions) {
        for (var d = 0; d < mapdimensions.length; d++) {
          infoHTML += '<th>' + mapdimensions[d].name + '</th>';
        }
      }
      infoHTML += '</tr>';
      infoHTML += '<tr><td>Map</tdh>';
      if (mapdimensions) {
        for (var d = 0; d < mapdimensions.length; d++) {
          infoHTML += '<td>' + mapdimensions[d].currentValue + '</td>';
        }
      }
      infoHTML += '</tr>';
      var l = 0;
      for (l = 0; l < _map.getNumLayers(); l++) {
        var j = (_map.getNumLayers() - 1) - l;
        if (layers[j].service && layers[j].enabled) {
          var layerDimensionsObject = layers[j].dimensions;// getLayerDimensions(layers[j]);
              // Add information to infoHTML
          if (layerDimensionsObject) {
            var layerTitle = '';
                // if(activeLayer==layers[j])layerTitle="->";else layerTitle="  ";
            layerTitle += layers[j].title;
            infoHTML += '<tr><td>' + layerTitle + '</td>';
            for (var mapdim = 0; mapdim < mapdimensions.length; mapdim++) {
              var foundDim = false;
              for (var layerdim = 0; layerdim < layerDimensionsObject.length; layerdim++) {
                if (layerDimensionsObject[layerdim].name.toUpperCase() == mapdimensions[mapdim].name.toUpperCase()) {
                  infoHTML += '<td>' + layerDimensionsObject[layerdim].currentValue + '</td>';
                  foundDim = true;
                  infoHTMLHasValidContent = true;
                  break;
                }
              }
              if (foundDim == false)infoHTML += '<td>-</td>';
            }
            infoHTML += '</tr>';
          }
        }
      }
      infoHTML += '</table>';
      if (infoHTMLHasValidContent == true) {
        divDimInfo.style.display = '';
        divDimInfo.innerHTML = infoHTML;
        var cx = 8;
        var cy = 8;
        divDimInfo.style.width = (Math.min((width - parseInt(divDimInfo.style.marginLeft) - 210), 350)) + 'px';
        divDimInfo.style.left = cx + 'px';
        divDimInfo.style.top = cy + 'px';
      } else {
        divDimInfo.style.display = 'none';
      }
    } catch (e) {
      error('Exception' + e);
    }
  };

  this.getLegendGraphicURLForLayer = function (layer) {
    if (layer) {
      var legendURL = layer.legendGraphic;
      if (!legendURL) return undefined;
      // For THREDDS WMS we need to add layers=
      legendURL += '&layers=' + URLEncode(layer.name) + '&';
      try {
        if (layer.legendIsDimensionDependant == true) {
          legendURL += _map.getDimensionRequestString(layer) + '&';
        }
        legendURL += '&transparent=true&width=90&height=250&';
      } catch (e) {
        return undefined;
      }

      // legendURL+="STYLE="+URLEncode(layer.currentStyle)+"&";

            // Handle WMS extensions
      legendURL += layer.wmsextensions.url;

      return legendURL;
    }
    return undefined;
  };

  var showScaleBarInMap = true;
  this.showScaleBar = function () {
    showScaleBarInMap = true;
    console.log('todo showScaleBar');
  };
  this.hideScaleBar = function () {
    showScaleBarInMap = false;
    console.log('todo hideScaleBar');
  };


  this.getMaxNumberOfAnimations = function () {
    return maxAnimationSteps;
  };

  var zoomBeforeLoadBBOX;
  var srsBeforeLoadBBOX;
  // Animate between start and end dates with the smallest available resolution
  this.drawAutomatic = function (start, end) {
    if (layers.length === 0) {
      return;
    }
    var currentTime = start.format('YYYY-MM-DDTHH:mm:ss');
    var drawDates = [];
    var iter = 0;
    // Fetch all dates within the time interval with a dynamic frequency
    while (moment(currentTime) < end && iter < 1000) {
      iter++;
      var smallestTime = null;
      for (var i = layers.length - 1; i >= 0; i--) {
        var timeDim = layers[i].getDimension('time');
        if (!timeDim) {
          continue;
        }
        var layerTime = timeDim.getNextClosestValue(currentTime);
        if (!layerTime || layerTime === 'date too early') {
          continue;
        }

        if (smallestTime === null || moment(layerTime) < moment(smallestTime)) {
          smallestTime = layerTime;
        }
      }
      if (smallestTime === null) {
        break;
      }
      var smallestTimeObj = { name: 'time', value: smallestTime };
      drawDates.push(smallestTimeObj);
      currentTime = smallestTime;
    }

    // If there are times in the interval, animate them all,
    // Otherwise, fall back to "dumb" animation and draw the last 100 dates from the first layer
    if (drawDates.length > 0) {
      const splicedDate = drawDates.pop();
      this.draw(drawDates);
    } else {
      var firstTimeDim = layers[0].getDimension('time');
      if (!firstTimeDim) {
        return;
      }
      var numTimeSteps = firstTimeDim.size();

      var numStepsBack = Math.min(firstTimeDim.size(), 100);

      var dates = [];
      for (var j = numTimeSteps - numStepsBack; j < numTimeSteps; ++j) {
        dates.push({ name:firstTimeDim.name, value:firstTimeDim.getValueForIndex(j) });
      }
      this.draw(dates);
    }
  };

  var drawTimer = new WMJSDebouncer();
  var drawTimerBusy = false;
  var drawTimerPending = false;
  var drawTimerAnimationList;

  this.draw = function (animationList) {
    if (_map.isAnimating ) { 
      if (enableConsoleDebugging)console.log('ANIMATING: Skipping draw:' + animationList);
      return;
    }
    drawTimerAnimationList = animationList;
    if (drawTimerBusy === true) {
      if (drawTimerPending === true) return;
      drawTimerPending = true;
      drawTimer.init(10, () => {
        drawTimerBusy = false;
        drawTimerPending = false;
        _map._draw(drawTimerAnimationList);
      });
      return;
    }
    drawTimerBusy = true;
    _map._draw(drawTimerAnimationList);
  };
  /**
   * API Function called to draw the layers, fires getmap request and shows the layers on the screen
   */
  this._draw = function (animationList) {
    
    if (enableConsoleDebugging)console.log('draw:' + animationList);


    if (enableConsoleDebugging)console.log('drawnBBOX.setBBOX(bbox)');
    drawnBBOX.setBBOX(bbox);
    _drawAndLoad(animationList);
  };

  var _drawAndLoad = function (animationList) {
//     if(width < 4 || height < 4 ) {
//       console.log('map too small, skipping');
//       return;
//     }

    callBack.triggerEvent('beforedraw');

    // debug("WebMapJS::draw():"+animationList);
    // alert(animationList);
    if (_map.isAnimating === false) {
      if (animationList !== undefined) {
        if (typeof (animationList) === 'object') {
          if (animationList.length > 0) {
            if (animationList.length > maxAnimationSteps) {
              alert('Too many animations given, max is ' + maxAnimationSteps);
              _map.draw('self');
              return;
            }
            _map.isAnimating = true;
            callBack.triggerEvent('onstartanimation', _map);
            _map.currentAnimationStep = 0;
            _map.animationList = [];
            _map.mouseHoverAnimationBox = false;
            for (var j = 0; j < animationList.length; j++) {
              var animationListObject = { name:animationList[j].name, value:animationList[j].value };
              _map.setDimension(animationList[j].name, animationList[j].value, false);
              animationListObject.requests = _map.getWMSRequests();
              _map.animationList.push(animationListObject);
            }
            _map.setDimension(_map.animationList[_map.currentAnimationStep].name, _map.animationList[_map.currentAnimationStep].value, false);
            wmjsAnimate.checkAnimation();
          }
        }
      }
    }

/*    if (_map.isAnimating == true) {
      for (var j = 0; j < _map.animationList.length; j++) {
        _map.setDimension(_map.animationList[j].name, _map.animationList[j].value);
        _map.animationList[j].requests = _map.getWMSRequests();
        _map.animationList[j].imagesInPrefetch = undefined;// _map.prefetch(_map.animationList[j].requests,false);;
      }
      _map.setDimension(_map.animationList[_map.currentAnimationStep].name, _map.animationList[_map.currentAnimationStep].value);

      if (isDefined(mainTimeSlider)) {
        mainTimeSlider.el.hide();
      }
    }*/

    _map._pdraw();
  };

  var onLayersReadyCallbackFunction = function () {
    _map.draw('onlayersready callback');
  };

  var onMapReadyCallbackFunction = function () {
    debug('--> onmapready event called');
    _map.draw('onmapready callback');
  };

  var onResumeSuspendCallbackFunction = function () {
    _map.draw('onresumesuspend callback');
  };

  this.getWMSRequests = function () {
    var requests = [];
    var n = _map.getNumLayers();
    for (j = 0; j < n; j++) {
      if (layers[j].service && layers[j].enabled) {
        var request = buildWMSGetMapRequest(layers[j]);
        if (request) {
          requests.push(request);
        }
      }
    }
    return requests;
  };

  /**
   * Prefetches given requests
   *
   * @param requests An array of requests to prefetch
   * @return The list of images in prefetch
   */
  this.prefetch = function (requests) {
    var prefetching = [];
    for (j = 0; j < requests.length; j++) {
      var image = getMapImageStore.getImage(requests[j]);
      if (image.isLoaded() == false && image.isLoading() == false) {
        prefetching.push(image);
        image.load();
      }
    }
    return prefetching;
  };

  this.getImageStore = function () {
    return getMapImageStore;
  };

  // Returns 0: not loaded, 1 loading, 2 loaded
  this.isThisRequestLoaded = function (request) {
    var image = getMapImageStore.getImageForSrc(request);
    if (image == undefined) return 0;
    if (image.isLoaded()) return 2;
    if (image.isLoading()) return 1;
  };

  this.mouseHoverAnimationBox = false;

  this._pdraw = function () {
    if (initialized == 0) return;

    if (suspendDrawing == true) {
      if (callBack.addToCallback('onresumesuspend', onResumeSuspendCallbackFunction) == true) {
        debug('Suspending on onresumesuspend');
      }
      drawBusy = 0;
      return;
    }
//       if(drawBusy==1){
//         debug("Suspending on ondrawready");
//         callBack.addToCallback("ondrawready",_map.draw);
//         //drawBusy=0;
//         return;
//       }


//       drawBusy=1;

    function loadLayers () {
      if (enableConsoleDebugging)console.log('loadLayers');
      var request;

      var currentLayerIndex = 0;
      numBaseLayers = 0;
      if (baseLayers) {
        for (var l = 0; l < baseLayers.length; l++) {
          if (baseLayers[l].enabled) {
            if (baseLayers[l].keepOnTop === false) {
              if (baseLayers[l].type && baseLayers[l].type === 'twms') continue;
              numBaseLayers++;
              request = buildWMSGetMapRequest(baseLayers[l]);

              if (request) {
                divBuffer[newSwapBuffer].setSrc(currentLayerIndex, request, _map.getWidth(), _map.getHeight());
                divBuffer[newSwapBuffer].setOpacity(currentLayerIndex, baseLayers[l].opacity);
                 // _map.setBufferImageSrc(newSwapBuffer,currentLayerIndex,request);
               // _map.setBufferImageOpacity(newSwapBuffer,currentLayerIndex,baseLayers[l].opacity);

                currentLayerIndex++;
              }
            }
          }
        }
      }
      var j = 0;

      // Loop through all layers
      for (j = 0; j < _map.getNumLayers(); j++) {
        if (layers[j].service && layers[j].enabled) {
          // Get the dimension object for this layer
          var layerDimensionsObject = layers[j].dimensions;// getLayerDimensions(layers[j]);
          request = buildWMSGetMapRequest(layers[j], layerDimensionsObject);
          if (request) {
            // _map.setBufferImageSrc(newSwapBuffer,currentLayerIndex,request);
            // _map.setBufferImageOpacity(newSwapBuffer,currentLayerIndex,layers[j].opacity);
            divBuffer[newSwapBuffer].setSrc(currentLayerIndex, request);
            divBuffer[newSwapBuffer].setOpacity(currentLayerIndex, layers[j].opacity);
            layers[j].image = divBuffer[newSwapBuffer].layers[currentLayerIndex];
            currentLayerIndex++;
          }
        }
      }

      // debug*
      if (baseLayers) {
        for (var l = 0; l < baseLayers.length; l++) {
          if (baseLayers[l].enabled) {
            if (baseLayers[l].keepOnTop == true) {
              request = buildWMSGetMapRequest(baseLayers[l]);
              if (request) {
                // _map.setBufferImageSrc(newSwapBuffer,currentLayerIndex,request);
                // _map.setBufferImageOpacity(newSwapBuffer,currentLayerIndex,baseLayers[l].opacity);
                divBuffer[newSwapBuffer].setSrc(currentLayerIndex, request);
                divBuffer[newSwapBuffer].setOpacity(currentLayerIndex, baseLayers[l].opacity);
                currentLayerIndex++;
              }
            }
          }
        }
      }

      _map.flipBuffers();
      // Make info HTML
      // makeInfoHTML();
    };

    // if layers are not ready yet, wait for them
    if (layersBusy == 1) {
      if (callBack.addToCallback('onlayersready', onLayersReadyCallbackFunction) == true) {
        debug('Suspending on onlayersready');
      }
//         drawBusy=0;
      return;
    }
    if (mapBusy) {
      if (callBack.addToCallback('onmapready', onMapReadyCallbackFunction) == true) {
        debug('Suspending on onmapready');
      }
//         drawBusy=0;
      return;
    }

    loadLayers();
//       drawBusy=0;
    callBack.triggerEvent('ondrawready', _map);
    loadLegendInline();
  };

  var wmjsAnimate;

  var updateBoundingBox = function (_mapbbox) {
    if (divBuffer.length == 0) return;
    var mapbbox = bbox; if (isDefined(_mapbbox))mapbbox = _mapbbox;
    updateBBOX.copy(mapbbox);
    divBuffer[currentSwapBuffer].setBBOX(updateBBOX, loadedBBOX);
    divBuffer[currentSwapBuffer].mapbbox = updateBBOX;
    _map.showBoundingBox(divBoundingBox.bbox, updateBBOX);
    callBack.triggerEvent('onupdatebbox', updateBBOX);
  };


  var loadingDivTimer = new WMJSTimer();

  _map.flipBuffers = function () {
    if (enableConsoleDebugging)console.log('flipBuffers');
    var prev = currentSwapBuffer;
    var current = newSwapBuffer;

//       divBuffer[prev].bbox = bbox.clone();
//       divBuffer[prev].display(updateBBOX);

    // divBuffer[newSwapBuffer].mapbbox=bbox;
    callBack.triggerEvent('onmapstartloading');
    mapBusy = true;
    loadingDivTimer.init(500, function () { loadingDiv.show(); });
    loadingBBOX.setBBOX(bbox);

    if(!divBuffer[current])return;
    divBuffer[current].load(
      function () {
        if (enableConsoleDebugging)console.log('flipBuffers loadcomplete');
        try {
          divBuffer[prev].srs = srs;
          divBuffer[current].bbox = bbox.clone();
          divBuffer[current].srs = srs;
          if (enableConsoleDebugging)console.log('loadedBBOX.setBBOX(bbox)');
          loadedBBOX.setBBOX(loadingBBOX);
          if (enableConsoleDebugging)console.log('-----------------------');

          divBuffer[current].display(updateBBOX, loadedBBOX);

          divMapPin.oldx = divMapPin.exactX;
          divMapPin.oldy = divMapPin.exactY;
          divBuffer[prev].hide();
          currentSwapBuffer = current;
          newSwapBuffer = prev;

        } catch (e) {
          console.log(e);
        }
        mapBusy = false;

        callBack.triggerEvent('onmaploadingcomplete', _map);
        callBack.triggerEvent('onloadingcomplete', _map);
        callBack.triggerEvent('onmapready', _map);
        loadingDiv.hide();
        loadingDivTimer.stop();
      }
    );
  };

  _map.getBackBufferCanvasContext = function () {
    return divBuffer[newSwapBuffer].getCanvasContext();
  };
  _map.getFrontBufferCanvasContext = function () {
    return divBuffer[currentSwapBuffer].getCanvasContext();
  };

  _map.redrawBuffer = function () {
    divBuffer[currentSwapBuffer].display();
  };

  this.addBaseLayers = function (layer) {
    if (layer) {
      numBaseLayers = 0;
      layer = toArray(layer);
      baseLayers.push(layer);
      for (j = 0; j < baseLayers.length; j++) {
        if (baseLayers.keepOnTop == true) {
          numBaseLayers++;
        }

        // baseLayers[j].id=(-2)-j;;
      }
      callBack.triggerEvent('onlayeradd');
    } else baseLayers = undefined;
  };

  this.setBaseLayers = function (layer) {
    // TODO use calculate baselayer instead...
    if (layer) {
      numBaseLayers = 0;
      // layer=toArray(layer);
      baseLayers = layer;
      for (j = 0; j < baseLayers.length; j++) {
        if (baseLayers.keepOnTop == true) {
          numBaseLayers++;
        }
        // baseLayers[j].id=(-2)-j;;
      }
      callBack.triggerEvent('onlayerchange');
    } else baseLayers = undefined;
  };

  this.getBaseLayers = function () {
    return baseLayers;
  };

  this.getNumLayers = function () {
    return layers.length;
  };

  this.getBaseElement = function () {
    return baseDiv;
  };

  var mouseWheelBusy = 0;
  var mouseWheelBusyDelayTimer = new WMJSTimer();

  var flyZoomToBBOXTimerLoop = 0;
  var flyZoomToBBOXTimer = new WMJSTimer();
  var flyZoomToBBOXScaler=0;
  var flyZoomToBBOXCurrent = new WMJSBBOX();
  var flyZoomToBBOXNew = new WMJSBBOX();
  var flyZoomToBBOXContinueNew = new WMJSBBOX();
  var flyZoomToBBOXTimerFuncBusy = 0;
  var flyZoomToBBOXTimerFuncBusyAndContinue= 0;
  var flyZoomToBBOXTimerFunc = () => {
    let z1 = 1 - flyZoomToBBOXScaler;
    var nbbox = new WMJSBBOX (
      flyZoomToBBOXCurrent.left * z1 + flyZoomToBBOXNew.left * flyZoomToBBOXScaler,
      flyZoomToBBOXCurrent.bottom * z1 + flyZoomToBBOXNew.bottom * flyZoomToBBOXScaler,
      flyZoomToBBOXCurrent.right * z1 + flyZoomToBBOXNew.right * flyZoomToBBOXScaler,
      flyZoomToBBOXCurrent.top * z1 + flyZoomToBBOXNew.top * flyZoomToBBOXScaler);
    updateBoundingBox(nbbox);
    flyZoomToBBOXTimerLoop += 1;
    flyZoomToBBOXScaler += (1 / 6);
    if (flyZoomToBBOXTimerLoop > 5) {
      flyZoomToBBOXTimerLoop = 0;
      flyZoomToBBOXScaler = 0;
      _map.zoomTo(nbbox);
      if (flyZoomToBBOXTimerFuncBusyAndContinue === 0) {
        flyZoomToBBOXTimerFuncBusyAndContinue = 0;
        flyZoomToBBOXTimerFuncBusy = 0;
        _map.draw('flyZoomToBBOXTimerFunc');
      } else {
        flyZoomToBBOXTimerFuncBusyAndContinue = 0;
        flyZoomToBBOXTimerFuncBusy = 0;
        flyZoomToBBOXStartZoom(updateBBOX, flyZoomToBBOXContinueNew);
      }
      return;
    }
    flyZoomToBBOXTimer.init(10, flyZoomToBBOXTimerFunc);
  };

  var flyZoomToBBOXStartZoom = (currentbox, newbox) => {
    if (flyZoomToBBOXTimerFuncBusy === 1) {
      flyZoomToBBOXContinueNew.copy(newbox);
      flyZoomToBBOXTimerFuncBusyAndContinue = 1;
      return;
    }
    flyZoomToBBOXCurrent.copy(currentbox);
    flyZoomToBBOXNew.copy(newbox);
    flyZoomToBBOXTimerLoop = 0;
    flyZoomToBBOXScaler = 0;
    if (flyZoomToBBOXTimerFuncBusy === 0) {
      flyZoomToBBOXTimerFuncBusy = 1;
      flyZoomToBBOXTimerFunc();
    }
  };

  // this.mouseWheel = function(delta){
  let mouseWheelEventBBOXCurrent = new WMJSBBOX();
  let mouseWheelEventBBOXNew = new WMJSBBOX();
  this.mouseWheelEvent = function (event, delta, deltaX, deltaY) {

    event.stopPropagation();
    preventdefault_event(event);
    // alert(element.top);
    // if(drawBusy==1)return;
    if (mouseWheelBusy == 1) return;
    mouseWheelBusy = 1;
    // controlsBusy = true;

    // if(delta>0){
     //   _map.setMapPin(mouseX,mouseY);
   // _map.showMapPin();

    var w = (updateBBOX.right - updateBBOX.left);
    var h = (updateBBOX.bottom - updateBBOX.top);

    var geoMouseXY = _map.getGeoCoordFromPixelCoord({ x:mouseX, y:mouseY }, drawnBBOX);




    var nx = (geoMouseXY.x - updateBBOX.left) / w;// Normalized to 0-1
    var ny = (geoMouseXY.y - updateBBOX.top) / h;

    var zoomW;
    var zoomH;
    if (delta < 0) {
      zoomW = w * -0.3;
      zoomH = h * -0.3;
    } else {
      zoomW = w * 0.20;// delta;
      zoomH = h * 0.20;//* delta;
    }
    var newLeft = updateBBOX.left + zoomW;
    var newTop = updateBBOX.top + zoomH;
    var newRight = updateBBOX.right - zoomW;
    var newBottom = updateBBOX.bottom - zoomH;

    var newW = newRight - newLeft;
    var newH = newBottom - newTop;

    var newX = nx * newW + newLeft;
    var newY = ny * newH + newTop;

    var panX = (newX - geoMouseXY.x);

    var panY = (newY - geoMouseXY.y);
        // debug("OldXY:"+(geoMouseXY.x+","+geoMouseXY.y)+" newXY:"+(newX+","+newY));
    newLeft -= panX;
    newRight -= panX;
    newTop -= panY;
    newBottom -= panY;

      /* var mx=(mouseX-width/2)/width;
      var my=(mouseY-height/2)/height;
      var sx=a*mx*2;
      var sy=-a*my*2; */

    mouseWheelEventBBOXCurrent.copy(updateBBOX);

    mouseWheelEventBBOXNew.left = newLeft;
    mouseWheelEventBBOXNew.bottom = newBottom;
    mouseWheelEventBBOXNew.right = newRight;
    mouseWheelEventBBOXNew.top = newTop;



    flyZoomToBBOXStartZoom(mouseWheelEventBBOXCurrent, mouseWheelEventBBOXNew);
    mouseWheelBusy =0;
    return;
  };

  var pinchStart1, pinchStart2;
  var pinchBox;
  this.pinchStart = function (x, y, e) {
    pinchStart1 = { x:e.pointers[0].clientX, y:e.pointers[0].clientY };
    pinchStart2 = { x:e.pointers[1].clientX, y:e.pointers[1].clientY };
    pinchBox = bbox.clone();
    controlsBusy = true;
    mouseDownPressed = 0;
    mouseDragging = 1;
    mouseWheelBusy = 1;
  };
  this.pinchMove = function (x, y, e) {
    mouseDownPressed = 0;
    pinchMove1 = { x:e.pointers[0].clientX, y:e.pointers[0].clientY };
    pinchMove2 = { x:e.pointers[1].clientX, y:e.pointers[1].clientY };
    var dX1 = (pinchMove2.x - pinchMove1.x);
    var dX2 = (pinchStart2.x - pinchStart1.x);
    var dY1 = (pinchMove2.y - pinchMove1.y);
    var dY2 = (pinchStart2.y - pinchStart1.y);

    if (dX2 == 0)dX2 = 1;
    if (dY2 == 0)dY2 = 1;

    if (dX1 * dX1 > dY1 * dY1) {
      var sx = dX1 / dX2;
      var newxr = ((width - pinchMove1.x) / sx) + pinchStart1.x;
      var newxl = pinchStart1.x - (pinchMove1.x / sx);
      bbox.right = (newxr / width) * (pinchBox.right - pinchBox.left) + pinchBox.left;
      bbox.left = (newxl / width) * (pinchBox.right - pinchBox.left) + pinchBox.left;
      var aspect = (pinchBox.right - pinchBox.left) / (pinchBox.top - pinchBox.bottom);
      var centerH = (bbox.top + bbox.bottom) / 2;
      var extentH = ((bbox.left - bbox.right) / 2) / aspect;
      bbox.bottom = centerH + extentH;
      bbox.top = centerH - extentH;
    } else {
      var sy = dY1 / dY2;
      var newyb = ((height - pinchMove1.y) / sy) + pinchStart1.y;
      var newyt = pinchStart1.y - (pinchMove1.y / sy);
      bbox.bottom = (newyb / height) * (pinchBox.bottom - pinchBox.top) + pinchBox.top;
      bbox.top = (newyt / height) * (pinchBox.bottom - pinchBox.top) + pinchBox.top;
      var aspect = (pinchBox.right - pinchBox.left) / (pinchBox.top - pinchBox.bottom);
      var centerW = (bbox.right + bbox.left) / 2;
      var extentW = ((bbox.bottom - bbox.top) / 2) * aspect;
      bbox.left = centerW + extentW;
      bbox.right = centerW - extentW;
    }
    updateBoundingBox(bbox);
  };
  this.pinchEnd = function (x, y, e) {
    controlsBusy = false;
    mouseDownPressed = 0;
    mouseDragging = 0;
    mouseWheelBusy = 0;
    _map.zoomTo(bbox);
    _map.draw('pinchEnd');
  };

  _map.destroy = function () {
    _map.stopAnimating();
    for (var i = layers.length - 1; i >= 0; i--) {
      layers[i].setAutoUpdate(false);
    }
    detachEvents();
  };

  function detachEvents () {
    console.log('Detaching...');
    baseDiv.off('mousedown');
    baseDiv.off('mousewheel');
    del_event(document, 'mouseup', _map.mouseUpEvent);
    del_event(document, 'mousemove', _map.mouseMoveEvent);
  }

  function attachEvents () {
    baseDiv.mousedown(_map.mouseDownEvent);
    baseDiv.mousewheel(_map.mouseWheelEvent);
    attach_event(document, 'mouseup', _map.mouseUpEvent);
    attach_event(document, 'mousemove', _map.mouseMoveEvent);
    if (_map.isTouchDevice()) {
      _map.enableInlineGetFeatureInfo(false);
      var mc = new Hammer.Manager(document.body);
      mc.add(new Hammer.Pan());
      mc.add(new Hammer.Pinch());
      mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
      mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));
      mc.on('panstart', function (ev) { ev.preventDefault(); _map.mouseDown(ev.center.x, ev.center.y, ev); });
      mc.on('panmove', function (ev) { ev.preventDefault(); _map.mouseMove(ev.center.x, ev.center.y, ev); });
      mc.on('panend', function (ev) { ev.preventDefault(); _map.mouseUp(ev.center.x, ev.center.y, ev); });
      mc.on('pinchstart', function (ev) { ev.preventDefault(); _map.pinchStart(ev.center.x, ev.center.y, ev); });
      mc.on('pinchmove', function (ev) { ev.preventDefault(); _map.pinchMove(ev.center.x, ev.center.y, ev); });
      mc.on('pinchend', function (ev) { ev.preventDefault(); _map.pinchEnd(ev.center.x, ev.center.y, ev); });
      _map.hideControls();
    }

    _map.setMapModePan();
  };

  // Adds DIM_ for certain dims
  var getCorrectWMSDimName = function (origDimName) {
      // Adds DIM_ for dimensions other than height or time
    // origDimName=origDimName.toUpperCase();
    if (origDimName.toUpperCase() == 'TIME') return origDimName;
    if (origDimName.toUpperCase() == 'ELEVATION') return origDimName;
    return 'DIM_' + origDimName;
  };

  // Returns all dimensions with its current values as URL
  var getMapDimURL = function (layer) {
    var layerDimensions = layer.dimensions;// getLayerDimensions(layer);
    var request = '';
    for (var j = 0; j < layerDimensions.length; j++) {
      request += '&' + getCorrectWMSDimName(layerDimensions[j].name);
      request += '=' + URLEncode(layerDimensions[j].currentValue);

      if (layerDimensions[j].currentValue == WMJSDateOutSideRange ||
        layerDimensions[j].currentValue == WMJSDateTooEarlyString ||
        layerDimensions[j].currentValue == WMJSDateTooLateString) {
        throw (WMJSDateOutSideRange);
      }
    }
    return request;
  };

  // Returns all dimensions with its current values as object
  var buildLayerDims = function () {
    // return;
    if (_map.buildLayerDimsBusy == true) {
      alert('b');
      return;
    }
    for (var k = 0; k < mapdimensions.length; k++) {
      var mapDim = mapdimensions[k];
      for (var j = 0; j < layers.length; j++) {
        for (var i = 0; i < layers[j].dimensions.length; i++) {
          var layerDim = layers[j].dimensions[i];
          if (layerDim.linked == true) {
            if (layerDim.name == mapDim.name) {
              // if(layerDim.units=="ISO8601"&&mapDim.units=="ISO8601"){

              if (mapDim.currentValue == 'current' ||
                mapDim.currentValue == 'default' ||
                mapDim.currentValue == '' ||
                mapDim.currentValue == 'earliest' ||
                mapDim.currentValue == 'middle' ||
                mapDim.currentValue == 'latest'
              ) {
                mapDim.currentValue = layerDim.getClosestValue(mapDim.currentValue);
                // if(mapDim.currentValue == WMJSDateTooEarlyString)alert("BUG!");
              }

              // alert(mapDim.currentValue);
              _map.buildLayerDimsBusy = true;
              layerDim.setClosestValue(mapDim.currentValue);
              _map.buildLayerDimsBusy = false;
              /* }else{
                if(layerDim.units == mapDim.units){
                  var index = -1;
                  var value = WMJSDateOutSideRange;
                  try{
                    index = layerDim.getIndexForValue(mapDim.currentValue);
                    value = layerDim.getValueForIndex(index);
                  }catch(e){
                  }
                  layerDim.currentValue = value;
                }
              } */
            }
          }
        }
      }
    }

    return;
  };

  var mouseX = 0;
  var mouseY = 0;
  var mouseDownX = -10000;
  var mouseDownY = -10000;
  var mouseUpX = 10000;
  var mouseUpY = 10000;
  var mouseDragging = 0;
  var controlsBusy = false;
  var mouseDownPressed = 0;
  var elementPosition;
  var mapMode = 'pan';// pan,zoom,zoomout,info
  this.getMapMode = function () {
    return mapMode;
  };
  /* GetMetaData handling */
  this.getWMSMetaDataRequestURL = function (layer) {
    var request = layer.service;
    request += '&SERVICE=WMS&REQUEST=GetMetaData&VERSION=' + layer.version;
    request += '&LAYER=' + URLEncode(layer.name);
    request += '&FORMAT=text/html';
    try {
      request += '&' + getMapDimURL(layer);
    } catch (e) {
      return undefined;
    }
    debug("<a target=\'_blank\' href='" + request + "'>" + request + '</a>', false);
    return request;
  };

  /* GetFeature info handling */
  var numGetFeatureInfoRequests = 0;
  var getFeatureInfoResult = Array();
  var GetFeatureInfoObject = function (layer, data) {
    this.layer = layer;
    this.data = data;
  };

  /* GetPointInfo handling */
  var numGetPointInfoRequests = 0;
  var getPointInfoResult = Array();
  var GetPointInfoObject = function (layer, data) {
    this.layer = layer;
    this.data = data;
  };

  var getPointInfoRequestURL = function (layer, x, y, service, style) {
    var request = service;

    request += '&GRAPHSTYLE=' + style;

    request += '&' + _map.getBBOXandProjString(layer);

    request += '&LAYERS=' + URLEncode(layer.name);

    request += 'WIDTH=' + width;
    request += '&HEIGHT=' + height;
    request += '&X=' + x;
    request += '&Y=' + y;
    request += '&FORMAT=image/png';
    request += '&INFO_FORMAT=text/html';
    request += '&STYLES=';
    try {
      request += '&' + getMapDimURL(layer);
    } catch (e) {
      return undefined;
    }
    debug("<a target=\'_blank\' href='" + request + "'>" + request + '</a>', false);
    return request;
  };

  // Makes a valid getfeatureinfoURL for each layer
  this.getWMSGetFeatureInfoRequestURL = function (layer, x, y) {
    var request = WMJScheckURL(layer.service);
    request += '&SERVICE=WMS&REQUEST=GetFeatureInfo&VERSION=' + layer.version;

    request += '&LAYERS=' + URLEncode(layer.name);

    var baseLayers = layer.name.split(',');
    request += '&QUERY_LAYERS=' + URLEncode(baseLayers[baseLayers.length - 1]);
    request += '&' + _map.getBBOXandProjString(layer);
    request += 'WIDTH=' + width;
    request += '&HEIGHT=' + height;
    if (layer.version == WMSVersion.version100 || layer.version == WMSVersion.version111) {
      request += '&X=' + x;
      request += '&Y=' + y;
    }
    if (layer.version == WMSVersion.version130) {
      request += '&I=' + x;
      request += '&J=' + y;
    }
    request += '&FORMAT=image/gif';
    request += '&INFO_FORMAT=text/html';
    request += '&STYLES=';
    try {
      request += '&' + getMapDimURL(layer);
    } catch (e) {
      return undefined;
    }
    debug("<a target=\'_blank\' href='" + request + "'>" + request + '</a>', false);
    return request;
  };

  // Called when a HTTP request is finished
  var FeatureInfoRequestReady = function (data, layer) {
    numGetFeatureInfoRequests--;
    var result;
    if (layer) {
      if (layer.queryable == true) {
        result = new GetFeatureInfoObject(layer, data);
      } else {
        result = new GetFeatureInfoObject(layer, 'not queryable');
      }
    } else result = new GetFeatureInfoObject(layer, 'Query failed...');
    getFeatureInfoResult.push(result);
    if (numGetFeatureInfoRequests <= 0) {
      numGetFeatureInfoRequests = 0;
      callBack.triggerEvent('ongetfeatureinfoready', getFeatureInfoResult);
    }
  };

  // Called when a HTTP request is finished
  /* var PointInfoRequestReady = function(data,layer){
    debug("PointInfoRequestReady "+layer.name+">>>"+numGetPointInfoRequests);
    numGetPointInfoRequests--;
    var result;
    if(layer){
      result = new GetPointInfoObject(layer, data);
    }else result = new GetPointInfoObject(layer,"Query failed...");

    //result = {layer:layer,message:"Query failed"}
    getPointInfoResult.push(result);
    if(numGetPointInfoRequests<=0){
      numGetPointInfoRequests=0;
      callBack.triggerEvent("ongetpointinfoready",getPointInfoResult);
    }
  } */

  var newGetPointInfo = function () {
    debug('resuming on ongetpointinfoready');

    _map.getPointInfo(mouseDownX, mouseDownY);
  };

  var getPointInfoBusy = false;
  this.getPointInfo = function (x, y) {
    if (getPointInfoBusy) {
      debug('suspending on ongetpointinfoready');
      _map.addListener('ongetpointinfoready', newGetPointInfo, false);
      return;
    }
    getPointInfoBusy = true;
    callBack.triggerEvent('beforegetpointinfo');

    var gr = _map.getGraphingData();

    if (gr == undefined) {
      error('getPointInfo getGraphingData is undefined');
      getPointInfoBusy = false;
      return;
    }
    debug('getPointInfo(' + x + ',' + y + ')' + ' ' + gr.layer.name);
    var url = getPointInfoRequestURL(gr.layer, x, y, gr.service, gr.style);
    debug('GetPointInfo: ' + url);

    var graphingImage = new Image();
    graphingImage.loadEvent = function () {
      getPointInfoBusy = false;
      var getPointInfoResult = {};
      getPointInfoResult.url = url;
      getPointInfoResult.layer = gr.layer;
      getPointInfoResult.img = graphingImage;

      callBack.triggerEvent('ongetpointinfoready', getPointInfoResult);
    };
    setElProps(graphingImage);
    graphingImage.src = url;
  };

  var newGetFeatureInfo = function () {
    debug('resuming on ongetfeatureinfoready');
    callBack.triggerEvent('beforegetfeatureinfo');
    _map.getFeatureInfo(mouseDownX, mouseDownY);
  };

  this.getFeatureInfo = function (x, y) {
    if (numGetFeatureInfoRequests > 0) {
      debug('suspending on ongetfeatureinfoready');
      _map.addListener('ongetfeatureinfoready', newGetFeatureInfo, false);
      return;
    }
    debug('GetFeatureInfo:');
    // callBack.triggerEvent("ongetfeatureinfoready",['Querying server... ']);
    getFeatureInfoResult = Array();
    numGetFeatureInfoRequests = 0;
    for (var j = 0; j < layers.length; j++) {
      var layer = layers[layers.length - j - 1];
      layer.getFeatureInfoUrl = '';
      if (layer.service && layer.enabled && layer.queryable == true) {
        layer.getFeatureInfoUrl = _map.getWMSGetFeatureInfoRequestURL(layer, x, y);
        if (!isDefined(layer.getFeatureInfoUrl)) {
          layer.getFeatureInfoUrl = '';
        } else {
          numGetFeatureInfoRequests++;
        }
      }
    }
    if (numGetFeatureInfoRequests == 0) {
      callBack.triggerEvent('ongetfeatureinfoready', ['No layers to query']);
    }
    for (var j = 0; j < layers.length; j++) {
      var myLayer = layers[layers.length - j - 1];

      if (myLayer.getFeatureInfoUrl != '') {
        if (myLayer.queryable == false) {
          FeatureInfoRequestReady('Layer is not queryable.', myLayer);
        } else {
          try {
            MakeHTTPRequest(myLayer.getFeatureInfoUrl, FeatureInfoRequestReady,
            function (data, myLayer) { FeatureInfoRequestReady(data, myLayer); error(data); }, myLayer);
          } catch (e) {
            FeatureInfoRequestReady('Exception: ' + e, myLayer);
          }
        }
      }
    }
  };

  this.getGetFeatureInfoObjectAsHTML = function (data) {
    var html = '';

    try {
      html += '<div class="getfeatureinfo">';
      for (var j = 0; j < layers.length; j++) {
        for (var i = 0; i < data.length; i++) {
          if (data[i].layer == layers[j]) {
          //  html+="<div style='border-bottom:2px solid white;background-color:lightblue;padding:3px;line-height:20px;'>";
            html += '<div class="getfeatureinfolayer">';
            html += "<b><a target='_blank' href='" + data[i].layer.getFeatureInfoUrl + "'>" + data[i].layer.title + '</a></b><br/>';

            html += data[i].data;
            html += '</div>';
         //   html+="</div>";
          }
        }
      }
      html += '</div>';
    } catch (e) { html = 'No layers to query.'; }
    return html;
  };

  /* End of GetFeature info handling */

  this.getMapPinXY = function () {
    return [divMapPin.exactX, divMapPin.exactY];
  };

  this.positionMapPinByLatLon = function (coord) {
    debug('positionMapPinByLatLon at ' + coord.x + ',' + coord.y);
    var newpos = _map.getPixelCoordFromLatLong(coord);
    _map.setMapPin(newpos.x, newpos.y);
    _map.showMapPin();
  };

  this.repositionMapPin = function () {
    var newpos = _map.getPixelCoordFromGeoCoord({ x:divMapPin.geoPosX, y:divMapPin.geoPosY });
    _map.setMapPin(newpos.x, newpos.y);
    // debug(newpos.x+)
  };

  this.setMapPin = function (_x, _y) {
    var x = _x;
    var y = _y;

    if (typeof (_x) === 'object') {
      x = _x.x;
      y = _x.y;
    }
    if (!x || !y) return;

    debug("setMapPin ("+x+";"+y+")");
    divMapPin.x = parseInt(x);
    divMapPin.y = parseInt(y);

    divMapPin.exactX = parseFloat(x);
    divMapPin.exactY = parseFloat(y);
    debug('Input coords: ' + _x + ', ' + _y);
    debug('Exact coords: ' + divMapPin.exactX + ', ' + divMapPin.exactY);
    var geopos = _map.getGeoCoordFromPixelCoord({ x:divMapPin.exactX, y:divMapPin.exactY });
    divMapPin.geoPosX = geopos.x;
    divMapPin.geoPosY = geopos.y;
    divMapPin.style.left = divMapPin.x - 5 + 'px';
    divMapPin.style.top = divMapPin.y - 7 + 'px';
  };

  this.isMapPinVisible = function () {
    if (divMapPin.style.display == 'none') return false;
    return true;
  };

  this.showMapPin = function () {
    divMapPin.innerHTML = '<img src=\'' + mapPinImageSrc + '\'>';
    divMapPin.style.display = '';
  };

  this.hideMapPin = function () {
    divMapPin.style.display = 'none';
  };

  this.setMapModeGetInfo = function () {
    mapMode = 'info';
    baseDiv.css('cursor', 'default');
  };

  this.setMapModeZoomBoxIn = function (e) {
    mapMode = 'zoom';
    baseDiv.css('cursor', 'default');
  };

  this.setMapModeZoomOut = function (e) {
    mapMode = 'zoomout';
    baseDiv.css('cursor', 'default');
  };

  this.setMapModePan = function (e) {
    mapMode = 'pan';
    baseDiv.css('cursor', 'default');
  };

  this.setMapModePoint = function (e, graphWin) {
    mapMode = 'point';
    baseDiv.css('cursor', 'url(webmapjs/img/aero_pen.cur), default');
  };

  var oldMapMode;
  this.setMapModeNone = function (e) {
    mapMode = 'none';
    baseDiv.css('cursor', 'default');
  };

  this.getMouseCoordinatesForDocument = function (e) {
    if (isDefined(e.changedTouches)) {
      return { x:parseInt(e.changedTouches[0].screenX), y:parseInt(e.changedTouches[0].screenY) };
    }
    var parentOffset = $(mainElement).parent().offset();
    var pageX = e.pageX;
    var pageY = e.pageY;
    if (pageX == undefined) { pageX = getClick_X(e); }
    if (pageY == undefined) { pageY = getClick_Y(e); }
    var relX = pageX - parentOffset.left;
    var relY = pageY - parentOffset.top;
    return { x:relX, y:relY };
  };

  this.getMouseCoordinatesForElement = function (e) {
    if (isDefined(e.changedTouches)) {
      return { x:parseInt(e.changedTouches[0].screenX), y:parseInt(e.changedTouches[0].screenY) };
    }
    var parentOffset = $(mainElement).parent().offset();
    var pageX = e.pageX;
    var pageY = e.pageY;
    if (pageX == undefined) { pageX = getClick_X(e); }
    if (pageY == undefined) { pageY = getClick_Y(e); }
    var relX = pageX - parentOffset.left;
    var relY = pageY - parentOffset.top;
    return { x:relX, y:relY };
  };

  this.mouseDown = function (mouseCoordX, mouseCoordY, event) {


    var shiftKey = false;
    if (event) {
      if (event.shiftKey == true) {
        shiftKey = true;
      }
    }

    mouseDownX = mouseCoordX;
    mouseDownY = mouseCoordY;
    mouseDownPressed = 1;
    if (mouseDragging === 0) {
      if (checkInvalidMouseAction(mouseDownX, mouseDownY) === 0) {
        let triggerResults = callBack.triggerEvent('beforemousedown', { mouseX:mouseCoordX, mouseY:mouseCoordY, mouseDown:true, event:event });
        for (let j = 0; j < triggerResults.length; j++) {
          if (triggerResults[j] === false) {
            return;
          }
        }
      }
    }
    controlsBusy = true;
    if (!shiftKey) {
      if (oldMapMode != undefined) {
        mapMode = oldMapMode;
        oldMapMode = undefined;
      }
    } else {
      if (oldMapMode == undefined)oldMapMode = mapMode;
      mapMode = 'zoom';
    }
    callBack.triggerEvent('mousedown', { map:_map, x:mouseDownX, y:mouseDownY });

    if (mapMode == 'info') {
      debug('GetFeatureInfo');
      _map.setMapPin(mouseDownX, mouseDownY);
      _map.showMapPin();

      callBack.triggerEvent('beforegetfeatureinfo', { map:_map, x:mouseDownX, y:mouseDownY });
      _map.getFeatureInfo(mouseDownX, mouseDownY);
    } else if (mapMode == 'point') {
      _map.setMapPin(mouseDownX, mouseDownY);
      _map.showMapPin();
      _map.getPointInfo(mouseDownX, mouseDownY);
    }
  };

  var InValidMouseAction = 0;
  var checkInvalidMouseAction = function (MX, MY) {
    if (MY < 0 | MX < 0 | MX > width | MY > height) { InValidMouseAction = 1; return -1; }
    return 0;
  };

  var resizingBBOXCursor = false;
  var resizingBBOXEnabled = false;

  var mouseGeoCoordXY;
  var mouseUpdateCoordinates;

  this.updateMouseCursorCoordinates = function (coordinates) {
    mouseUpdateCoordinates = coordinates;
    mouseGeoCoordXY = _map.getGeoCoordFromPixelCoord(coordinates);
    _map.draw('updateMouseCursorCoordinates');
  };

  this.mouseDownEvent = function (e) {
    preventdefault_event(e);
    var mouseCoords = _map.getMouseCoordinatesForDocument(e);
    if (mapHeader.cursorSet && mouseCoords.y < mapHeader.height) {
      return;
    }
    _map.mouseDown(mouseCoords.x, mouseCoords.y, e);
  };
  this.mouseMoveEvent = function (e) {
    preventdefault_event(e);
    var mouseCoords = _map.getMouseCoordinatesForDocument(e);
    if (mouseDownPressed === 0 && mouseCoords.y >= 0 && mouseCoords.y < mapHeader.height && mouseCoords.x >= 0 && mouseCoords.x <= width) {
      if (mapHeader.cursorSet === false) {
        mapHeader.cursorSet = true;
        mapHeader.prevCursor = currentCursor;
        mapHeader.hovering = true;
        _map.setCursor('pointer');
        _map.draw('mouseMoveEvent');
      }
    } else {
      if (mapHeader.cursorSet === true) {
        mapHeader.cursorSet = false;
        mapHeader.hovering = false;
        _map.setCursor(mapHeader.prevCursor);
        _map.draw('mouseMoveEvent');
      }
    }

    _map.mouseMove(mouseCoords.x, mouseCoords.y, e);
  };
  this.mouseUpEvent = function (e) {
    preventdefault_event(e);
    var mouseCoords = _map.getMouseCoordinatesForDocument(e);
    _map.mouseUp(mouseCoords.x, mouseCoords.y, e);
  };

  this.mouseMove = function (mouseCoordX, mouseCoordY) {
    mouseX = mouseCoordX;
    mouseY = mouseCoordY;
    if (mouseDragging === 0 ){
      let triggerResults = callBack.triggerEvent('beforemousemove', { mouseX:mouseX, mouseY:mouseY, mouseDown:mouseDownPressed === 1 ? true:false });
      for (let j = 0; j < triggerResults.length; j++) {
        if (triggerResults[j] === false) {
          return;
        }
      }
    }
    if (divBoundingBox.displayed == true && mapPanning == 0) {
      var tlpx = _map.getPixelCoordFromGeoCoord({ x:divBoundingBox.bbox.left, y:divBoundingBox.bbox.top });
      var brpx = _map.getPixelCoordFromGeoCoord({ x:divBoundingBox.bbox.right, y:divBoundingBox.bbox.bottom });

      var foundBBOXRib = false;

      if (mouseDownPressed == 0) {
        if (resizingBBOXEnabled === false)resizingBBOXCursor = baseDiv.css('cursor');
        // Find left rib
        if (Math.abs(mouseX - tlpx.x) < 6 && mouseY > tlpx.y && mouseY < brpx.y) {
          foundBBOXRib = true; baseDiv.css('cursor', 'col-resize'); resizingBBOXEnabled = 'left';
        }
        // Find top rib
        if (Math.abs(mouseY - tlpx.y) < 6 && mouseX > tlpx.x && mouseX < brpx.x) {
          foundBBOXRib = true; baseDiv.css('cursor', 'row-resize'); resizingBBOXEnabled = 'top';
        }
        // Find right rib
        if (Math.abs(mouseX - brpx.x) < 6 && mouseY > tlpx.y && mouseY < brpx.y) {
          foundBBOXRib = true; baseDiv.css('cursor', 'col-resize'); resizingBBOXEnabled = 'right';
        }
        // Find bottom rib
        if (Math.abs(mouseY - brpx.y) < 6 && mouseX > tlpx.x && mouseX < brpx.x) {
          foundBBOXRib = true; baseDiv.css('cursor', 'row-resize'); resizingBBOXEnabled = 'bottom';
        }
        // Find topleft corner
        if (Math.abs(mouseX - tlpx.x) < 6 && Math.abs(mouseY - tlpx.y) < 6) {
          foundBBOXRib = true; baseDiv.css('cursor', 'nw-resize'); resizingBBOXEnabled = 'topleft';
        }
        // Find topright corner
        if (Math.abs(mouseX - brpx.x) < 6 && Math.abs(mouseY - tlpx.y) < 6) {
          foundBBOXRib = true; baseDiv.css('cursor', 'ne-resize'); resizingBBOXEnabled = 'topright';
        }
        // Find bottomleft corner
        if (Math.abs(mouseX - tlpx.x) < 6 && Math.abs(mouseY - brpx.y) < 6) {
          foundBBOXRib = true; baseDiv.css('cursor', 'sw-resize'); resizingBBOXEnabled = 'bottomleft';
        }
        // Find bottomright corner
        if (Math.abs(mouseX - brpx.x) < 6 && Math.abs(mouseY - brpx.y) < 6) {
          foundBBOXRib = true; baseDiv.css('cursor', 'se-resize'); resizingBBOXEnabled = 'bottomright';
        }
      }

      if (foundBBOXRib == true || (resizingBBOXEnabled !== false && mouseDownPressed == 1)) {
        if (mouseDownPressed == 1) {
          if (resizingBBOXEnabled == 'left')tlpx.x = mouseX;
          if (resizingBBOXEnabled == 'top')tlpx.y = mouseY;
          if (resizingBBOXEnabled == 'right')brpx.x = mouseX;
          if (resizingBBOXEnabled == 'bottom')brpx.y = mouseY;
          if (resizingBBOXEnabled == 'topleft') { tlpx.x = mouseX; tlpx.y = mouseY; }
          if (resizingBBOXEnabled == 'topright') { brpx.x = mouseX; tlpx.y = mouseY; }
          if (resizingBBOXEnabled == 'bottomleft') { tlpx.x = mouseX; brpx.y = mouseY; }
          if (resizingBBOXEnabled == 'bottomright') { brpx.x = mouseX; brpx.y = mouseY; }

          tlpx = _map.getGeoCoordFromPixelCoord(tlpx);
          brpx = _map.getGeoCoordFromPixelCoord(brpx);
          divBoundingBox.bbox.left = tlpx.x;
          divBoundingBox.bbox.top = tlpx.y;
          divBoundingBox.bbox.right = brpx.x;
          divBoundingBox.bbox.bottom = brpx.y;
          _map.showBoundingBox(divBoundingBox.bbox);

          var data = { map:_map, bbox:divBoundingBox.bbox };
          callBack.triggerEvent('bboxchanged', data);
        }
        return;
      } else {
        resizingBBOXEnabled = false;
        baseDiv.css('cursor', resizingBBOXCursor);
      }
    }

    //  alert(mouseX);
    if (checkInvalidMouseAction(mouseX, mouseY) == -1) {
      try {
        callBack.triggerEvent('onmousemove', [undefined, undefined]);
        _map.updateMouseCursorCoordinates(undefined);
      } catch (e) {
        console.log(e);
      }
      // _map.resumeDrawing();
      mouseUpX = mouseX;
      mouseUpY = mouseY;
//         if(drawBusy==1)return;
      if (mapPanning == 0) return;
      if (mouseDownPressed == 1) if (mapMode == 'zoomout')_map.zoomOut();
      mouseDownPressed = 0;
      if (mouseDragging == 1) {
        mouseDragEnd(mouseUpX, mouseUpY);
      }
      return;
    }

    if (mouseDownPressed == 1) {
      if (!(Math.abs(mouseDownX - mouseX) < 3 && Math.abs(mouseDownY - mouseY) < 3)) {
        mouseDrag(mouseX, mouseY);
      }
    }
    callBack.triggerEvent('onmousemove', [mouseX, mouseY]);
    _map.updateMouseCursorCoordinates({ x:mouseX, y:mouseY });
  };

  this.mouseUp = function (mouseCoordX, mouseCoordY, e) {
    controlsBusy = false;
    mouseUpX = mouseCoordX;
    mouseUpY = mouseCoordY;
    if (mouseDragging === 0) {
      if (checkInvalidMouseAction(mouseUpX, mouseUpY) === 0) {
        let triggerResults = callBack.triggerEvent('beforemouseup', { mouseX:mouseCoordX, mouseY:mouseCoordY, mouseDown:false, event:e });
        for (let j = 0; j < triggerResults.length; j++) {
          if (triggerResults[j] === false) {
            mouseDownPressed = 0;
            return;
          }
        }
      }
    }

    if (mouseDownPressed == 1) {
      if (mapMode == 'zoomout') { _map.zoomOut(); }
      if (mouseDragging == 0) {
        // if(mapMode=='pan')
        {
          if (Math.abs(mouseDownX - mouseUpX) < 3 && Math.abs(mouseDownY - mouseUpY) < 3) {
            if (isDefined(e)) {
              callBack.triggerEvent('mouseclicked', { map:_map, x:mouseUpX, y:mouseUpY, shiftKeyPressed: (e.shiftKey == true) });
            }
            if (inlineGetFeatureInfo == true) {
            // if(false){
              // _map.closeAllDialogs(gfiDialogList)
              var dialog;

              if (gfiDialogList.length == 0) {
                dialog = WMJSDialog.createDialog({ x:mouseUpX, y:mouseUpY, autoDestroy:false }, baseDiv, _map);
                gfiDialogList.push(dialog);
              } else {
                dialog = gfiDialogList[0];
              }
              if (dialog.hasBeenDragged == false) {
                if (dialog.moveToMouseCursor == true) {
                  dialog.setXY(mouseUpX, mouseUpY);
                } else {
                  dialog.setXY(5, 35);
                }
              }

              dialog.on('hide', function (event, ui) {
                dialog.hasBeenDragged = false;
              });
              dialog.setLoading();
              dialog.show();
              var ongetfeatureinfoready = function (data) {
                // alert(_map.getGetFeatureInfoObjectAsHTML(data));
                dialog.setHTML(_map.getGetFeatureInfoObjectAsHTML(data));
              };

              _map.addListener('ongetfeatureinfoready', ongetfeatureinfoready, true);
              _map.setMapPin(mouseDownX, mouseDownY);
              _map.showMapPin();
              callBack.triggerEvent('beforegetfeatureinfo');
              _map.getFeatureInfo(mouseDownX, mouseDownY);
            }
          }
        }
      }
      callBack.triggerEvent('mouseup', { map:_map, x:mouseUpX, y:mouseUpY });
    }

    mouseDownPressed = 0;
    if (mouseDragging == 1) {
      mouseDragEnd(mouseUpX, mouseUpY);
    }
  };

  // Derived mouse functions
  var mouseDragStart = function (x, y) {
    if (mapMode == 'pan')mapPanStart(x, y);
    if (mapMode == 'zoom')mapZoomStart(x, y);
  };

  var mouseDrag = function (x, y) {
    if (mouseDragging == 0) { mouseDragStart(x, y); mouseDragging = 1; }
    if (mapMode == 'pan')mapPan(x, y);
    if (mapMode == 'zoom')mapZoom(x, y);
  };

  var mouseDragEnd = function (x, y) {
    if (mouseDragging == 0) return; mouseDragging = 0;
    if (mapMode == 'pan')mapPanEnd(x, y);
    if (mapMode == 'zoom')mapZoomEnd(x, y);
    callBack.triggerEvent('mapdragend', { map:_map, x:mouseUpX, y:mouseUpY });
  };

  // Map zoom and pan functions
  var mapPanning = 0;
  var mapPanStartGeoCoords;
  var mapPanStart = function (_x, _y) {
    // if(drawBusy==1||mapBusy)return;
    baseDiv.css('cursor', 'move');
    var x = parseInt(_x); var y = parseInt(_y);

    divMapPin.oldx = divMapPin.exactX;
    divMapPin.oldy = divMapPin.exactY;
    for (var j = 0; j < gfiDialogList.length; j++) {
      gfiDialogList[j].origX = gfiDialogList[j].x;
      gfiDialogList[j].origY = gfiDialogList[j].y;
    }
    mapPanning = 1;
    if (enableConsoleDebugging)console.log('updateBBOX.setBBOX(drawnBBOX)');
    updateBBOX.setBBOX(drawnBBOX);
    mapPanStartGeoCoords = _map.getGeoCoordFromPixelCoord({ x:x, y:y }, drawnBBOX);
  };

  var mapPan = function (_x, _y) {
    if (mapPanning == 0) return;
    var x = parseInt(_x); var y = parseInt(_y);

    if (mouseX < 0 || mouseY < 0 || mouseX > parseInt(mainElement.style.width) || mouseY > parseInt(mainElement.style.height)) {
      mapPanEnd(x, y);
      return;
    }
    var mapPanGeoCoords = _map.getGeoCoordFromPixelCoord({ x:x, y:y }, drawnBBOX);
    var diff_x = mapPanGeoCoords.x - mapPanStartGeoCoords.x;
    var diff_y = mapPanGeoCoords.y - mapPanStartGeoCoords.y;
    _map.setMapPin(divMapPin.oldx + (diff_x / (bbox.right - bbox.left)) * width, divMapPin.oldy + (diff_y / (bbox.bottom - bbox.top)) * height);
    updateBBOX.left = drawnBBOX.left - diff_x;
    updateBBOX.bottom = drawnBBOX.bottom - diff_y;
    updateBBOX.right = drawnBBOX.right - diff_x;
    updateBBOX.top = drawnBBOX.top - diff_y;
    updateBoundingBox(updateBBOX);
  };

  var mapPanEnd = function (_x, _y) {
    baseDiv.css('cursor', 'default');
    var x = parseInt(_x);
    var y = parseInt(_y);
    if (mapPanning == 0) return;
    mapPanning = 0;

    var mapPanGeoCoords = _map.getGeoCoordFromPixelCoord({ x:x, y:y }, drawnBBOX);
    var diff_x = mapPanGeoCoords.x - mapPanStartGeoCoords.x;
    var diff_y = mapPanGeoCoords.y - mapPanStartGeoCoords.y;
    mapPanStartGeoCoords = _map.getGeoCoordFromPixelCoord({ x:x, y:y }, drawnBBOX);
    _map.setMapPin(divMapPin.oldx + (diff_x / (bbox.right - bbox.left)) * width, divMapPin.oldy + (diff_y / (bbox.bottom - bbox.top)) * height);

    updateBBOX.left = drawnBBOX.left - diff_x;
    updateBBOX.bottom = drawnBBOX.bottom - diff_y;
    updateBBOX.right = drawnBBOX.right - diff_x;
    updateBBOX.top = drawnBBOX.top - diff_y;
    updateBoundingBox(updateBBOX);
    _map.zoomTo(updateBBOX);
    _map.draw('mapPanEnd');

//     for (var j = 0; j < gfiDialogList.length; j++) {
//       if (gfiDialogList[j].hasBeenDragged == false) {
//         if (gfiDialogList[j].moveToMouseCursor == true) {
//           gfiDialogList[j].setXY(gfiDialogList[j].origX + x, gfiDialogList[j].origY + y);
//           gfiDialogList[j].origX = gfiDialogList[j].origX + x;
//           gfiDialogList[j].origY = gfiDialogList[j].origY + y;
//         }
//       }
//     }
  };

  var mapZooming = 0;
  var mapZoomStart = function (x, y) {
    baseDiv.css('cursor', 'crosshair');
    mapZooming = 1;
  };
  var mapZoom = function (x, y) {
    if (mapZooming == 0) return;
    x = mouseX - mouseDownX;
    y = mouseY - mouseDownY;
    if (x < 0 && y < 0) {
      baseDiv.css('cursor', 'not-allowed');
    } else {
      baseDiv.css('cursor', 'crosshair');
    }
    var w = x; h = y;
    divZoomBox.style.display = '';
    if (w < 0) {
      w = -w;
      divZoomBox.style.left = (mouseX) + 'px';
    } else divZoomBox.style.left = (mouseDownX) + 'px';
    if (h < 0) {
      h = -h;
      divZoomBox.style.top = (mouseY) + 'px';
    } else divZoomBox.style.top = (mouseDownY) + 'px';
    divZoomBox.style.width = w + 'px';
    divZoomBox.style.height = h + 'px';
  };

  var mapZoomEnd = function (x, y) {
    x = mouseUpX - mouseDownX;
    y = mouseUpY - mouseDownY;
          // debug("mapZoomEnd mouseDownEvent = "+mouseDownX+" , "+mouseDownY+"\t"+"xy = "+x+" , "+y);
    baseDiv.css('cursor', 'default');
    if (mapZooming == 0) return;
    mapZooming = 0;
    // debug("mapZoomEnd");
    divZoomBox.style.display = 'none';
    if (x < 0 && y < 0) return;
    var zoomBBOXPixels = new WMJSBBOX();

    if (x < 0) {
      zoomBBOXPixels.left = mouseDownX + x;
      zoomBBOXPixels.right = mouseDownX;
    } else {
      zoomBBOXPixels.left = mouseDownX;
      zoomBBOXPixels.right = mouseDownX + x;
    }
    if (y < 0) {
      zoomBBOXPixels.top = mouseDownY + y;
      zoomBBOXPixels.bottom = mouseDownY;
    } else {
      zoomBBOXPixels.top = mouseDownY;
      zoomBBOXPixels.bottom = mouseDownY + y;
    }

    // debug("zoomBBOXPixels 1:"+zoomBBOXPixels.toString());
    var p1 = _map.pixelCoordinatesToXY({ x:zoomBBOXPixels.left, y:zoomBBOXPixels.bottom });
    var p2 = _map.pixelCoordinatesToXY({ x:zoomBBOXPixels.right, y:zoomBBOXPixels.top });

    zoomBBOXPixels.left = p1.x;
    zoomBBOXPixels.bottom = p1.y;
    zoomBBOXPixels.right = p2.x;
    zoomBBOXPixels.top = p2.y;
     // debug("zoomBBOXPixels 2:"+zoomBBOXPixels.toString());
    _map.zoomTo(zoomBBOXPixels);
    _map.draw('mapZoomEnd');
  };

  this.setCursor = function (cursor) {
    if (cursor) {
      currentCursor = cursor;
    } else {
      currentCursor = 'default';
    }
    baseDiv.css('cursor', currentCursor);
  };

  this.zoomTo = function (_newbbox) {
    if (enableConsoleDebugging)console.log('zoomTo');
    var setOrigBox = false;

    var newbbox = new WMJSBBOX(_newbbox);
    // Maintain aspect ratio
    try {
      var ratio = (resizeBBOX.left - resizeBBOX.right) / (resizeBBOX.bottom - resizeBBOX.top);
    } catch (e) {
      setOrigBox = true;
    }
    // Check whether we have had valid bbox values
    if (isNaN(ratio)) {
      setOrigBox = true;
    }
    if (setOrigBox == true) {
      error('Invalid bbox: setting ratio to 1');
      ratio = 1;
    }
    if (ratio < 0)ratio = -ratio;

    var screenRatio = width / height;

    // Is W > H?
    if (ratio > screenRatio) {
      // W is more than H, so calc H
      var centerH = (newbbox.top + newbbox.bottom) / 2;
      var extentH = ((newbbox.left - newbbox.right) / 2) / ratio;
      newbbox.bottom = centerH + extentH;
      newbbox.top = centerH - extentH;
    } else {
      // H is more than W, so calc W
      var centerW = (newbbox.right + newbbox.left) / 2;
      var extentW = ((newbbox.bottom - newbbox.top) / 2) * ratio;
      newbbox.left = centerW + extentW;
      newbbox.right = centerW - extentW;
    }

    _map.setBBOX(newbbox);
    updateBoundingBox(bbox);
    // resizeBBOX.clone(zoomBBOX);
    drawnBBOX.setBBOX(bbox);

    var resetMapPinAndDialogs = function () {
      var newpos = _map.getPixelCoordFromGeoCoord({ x:divMapPin.geoPosX, y:divMapPin.geoPosY });
      _map.setMapPin(newpos.x, newpos.y);
      for (var j = 0; j < gfiDialogList.length; j++) {
        var newpos = _map.getPixelCoordFromGeoCoord({ x:gfiDialogList[j].geoPosX, y:gfiDialogList[j].geoPosY });
        if (gfiDialogList[j].hasBeenDragged == false) {
          if (gfiDialogList[j].moveToMouseCursor == true) {
            gfiDialogList[j].setXY(gfiDialogList[j].origX + x, gfiDialogList[j].origY + y);
          }
        }
      }
    };
    resetMapPinAndDialogs();

    // _map.draw("zoomTo");
    // _map.addListener('onloadingcomplete',resetMapPinAndDialogs,false);
  };

  this.pixelCoordinatesToXY = function (coordinates) {
    return _map.getGeoCoordFromPixelCoord(coordinates);
    /*
    var px = coordinates.x;
    var py = coordinates.y
    var X =0,Y=0;
    var elPos = findElementPos(mainElement);
    X=(px/elPos[2])*(bbox.right-bbox.left)+bbox.left;
    //In case of latlon
    Y=(py/elPos[3])*(bbox.bottom-bbox.top)+bbox.top;
    return {x:X,y:Y}; */
  };

  this.getGeoCoordFromPixelCoord = function (coordinates, _bbox) {
    var mybbox = bbox;
    if (_bbox)mybbox = _bbox;
    if (!isDefined(coordinates)) return undefined;
    try {
      var lon = (coordinates.x / width) * (mybbox.right - mybbox.left) + mybbox.left;
      var lat = (coordinates.y / height) * (mybbox.bottom - mybbox.top) + mybbox.top;
    } catch (e) {
      return undefined;
    }
    return { x:lon, y:lat };
  };

  // proj4 remembers current projection
  this.proj4 = new Object();
  this.proj4.srs = 'empty';
  this.proj4.projection = undefined;
  var longlat = new Proj4js.Proj('EPSG:4326');

  this.getPixelCoordFromLatLong = function (coordinates) {
    var p = new Proj4js.Point();

    try {
      p.x = parseFloat(coordinates.x);
      p.y = parseFloat(coordinates.y);
      if (_map.proj4.srs != srs || !isDefined(this.proj4.projection)) {
        _map.proj4.projection = new Proj4js.Proj(srs);
        _map.proj4.srs = srs;
      }
      // alert(longlat);

      // debug("proj4:"+this.proj4.srs+ " "+ this.proj4);
      Proj4js.transform(longlat, _map.proj4.projection, p);
    } catch (e) {
      alert(debug('error in getPixelCoordFromLatLong ' + e));
      return undefined;
    }
    var newpos = _map.getPixelCoordFromGeoCoord(p);

    return newpos;
  };

  this.WCJSSearchRequest = function (searchDefinition) {
    /* ------------ */
    /*  Validation  */
    /* ------------ */
    /* Is it a coordinate search? No Ajax calls needed. */
    if (searchDefinition.trim().match(/^(-?(?:[1-8]?\d(?:\.\d+)?|90(?:\.0+)?),-?(?:180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?))$/)) {
      splitted = searchDefinition.split(',');
      lat = splitted[0];
      lng = splitted[1];
      _map.calculateBoundingBoxAndZoom(lat, lng);
      return;
    }

    if (typeof (geoNamesURL) === 'undefined' ||
      typeof (knmiGeoNamesURL) === 'undefined') {
      error(I18n.no_urls_in_config.text);
      return;
    }

    /* If there is no search term */
    if (!searchDefinition.trim()) {
      debug(I18n.no_search_definition.text);
      // Reset value, in case there are only spaces.
      $('#searchtextfield').attr('value', '');
      return;
    }

    searchDef = searchDefinition.trim().match(/^[a-zA-Z0-9 ]*$/);

    /* Only Alphanumeric characters are allowed */
    if (!searchDef) {
      debug(I18n.only_alpha_num_allowed.text);
      $('#searchtextfield').attr('value', '');
      return;
    }

    /*
     * First attempt if getting the lat/lng from GeoNames.org.
     * If not succesful, try our own SQLite3 DB.
     */
    var urlKNMIGeoNames = knmiGeoNamesURL.replace('{searchTerm}', searchDef);

    /* Debugging text */
    debug(I18n.debug_searching_location.text);
    debug("<a target=\'_blank\' href='" + urlKNMIGeoNames + "'>" + urlKNMIGeoNames + '</a>', false);

    $.ajax({
      dataType: 'jsonp',
      contentType: 'application/jsonp',
      jsonpCallback: 'resultGeo',
      crossDomain: true,
      type: 'GET',
      url: urlKNMIGeoNames,
      success: succes,
      error:errormessage
    });

    function errormessage (jqXHR, textStatus, errorThrown) {
      error(I18n.geonames_api_call_failed.text);
    }

    function succes (obj) {
      /* If there is no result from the API, search the SQLite DB */
      if ($(obj).length === 0) {
        var urlApiGeonames = geoNamesURL.replace('{searchTerm}', searchDef)
          .replace('{username}', defaultUsernameSearch);
        _map.WCJSSearchRequestGeoNames(urlApiGeonames);
        return;
      }

      var lat = parseFloat($(obj)[0].lat);
      var lng = parseFloat($(obj)[0].lon);

      _map.calculateBoundingBoxAndZoom(lat, lng);
    }
  };

  this.WCJSSearchRequestGeoNames = function (url) {
    debug(I18n.debug_searching_sqlite_location.text);
    debug("<a target=\'_blank\' href='" + url + "'>" + url + '</a>', false);

    function errormessage (jqXHR, textStatus, errorThrown) {
      error(I18n.geonames_sqlite_call_failed.text);
    }

    function succes (obj) {
      /* If there is no result */
      if ($(obj).find('totalResultsCount').text() === '0') {
        error(I18n.no_results_search.text);
        /* Reset value */
        return;
      }

      var lat = parseFloat($(obj).find('geoname').find('lat').text());
      var lng = parseFloat($(obj).find('geoname').find('lng').text());

      _map.calculateBoundingBoxAndZoom(lat, lng);
    }

    $.ajax({
      dataType: 'xml',
      type: 'GET',
      url: url,
      success: succes,
      error:errormessage
    });
  };

  this.calculateBoundingBoxAndZoom = function (lat, lng) {
    var lengthToBBOX = 500000;
    if (_map.proj4.projection.srsCode === 'EPSG:4326' ||
      _map.proj4.projection.srsCode === 'EPSG:50001') {
      lengthToBBOX = 5;
    }
    var latlng = _map.getPixelCoordFromLatLong({ x:lng, y:lat });
    var geolatlng = _map.getGeoCoordFromPixelCoord(latlng);

    var searchZoomBBOX = new WMJSBBOX();

    /* Making the boundingbox. */
    searchZoomBBOX.left = geolatlng.x - lengthToBBOX;
    searchZoomBBOX.bottom = geolatlng.y - lengthToBBOX;
    searchZoomBBOX.right = geolatlng.x + lengthToBBOX;
    searchZoomBBOX.top = geolatlng.y + lengthToBBOX;

    _map.zoomTo(searchZoomBBOX);
    _map.positionMapPinByLatLon({ x:lng, y:lat });
    _map.draw('zoomIn');
  };

  this.getLatLongFromPixelCoord = function (coordinates) {
    var p = new Proj4js.Point();
    try {
      p.x = (coordinates.x / width) * (bbox.right - bbox.left) + bbox.left;
      p.y = (coordinates.y / height) * (bbox.bottom - bbox.top) + bbox.top;
      if (this.proj4.srs != srs) {
        this.proj4.projection = new Proj4js.Proj(srs);
        this.proj4.srs = srs;
      }
      Proj4js.transform(this.proj4.projection, longlat, p);
    } catch (e) {
      return undefined;
    }
    return { x:p.x, y:p.y };
  };

  this.getPixelCoordFromGeoCoord = function (coordinates, _bbox, _width, _height) {
    var w = width;
    var h = height;
    var b = updateBBOX;
    if (isDefined(_width))w = _width;
    if (isDefined(_height))h = _height;
    if (isDefined(_bbox))b = _bbox;

    var x = (w * (coordinates.x - b.left)) / (b.right - b.left);
    var y = (h * (coordinates.y - b.top)) / (b.bottom - b.top);
    // Was parseInt, but we require sub-pixel precision
    return { x:parseFloat(x), y:parseFloat(y) };
  };

  // listeners:
  this.addListener = function (name, f, keep) {
    return callBack.addToCallback(name, f, keep);
  };

  this.removeListener = function (name, f) {
    return callBack.removeEvents(name, f);
  };

  this.getListener = function (name) {
    return callBack;
  };

  this.suspendEvent = function (name) {
    callBack.suspendEvent(name);
  };

  this.resumeEvent = function (name) {
    callBack.resumeEvent(name);
  };
  // Dimension handling
  this.getDimensionList = function () {
    return mapdimensions;
  };

  this.getDimension = function (name) {
    for (var i = 0; i < mapdimensions.length; i++) {
      if (mapdimensions[i].name == name) {
        return mapdimensions[i];
      }
    }
    return undefined;
  };

  this.setDimension = function (name, value, triggerEvent) {
    // debug("WebMapJS::setDimension('"+name+"','"+value+"')");
    if (!isDefined(name) || !isDefined(value)) {
      error('Unable to set dimension with undefined value or name');
      return;
    }
    var dim;
    for (var i = 0; i < mapdimensions.length; i++) {
      // debug("WebMapJS::comparing"+mapdimensions[i].name+" - "+name);

      if (mapdimensions[i].name == name) {
        dim = mapdimensions[i]; break;
      }
    }

    // if(value == WMJSDateTooEarlyString)alert("BUG");

    if (isDefined(dim) == false) {
      dim = { name:name, currentValue:value };
      mapdimensions.push(dim);
    }

    if (isDefined(dim)) {
      if (isDefined(mainTimeSlider)) {
       // debug("WebMapJS::setDimension::2('"+name+"','"+value+"')");
        mainTimeSlider.setValue(name, value);
      }

      if (dim.currentValue != value) {
        // debug("WebMapJS::setDimension "+name+"="+value);
        var cv = dim.currentValue;
        dim.currentValue = value;
        buildLayerDims();

       // if(cv!=value){

        if ( triggerEvent !== false) {
          triggerEvent = true;
        }
        if (triggerEvent === true) {
          callBack.triggerEvent('ondimchange', name);
        }
      // }

        // callBack.triggerEvent("ondimchange");
        // Keep a store of recently used currentvalues of certain dims. Can be used to reset currentvalues,
//           for(i in dimensionValueCache){
//             if(dimensionValueCache[i].name==dim.name){
//               if(dimensionValueCache[i].units==dim.units){
//                 //debug("Caching val:"+value);
//                 dimensionValueCache[i].currentValue=value;
//                 return;
//               }
//             }
//           }
//           dimensionValueCache.push(dim);
      }
    } else {
      error('WebMapJS::setDimension: Dimension ' + name + ' not found');
    }
  };

//     //Resume/suspend map drawing
//     this.suspendDrawing = function(){
//       suspendDrawing = true;
//     };
//     this.resumeDrawing = function(){
//       suspendDrawing = false;
//       callBack.triggerEvent("onresumesuspend");
//     };
//
  // Layer handling
  this.setLayerOpacity = function (_layer, _opacity) {
    if (!_layer) return;
    _layer.opacity = _opacity;
    var currentLayerIndex = numBaseLayers;
    for (j = 0; j < _map.getNumLayers(); j++) {
      if (layers[j].service && layers[j].enabled) {
        if (_layer == layers[j]) {
          _map.setBufferImageOpacity(newSwapBuffer, currentLayerIndex, _opacity);
          return;
        }
        currentLayerIndex++;
      }
    }
  };

  this.zoomToLayer = function (_layer) {
    // Tries to zoom to the layers boundingbox corresponding to the current map projection
    // If something fails, the defaultBBOX is used instead.
    var layer = _layer;
    if (!layer) {
      layer = activeLayer;
    }
    if (!layer) {
      _map.zoomTo(defaultBBOX);
      _map.draw('zoomTolayer');
      return;
    }
    for (var j = 0; j < layer.projectionProperties.length; j++) {
      if (layer.projectionProperties[j].srs == srs) {
        var w = layer.projectionProperties[j].bbox.right - layer.projectionProperties[j].bbox.left;
        var h = layer.projectionProperties[j].bbox.top - layer.projectionProperties[j].bbox.bottom;
        var newBBOX = layer.projectionProperties[j].bbox.clone();
        newBBOX.left -= w / 100;
        newBBOX.right += w / 100;
        newBBOX.bottom -= h / 100;
        newBBOX.top += h / 100;

        _map.zoomTo(newBBOX);
        _map.draw('zoomTolayer');
        return;
      }
    }
    error('Unable to find the correct bbox with current map projection ' + srs + ' for layer ' + layer.title + '. Using default bbox instead.');
    _map.zoomTo(defaultBBOX);
    _map.draw('zoomTolayer');
  };

  this.setPreviousExtent = function () {
    DoUndo = 1;
    UndoPointer++;
    if (UndoPointer >= NrOfUndos)UndoPointer = NrOfUndos - 1;
    _map.setProjection(WMJSProjection_undo[UndoPointer].srs, WMJSProjection_undo[UndoPointer].bbox);
    _map.draw('setPreviousExtent');
  };

  this.setNextExtent = function () {
    DoRedo = 1;
    UndoPointer--; if (UndoPointer < 0)UndoPointer = 0;
    _map.setProjection(WMJSProjection_undo[UndoPointer].srs, WMJSProjection_undo[UndoPointer].bbox);
    _map.draw('setNextExtent');
  };

  this.setBBOX = function (left, bottom, right, top) {
    if (enableConsoleDebugging)console.log('setBBOX');


    bbox.setBBOX(left, bottom, right, top);
    resizeBBOX.setBBOX(bbox);

    if (srs !== 'GFI:TIME_ELEVATION') {
      var divRatio = (width / height);
      var bboxRatio = (bbox.right - bbox.left) / (bbox.top - bbox.bottom);
      if (bboxRatio > divRatio) {
        var centerH = (bbox.top + bbox.bottom) / 2;
        var extentH = ((bbox.left - bbox.right) / 2) / divRatio;
        bbox.bottom = centerH + extentH;
        bbox.top = centerH - extentH;
        // error("bbox:"+bbox.left+","+bbox.bottom+","+bbox.right+","+bbox.top+" divratio: "+divRatio+" width,height: "+width+" , "+height);
      } else {
        // H is more than W, so calc W
        var centerW = (bbox.right + bbox.left) / 2;
        var extentW = ((bbox.bottom - bbox.top) / 2) * divRatio;
        bbox.left = centerW + extentW;
        bbox.right = centerW - extentW;
      }
    }
//       //Cells must always be square
//       if(srs!="GFI:TIME_ELEVATION"){
//         var setOrigBox = false;
//         var newbbox = new WMJSBBOX(bbox);
//         var ratio = 1;
//         try{
//           ratio = (newbbox.left-newbbox.right)/(newbbox.bottom-newbbox.top);
//         }catch(e){
//           setOrigBox=true;
//         }
//         //Check whether we have had valid bbox values
//         if(isNaN(ratio)){
//           setOrigBox=true;
//         }
//         if(setOrigBox==true){
//           ratio=1;
//         }
//         if(ratio<0)ratio=-ratio;
//
//         var screenRatio=width/height;
//         //Is W > H?
//         if(ratio>screenRatio){
//           //W is more than H, so calc H
//           var centerH = (newbbox.top+newbbox.bottom)/2;
//           var extentH = ((newbbox.left-newbbox.right)/2)/ratio;
//           newbbox.bottom = centerH+extentH*screenRatio;
//           newbbox.top = centerH-extentH*screenRatio;
//         }else{
//           //H is more than W, so calc W
//           var centerW = (newbbox.right+newbbox.left)/2;
//           var extentW = ((newbbox.bottom-newbbox.top)/2)*ratio;
//           newbbox.left = centerW+extentW;
//           newbbox.right = centerW-extentW;
//         }
//         bbox.setBBOX(newbbox);
//       }

    updateBBOX.setBBOX(bbox);
    drawnBBOX.setBBOX(bbox);
     // Undo part
    if (DoRedo == 0 && DoUndo == 0) {
      if (UndoPointer != 0) {
        for (j = 0; j <= UndoPointer; j++)WMJSProjection_tempundo[j] = WMJSProjection_undo[j];
        for (j = 0; j <= UndoPointer; j++)WMJSProjection_undo[j] = WMJSProjection_tempundo[UndoPointer - j];
        UndoPointer = 0;
      }
      for (j = MaxUndos - 1; j > 0; j--) {
        WMJSProjection_undo[j].bbox.setBBOX(WMJSProjection_undo[j - 1].bbox);
        WMJSProjection_undo[j].srs = WMJSProjection_undo[j - 1].srs;
      }
      WMJSProjection_undo[0].bbox.setBBOX(bbox);
      WMJSProjection_undo[0].srs = srs;
      NrOfUndos++;
      if (NrOfUndos > MaxUndos)NrOfUndos = MaxUndos;
    }
    DoRedo = 0;
    DoUndo = 0;
    // console.log('triggerEvent::afterbboxupdate', bbox);
    if (bbox.equals(left, bottom, right, top) === true) {
      return false;
    }
    callBack.triggerEvent('aftersetbbox', _map);
    return true;
  };

  this.zoomOut = function () {
    var a = (resizeBBOX.right - resizeBBOX.left) / 6;
    // error(a);
    this.zoomTo(new WMJSBBOX(resizeBBOX.left - a, resizeBBOX.bottom - a, resizeBBOX.right + a, resizeBBOX.top + a));
    _map.draw('zoomOut');
  };

  this.zoomIn = function (ratio) {
    var a = (resizeBBOX.left - resizeBBOX.right) / 8;
    // error(a);
    if (isDefined(ratio) == false) {
      ratio = 1;
    } else {
      if (ratio == 0) return;
    }
    a = a * ratio;
    this.zoomTo(new WMJSBBOX(resizeBBOX.left - a, resizeBBOX.bottom - a, resizeBBOX.right + a, resizeBBOX.top + a));
    _map.draw('zoomIn');
  };

  this.searchForLocation = function (searchParam) {
    _map.WCJSSearchRequest(searchParam);
  };


  this.displayLegendInMap = function (_displayLegendInMap) {
    displayLegendInMap = _displayLegendInMap;
    _map.repositionLegendGraphic();
  };

  this.showBoundingBox = function (_bbox, _mapbbox) {
    if (isDefined(_bbox)) {
      divBoundingBox.bbox = _bbox;
      divBoundingBox.style.display = '';
      divBoundingBox.displayed = true;
    }
    if (divBoundingBox.displayed !== true) return;

    var b = bbox;
    if (isDefined(_mapbbox))b = _mapbbox;
    var coord1 = this.getPixelCoordFromGeoCoord({ x:divBoundingBox.bbox.left, y:divBoundingBox.bbox.top }, b);
    var coord2 = this.getPixelCoordFromGeoCoord({ x:divBoundingBox.bbox.right, y:divBoundingBox.bbox.bottom }, b);

    divBoundingBox.style.left = (coord1.x - 1) + 'px';
    divBoundingBox.style.top = (coord1.y - 2) + 'px';
    divBoundingBox.style.width = (coord2.x - coord1.x) + 'px';
    divBoundingBox.style.height = (coord2.y - coord1.y - 1) + 'px';
  };

  this.hideBoundingBox = function () {
    divBoundingBox.style.display = 'none';
    divBoundingBox.displayed = false;
  };

  this.setDebugFunction = function (debugFunction) { debug = debugFunction; };
  this.setErrorFunction = function (errorFunction) { error = errorFunction; };
  // Make sure the constructor is called upon creation of the object
  constructor();
  updateBoundingBox(bbox);

  // _map.setDisplayModeGFI();

  //_map._setSize(1000,500);

};

