<?php
/**
 * PHP Scalebar generator
 *
 * $Id: makeScaleBar.php 
 *
 * @author      Maarten Plieger
 * @version     1
 * @copyright   (c) 2012 Royal Netherlands Meteorological Institute
 * @package     ADAGUC
 *
 **/

  /**
   * Getscalebar properties
   * 
   * @access public
   * @param double Width of BBOX
   * @param int width of image
   * @return array containing scalebarwidth with corresponding scalenumber
   */
  
  function getScaleBarProps($bboxSize,$width){
    if($bboxSize==0||$width<0){return NULL;}
    if(!isset($bboxSize)||!isset($width)){return NULL;}
    $pixelsPerUnit=$width/($bboxSize);
    
    if($pixelsPerUnit==0){
      return NULL;
    }
    
    
    $desiredWidth=25;
    
    //$closestWidth=intval($divFactor*$pixelsPerUnit);
    
    $realWidth = 0;
    $numMapUnits=1/10000000;
    
    $numIters=0;
    $a=$desiredWidth/$pixelsPerUnit;

    do{
      $numMapUnits*=10;
      $divFactor=$a/$numMapUnits;
      if($divFactor==0)return NULL;
      $realWidth=$desiredWidth/$divFactor;
      $numIters++;
    }while($realWidth<$desiredWidth);
    
    do{
      $numMapUnits/=2;
      $divFactor=$a/$numMapUnits;
      $realWidth=$desiredWidth/$divFactor;
      $numIters++;
    }while($realWidth>$desiredWidth);
    
    do{
      $numMapUnits*=1.2;
      $divFactor=$a/$numMapUnits;
      $realWidth=$desiredWidth/$divFactor;
      $numIters++;
    }while($realWidth<$desiredWidth);
    
    
    $roundedMapUnits = $numMapUnits;
    
    $d=pow(10,round(log10($numMapUnits)+0.5)-1);
    
    $roundedMapUnits=intval($roundedMapUnits/$d);
    if($roundedMapUnits<2.5)$roundedMapUnits=2.5;
    if($roundedMapUnits>2.5&&$roundedMapUnits<7.5)$roundedMapUnits=5;
    if($roundedMapUnits>7.5)$roundedMapUnits=10;
    $roundedMapUnits=($roundedMapUnits*$d);
    
    
    $divFactor=($desiredWidth/$pixelsPerUnit)/$roundedMapUnits;
    $realWidth=$desiredWidth/$divFactor;
    return array($realWidth,$roundedMapUnits);
  }


  $width=250;
  //$height=250;
  
  //$bbox="-180,-90,180,90";
  //$bboxWidth = 256;
  
  if(isset($_GET['BBOX'])) $bbox =$_GET['BBOX'];
  if(isset($_GET['BBOXWIDTH']))$bboxWidth =$_GET['BBOXWIDTH'];
  
  $projection =$_GET['SRS'];
  if(!isset($projection))$projection="EPSG:4326";
  
  if(!isset($bbox)&&!isset($bboxWidth))die("BBOX or BBOXWIDTH missing");

  if(isset($bbox)){
    $bboxsplit=explode(",",$bbox);
    if(count($bboxsplit)!=4)die("invalid bbox");
    $bboxWidth=$bboxsplit[2]-$bboxsplit[0];
  }
  
  $width =$_GET['WIDTH'];
  if(!isset($width))die("WIDTH missing");
  
  
  
  
  $scalebarWidth=200;
  $scalebarHeight=20;
  
  $offsetX = 3;
  
  $newIm = imagecreatetruecolor($scalebarWidth, $scalebarHeight);
  imagealphablending($newIm, true);
  imagesavealpha($newIm, false);
  $transp = imagecolorallocate($newIm, 0, 0, 0);
  $foreground= imagecolorallocate($newIm, 1, 1, 1);
  imagecolortransparent( $newIm,$transp );
