/** Differences between WMS 1.1.1 and 1.3.0:
 * 
 * http://dmorissette.blogspot.nl/2012/12/dont-upgrade-to-wms-130-unless-you.html
 * 
 */

var WMSVersion = {
  version100: "1.0.0",
  version111: "1.1.1",
  version130: "1.3.0"
};


/** 
  * Global getcapabilities function
  */
var WMJSGetCapabilities = function(service,forceReload,succes,fail){
  //Make the regetCapabilitiesJSONquest
  if(isDefined(service)==false){
    fail(I18n.no_service_defined.text);
    return;
  }
  if(service.length == 0){
    fail(I18n.service_url_empty.text);
    return;
  }
  
  try{
    if(!isDefined(xml2jsonrequestURL)){};
  }catch(e){
    xml2jsonrequestURL=base+'/php/xml2jsonrequest.php?';
  }
  try{
    if(!isDefined(requestProxy)){};
  }catch(e){
    requestProxy=base+'/php/MakeRequest.php?';
  }
  
  var getcapreq=xml2jsonrequestURL+"request=";
  if(service.indexOf("?")==-1){
    service+="?";
  }
  debug("GetCapabilities:");
  var url=service+"&service=WMS&request=GetCapabilities";
   debug("<a target=\'_blank\' href='"+url+"'>"+url+"</a>",false);
  getcapreq+=URLEncode(url);
  debug(getcapreq);
  
  debug(URLEncode(url));
  debug(url);
  //Error message in case the request goes wrong
  var errormessage = function(message){
    fail(I18n.unable_to_do_getcapabilities.text + ":\n" + getcapreq + "\n" + I18n.result.text + ":\n"+message);
  }
  $.ajax({
    dataType: "jsonp",
    url: getcapreq,
    success: succes,
    error:errormessage
  });
  //MakeJSONPRequest(getcapreq,succes,errormessage);
};

/**
  * Global service store for re-use of services
  */
var WMJSServiceStore = new Array();

var WMJSgetServiceFromStore = function(serviceName){

  for(var j=0;j<WMJSServiceStore.length;j++){
    if(WMJSServiceStore[j].service==serviceName){
      return WMJSServiceStore[j];
    }
  }
  var service = new WMJSService({service:serviceName})
  WMJSServiceStore.push(service);
  return service;
};

/**
  * WMJSService Class
  * 
  * options: 
  *   service 
  *   title (optional) 
  */


