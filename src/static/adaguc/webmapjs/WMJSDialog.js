var WMJSDialog = {};
var WMJSDialogsCreated  = 0;
WMJSDialog.closeAllDialogs = function(gfiDialogList){
  for(var j=0;j<gfiDialogList.length;j++){
    gfiDialogList[j].remove();
  }
  gfiDialogList = [];
}

WMJSDialog.createDialog = function(options,baseDiv,_map){
  //_map.closeAllGFIDialogs();
  var id = 'auto_'+WMJSDialogsCreated++;
  var x=0;
  var y=0;
  var autoDestroy = true;
  if(isDefined(options.id)){
    id = options.id;
  }

  if(isDefined(options.x)){
    x = options.x;
  }

  if(isDefined(options.y)){
    y = options.y;
  }
  
  if(isDefined(options.autoDestroy)){
    autoDestroy = options.autoDestroy;
  } 
    
  var dialog = jQuery('<div />', {
      css:{
        minHeight:'20px',height:200,width:420,zIndex:2000,
        //border:'2px solid #8890D0',
        borderTop:'1px solid #8890D0',
        borderRight:'1px solid #8890D0',
        borderBottom:'1px solid #6670B0',
        borderLeft:'1px solid #6670B0',
        position:'absolute',margin:0,padding:'0px',backgroundColor:'#EEF',display:'inline-block'
      },
      mousedown:function(event){
        event.stopPropagation();
        preventdefault_event(event);
        //dialog.remove();
        // dialogClosed(dialog);
      },
      mousewheel:function(event){
        event.stopPropagation();
        //preventdefault_event(event);
      }
      
    }).appendTo(baseDiv);
  

    dialog.hasBeenDragged = false;
    
    dialog.on( "drag", function( event, ui ) {
      
      dialog.hasBeenDragged = true;
    
    });
    
    
    dialog.resizable();
    dialog.draggable();
    
    dialog.closeDialog = function(){
      if(autoDestroy == false){
        dialog.hide();
        
        dialog.trigger( "hide");
      }else{
        dialog.remove();
        dialogClosed(dialog);
      }
    }
    
    dialog.keyup(function(e) {
      //alert(e);
        if (e.keyCode == 27) {dialog.closeDialog(); }   
      });
    var closeButton= jQuery('<div/>', {css:{position:'absolute',right:'6px',top:'-3px',margin:'0px',padding:'0px',zIndex:1200},
      click:function(){
        
        dialog.closeDialog();
      }}).appendTo(dialog);
    closeButton.iconbutton({text:false, icons:{primary:'wmjs-icon-close'}});
    
    var dialogContent= jQuery('<div/>', {
      css:{position:'absolute',right:'0px',top:'18px',background:'#FFF',borderTop:'2px solid #6670B0',width:'100%',height:'100%',overflow:'auto',fontSize:'10px',lineHeight:'12px'},
      mousedown:function(event){
        event.stopPropagation();
        preventdefault_event(event);
      }
    }).appendTo(dialog);
    
    
      
    dialog.resize(function(){
      dialogContent.css({width:dialog.width()+'px',height:(dialog.height()-18)+'px'});
    });
    dialog.resize();
    
    dialog.setLoading = function(){
        dialogContent.html('<img style="margin-left:10px;margin-top:10px;" src="'+loadingImageSrc+'"/>');
    }
    
    dialog.setXY = function(x,y){
      dialog.hasBeenDragged = false;
      dialog.css({left:x+'px',top:y+'px'});//,zIndex:1000});
      var geopos=_map.getGeoCoordFromPixelCoord({x:x,y:y});
      dialog.geoPosX = geopos.x;
      dialog.geoPosY = geopos.y;         
      dialog.x=x;
      dialog.y=y;
    };
    dialog.setXY(x,y);
    dialog.origX = x;
    dialog.origY = y;
    
    dialog.setLoading();
    
    dialog.setHTML = function(data){
        dialogContent.html(data);
    }
    
    
    if(isDefined(options.dataURL)){
      //bla
      var update = function(data){
        
          dialogContent.html(data);
      };
    
      MakeHTTPRequest(options.dataURL,update,update);
    }
    
    
  
    
    return dialog;
  };