//  imagefilledrectangle($newIm,0,0,$scalebarWidth,$scalebarHeight, $transp);

  $scaleBarProps=getScaleBarProps($bboxWidth,$width);
  if($scaleBarProps==NULL){
    echo("Invalid params");
    die();
  }
  $fw=$scaleBarProps[0];
  $val=$scaleBarProps[1];
  for($j=0;$j<2;$j++){
    imageline($newIm,$offsetX,$scalebarHeight-2-$j,$fw*2+$offsetX,$scalebarHeight-2-$j,$foreground);
  }
    
  
  $subDivXW=$fw/5;
  for($j=1;$j<5;$j++){
    imageline($newIm,$subDivXW*$j+$offsetX,$scalebarHeight-2,$subDivXW*$j+$offsetX,$scalebarHeight-2-3,$foreground);
  }

  imageline($newIm,$offsetX,$scalebarHeight-2,$offsetX,$scalebarHeight-2-7,$foreground);
  imageline($newIm,$fw+$offsetX,$scalebarHeight-2,$fw+$offsetX,$scalebarHeight-2-5,$foreground);
  imageline($newIm,$fw*2+$offsetX,$scalebarHeight-2,$fw*2+$offsetX,$scalebarHeight-2-7,$foreground);
  putenv('GDFONTPATH=' . realpath('.'));
  $fontFile = 'FreeSans';
  
  
  $units="";
  
  if($projection=="EPSG:3411")$units="meter";
  if($projection=="EPSG:3412")$units="meter";
  if($projection=="EPSG:3575")$units="meter";
  
  if($projection=="EPSG:4326")$units="degrees";
  if($projection=="EPSG:28992")$units="meter";
  if($projection=="EPSG:32661")$units="meter";
  if($projection=="EPSG:3857")$units="meter";
  if($projection=="EPSG:900913")$units="meter";
  if($projection=="EPSG:102100")$units="meter";
  
  
  if($units=="meter"){
    if($val>1000){
      $val/=1000;$units="km";
    }
  }
  
  
  imagefttext( $newIm, 6,0, $offsetX-2, 8, -$foreground, $fontFile, 0);
  imagefttext( $newIm, 6,0, $offsetX+$fw-strlen($val)*2.5+1, 8, -$foreground, $fontFile,$val);
  
  $textsize=imagettfbbox ( 6,0,  $fontFile, $val*2);

  imagefttext( $newIm, 6,0, $offsetX+$fw*2-$textsize[4]/2, 8, -$foreground, $fontFile, $val*2);
  $mostRightPx1=$offsetX+$fw*2+$textsize[4]/2+4;
  
  
  $textsize=imagettfbbox ( 6,0,  $fontFile, $units);
  imagefttext( $newIm, 6,0, $offsetX+$fw*2+10, 17, -$foreground, $fontFile, $units);
  $mostRightPx2=$offsetX+$fw*2+14+$textsize[4];
 
  $newWidth=$mostRightPx1;
  if($mostRightPx2>$mostRightPx1)$newWidth=$mostRightPx2;
   //$newWidth=$mostRightPx2;
  if($newWidth>$scalebarWidth)$newWidth=$scalebarWidth;
  $newWidth+=2;
  $finalIm = imagecreatetruecolor($newWidth, $scalebarHeight);
  
  imagealphablending($finalIm, true);
  imagesavealpha($finalIm, false);
  $transp = imagecolorallocate($finalIm, 0, 0, 0);
  $foreground= imagecolorallocate($finalIm, 1, 1, 1);
  imagecolortransparent( $finalIm,$transp );
  
  //imagefilledrectangle($finalIm,0,0,$newWidth,$scalebarHeight, $transp);
  
  imagecopy($finalIm, $newIm, 0, 0, 0, 0, $newWidth,$scalebarHeight);
  
  //Write the image to stdout
  header('Content-type: image/png'); 
  ImagePng($finalIm);
  
  //Clean up
  imagedestroy($newIm);
  imagedestroy($finalIm);
  
  
?>
