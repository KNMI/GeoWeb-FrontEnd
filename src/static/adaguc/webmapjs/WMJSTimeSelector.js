function WMJSTimeSelector (element, callback, _defaultLength) {
  var MySet = function () {
    this.values = [];
  };
  MySet.prototype.add = function (o) { if (this[o] === true) return false; this[o] = true; this.values.push(o); return true; };

  var _this = this;
  this.element = element;
  this.webmapjs = undefined;

  this.values = [];

  var defaultLength = 24;
  if (isDefined(_defaultLength)) {
    defaultLength = _defaultLength;
  }

  var controlElement = $('<div class="WMJSTimeSelector-controlElement WMJSTimeSelector-noselect"/>', {});

  var timeChooserElement = $('<div class="WMJSTimeSelector-timeChooserElement WMJSTimeSelector-noselect"/>', {});

  var timeInformationElement = $('<div class="WMJSTimeSelector-timeinfo WMJSTimeSelector-noselect"/>', {});

  var controlElementBottom = $('<div class=""WMJSTimeSelector-controlElementBottom WMJSTimeSelector-noselect"/>', {});

  this.element.append(timeInformationElement);
  this.element.append(controlElement);
  this.element.append(timeChooserElement);
  this.element.append(controlElementBottom);

  /** Control elements, buttons and spinners **/
  var fastBackward = $('<button>&lt;&lt;</button>').button().click(function () {
    var values = _this.makeDateList(_this.webmapjs, _this.currentValue, defaultLength);
    beforeCallback(values[0]);
  });
  var fastForward = $('<button>&gt;&gt;</button>').button().click(function () {
    var values = _this.makeDateList(_this.webmapjs, _this.currentValue, defaultLength);
    beforeCallback(values[values.length - 1]);
  });
  var backward = $('<button>&lt;</button>').button().click(function () {
    var values = _this.makeDateList(_this.webmapjs, _this.currentValue, defaultLength);
    for (var j = 1; j < values.length; j++) { if (values[j] == _this.currentValue) { beforeCallback(values[j - 1]); return; } }beforeCallback(values[0]);
  });
  var forward = $('<button>&gt;</button>').button().click(function () {
    var values = _this.makeDateList(_this.webmapjs, _this.currentValue, defaultLength);
    for (var j = 0; j < values.length - 1; j++) { if (values[j] == _this.currentValue) { beforeCallback(values[j + 1]); return; } }beforeCallback(values[values.length - 1]);
  });

  controlElement.append("<table class='WMJSTimeSelector-table'><tr><th>" + I18n.year.text + '</th><th>' + I18n.month.text +
      '</th><th>' + I18n.day.text + '</th><th>' + I18n.hour.text + '</th><th>' + I18n.min.text + '</th></tr><tr>' +
  "<td><input class='WMJSTimeSelector_yearspinner'/></td>" +
  "<td><input class='WMJSTimeSelector_monthspinner'/></td>" +
  "<td><input class='WMJSTimeSelector_dayspinner'/></td>" +
  "<td><input class='WMJSTimeSelector_hourspinner'/></td>" +
  "<td><input class='WMJSTimeSelector_minutespinner'/></td>" +
  // "<td><input class='WMJSTimeSelector_secondspinner'/></td>"+
  '</tr>');

  var loadAllDataButton = $('<button>' + I18n.load_all.text + '</button>').button().click(function () {
    var values = _this.values;
    for (var j = 0; j < values.length; j++) {
      // console.log(values[j]);
      loadThisTimeValue(values[j]);
    }
  });
  var playAllDataButton = $('<button>' + I18n.play_animation.text + '</button>').button().click(function () {
    var values = _this.values;
    var animationList = [];
    for (var j = 0; j < values.length; j++) {
      // console.log(values[j]);
      loadThisTimeValue(values[j]);
      animationList.push({ name:'time', value:values[j] });
    }
    _this.webmapjs.draw(animationList);
  });
  var stopAnimationButton = $('<button>' + I18n.stop.text + '</button>').button().click(function () {
    _this.webmapjs.stopAnimating();
  });
  controlElementBottom.append(loadAllDataButton);
  controlElementBottom.append(playAllDataButton);
  controlElementBottom.append(stopAnimationButton);

  var yearSpinner = controlElement.find('.WMJSTimeSelector_yearspinner');
  var monthSpinner = controlElement.find('.WMJSTimeSelector_monthspinner');
  var daySpinner = controlElement.find('.WMJSTimeSelector_dayspinner');
  var hourSpinner = controlElement.find('.WMJSTimeSelector_hourspinner');
  var minuteSpinner = controlElement.find('.WMJSTimeSelector_minutespinner');
  var secondSpinner = controlElement.find('.WMJSTimeSelector_secondspinner'); ;

  var timeButtonElement = $('<div class="WMJSTimeSelector_timebuttons"/>', {});

  timeButtonElement.append(fastBackward);
  timeButtonElement.append(backward);
  timeButtonElement.append(forward);
  timeButtonElement.append(fastForward);
  controlElement.append(timeButtonElement);
  var spinnerValue = '';

  var format = function (value, numdigits) {
    value = '' + value;
    while (value.length < numdigits) { value = '0' + value; }
    return value;
  };

  var spinnersTriggerd = function (id, value) {
    var newSpinnerValue = spinnerValue;

    if (id == 'year')newSpinnerValue = [format(value, 4), newSpinnerValue.slice(4)].join('');
    if (id == 'month')newSpinnerValue = [newSpinnerValue.slice(0, 5), format(value, 2), newSpinnerValue.slice(7)].join('');
    if (id == 'day')newSpinnerValue = [newSpinnerValue.slice(0, 8), format(value, 2), newSpinnerValue.slice(10)].join('');
    if (id == 'hour')newSpinnerValue = [newSpinnerValue.slice(0, 11), format(value, 2), newSpinnerValue.slice(13)].join('');
    if (id == 'minute')newSpinnerValue = [newSpinnerValue.slice(0, 14), format(value, 2), newSpinnerValue.slice(16)].join('');
    if (id == 'second')newSpinnerValue = [newSpinnerValue.slice(0, 17), format(value, 2), newSpinnerValue.slice(19)].join('');
    // console.log(newSpinnerValue);

    var newSpinnerValueAsDate = parseISO8601DateToDate(newSpinnerValue);
    var newSpinnerValue = newSpinnerValueAsDate.toISO8601();

    // If the new value is different, but not enough to make a change, force a change. (e.g. one second spin, will become 5 minutes in case of radar)
    if (newSpinnerValue != _this.currentValue) {
      var values = _this.makeDateList(_this.webmapjs, newSpinnerValue, 3);
      // console.log(values[0]+" "+values[1]+" "+values[2]+" for "+newSpinnerValue+" and "+_this.currentValue+" spinenr "+spinnerValue);
      if (values[1] == _this.currentValue) {
        var dateObj = parseISO8601DateToDate(values[1]);
        if (newSpinnerValueAsDate > dateObj) {
          newSpinnerValue = values[2];
        } else if (newSpinnerValueAsDate < dateObj) {
          newSpinnerValue = values[0];
        }
      }
    }

    if (newSpinnerValue != spinnerValue) {
      setSpinnerValue(newSpinnerValue);
      beforeCallback(newSpinnerValue);
    }

    return false;
  };

  var setSpinnerValue = function (value) {
    if (!isDefined(value)) return;
    spinnerValue = value;
    yearSpinner.spinner('value', value.substring(0, 4));
    monthSpinner.spinner('value', value.substring(5, 7));
    daySpinner.spinner('value', value.substring(8, 10));
    hourSpinner.spinner('value', value.substring(11, 13));
    minuteSpinner.spinner('value', value.substring(14, 16));
    secondSpinner.spinner('value', value.substring(17, 19));
  };

  yearSpinner.spinner({ spin: function (event, ui) { return spinnersTriggerd('year', ui.value); }, change: function (event, ui) { spinnersTriggerd('year', $(event.target).spinner('value')); }, numberFormat:'d4' });
  monthSpinner.spinner({ spin: function (event, ui) { return spinnersTriggerd('month', ui.value); }, change: function (event, ui) { spinnersTriggerd('month', $(event.target).spinner('value')); }, numberFormat:'d2' });
  daySpinner.spinner({ spin: function (event, ui) { return spinnersTriggerd('day', ui.value); }, change: function (event, ui) { spinnersTriggerd('day', $(event.target).spinner('value')); }, numberFormat:'d2' });
  hourSpinner.spinner({ spin: function (event, ui) { return spinnersTriggerd('hour', ui.value); }, change: function (event, ui) { spinnersTriggerd('hour', $(event.target).spinner('value')); }, numberFormat:'d2' });
  minuteSpinner.spinner({ spin: function (event, ui) { return spinnersTriggerd('minute', ui.value); }, change: function (event, ui) { spinnersTriggerd('minute', $(event.target).spinner('value')); }, numberFormat:'d2' });
  secondSpinner.spinner({ spin: function (event, ui) { return spinnersTriggerd('second', ui.value); }, change: function (event, ui) { spinnersTriggerd('second', $(event.target).spinner('value')); }, numberFormat:'d2' });

  yearSpinner.spinner().keyup(function (e, ui) { var code = e.keyCode || e.which; if (code == 13)spinnersTriggerd('year', $(event.target).spinner('value')); });
  monthSpinner.spinner().keyup(function (e, ui) { var code = e.keyCode || e.which; if (code == 13)spinnersTriggerd('month', $(event.target).spinner('value')); });
  daySpinner.spinner().keyup(function (e, ui) { var code = e.keyCode || e.which; if (code == 13)spinnersTriggerd('day', $(event.target).spinner('value')); });
  hourSpinner.spinner().keyup(function (e, ui) { var code = e.keyCode || e.which; if (code == 13)spinnersTriggerd('hour', $(event.target).spinner('value')); });
  minuteSpinner.spinner().keyup(function (e, ui) { var code = e.keyCode || e.which; if (code == 13)spinnersTriggerd('minute', $(event.target).spinner('value')); });
  secondSpinner.spinner().keyup(function (e, ui) { var code = e.keyCode || e.which; if (code == 13)spinnersTriggerd('second', $(event.target).spinner('value')); });

  /** Control and logic part **/

  this.loadingComplete = function (webmapjs) {
    this.generate(webmapjs, false, true);
  };

  this.dimensionUpdate = function (webmapjs) {
    this.generate(webmapjs, true, true);
  };

  this.dimensionChange = function (webmapjs) {
    this.generate(webmapjs, false, false);
  };

  /** Called internally to update the time information on the screen **/
  var updateTimeInformation = function (value) {
    setSpinnerValue(value);
    var date = parseISO8601DateToDate(value);
    $(timeInformationElement).html(I18n.local_time.text + ':<br/><b>' + date.toString().replace(/GMT.*/g, '') + '</b>');
  };

  /** Called internally before triggering the external callback function **/
  var beforeCallback = function (value) {
    _this.webmapjs.stopAnimating();
    updateTimeInformation(value);
    callback(value);
  };

  /** Makes the list of dates based on all layers **/
  this.makeDateList = function (webmapjs, timevalue, lengthoflist) {
    var foundDims = [];
    var layers = webmapjs.getLayers();
    for (var j = 0; j < layers.length; j++) {
      if (layers[j].enabled == true) {
        var dimTime = layers[j].getDimension('time');
        if (dimTime) {
          foundDims.push(dimTime);
        }
      }
    }
    var set = new MySet();

    var max = lengthoflist;

    for (var t = 0; t < max; t++) {
      for (var dimnr = 0; dimnr < foundDims.length; dimnr++) {
        var dim = foundDims[dimnr];
        var index = dim.getIndexForValue(timevalue, false); ;

        var newindex = t + (index);
        if (newindex < 0)newindex = 0;
        if (newindex > dim.size() - 1)newindex = dim.size() - 1;
        if (newindex >= 0 && newindex < dim.size()) {
          set.add(dim.getValueForIndex(newindex));
        }
        newindex = -t + (index);
        if (newindex < 0)newindex = 0;
        if (newindex > dim.size() - 1)newindex = dim.size() - 1;
        if (newindex >= 0 && newindex < dim.size()) {
          set.add(dim.getValueForIndex(newindex));
        }
      }
    }

    set.values.sort();
    var timeindex = 0;
    for (var j = 0; j < set.values.length; j++) if (timevalue == set.values[j]) { timeindex = j; break; }
    var numAdded = 0;
    var set2 = new MySet();
    for (var j = 0; j < max; j++) {
      var index = timeindex + j;
      if (index > 0 && index < set.values.length) { if (set2.add(set.values[index]) == true) { numAdded++; if (numAdded > max) break; } }
      index = timeindex - j;
      if (index > 0 && index < set.values.length) { if (set2.add(set.values[index]) == true) { numAdded++; if (numAdded > max) break; } }
    }
    set2.values.sort();
    var values = [];
    for (var j = 0; j < set2.values.length; j++) {
      values.push(set2.values[j]);
    }
    return values;
  };
  // var numcalled = 0;

  var checkIfThisTimeValueIsLoaded = function (timevalue) {
    // numcalled ++;
    // console.log("checkIfThisTimeValueIsLoaded numcalled: "+numcalled);
    // return false;
    if (!_this.webmapjs) return false;
    var timedim = _this.webmapjs.getDimension('time');
    if (!isDefined(timedim)) return false;
    var currentValue = timedim.currentValue;

    _this.webmapjs.suspendEvent('ondimchange');
    _this.webmapjs.suspendEvent('ondimupdate');
    _this.webmapjs.setDimension('time', timevalue);
    var check = function () {
      var requests = _this.webmapjs.getWMSRequests();
      if (requests.length == 0) return false;
      for (var l = 0; l < requests.length; l++) {
        if (_this.webmapjs.isThisRequestLoaded(requests[l]) == 0) {
          return false;
        }
      }
      return true;
    };
    var value = check();
    _this.webmapjs.setDimension('time', currentValue);
    _this.webmapjs.resumeEvent('ondimchange');
    _this.webmapjs.resumeEvent('ondimupdate');

    return value;
  };

  var loadThisTimeValue = function (timevalue) {
    if (!_this.webmapjs) return false;
    var timedim = _this.webmapjs.getDimension('time');
    if (!isDefined(timedim)) return false;
    var currentValue = timedim.currentValue;

    _this.webmapjs.suspendEvent('ondimchange');
    _this.webmapjs.suspendEvent('ondimupdate');
    _this.webmapjs.setDimension('time', timevalue);
    var check = function () {
      var requestToReturn = [];
      var requests = _this.webmapjs.getWMSRequests();
      if (requests.length == 0) return false;
      for (var l = 0; l < requests.length; l++) {
        if (_this.webmapjs.isThisRequestLoaded(requests[l]) == 0) {
          // console.log("Load "+requests[l]);
          requestToReturn.push(requests[l]);
        }
      }
      return requestToReturn;
    };
    var value = check();
    _this.webmapjs.prefetch(value);
    _this.webmapjs.setDimension('time', currentValue);
    _this.webmapjs.resumeEvent('ondimchange');
    _this.webmapjs.resumeEvent('ondimupdate');

    return value;
  };

  this.generate = function (webmapjs, forceUpdate, loadeventwastriggered) {
    this.webmapjs = webmapjs;
    if (!webmapjs.getDimension('time')) {
      // console.log("No time dim");
      $(timeChooserElement).html(I18n.no_dimensions_available.text);
      controlElement.hide();
      timeInformationElement.hide();
      _this.currentValue = '';
      _this.values = [];
      return;
    }
    controlElement.show();
    timeInformationElement.show();
    var currentValue = webmapjs.getDimension('time').currentValue;
//     if(forceUpdate == false){
//       if(_this.currentValue == currentValue){
//         return;
//       }
//     }

    // Convert "current" to real date
    if (currentValue == 'current') {
      var layers = webmapjs.getLayers();
      for (var j = 0; j < layers.length; j++) {
        var dimTime = layers[j].getDimension('time');
        if (dimTime) {
          currentValue = dimTime.getValueForIndex(dimTime.getIndexForValue(currentValue, false));
        }
      }
    }
    _this.currentValue = currentValue;

    updateTimeInformation(_this.currentValue);

    if (forceUpdate == false) {
      var foundValue = false;
      if (isDefined(_this.values)) {
        $(_this.element).find('.WMJSTimeSelector-tr').removeClass('WMJSTimeSelector-col-selected');
        for (var j = 0; j < _this.values.length; j++) {
          var isloaded = false;
          var el = $(_this.element).find('.WMJSTimeSelector-tr:eq(' + j + ')');

          if (loadeventwastriggered === true) {
            var isloaded = false;
            if (el.hasClass('WMJSTimeSelector-col-loaded')) {
              isloaded = true;
            }
            if (!isloaded) {
              // console.log(isloaded+" "+_this.values[j]);
              isloaded = (checkIfThisTimeValueIsLoaded(_this.values[j]) == true);
            }
            if (isloaded) {
              el.addClass('WMJSTimeSelector-col-loaded');
            } else {
              el.removeClass('WMJSTimeSelector-col-loaded');
            }
          }

          if (_this.currentValue == _this.values[j]) {
            _this.currentValue = currentValue;

            el.addClass('WMJSTimeSelector-col-selected');
            foundValue = true;
          }
        }
      }
      if (foundValue == true) return;
    }

    // console.log(" making datelist forceUpdate="+forceUpdate);

    _this.values = _this.makeDateList(webmapjs, currentValue, defaultLength);

    // console.log(currentValue);

    var timeTableHTML = "<table class='WMJSTimeSelector-table WMJSTimeSelector-noselect'>";

    var addcol = function (args) {
      return "<td class='WMJSTimeSelector-colindex'>" + args.index + "</td><td class='WMJSTimeSelector-col'>" + args.textdate + "</td><td class='WMJSTimeSelector-colindex'>" + args.index + "</td><td class='WMJSTimeSelector-col'>" + args.texttime + '</td>';
    };

    var addrow = function (args) {
      var classes = 'WMJSTimeSelector-tr';

      if (args.isLoaded == true) {
        classes += ' WMJSTimeSelector-col-loaded';
      }
      if (args.value == currentValue) {
        classes += ' WMJSTimeSelector-col-selected';
      }
      // console.log(args.value+"=="+currentValue);
      return "<tr class='" + classes + "'>" + addcol(args) + '</tr>';
    };

   // console.log(_this.values);
    var args = {};
    for (var j = 0; j < _this.values.length; j++) {
      args.index = j;
      args.value = _this.values[j];
      args.text = args.value.replace(/T/g, ' | ');
      args.text = args.text.replace(/Z/g, ' ');
      args.textdate = args.value.split('T')[0];
      args.texttime = args.value.split('T')[1];
      args.texttime = args.texttime.split(':')[0] + ':' + args.texttime.split(':')[1] + 'z';
      args.isLoaded = checkIfThisTimeValueIsLoaded(args.value);
//      console.log(args.isLoaded);
      timeTableHTML += addrow(args);
    }

    timeTableHTML += '</table>';

    var html = '';
    html += timeTableHTML;

    $(timeChooserElement).html(html);

    var selectRow = function (t) {
      var index = ($(t.target).parent().find('td').first().html());
      var v = _this.values[index];
      beforeCallback(_this.values[index]);
    };

    var hoverRow = function (t) {
      if (isDown == false) return;
      selectRow(t);
    };

    $(_this.element).find('.WMJSTimeSelector-tr').mouseover(hoverRow);
     // $(_this.element).find(".WMJSTimeSelector-tr").click(selectRow);
    $(_this.element).find('.WMJSTimeSelector-tr').mousedown(selectRow);
  };

  var isDown = false;   // Tracks status of mouse button
  $(document).mousedown(function () {
    isDown = true;      // When mouse goes down, set isDown to true
  })
  .mouseup(function () {
    isDown = false;    // When mouse goes up, set isDown to false
  });

  $(_this.element).bind('mousewheel', function (e) {
      // console.log(e.originalEvent.deltaY);
    var p = 0;
    try {
      if (isDefined(e.originalEvent.deltaY)) {
        p = e.originalEvent.deltaY;
      }
    } catch (e) {
    }
    if (p == 0) {
      if (e.originalEvent.wheelDelta / 120 > 0) {
        p = -1;
      } else {
        p = 1;
      }
    }

    if (p < 0) {
      backward.click();
    } else {
      forward.click();
    }
  });
};
