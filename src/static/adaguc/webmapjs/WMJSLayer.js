/**
  * WMJSLayer class
  * Author : MaartenPlieger (plieger at knmi.nl)
  * Copyright KNMI
  */
WMJSEmptyLayerName = 'empty_layer';
WMJSEmptyLayerTitle = 'empty layer';
function WMJSLayer (options) {
  this.autoupdate = false;
  this.timer = undefined;
  // options.failure is called when failed.
  this.service = undefined; // URL of the WMS Service
  this.WMJSService = undefined; // Corresponding WMJSService
  this.getmapURL = undefined;
  this.getfeatureinfoURL = undefined;
  this.getlegendgraphicURL = undefined;
  // this.getgraphinfoURL = undefined;
  this.keepOnTop = false;
  this.transparent = true;
  this.hasError = false;
  this.legendIsDimensionDependant = true;
  this.wms130bboxcompatibilitymode = false;
  this.version = WMSVersion.version111;
  this.path = '';
  this.type = 'wms';
  this.objectpath = [];
  // Extensions compatible with ncWMS WMS extensions on http://www.resc.rdg.ac.uk/trac/ncWMS/wiki/WmsExtensions
  this.wmsextensions = function (options) {
    this.wmsextensions.colorscalerange = '';
    if (isDefined(options.colorscalerange)) {
      this.wmsextensions.colorscalerange = options.colorscalerange;
    }
    this.wmsextensions.url = '';
    if (this.wmsextensions.colorscalerange.length > 2) {
      this.wmsextensions.url += '&COLORSCALERANGE=' + this.wmsextensions.colorscalerange;
    }
  };
  this.wmsextensions.url = '';

  this.jsonlayer_v1_1_1 = undefined; // JSON data for this layer from getcapabilities XML file.
  this.name = undefined;
  this.title = WMJSEmptyLayerTitle;
  this.abstract = undefined;
  this.dimensions = Array();// Array of Dimension
  this.legendGraphic = '';
  this.projectionProperties = Array();// Array of WMJSProjections
  this.queryable = false;

  this.enabled = true;
  this.styles = undefined;
  this.currentStyle = '';
  this.id = -1;
  this.opacity = 1.0; // Ranges from 0.0-1.0
  this.image = undefined;
  this.getCapabilitiesDoc = undefined;
  this.serviceTitle = 'not defined';
  this.onReady = function (layer) { }; // Function to be overridden when a callback is need for when the layer is completely filled in by WMJSMap
  this.parentMaps = [];

  this.getLayerName = function () {
    return this.name;
  };

  this.toggleAutoUpdate = function () {
    this.autoupdate = !this.autoupdate;
    if (this.autoupdate) {
      var numDeltaMS = 60000;
      this.timer = setInterval(
        (function (self) {
          return function () {
            self.parseLayer(undefined, true, "WMJSLayer::autoupdate");
          };
        })(this), numDeltaMS);
    } else {
      clearInterval(this.timer);
    }
  };
  this.setAutoUpdate = function (val, interval, callback) {
    if (val !== this.autoupdate) {
      this.autoupdate = val;
      if (!val) {
        clearInterval(this.timer);
      } else {
        this.timer = setInterval((function (self) {
          return function () {
            self.parseLayer(callback, true, "WMJSLayer::autoupdate");
          };
        })(this), interval);
      }
    }
  };

  this.setOpacity = function (opacityValue) {
    // console.log("setOpacity image");
    this.opacity = opacityValue;

    if (this.image) {
      this.image.setOpacity(this.opacity);
      this.parentMaps[0].redrawBuffer();
    }
  };

  this.remove = function () {
    for (var j = 0; j < this.parentMaps.length; j++) {
      this.parentMaps[j].deleteLayer(this);
      this.parentMaps[j].draw('WMJSLayer::remove');
    }
    clearInterval(this.timer);
  };

  this.moveUp = function () {
    for (var j = 0; j < this.parentMaps.length; j++) {
      this.parentMaps[j].moveLayerUp(this);
      this.parentMaps[j].draw('WMJSLayer::moveUp');
    }
  };

  this.moveDown = function () {
    for (var j = 0; j < this.parentMaps.length; j++) {
      this.parentMaps[j].moveLayerDown(this);
      this.parentMaps[j].draw('WMJSLayer::moveDown');
    }
  };

  this.zoomToLayer = function () {
    for (var j = 0; j < this.parentMaps.length; j++) {
      this.parentMaps[j].zoomToLayer(this);
    }
  };

  this.draw = function (e) {
    for (var j = 0; j < this.parentMaps.length; j++) {
      this.parentMaps[j].draw('WMJSLayer::draw::' + e);
    }
  };

  this.setDimension = function (name, value) {
    var dim;
    for (var j = 0; j < this.dimensions.length; j++) {
      if (this.dimensions[j].name == name) {
        dim = this.dimensions[j];
      }
    }
    if (isDefined(dim) == false) { return; }
    if (isDefined(value) == false) { return; }

    dim.setValue(value);

    if (dim.linked == true) {
      for (var j = 0; j < this.parentMaps.length; j++) {
        this.parentMaps[j].setDimension(name, dim.getValue());
      }
    }
  };

  this.configureDimensions = function () {
    var layer = this;
    var jsonlayer = layer.jsonlayer_v1_1_1;
    // alert(dump(layer.objectpath.length));//getCapabilitiesDoc
    if (!jsonlayer) return;
    // Fill in dimensions
    var dimensions = toArray(jsonlayer.Dimension);

    // Add dims from parentlayers
    for (var j = layer.objectpath.length - 1; j >= 0; j--) {
      var parentDims = layer.objectpath[j].Dimension;
      if (!isNull(parentDims) && isDefined(parentDims)) {
        for (var d = 0; d < parentDims.length; d++) {
          var parentDim = parentDims[d];
          if (!isNull(parentDim) && isDefined(parentDim)) {
            var foundDim = false;
            for (var i = 0; i < dimensions.length; i++) {
              if (parentDim.attr.name.toLowerCase() === dimensions[j].attr.name.toLowerCase()) {
                foundDim = true;
                break;
              }
            }
            if (!foundDim) {
              dimensions.push(parentDim);
            }
          }
        }
      }
    }

    var extents = toArray(jsonlayer.Extent);
    layer.dimensions = [];
    for (var j = 0; j < dimensions.length; j++) {
      var dim = new WMJSDimension();
      dim.name = dimensions[j].attr.name.toLowerCase();
      dim.units = dimensions[j].attr.units;

      // WMS 1.1.1 Mode:
      for (var i = 0; i < extents.length; i++) {
        if (extents[i].attr.name.toLowerCase() == dim.name) {
          // Check if a value is given:
          if (!extents[i].value) { dim.values = ''; } else { dim.values = extents[i].value.trim(); }
          // Check for default
          if (extents[i].attr['default']) {
            dim.defaultValue = extents[i].attr['default'].trim();
          } else {
            var s = dim.values.split('/');
            if (s.length > 1)dim.defaultValue = s[1]; else
            if (s.length > 0)dim.defaultValue = s[0];
          }
          // If no values are given, provide the defaults.
          if (!extents[i].value) {
            error('No extent defined for dim ' + dim.name + ' in layer ' + layer.title);
            error('Using default value ' + dim.defaultValue);
            dim.values = dim.defaultValue;
          }
        }
      }

      // WMS 1.3.0 Mode:
      if (layer.version == WMSVersion.version130) {
        dim.values = dimensions[j].value;
        dim.defaultValue = dimensions[j].attr['default'];
      }

      var defaultValue = dim.defaultValue;

      if (layer.parentMaps.length > 0) {
        var mapDim = layer.parentMaps[0].getDimension(dim.name);
        if (isDefined(mapDim)) {
          if (isDefined(mapDim.currentValue)) {
            defaultValue = dim.getClosestValue(mapDim.currentValue);
            debug('WMJSLayer::configureDimensions Dimension ' + dim.name + ' default value [' + defaultValue + '] is based on map value [' + mapDim.currentValue + ']');
          } else {
            debug('WMJSLayer::configureDimensions Map dimension currentValue for ' + dim.name + ' does not exist.');
          }
        }
      } else {
        debug('WMJSLayer::configureDimensions Layer has no parentmaps');
      }
      // debug("Dimension "+dim.name+" default value is "+defaultValue);
      dim.currentValue = defaultValue;

      dim.parentLayer = layer;
      if (isDefined(dim.values)) {
        layer.dimensions.push(dim);
      } else {
        error('Skipping dimension ' + dim.name);
      }
    }
  };

  /**
    * Calls success with a configured layer object
    * Calls options.failure with error message.
    * Throws string exceptions when someting goes wrong
    */
  this.parseLayer = function (_layerDoneCallback, forceReload, whoIsCalling) {
    // debug(">Layer enabled is "+this.enabled+" by "+whoIsCalling);
    // var isEnabled = this.enabled;
    // this.enabled = false;
    var _this = this;
    _this.hasError = false;

    var layerDoneCallback = function (layer) {
      // _this.enabled = isEnabled;
      // debug("<Layer enabled is "+_this.enabled);
      if (isDefined(_layerDoneCallback)) {
        _layerDoneCallback(layer);
      }
    };
    var fail = function (layer, message) {
      _this.hasError = true;
      _this.lastError = message;
      _this.title = I18n.service_has_error.text;
      error(message);
      layerDoneCallback(layer);
      if (isDefined(options.failure)) {
        options.failure(layer, message);
      }
    };

    var callback = function (data) {
      var parseGetCapForLayer = function (layer, getcapabilitiesjson) {
        var jsondata = getcapabilitiesjson;
        if (jsondata == 0 || jsondata == undefined) {
          layer.title = I18n.service_has_error.text;
          layer.abstract = I18n.not_available_message.text;
          fail(layer, I18n.unable_to_connect_server.text);
          return;
        }

        var j = 0;

        // Get the Capability object
            // Get the rootLayer
        var capabilityObject;
        try {
          capabilityObject = layer.WMJSService.getCapabilityElement(getcapabilitiesjson);
        } catch (e) {
          fail(layer, e);
          return;
        }

        layer.version = layer.WMJSService.version;

        // Get the rootLayer
        var rootLayer = capabilityObject.Layer;
        if (!isDefined(rootLayer)) {
          fail(layer, 'No Layer element in service'); return;
        }

        try {
          layer.serviceTitle = rootLayer.Title.value;
        } catch (e) {
          // fail(layer,'Service has no title');return;
          layer.serviceTitle = 'Unnamed service';
        }

        var optimalFormat = 'image/png';
        // Get the optimal image format for this layer
        try {
          var serverFormats = capabilityObject.Request.GetMap.Format;
          for (var f = 0; f < serverFormats.length; f++) {
            if (serverFormats[f].value.indexOf('24') > 0)optimalFormat = serverFormats[f].value;
            if (serverFormats[f].value.indexOf('32') > 0)optimalFormat = serverFormats[f].value;
          }
        } catch (e) {
          error('This WMS service has no getmap formats listed: using image/png');
        }

        if (layer.name == undefined || layer.name.length < 1) {
          layer.title = WMJSEmptyLayerTitle;
          layer.abstract = I18n.not_available_message.text;
          layerDoneCallback(layer);
          return;
        }

        var foundLayer = 0;
          // Function will be called when the layer with the right name is found in the getcap doc
        var foundLayerFunction = function (jsonlayer, path, objectpath) {
          layer.jsonlayer_v1_1_1 = jsonlayer;

          layer.getmapURL = undefined;
          try { layer.getmapURL = capabilityObject.Request.GetMap.DCPType.HTTP.Get.OnlineResource.attr['xlink:href']; } catch (e) {}
          if (!isDefined(layer.getmapURL)) { layer.getmapURL = layer.service; error('GetMap OnlineResource is not specified. Using default.'); }

          layer.getfeatureinfoURL = undefined;
          try { layer.getfeatureinfoURL = capabilityObject.Request.GetFeatureInfo.DCPType.HTTP.Get.OnlineResource.attr['xlink:href']; } catch (e) {}
          if (!isDefined(layer.getfeatureinfoURL)) { layer.getfeatureinfoURL = layer.service; error('GetFeatureInfo OnlineResource is not specified. Using default.'); }

          layer.getlegendgraphicURL = undefined;
          try { layer.getlegendgraphicURL = capabilityObject.Request.GetLegendGraphic.DCPType.HTTP.Get.OnlineResource.attr['xlink:href']; } catch (e) {}

          if (!isDefined(layer.getlegendgraphicURL)) { layer.getlegendgraphicURL = layer.service; error('GetLegendGraphic OnlineResource is not specified. Using default.'); }

          // TODO Should be arranged also for the other services:
          layer.getmapURL = WMJScheckURL(layer.getmapURL);
          layer.getfeatureinfoURL = WMJScheckURL(layer.getfeatureinfoURL);
          layer.getlegendgraphicURL = WMJScheckURL(layer.getlegendgraphicURL);

          layer.getCapabilitiesDoc = jsondata;
          layer.title = jsonlayer.Title.value;
          try {
            layer.abstract = jsonlayer.Abstract.value;
          } catch (e) {
            layer.abstract = I18n.not_available_message.text;
          }
          layer.path = path;
          layer.objectpath = objectpath;

          layer.styles = undefined;
          // layer.format=optimalFormat;
          layer.jsonlayer = layer;
          // layer.currentStyle='';
          // alert('foundLayerFunction 1');
          try {
            var layerStyles = '';
            if (jsonlayer.Style) {
              layerStyles = toArray(jsonlayer.Style);
            }
            layer.styles = layerStyles;

            // parse styles

            for (var j = 0; j < layer.styles.length; j++) {
              var style = layer.styles[j];
              style.index = j;
              style.nrOfStyles = layer.styles.length;
              style.title = 'default';
              style.name = 'default';
              style.legendURL = '';
              style['abstracttext'] = 'No abstract available';

              try { style.title = style.Title.value; } catch (e) {}
              try { style.name = style.Name.value; } catch (e) {}
              try { style.legendURL = style.LegendURL.OnlineResource.attr['xlink:href']; } catch (e) {}
              try { style['abstracttext'] = style.Abstract.value; } catch (e) {}
            }

            if (layer.currentStyle == '') {
              layer.currentStyle = layer.styles[0].Name.value;
            }

            layer.setStyle(layer.currentStyle);
          } catch (e) {
            layer.currentStyle = '';
            layer.styles = '';
            error('No styles found for layer ' + layer.title);
          }
    // alert('foundLayerFunction 2');
          layer.configureDimensions();
          // alert('foundLayerFunction 3_'+layer.dimensions.length);
          var gp = toArray(jsonlayer.SRS);

          if (isDefined(jsonlayer.CRS)) {
            gp = toArray(jsonlayer.CRS);
          }

          layer.projectionProperties = Array();

          var tempSRS = Array();

          var getgpbbox = function (data) {
            if (isDefined(data.BoundingBox)) {
              // Fill in SRS and BBOX on basis of BoundingBox attribute
              var gpbbox = toArray(data.BoundingBox);
              for (j = 0; j < gpbbox.length; j++) {
                var srs;
                srs = gpbbox[j].attr.SRS;

                if (isDefined(gpbbox[j].attr.CRS)) {
                  srs = gpbbox[j].attr.CRS;
                }
                if (srs) {
                  if (srs.length > 0) {
                    srs = decodeURIComponent(srs);
                  }
                }
                var alreadyAdded = false;
                for (var i = 0; i < layer.projectionProperties.length; i++) {
                  if (srs == layer.projectionProperties[i].srs) {
                    alreadyAdded = true;
                    break;
                  }
                }

                if (alreadyAdded == false) {
                  var geoProperty = new WMJSProjection();

                  geoProperty.srs = srs;
                  var swapBBOX = false;
                  if (layer.version == WMSVersion.version130) {
                    if (geoProperty.srs == 'EPSG:4326' && layer.wms130bboxcompatibilitymode == false) {
                      swapBBOX = true;
                    }
                  }
                  if (swapBBOX == false) {
                    geoProperty.bbox.left = parseFloat(gpbbox[j].attr.minx);
                    geoProperty.bbox.bottom = parseFloat(gpbbox[j].attr.miny);
                    geoProperty.bbox.right = parseFloat(gpbbox[j].attr.maxx);
                    geoProperty.bbox.top = parseFloat(gpbbox[j].attr.maxy);
                  } else {
                    geoProperty.bbox.left = parseFloat(gpbbox[j].attr.miny);
                    geoProperty.bbox.bottom = parseFloat(gpbbox[j].attr.minx);
                    geoProperty.bbox.right = parseFloat(gpbbox[j].attr.maxy);
                    geoProperty.bbox.top = parseFloat(gpbbox[j].attr.maxx);
                  }

                  layer.projectionProperties.push(geoProperty);
                  tempSRS.push(geoProperty.srs);
                }
              }
            }
            /* for(var j=0;j<layer.projectionProperties.length;j++){
              var geoProperty = layer.projectionProperties[j];
              if(geoProperty.srs == "EPSG:4326" || geoProperty.srs == "CRS:84"){
                if(isDefined(data.EX_GeographicBoundingBox)){
                  var left   = data.EX_GeographicBoundingBox.westBoundLongitude.value;
                  var bottom = data.EX_GeographicBoundingBox.southBoundLatitude.value;
                  var right  = data.EX_GeographicBoundingBox.eastBoundLongitude.value;
                  var top    = data.EX_GeographicBoundingBox.northBoundLatitude.value;
                  if(isDefined(left) && isDefined(left) && isDefined(left) && isDefined(left)){
                    geoProperty.bbox.left =   parseFloat(left);
                    geoProperty.bbox.bottom = parseFloat(bottom);
                    geoProperty.bbox.right =  parseFloat(right);
                    geoProperty.bbox.top =    parseFloat(top);
                  }
                }
              }
            } */
          };

          getgpbbox(jsonlayer);
          getgpbbox(rootLayer);

          // Fill in SRS  on basis of SRS attribute
          for (j = 0; j < gp.length; j++) {
            if (tempSRS.indexOf(gp[j].value) == -1) {
              var geoProperty = new WMJSProjection();
              error('Warning: BoundingBOX missing for SRS ' + gp[j].value);
              geoProperty.bbox.left = -180;
              geoProperty.bbox.bottom = -90;
              geoProperty.bbox.right = 180;
              geoProperty.bbox.top = 90;
              geoProperty.srs = gp[j].value;
              layer.projectionProperties.push(geoProperty);
            }
          }
          tempSRS = '';

            // Check if the current map projection is supported by layer projection
          /* var projectionSupported = 0;
          for(j=0;j<layer.projectionProperties.length;j++){
            if(srs==layer.projectionProperties[j].srs){
              projectionSupported=1;
            }
          }
          if(projectionSupported == 0){
            var errormsg="Unable to display layer '"+layer.name+"' from service '"+layer.service+"':\n";
            errormsg+="The current map projection is not supported by any of the layer projections";
            error(errormsg);
          } */

            // Check if layer is queryable
          layer.queryable = false;
          try {
            if (parseInt(jsonlayer.attr.queryable) == 1)layer.queryable = true; else layer.queryable = false;
          } catch (e) {
            error('Unable to detect whether this layer is queryable (for layer ' + layer.title + ')');
          }
          foundLayer = 1;
        };// [/FoundLayer]

        // Try to recursively find the name in the getcap doc
        var JSONLayers = toArray(rootLayer.Layer);
        var path = '';
        var objectpath = [];

        function recursivelyFindLayer (JSONLayers, path, _objectpath) {
          var objectpath = [];
          for (var i = 0; i < _objectpath.length; i++) {
            objectpath.push(_objectpath[i]);
          }
          objectpath.push(JSONLayers);

          for (var j = 0; j < JSONLayers.length; j++) {
            if (JSONLayers[j].Layer) {
              var pathnew = path;

              try {
                pathnew += JSONLayers[j].Title.value + '/';
              } catch (e) {
              }

              recursivelyFindLayer(toArray(JSONLayers[j].Layer), pathnew, objectpath);
            } else {
              if (JSONLayers[j].Name) {
                if (JSONLayers[j].Name.value == layer.name) { foundLayerFunction(JSONLayers[j], path, objectpath); return; }
              }
            }
          }
        }
        objectpath.push(rootLayer);
        recursivelyFindLayer(JSONLayers, path, objectpath);

        if (foundLayer == 0) {
          // Layer was not found...
          var message = '';
          if (layer.name) {
            message = ("Unable to find layer '" + layer.name + "' in service '" + layer.service + "'");
          } else {
            message = ("Unable to find layer '" + layer.title + "' in service '" + layer.service + "'");
          }
          layer.title = '--- layer not found in service ---';
          layer.abstract = I18n.not_available_message.text;
          fail(layer, message);
          return layer;
        } else {
          // for(var j=0;j<layer.parentMaps.length;j++){
            // layer.parentMaps[j].rebuildMapDimensions();
          // }

          // Layer was found
          if (layer.onReady) {
            layer.onReady(layer);
          }
        }
        // alert("WMJSLayer::"+layer.dimensions.length);
        layerDoneCallback(layer);
        return layer;
      };// [/parseGetCapForLayer]

      var layer = parseGetCapForLayer(_this, data);

      // layerDoneCallback(this);
    };

    var requestfail = function (data) {
      fail(_this, data);
      return;
    };
    _this.WMJSService = WMJSgetServiceFromStore(this.service);
    _this.WMJSService.getCapabilities(callback, requestfail, forceReload);
  };

  this.cloneLayer = function () {
    var layer = new WMJSLayer();
    for (i in this) {
      layer[i] = this[i];
    }
    return layer;
  };

  this.setName = function (layer) {
    this.name = layer;
    this.parseLayer(undefined, undefined, 'WMJSLayer::setName');
  };

  this.getLayerRelative = function (success, failure, prevNext) {
    if (!isDefined(prevNext)) {
      prevNext = 0;
    }
    var _this = this;
    var getLayerObjectsFinished = function (layerObjects) {
      var currentLayerIndex = -1;
      for (var j = 0; j < layerObjects.length; j++) {
        if (layerObjects[j].name == _this.name) {
          currentLayerIndex = j;
          break;
        }
      }
      if (currentLayerIndex == -1) {
        failure('Current layer [' + _this.name + '] not in this service');
        return;
      }

      if (prevNext === -1)currentLayerIndex--;
      if (prevNext === 1)currentLayerIndex++;
      if (currentLayerIndex > layerObjects.length - 1)currentLayerIndex = 0;
      if (currentLayerIndex < 0)currentLayerIndex = layerObjects.length - 1;
      success(layerObjects[currentLayerIndex], currentLayerIndex, layerObjects.length);
    };
    _this.WMJSService.getLayerObjectsFlat(getLayerObjectsFinished, failure);
  };

  this.autoSelectLayer = function (success, failure) {
    var _this = this;
    var getLayerObjectsFinished = function (layerObjects) {
      for (var j = 0; j < layerObjects.length; j++) {
        if (isDefined(layerObjects[j].name)) {
          if (layerObjects[j].name.indexOf('baselayer') == -1) {
            if (layerObjects[j].path.indexOf('baselayer') == -1) {
              success(layerObjects[j]);
              return;
            }
          }
        }
      }
    };
    _this.WMJSService.getLayerObjectsFlat(getLayerObjectsFinished, failure);
  };

  this.getNextLayer = function (success, failure) {
    this.getLayerRelative(success, failure, 1);
  };

  this.getPreviousLayer = function (success, failure) {
    this.getLayerRelative(success, failure, -1);
  };

  /**
   * Sets the style by its name
   * @param style: The name of the style (not the object)
   */
  this.setStyle = function (styleName) {
    debug('WMJSLayer::setStyle: ' + styleName);

    if (this.styles.length == 0) {
      this.currentStyle = '';
      this.legendGraphic = '';
      debug('Layer has no styles.');
      return;
    }

   // debug("Layer has "+this.styles.length+" styles.");
    for (var j = 0; j < this.styles.length; j++) {
      // debug("Comparing "+this.styles[j].name+" with " +styleName);
      if (this.styles[j].name == styleName) {
        // debug("WMJSLayer::setStyle: Setting style "+this.styles[j].name);
        this.legendGraphic = this.styles[j].legendURL;
        this.currentStyle = this.styles[j].name;
        return;
      }
    }
    debug('WMJSLayer::setStyle: Style ' + styleName + ' not found, setting style ' + this.styles[0].name);
    this.currentStyle = this.styles[0].name;
    this.legendGraphic = this.styles[0].legendURL;

    // throw("Style "+styleName+" not found");
  };

  /**
   * Get the styleobject by name
   * @param styleName The name of the style
   * @param nextPrev, can be -1 or +1 to get the next or previous style object in circular manner.
   */
  this.getStyleObject = function (styleName, nextPrev) {
    if (isDefined(this.styles) == false) {
      return undefined;
    }
    for (var j = 0; j < this.styles.length; j++) {
      if (this.styles[j].name == styleName) {
        if (nextPrev === -1)j--;
        if (nextPrev === 1)j++;
        if (j < 0)j = this.styles.length - 1;
        if (j > this.styles.length - 1)j = 0;
        this.styles[j].nrOfStyles = this.styles.length;
        this.styles[j].index = j;
        return this.styles[j];
      }
    }
    return undefined;
  };

  /*
   *Get the current stylename as used in the getmap request
   */
  this.getStyle = function () {
    return this.currentStyle;
  };

  this.setService = function (service) {
    this.service = service;
    this.getmapURL = service;
    this.getfeatureinfoURL = service;
    this.getlegendgraphicURL = service;
    this.getgraphinfoURL = service;
  };

  this.getDimension = function (name) {
    for (var i = 0; i < this.dimensions.length; i++) {
      if (this.dimensions[i].name == name) {
        return this.dimensions[i];
      }
    }
    return undefined;
  };

  this.getProjection = function (srsName) {
    for (var j = 0; j < this.projectionProperties.length; j++) {
      if (this.projectionProperties[j].srs == srsName) {
        var returnSRS = [];
        returnSRS.srs = this.projectionProperties[j].srs + '';
        returnSRS.bbox = new WMJSBBOX(
            this.projectionProperties[j].bbox.left,
            this.projectionProperties[j].bbox.bottom,
            this.projectionProperties[j].bbox.right,
            this.projectionProperties[j].bbox.top);
        return returnSRS;
      }
    }
  };

  this.display = function (displayornot) {
    this.enabled = displayornot;
    for (var j = 0; j < this.parentMaps.length; j++) {
      this.parentMaps[j].displayLayer(this, this.enabled);
    }
  };

  if (options) {
    // alert("WMJSLAYER:"+options.service);
    this.service = options.service;
    this.getmapURL = options.service;
    this.getfeatureinfoURL = options.service;
    this.getlegendgraphicURL = options.service;
    // this.name=options.layer;
    this.name = options.name;
    if (options.getgraphinfoURL) this.getgraphinfoURL = options.getgraphinfoURL;

    if (options.style) {
      this.currentStyle = options.style;
    }
    if (options.format) this.format = options.format; else this.format = 'image/png';
    if (options.opacity) {
      // alert(options.opacity);
      this.opacity = options.opacity;
    }
    if (options.title) this.title = options.title;
    this.abstract = I18n.not_available_message.text;

    if (options.enabled === false) this.enabled = false;

    if (options.keepOnTop == true) this.keepOnTop = true;
    if (options.transparent === true) { this.transparent = true; }
    if (options.transparent === false) { this.transparent = false; }
    if (isDefined(options.onReady)) { this.onReady = options.onReady; this.parseLayer(undefined, undefined, 'WMJSLayer::configOptions'); }
    if (isDefined(options.type)) { this.type = options.type; }
  }
};
