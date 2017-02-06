/**
  * WMJSTimeSlider class
  * Author : MaartenPlieger (plieger at knmi.nl)
  * Copyright KNMI
  */


var sliderTooltip = function(dimValue) {
    var curValue = dimValue;//"test";//ui.value;
    //var tooltip = '<div class="slidertooltip"><div class="slidertooltip-inner">' + curValue + '</div><div class="slidertooltip-arrow"></div></div>';
    if(isDefined(curValue)){
      var tooltip = '<div class="slidertooltip"><div class="slidertooltip-inner">' + curValue + '</div></div>';
      $('.relativecontrol .ui-slider-handle').html(tooltip);
    }else{
      $('.ui-slider-handle .relativecontrol').html("");
    }

};

var RelativeSlider = function(config){
  var _this = this;
  var element = config.renderTo;
  var maxValue;
  var el=element;
  $('<input class="datetimepicker"/><br/><span class="relativeslider"/><span class="timeprevious"/><span class="timenext"/>').appendTo(element);
  
  var absoluteValue = 0;
  var previousRelValue=50;
  
  var sliderChangeRelative = function(relativeValue){
    absoluteValue+=relativeValue;
    if(absoluteValue>maxValue-1)absoluteValue = maxValue-1; 
    if(absoluteValue<0)absoluteValue = 0;
    if(isDefined(config.change)){
      config.change(_this,absoluteValue);
    }
    //sliderTooltip();
    //absSlider.slider('value',absoluteValue);  
  };
  
  var sliderSlideRelative = function(relativeValue){
    var oldAbs=absoluteValue;
    var temp = absoluteValue+relativeValue;
    if(temp>maxValue)temp = maxValue;
    if(temp<0)temp=0;
    if(isDefined(config.slide)){
      config.slide(_this,temp);
    }
    //absSlider.slider('value',temp);  
    absoluteValue = oldAbs;
  };
  
  var sliderChangeAbsolute = function(el,ui){
    absoluteValue = ui.value;
    if(isDefined(config.change)){
      config.change(_this,absoluteValue);
    }
  };
  
  var calculateRelativeValue = function(sliderValue){
    var relValue = 0;
    var value = sliderValue;
    relValue = (sliderValue-previousRelValue);
    return parseInt(relValue);
  };

  var relSliderSlide = function(event,ui){
    var relValue = calculateRelativeValue(ui.value);
    sliderSlideRelative(relValue);
  };
  
  var relSliderChange = function(event,ui){
    var relValue = calculateRelativeValue(ui.value);
    sliderChangeRelative(relValue);
    if(ui.value!=50){
      relSlider.slider('value',50);  
    }
  };  
  
  var relSlider = el.find('.relativeslider').slider({
    min:0,max: 100,value:50,animate: 1000,
    change:function(event, ui) {
      if (event.originalEvent) {
        relSliderChange(event, ui);
      }
    },
    slide:relSliderSlide
  });
  
  relSlider.addClass('relativecontrol');
 
  el.find('.timeprevious').iconbutton({text:false, icons:{primary:'ui-icon-circle-triangle-w'}});
  
  el.find('.timenext').iconbutton({text:false, icons:{primary:'ui-icon-circle-triangle-e'}});
  
  el.find('.timeprevious').click(function(){
    sliderChangeRelative(-1);
    //sliderSlideRelative(-1);
  });
  
  el.find('.timenext').click(function(){
    sliderChangeRelative(1);
    //sliderSlideRelative(1);
  });
  
  var timePicker = el.find('.datetimepicker').datetimepicker({
     // controlType: myTimePickerControl,
      
      dateFormat: "yy-mm-dd",
      timeFormat: "HH:mm:ss",
      separator: 'T',
      showOn: "button",
      buttonText: "",
      altFieldTimeOnly: false,
      showAnim:'slideDown',
      //defaultDate: "5/31/2013",
      changeMonth: true,
      changeYear: true,
      showTimezone: false,
      //addSliderAccess: true,
      //sliderAccessArgs: { touchonly: false },
      onSelect:function(dateText,obj){
         

        var validDate = _this.setPositionByText(dateText);
        if(dateText != validDate.dimvalue){
          //alert(dateText+'!='+validDate.dimvalue);
          timePicker.datetimepicker('setDate', validDate.dimvalue.replace("Z",""));
        }
        //alert(timePicker.datetimepicker( "widget" ).is(":visible"));
      },
      css:{
         zIndex:4000
      }
    });

  
  /**
   * Sets position of the slider
   */
  this.setPosition = function(_absoluteValue){
    absoluteValue=_absoluteValue;
    //absSlider.slider("option", "value", _absoluteValue); 
  }
  
  this.setPositionByText = function(string){
    if(isDefined(config.textUpdate)){
      return config.textUpdate(_this,string);
      //this.setText(string);
    }
  }
  
  
  
  var firstTimeInitialization = true;
  
  
  /**
   * Just changes the text of the textbox on the right
   */
  
  this.setText = function(textString,fromSlider){
     
    //el.find('.datetime').val(textString);
    textString = textString.replace("Z","");
    //textString = textString.replace("T","");
    
    el.find('.datetimepicker').val(textString);
    /*if(firstTimeInitialization){
     timePicker.datetimepicker('setDate', textString);
     firstTimeInitialization=false;
    }*/
  };
  
  this.setMax = function(max,minDate,maxDate){
    //maxValue = max-1;
    //absSlider.slider("option", "max", maxValue); 
    //alert(minDate);
    timePicker.datetimepicker('option', {minDate: minDate.replace("Z",""), maxDate: maxDate.replace("Z","")});
  }

};

