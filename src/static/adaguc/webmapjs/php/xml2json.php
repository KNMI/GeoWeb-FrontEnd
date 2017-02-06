<?php
// XML to Array

function xml2array(&$string) {
    $parser = xml_parser_create();
    xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
    xml_parse_into_struct($parser, $string, $vals, $index);
    xml_parser_free($parser);

    $mnary=array();
    $ary=&$mnary;
    foreach ($vals as $r) {
    $t=$r['tag'];
      if ($r['type']=='open') {
          if (isset($ary[$t])) {
            if(isset($ary[$t][0]))$ary[$t][] = array(); 
            else $ary[$t] = array($ary[$t], array());
            $cv=&$ary[$t][count($ary[$t])-1];
          } else $cv=&$ary[$t];
          if (isset($r['attributes'])) {
            foreach ($r['attributes'] as $k=>$v){
              $cv['attr'][$k]=$v;
          //    print($cv." = ".$k."=>".$v."<br>");
            }
          }
          //$cv=array();
          $cv['_p']=&$ary;
          $ary=&$cv;
        } elseif ($r['type']=='complete') {
          if (isset($ary[$t])) { // same as open
            if(isset($ary[$t][0]))$ary[$t][] = array();
            else $ary[$t] = array($ary[$t], array());
            $cv=&$ary[$t][count($ary[$t])-1];
        } else $cv=&$ary[$t];
        if (isset($r['attributes'])) {foreach ($r['attributes'] as $k=>$v) $cv['attr'][$k]=$v;}
        if(isset($r['value'])){
          $cv['value']=$r['value'];
        } 
      } elseif ($r['type']=='close') {
        $ary=&$ary['_p'];
      }
    }    
    _del_p($mnary);
    return $mnary;
}
function xml2array2(&$string) {
    $parser = xml_parser_create();
    xml_parser_set_option($parser, XML_OPTION_CASE_FOLDING, 0);
    xml_parse_into_struct($parser, $string, $vals, $index);
    xml_parser_free($parser);

    $mnary=array();
    $ary=&$mnary;
    foreach ($vals as $r) {
      $t=$r['tag'];
      if ($r['type']=='open') {
        if (isset($ary[$t])) {
          if (isset($ary[$t][0])) $ary[$t][]=array(); else $ary[$t]=array($ary[$t], array());
          $cv=&$ary[$t][count($ary[$t])-1];
} else $cv=&$ary[$t];
        if (isset($r['attributes'])) {foreach ($r['attributes'] as $k=>$v) $cv['attr'][$k]=$v;}
        //$cv['']=array();
        $cv['_p']=&$ary;
        $ary=&$cv;
} elseif ($r['type']=='complete') {
        if (isset($ary[$t])) { // same as open
              if (isset($ary[$t][0])) $ary[$t][]=array(); 
              else $ary[$t]=array($ary[$t], array());
              $cv=&$ary[$t][count($ary[$t])-1];
} else $cv=&$ary[$t];
          if (isset($r['attributes'])) {foreach ($r['attributes'] as $k=>$v) $cv['attr'][$k]=$v;}
          if(isset($r['value']))$cv= $r['value'];
} elseif ($r['type']=='close') {
          $ary=&$ary['_p'];
}
}
    _del_p($mnary);
    return $mnary;
}

// _Internal: Remove recursion in result array
function _del_p(&$ary) {
  foreach ($ary as $k=>$v) {
        if ($k==='_p') unset($ary[$k]);
        elseif (is_array($ary[$k])) _del_p($ary[$k]);
}
}

function xml2json($xml){
  return json_encode(xml2array($xml));
}


?>