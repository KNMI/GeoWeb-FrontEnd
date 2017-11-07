<?php
//============================================================================
// Name        : getService.php
// Author      : MaartenPlieger (plieger at knmi.nl)
// Version     : 0.5 (September 2010)
// Description : Retrieves data from a server and offers it as a downloadstream with a proper filename.
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

  error_reporting(0);
  include("validateURL.php");
  $REQUEST =$_REQUEST['REQUEST'];
  if(!isset($_GET["REQUEST"]))die("invalid request.<br>\n");
  //$myFile= urldecode($REQUEST);

  $request=encodeRequestParams($request);
  if(validateUrl($myFile)==true){
    $myFile = replaceHostName($myFile);    
    if(!isset($_GET["NAME"]))die("invalid request.<br>\n");
    $fileName = urldecode($_GET["NAME"]);
    header('Content-Description: File Transfer');
    header('Content-type: application/force-download');
    header('Content-Disposition: attachment; filename='.$fileName);
    readfile($myFile); 
  }else die("invalid request.<br>\n");
?>