var TimeSlider = function(config){
  var _this = this;
  var currentDimension;
  var functionCalledOnChange;
  var functionCalledOnSlide;
  var currentValue;
  var slide = function(el,absoluteValue){
    el.setText(currentDimension.getValueForIndex(absoluteValue),true);
    if(isDefined(functionCalledOnSlide)){
      functionCalledOnSlide(absoluteValue);
    }

  };
  
  var change = function(el,absoluteValue){
    el.setText(currentDimension.getValueForIndex(absoluteValue),true);
    if(isDefined(functionCalledOnChange)){
      functionCalledOnChange(absoluteValue);
    }
  };
  
  
  var relativeSlider;
  /*relativeSlider = new RelativeSlider({
    renderTo:config.renderTo,
    slide:slide,
    change:change,
    textUpdate:function(obj,text){
      var result = _this.setValue("time",text);
      index = result.index;
      if(isDefined(index)){
        if(isDefined(functionCalledOnChange)){
          functionCalledOnChange(index);
        }
      }
      return result;
    }
  });*/
  
  
  this.setDimension = function(d,_functionCalledOnChange,_functionCalledOnSlide){
    currentDimension = d;
    functionCalledOnChange = _functionCalledOnChange;
    functionCalledOnSlide = _functionCalledOnSlide;
    
    if(isDefined(relativeSlider)){
      relativeSlider.setMax(d.size(),d.getValueForIndex(0),d.getValueForIndex(d.size()-1));
    }
    
    currentValue="";
    //relativeSlider.setValue(d.size());
    this.setValue(d.name,d.getValue());

  };
  
  /** Sets the value by dimensionname and its value, returns the index in the dimension*/
  this.setValue = function(dimname,dimvalue){
    
    if(!isDefined(currentDimension))return;
    if(dimname!="time")return;
    if(currentValue == dimvalue)return;
    
    currentValue= dimvalue;
    var index;
    try{
      index=currentDimension.getIndexForValue(dimvalue);
    }catch(e){
      
      
      index=currentDimension.size()-1;
      dimvalue = currentDimension.getValueForIndex(index);
      
      debug("Date "+dimvalue+" is outside range: "+index);
    }
   
    //debug("Setting "+index+":"+dimvalue);
    
    if(isDefined(relativeSlider)){
      relativeSlider.setText(dimvalue);
      relativeSlider.setPosition(index);
    }
    return {index:index,dimvalue:dimvalue};
  }
  
};
      