function WMJSService(options){
  this.service = undefined;
  this.title = undefined;
  this.onlineresource = undefined;
  this.abstract = undefined;
  this.version = WMSVersion.version111;
  this.getcapabilitiesDoc = undefined;
  this.busy=false;
  var flatLayerObject = undefined;  
  var _this = this;
  
  if(options){
    this.service=options.service;
    this.title=options.title;
  }
  
  
  var checkVersion111 = function(jsonData){
     try{
      var rootLayer = jsonData.WMT_MS_Capabilities.Capability.Layer;
   
    }catch(e){
      var message = _this.checkException(jsonData);
      if(message != undefined){
        throw(message);
      }
      if(!jsonData.WMT_MS_Capabilities.Capability){throw(I18n.no_wms_capability_element_found.text);}
      if(!jsonData.WMT_MS_Capabilities.Capability.Layer){throw(I18n.no_wms_layer_element_found.text);}
    }
  };
  
  var checkVersion130 = function(jsonData){
    try{
      var rootLayer = jsonData.WMS_Capabilities.Capability.Layer;
   
    }catch(e){
      var message = _this.checkException(jsonData);
      if(message != undefined){
        throw(message);
      }
      if(!jsonData.WMS_Capabilities.Capability){throw(I18n.no_wms_capability_element_found.text);}
      if(!jsonData.WMS_Capabilities.Capability.Layer){throw(I18n.no_wms_layer_element_found.text);}
    }
  };
  
  
  this.getCapabilityElement = function(jsonData){
    var capabilityObject;
    try{
      capabilityObject = jsonData.WMT_MS_Capabilities.Capability;
    }catch(e){
      try{
        capabilityObject = jsonData.WMS_Capabilities.Capability;  
      }catch(e){
        throw(I18n.no_capability_element_found.text);
      }
    }
    if(!isDefined(capabilityObject)){
      throw(I18n.no_capability_element_found.text);
    }
    return capabilityObject;
  };
  

  this.checkVersion = function (jsonData){
    var errormessage = "";
    
    var version = WMSVersion.version111;
    
    try{
      if(WMSVersion.version100 == jsonData.WMT_MS_Capabilities.attr.version)version = WMSVersion.version100;
      if(WMSVersion.version111 == jsonData.WMT_MS_Capabilities.attr.version)version = WMSVersion.version111;
      if(WMSVersion.version130 == jsonData.WMT_MS_Capabilities.attr.version)version = WMSVersion.version130;
    }catch(e){
      try{
        if(WMSVersion.version100 == jsonData.WMS_Capabilities.attr.version)version = WMSVersion.version100;
        if(WMSVersion.version111 == jsonData.WMS_Capabilities.attr.version)version = WMSVersion.version111;
        if(WMSVersion.version130 == jsonData.WMS_Capabilities.attr.version)version = WMSVersion.version130;
      }catch(e){
       var message = _this.checkException(jsonData);
        throw(message);
      }
    }
    if(version == WMSVersion.version111){
      checkVersion111(jsonData);
      return version;
    }
    if(version == WMSVersion.version130){
      checkVersion130(jsonData);
      return version;
    }
    return WMSVersion.version111;
  }
  
  
  var functionCallbackList = [];
  /**
    * Does getcapabilities for a service.
    * When multple getCapabilities for the same service are made, 
    * this method makes one get request and fires all callbacks with the same result.
    * @param succescallback Function called upon succes, cannot be left blank
    * @param failcallback Function called upon failure, cannot be left blank
    */
  this.getCapabilities = function(succescallback,failcallback,forceReload){
    
    flatLayerObject = undefined;
    var _this = this;
    if(this.busy){
      var cf = {callback:succescallback,fail:failcallback};
      functionCallbackList.push(cf);
      return;
    }
    if(!_this.getcapabilitiesDoc||forceReload == true){
      _this.busy = true;
      var fail = function(jsonData){
        _this.busy = false;
        for(var j=0;j<functionCallbackList.length;j++){
          functionCallbackList[j].fail(jsonData);
          functionCallbackList[j].fail = function(){};
        }
        functionCallbackList = [];
      }
      var succes = function(jsonData){
        _this.busy = false;
        _this.getcapabilitiesDoc=jsonData;
        
        try{
          _this.version = _this.checkVersion(jsonData);
        }catch(e){
          fail(e);
          return;
        }
        
        
        var WMS_Capabilities = jsonData.WMS_Capabilities;
        if(!WMS_Capabilities){
          WMS_Capabilities = jsonData.WMT_MS_Capabilities;
        }
        
        //console.log(WMS_Capabilities);
        
        //Get Abstract
        try{
          _this.abstract = WMS_Capabilities.Service.Abstract.value;
        }catch(e){
          this.abstract = I18n.not_available_message.text;
        }
        
        //Get Title
        try{
          _this.title = WMS_Capabilities.Service.Title.value;
        }catch(e){
          this.title = I18n.not_available_message.text;
        }
        
        //Get OnlineResource
        try{
          if(WMS_Capabilities.Service.OnlineResource.value){
            _this.onlineresource = WMS_Capabilities.Service.OnlineResource.value;
          }else{
            _this.onlineresource = WMS_Capabilities.Service.OnlineResource.attr["xlink:href"];
          }
        }catch(e){
          _this.onlineresource = I18n.not_available_message.text;
        }


        for(var j=0;j<functionCallbackList.length;j++){
          functionCallbackList[j].callback(jsonData);
          functionCallbackList[j].callback = function(){};
        }
        functionCallbackList = [];
        _this.busy = false;
        
      };
      var cf = {callback:succescallback,fail:failcallback};
      functionCallbackList.push(cf);
      
      WMJSGetCapabilities(this.service,false,succes,fail);
    }else{
      succescallback(this.getcapabilitiesDoc);
    }
  };
  
  this.checkException = function(jsonData){
    if(jsonData.ServiceExceptionReport){
      var code = "Undefined";
      var value = code;
      var se = jsonData.ServiceExceptionReport.ServiceException;
      if(se){
        try{
          if(se.attr.code)code = se.attr.code;
        }catch(e){}
        if(se.value){value = se.value;
          return("Exception: "+code+".\n"+value);
        }
      }
      return(I18n.wms_service_exception_code.text+code);
    }
    return undefined;
  };
  
  
  function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
  };
  /**
    * Calls succes with a hierarchical node structure
    * Calls failure with a string when someting goes wrong
    */
  this.getNodes = function(succes,failure,forceReload){
    /*if(forceReload != true){
      if(isDefined(this.getcapabilitiesDoc)){
        if(isDefined(this.nodeCache)){
          succes(this.nodeCache);
          
          return;
        }
      }
    }*/
    
    this.nodeCache = undefined;
    if(!failure){failure=function(msg){error(msg);}}
    
    var parse = function(jsonData){
      var nodeStructure = new Object();
      var rootLayer = _this.getCapabilityElement(jsonData).Layer;
      
      try{
        _this.version = _this.checkVersion(jsonData);
      }catch(e){
        failure(e);
        return;
      }
    
      
      var WMSLayers = toArray(rootLayer.Layer);
      try{
        nodeStructure.text=rootLayer.Title.value;
      }catch(e){
        nodeStructure.text=I18n.unnamed_service.text;
      }
      nodeStructure.leaf=false;
      nodeStructure.expanded=true;
      function recursivelyFindLayer(WMSLayers,rootNode,path){
        for(var j=0;j<WMSLayers.length;j++){
          var isleaf = false;
          if (WMSLayers[j].Name)isleaf = true;
          try {if(WMSLayers[j].Layer)isleaf=false;}catch(e){}
          var nodeObject;

          if(WMSLayers[j].Name){
            nodeObject = {name:WMSLayers[j].Name.value,text:WMSLayers[j].Title.value,leaf:isleaf,path:path};
          }else{
            if(isNull(WMSLayers[j].Title)){
              WMSLayers[j].Title = [];
              WMSLayers[j].Title.value = "Layer";
            }
            
            
            nodeObject = {text:WMSLayers[j].Title.value,leaf:isleaf};
          }
          //nodeObject = {text:'text',leaf:false};
          rootNode.push(nodeObject);
          if(WMSLayers[j].Layer){
            nodeObject.children = [];
            recursivelyFindLayer(toArray(WMSLayers[j].Layer),nodeObject.children,path+WMSLayers[j].Title.value);
            
          }
        }
        //Sort nodes alphabetically.
        sortByKey(rootNode,'text');
      };
      nodeStructure.children =new Array();
      recursivelyFindLayer(WMSLayers,nodeStructure.children,"");
      //_this.nodeCache = nodeStructure;
      succes(nodeStructure);
    }
    
    var callback = function(jsonData){
        parse(jsonData);
    };
    
    var fail = function(data){
      failure(data);
    };
    this.getCapabilities(callback,fail,forceReload);
  };
  
  /** Calls succes with an array of all layernames
   * Calls failure when something goes wrong
   */
  this.getLayerNames = function(succes,failure){
    var callback = function(data){
      var layerNames = [];
      var getNames = function(layers){
        //alert(layers.children);
        for(var j=0;j<layers.length;j++){
          
          if(layers[j].name){
            layerNames.push(layers[j].name);
          }
          if(layers[j].children){
            getNames(layers[j].children);
          }
        }
      }
      getNames(data.children);
      succes(layerNames);
    };
    this.getNodes(callback,failure);
  };

  
  /** Calls succes with an array of all layerobjects
   * Calls failure when something goes wrong
   */
  this.getLayerObjectsFlat = function(succes,failure){
    if(isDefined(flatLayerObject)){
      succes(flatLayerObject);
    }
    
    var callback = function(data){
      var flatLayerObject = [];
      var getNames = function(layers){
        //alert(layers.children);
        for(var j=0;j<layers.length;j++){
          
          if(layers[j].name){
            flatLayerObject.push(layers[j]);
          }
          if(layers[j].children){
            getNames(layers[j].children);
          }
        }
      }
      getNames(data.children);
      
      succes(flatLayerObject);
    };
    this.getNodes(callback,failure);
  };

};
