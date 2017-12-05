<?php
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

  #error_reporting(0);
  include("validateURL.php");
  $request  = isset($_REQUEST['request'])?$_REQUEST['request']:"";
  $callback = isset($_REQUEST['callback'])?$_REQUEST['callback']:"";
  
  if($request == "")die("Invalid request");
  if($callback == "")die("Invalid request");
  

 
  
  //$request = urldecode($request);
  //echo $request."<br>\n<br>\n";
  //$request=encodeRequestParams($request);
  
  if(validateUrl($request)==true)
  {
    include("xml2json.php");
    $request = replaceHostName($request);
    
    $request = str_replace(" ","%20", $request);
    
    if(FALSE){
      //SDP KDC default USERNAME and PASSWORD
      $opts = array(
      'http'=>array(
        'method'=>"GET",
        'header'=>
          "Authorization: Basic Z3Vlc3Q6Z3Vlc3Q=\r\n".//guest:guest example
          "Cookie: foo=bar\r\n" .
          "User-Agent: Mozilla/5.0 (Windows NT 6.2; rv:22.0) Gecko/20130405 Firefox/23.0\r\n"
        )
      );
      $context = stream_context_create($opts);
      $theData=file_get_contents ($request,false,$context); 
    }else{
      #echo($request);
      $theData=file_get_contents ($request); 
      #echo("Done");
    }
    if(!$theData){
      error("UnableToGetContent file_get_contents failed",$request,$callback);
      die();
    }
    
    if((substr($theData, 0, 5)!= "<?xml") && 
      (!((substr($theData, 0, 17) == "<WMS_Capabilities") || (substr($theData, 0, 20) == "<WMT_MS_Capabilities")))) {
      error("UnableToGetContent",$request,$callback);
      die();
    }
    
    $parsedXMLData = xml2json($theData);
    
    if($parsedXMLData=="[]"){
      echo $theData;//."for ".$request;
      return;
    }
    header('Content-type: application/json');
    echo $callback."(".$parsedXMLData.");";

    return;
  }else die();
?>
