<?php  
//============================================================================
// Name        : makeKML
// Author      : MaartenPlieger (plieger at knmi.nl)
// Version     : 0.1 (October 2011)
// Description : Converts ADAGUC WMS services to Google KML files
//============================================================================
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

  //Write the image to stdout
  header('Content-Description: File Transfer');
  header('Content-type: application/vnd.google-earth.kml+xml');
  header('Content-Disposition: attachment; filename='."ADAGUC.kml");

  //Requires PHP with libgd and freetype
  include("validateURL.php");
  class ServiceProps{
    public $bbox;
    public $srs;
    public $service;
    public $layer;
    public $selected;
    public $dims;
    public $x;
    public $y;
    public $anim;
    public $refr;
    public $isAnimating;
    public $isDateRefreshing;
    public $width=600;
    public $height=700;
    public $type;
    public $title;
  }
  class Layer{
    public $service;
    public $name;
    public $srs;
    public $dims;
    public $width;
    public $height;
  }
  function getWMSLayersFromURL(){
    $sp = new ServiceProps();
    
    if($_GET['bbox'])       $sp->bbox    =urldecode($_GET['bbox']);else die("bbox missing");
    if($_GET['srs'])        $sp->srs     =urldecode($_GET['srs']);else die("srs missing");
    if($_GET['service'])    $sp->service =urldecode($_GET['service']);else die("service missing");
    if($_GET['layer'])      $sp->layer   =urldecode($_GET['layer']);else die("layer missing");
    //if($_GET['selected'])   $sp->selected=urldecode($_GET['selected']);else die("selected missing");
    if($_GET['dims'])       $sp->dims    =urldecode($_GET['dims']);//else die("dims missing");
    //if($_GET['width'])      $sp->width   =urldecode($_GET['width']);else die("width missing");
    //if($_GET['height'])     $sp->height  =urldecode($_GET['height']);else die("height missing");
    if($_GET['type'])       $sp->type=urldecode($_GET['type']);
    if($_GET['title'])       $sp->title=urldecode($_GET['title']);
    if($_GET['anim'])
      if($_GET['anim']=='1')$sp->isAnimating=$_GET['anim'];else die("anim missing");
    if($_GET['refr'])
      if($_GET['refr']=='1')$sp->$isDateRefreshing=$_GET['refr'];else die("refr missing");
    
    if($sp->type=="interpol"){
      $sp->bbox="0,300000,285000,624000";
      $sp->srs="EPSG:28992";
      $sp->height=800;
      $sp->width=intval((285000/(624000-300000))*$sp->height);
      
    }
    $layers=explode(",",$sp->layer);
    $services=explode(",",$sp->service);
    $numServices=count($services);
    
    $dimString=$sp->dims;
    $dimString= str_replace("$", "=", $dimString);
    $dims=explode(",", $dimString); //split dimString in separate dim
    // Replace all dims except TIME and ELEVATION by DIM_$dim
    $newDimString="";
    foreach ($dims as $dim) {
      $terms=explode("=", $dim); 
      if (!((strtolower($terms[0])=="time") or (strtolower($terms[0])=="elevation"))) {
        $newDimString=$newDimString."&amp;DIM_".$terms[0]."=".$terms[1];
      } else {
        $newDimString=$newDimString."&amp;".$dim;
      }
    }
    $dimString= str_replace(",", "&amp;", $newDimString);
    $Errors="";
    //echo $dimString;
    //Create a new true color image
    $layers=array_reverse  ($layers );
    $layerListResult = array();
    foreach ($layers as $value){
      $values=explode("$",$value);
      if(count($values)==6){
        $layer=$values[0];
        $format=$values[1];
        $enables=$values[2];
        $styles=$values[3];
        $opacity=$values[4];
        $serviceIndex=$values[5];
        $service=$services[$serviceIndex];
  
        //Compose a getmap request...
        $layer= str_replace(".", ",", $layer);
      /*  $WMSRequest=$service."service=WMS&request=GetMap&version=1.1.1&layers=".$layer;
        $WMSRequest.="&format=".$format;
        $WMSRequest.="&width=".$sp->width."&height=".$sp->height;
        $WMSRequest.="&bbox=".$sp->bbox;
        $WMSRequest.="&srs=".$sp->srs;
        $WMSRequest.="&styles=".$styles;
        $WMSRequest.="&".$dimString;
        $WMSRequest.="&transparent=true";*/
        #echo "<a href='".$WMSRequest."'>$WMSRequest</a><br>";
          
        $layerObject = new Layer();
        $layerObject->service=$service;
        $layerObject->name=$layer;
        $layerObject->title=URLDecode($layer);
        $layerObject->bbox=$sp->bbox;
        $layerObject->width=$sp->width;
        $layerObject->height=$sp->height;

        $layerObject->srs=$sp->srs;
        $layerObject->styles=$styles;
        $layerObject->dims=$dimString;
        $layerListResult[] = $layerObject;

      }
    }
    return $layerListResult;
  }
    
  
  //Draw scalebar:
  function MapXYtoScreenCoordXY($d,$e,$bboxFloatVals,$screenW,$screenH) {
    $d-=$bboxFloatVals[0];
    $e-=$bboxFloatVals[3];
    $bboxW=$bboxFloatVals[2]-$bboxFloatVals[0];
    $bboxH=$bboxFloatVals[1]-$bboxFloatVals[3];
    
    $d/=$bboxW;
    $e/=$bboxH;
    $d*=($screenW);
    //echo "d=".($d)."<br>";
    $e*=($screenH);
    $pX=$d;
    $pY=$e;
    return array($pX,$pY);//new int[]{pX,pY};*/
  }
 

  $layers=getWMSLayersFromURL();

  $kml = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
  $kml .= "<kml xmlns=\"http://www.opengis.net/kml/2.2\" xmlns:gx=\"http://www.google.com/kml/ext/2.2\" xmlns:kml=\"http://www.opengis.net/kml/2.2\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n";
  
  $kml .="<Folder>\n";
  $kml .="<name>ADAGUC WMS</name>\n";
  $kml .="<open>1</open>\n";
  for($j=0;$j<count($layers);$j++){
    $service=$layers[$j]->service;
    $name=urlencode($layers[$j]->name);
    $title=urlencode($layers[$j]->title);
    $styles=urlencode($layers[$j]->styles);
    $dimstring=$layers[$j]->dims;
    $bbox=explode(",",$layers[$j]->bbox);


    

    $kml .="<GroundOverlay>\n";
    $kml .="    <name>$title</name>\n";
    $kml .="    <Icon>\n";
    $kml .="           <href>$service&amp;SERVICE=WMS&amp;VERSION=1.1.1&amp;REQUEST=GetMap&amp;SRS=EPSG:4326&amp;WIDTH=1024&amp;HEIGHT=1024&amp;LAYERS=$name&amp;STYLES=$styles&amp;TRANSPARENT=TRUE&amp;FORMAT=image/png&amp;$dimstring</href>\n";
    $kml .="           <viewRefreshMode>onStop</viewRefreshMode>\n";
    $kml .="           <viewBoundScale>1.0</viewBoundScale>\n";
    $kml .="           <refreshMode>onExpire</refreshMode>\n";
    $kml .="           <viewRefreshTime>2</viewRefreshTime>\n";
    $kml .="    </Icon>\n";
    $kml .="    <LatLonBox>\n";
    $kml .="          <north>$bbox[3]</north>\n";
    $kml .="           <south>$bbox[1]</south>\n";
    $kml .="           <east>$bbox[2]</east>\n";
    $kml .="           <west>$bbox[0]</west>\n";
    $kml .="    </LatLonBox>\n";
    $kml .="</GroundOverlay>\n";

    #echo($j."-".$layers[$j]->service."\n");
  }
  $kml .="</Folder>";
  $kml .="</kml>";
  echo($kml."\n");
?>
