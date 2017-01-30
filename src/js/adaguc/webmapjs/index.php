<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <title>Mapviewer</title>
  
    <!-- Proj4 -->
    <script type="text/javascript" src="../proj4js/lib/proj4js.js"></script>

    <!-- JQuery -->
    <link rel="stylesheet" href="../jquery/jquery-ui.css" />
    <script src="../jquery/jquery-1.8.3.js"></script>
    <script src="../jquery/jquery-ui.js"></script>
    <script src="../jquery/jquery.mousewheel.js"></script>
    <script src="../jquery/jquery-ui-timepicker-addon.js"></script>
    <script src="../jquery/globalize.js"></script>
    <script src="../jquery/hammer.min.js"></script>

    <!-- webmapjs -->
    <script type="text/javascript" src="../webmapjs/WMJSTools.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSISO8601.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSProj4Definitions.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSJqueryprototypes.js"></script>
    <script type="text/javascript" src="../webmapjs/WebMapJS.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSLayer.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSBBOX.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSDimension.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSService.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSListener.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSTimer.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSTimeSlider.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSProcessing.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSCoverage.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSImage.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSImageStore.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSDivBuffer.js"></script>
    <script type="text/javascript" src="../webmapjs/WMJSTimeSelector.js"></script>
    <link rel="stylesheet" type="text/css" href="../webmapjs/WMJSStyles.css" />
    <link rel="stylesheet" type="text/css" href="../webmapjs/WMJSTimeSelector.css" />

  <script type="text/javascript">
    
    setBaseURL("../webmapjs");
    
    var initializeWebMapJS = function(){
      var a = new newMap('webmap1');
    }
    
    var m;

    var newMap = function(element){
    
      var webMapJS  = new WMJSMap(document.getElementById(element));
    
      var baseLayer = new WMJSLayer({
        service:"http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?",
        name:"naturalearth2",
        title:"World base layer",
        //format:"image/gif",
        enabled:true
      });
      
      var topLayer = new WMJSLayer({
        service:"http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?",
        name:"world_line",
        format:"image/png",
        title:"World country borders",
        keepOnTop:true,
        enabled:true
      });

      var modisLayer = new WMJSLayer({
        service:"http://geoservices.knmi.nl/cgi-bin/MODIS_Netherlands.cgi?",
        name:"modis_250m_netherlands_8bit",
        format:"image/gif",
        title:"Modis base layer - The Netherlands",
        enabled:false,
        opacity:0.75
      });
      
      
      var layer = new WMJSLayer({
        service:'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
        name:'RADNL_OPER_R___25PCPRR_L3_COLOR'
      });
      
      
      
      /*var layer = new WMJSLayer({
        service:'http://msgcpp-ogc-archive.knmi.nl/msgar.cgi?',
        name:'air_temperature_at_cloud_top'
      });*/
  
      layer.onReady = function(){
        var timeDim = layer.getDimension('time');
        webMapJS.setProjection(layer.getProjection("EPSG:28992"));  
        //webMapJS.setDimension('time','2012-12-26T12:00:00Z');
      
        var dates = [];
        
        var timeDim = layer.getDimension('time');
      
        for(var j=0;j<timeDim.size();j++){
          dates.push({name:'time', value:timeDim.getValueForIndex(j)});
        }
        webMapJS.setAnimationDelay(100);
        webMapJS.draw();
        
       
      }

      webMapJS.setBaseLayers([baseLayer]);
      
      webMapJS.addLayer(layer);
       
     // var d = $( "#dialog" ).dialog({minHeight:'20px',height:100,width:200,zIndex:3000});
    // d.dialog( 'option', 'position', [950, 50] );
      
      //$(d).hide();
      var cb = function(){
    
      };
      
      webMapJS.addListener("ondrawready",cb);
    };
    
   
  </script>
</head>
<body onLoad="initializeWebMapJS()">

<table><tr><td>

<div id="webmap1" style="width:800px;height:600px;"></div>
</td></tr>
</table>
<div id="debug"></div>
<div id="divcont"></div>
</body >
</html>
