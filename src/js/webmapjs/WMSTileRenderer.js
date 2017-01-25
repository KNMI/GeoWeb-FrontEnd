function WMSTileRenderer(){
  var canvas;
  var context;
  var url;
  var minX;
  var minY;
  var maxX;
  var maxY;
  var initX=-285401.92;
  var initY=903401.92;
  var initR=3440.64;
  var _divElement;
  var drawTile = function(context,url,x,y,w,h){
    var imageObj = new Image();
    imageObj.padding=0;
    imageObj.margin=0;
    //alert(imageObj.x);
    imageObj.onload = function() {
      if(w){
        context.drawImage(imageObj,0,0,256,256,x,y,w,h);
        
      }else{
        context.drawImage(imageObj,x,y);
      }
    };
    imageObj.src = url;
  }
  /**
   * @param divElement The divElement to render to
   * @param _url The URL where the tiles are located
   * @param initX The initial X location of the tiles
   * @param initY The initial Y location of the tiles
   * @param initR The initial resolution the tile at first zoom level (0)
   */  
  this.init = function(_divElement){
    divElement=_divElement;
    canvas = document.createElement('canvas');
    canvas.setAttribute("width", parseInt(divElement.style.width));
    canvas.setAttribute("height", parseInt(divElement.style.height));
    canvas.setAttribute("class", "mapping");
    divElement.appendChild(canvas);
    try{
      canvas=G_vmlCanvasManager.initElement(canvas);
    }catch(e){
    }
    
    try{
      context = canvas.getContext("2d");
    }catch(e){
      alert("This browser is not supported by WMSTileRenderer");
    }
    //canvas = document.getElementById("cv");
    //context = canvas.getContext("2d");
    
  }
  
  this.clear = function(){
    if(!context)return;
    
    canvas.width = canvas.width;
  }
  /**
   * renders on the given bbox
   */
  this.render = function(_minX,_minY,_maxX,_maxY,_url,_initX,_initY,_initR,_extension){
    if(!context)return;
    
    //Check if width/height have changed
    var width=canvas.width;
    var height=canvas.height;
    var _width=parseInt(divElement.style.width);
    var _height=parseInt(divElement.style.height);
    if(width!=_width||height!=_height){
      //canvas.setAttribute("width",_width);
      //canvas.setAttribute("height", _height);
      canvas.width = _width;
      canvas.height = _height;
      width=_width
      height=_height;
    }else{
      //Check if other parameters have changed
      if(minX==_minX&&minY==_minY&&maxX==_maxX&&maxY==_maxY&&url==_url&&initX==_initX&&initY==_initY&&initR==_initR)return;
    }
    url=_url;
    initX=_initX;
    initY=_initY;
    initR=_initR;
    minX=_minX;
    minY=_minY;
    maxX=_maxX;
    maxY=_maxY;
    //alert(width);
    
    
    
    canvas.width = canvas.width;
    var level=0
    //Find the right zoomlevel based on min max extent and width of the image
    var OSM=false;
    if(_extension)OSM=true;
    
    //alert(OSM);
    if(OSM){
      z=parseInt(Math.log((maxX-minX)/(width/256))/Math.log(0.5)+26.0);
      
      level=z
      
      if(level>17)level=17;
      if(level<0)level=0;
    }else{
      z=parseInt(Math.log((maxX-minX)/(width/256))/Math.log(0.5)+21);
      level=z
      if(level>12)level=12;
      if(level<0)level=0;
    }
    
   
    
    //How many tiles are there on this zoomlevel?
    var d=parseInt(Math.pow(2,level));
    
    //Get the resolution of a tile
    var r=(initR/d)*256;
    
    var startX=parseInt((minX-initX)/r);
    var endX=parseInt((maxX-initX)/r)+1;
    var startY=parseInt(-(maxY-initY)/r);
    var endY=parseInt(-(minY-initY)/r)+1;
    
    var widthX=(r/(maxX-minX))*width+1;
    var widthY=(r/(maxY-minY))*height+1;
    var scaleW=width/(maxX-minX);
    var scaleH=height/(maxY-minY);
    var geoX1=0;
    var geoY1=0;
   
    var extension ="";
    if(_extension)extension=_extension;
    
    var nTilesDrawn = 0;
    //if(endX-startX>10){return;;}
    //Draw the tiles
    if(startX<0)startX=0;
    if(startY<0)startY=0;
    if(endX<0)endX=0;
    if(endY<0)endY=0;

    if(startX>d)startX=d;
    if(startY>d)startY=d;
    if(endX>d)endX=d;
    if(endY>d)endY=d;
    
    if(OSM){
      for(var x=startX;x<endX;x++){
        for(var y=startY;y<endY;y++){
          geoX1=(initX+x*r-minX)*scaleW;
          geoY1=height-(initY-y*r-minY)*scaleH;
          if(geoX1+widthX>=0&&
            geoY1+widthY>=0&&
            geoX1<width&&
            geoY1<height){
            if(x<d&&y<d){
              drawTile(context,url+level+"/"+x+"/"+y+extension,geoX1,geoY1,widthX,widthY);
              nTilesDrawn++;if(nTilesDrawn>120)return;
            }
            }
        }
      }
    }else{
      for(var x=startX;x<endX;x++){
        for(var y=startY;y<endY;y++){
          geoX1=(initX+x*r-minX)*scaleW;
          geoY1=height-(initY-y*r-minY)*scaleH;
          if(geoX1+widthX>=0&&
            geoY1+widthY>=0&&
            geoX1<width&&
            geoY1<height){
            if(x<d&&y<d){
              drawTile(context,url+level+"/"+y+"/"+x,geoX1,geoY1,widthX,widthY);
              nTilesDrawn++;if(nTilesDrawn>120)return;
            }
            }
        }
      }
    }
    
    //drawTile(context,"http://bvlogc.knmi.nl/ogc/mapserver.cgi?&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS=dutch_provinces&WIDTH="+width+"&HEIGHT="+height+"&SRS=EPSG%3A28992&BBOX="+minX+","+minY+","+maxX+","+maxY+"&STYLES=blue&FORMAT=image/png&TRANSPARENT=TRUE&",0,0);
  }
};