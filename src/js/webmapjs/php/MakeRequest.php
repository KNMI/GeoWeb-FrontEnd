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

  error_reporting(0);
  include("validateURL.php");
  $REQUEST =$_REQUEST['REQUEST'];
  //echo($REQUEST."<br/>");
  $myFile= $REQUEST;//urldecode($REQUEST);
  
  if(validateUrl($myFile)==true){
    $myFile = replaceHostName($myFile);
    $theData=file_get_contents ($myFile); 
    echo ($theData);
    return;
  }else die("invalid request.<br>\n");
?>
