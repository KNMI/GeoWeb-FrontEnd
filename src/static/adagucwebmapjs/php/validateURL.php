<?php 
//============================================================================
// Name        : validateURL.php
// Author      : MaartenPlieger (plieger at knmi.nl)
// Version     : 0.3 (September 2011)
// Description : Checks whether requested URLs are valid or not. 
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

ini_set('memory_limit','512M');
#Expand $URLArray with your own URL's:
include "../../config.php";


function isURLInList($url){
  return true;
  global $trustedURLS;
  $URLArray = $trustedURLS;
  foreach ($URLArray as $value) {
    if(startSWith($url,$value)==true)return true;
  }
  return false;
}

function error($code,$val,$isJSONP){
    if(isset($isJSONP)){
      echo $isJSONP."(";
    }
    echo "{ServiceExceptionReport:\n";
    echo "{ServiceException:{attr:{code:".json_encode($code)."},value:".json_encode($val)."}}";
    echo "}";
    if(isset($isJSONP)){
      echo ")";
    }
    die();
}


function logMessage($value){
 echo("*** $value ***\n");die();
}


function startSWith($string,$search){
    $pos = strpos($string,$search);
    if($pos === false || $pos != 0)return false; else return true;
}


function encodeRequestParams($request){
  $paramLoc=strpos($request,"?");
  if($paramLoc>0){
    $newRequest=substr($request,0,$paramLoc)."?".urlencode(substr($request,$paramLoc+1,strlen($request)));
    $request=$newRequest;
  }
  return $request;
}



/**
 * Checks values for cross site scripting
 * @param value
 * returns true when contains XSS 
 */
function checkXSS($value){
//  $value="http://bhw222.knmi.nl:8080/cgi-bin/server.cgi?source=%2F%2Fmeteosat9%2FMETEOSAT_9_SEVIRI_EUROPE_2012_08_27_10_45_00.h5&";
   if ( preg_match("/[^-a-zA-Z0-9,&$\/%\.:= _~?+\-()]/i", $value) ){
    logMessage("Invalid tokens or XSS detected in URL");
    return true;die();
  }
 
  return false;
}


function checkKVPSet($key){
  if(isset($_GET[$key])){
     if(checkXSS($_GET[$key]))return false;
     return true;
  }
  return false;
}

function getKVPXSSSafe($key){
  
  $value=$_GET[$key];
  if ( checkXSS($value) ){return;}
  return $value;
}

function decodeURLKVPXSSSafe($value){
  if ( checkXSS($value) ){return "";}
  
  return urldecode($value);
}

function isValidURL($url){
    if(checkXSS($url)){return false;die();}
    $regex = "(http:|https:)"; // SCHEME
    if(preg_match("/^$regex/", $url)){
      return true;
    }
    return false;
}

/*
function isValidURLold($url){
    
    return preg_match('|^http(s)?://[A-Za-z0-9-\-]+(.[A-Za-z0-9-\-]+)*(:[0-9]+)?(/.*)?$|i', $url);
} */ 

function validateUrl($url) {
      if(isValidURL($url)==true){
      $checkURL=isURLInList($url);
      if($checkURL==true){
        return true;
      }
      if($checkURL==false){
        error("UntrustedURL","The URL is not in the trusted list.\n");
        return false;
      }
    }
    error("InvalidURL","The URL is not valid.\n");
    return false;
}
  

?>
