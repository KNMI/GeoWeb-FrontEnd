/**
  * WMJSDimension Class
  * Keep all information for a single dimension, like time.
  * Author : MaartenPlieger (plieger at knmi.nl)
   * Copyright KNMI
  */
WMJSDateOutSideRange = 'outside range';
WMJSDateTooEarlyString = 'date too early';
WMJSDateTooLateString = 'date too late';
function WMJSDimension (config) {
  this.name = undefined;          // Name of the dimension, e.g. 'time'
  this.units = undefined;         // Units of the dimension, e.g. 'ISO8601'
  this.values = undefined;        // Values of the dimension, according to values defined in WMS specification, e.g. 2011-01-01T00:00:00Z/2012-01-01T00:00:00Z/P1M or list of values.
  this.currentValue = undefined;  // The current value of the dimension, changed by setValue and read by getValue
  this.defaultValue = undefined;
  this.parentLayer = undefined;
  this.linked = true;
  var _this = this;
  if (isDefined(config)) {
    if (isDefined(config.name)) { this.name = config.name; }
    if (isDefined(config.units)) { this.units = config.units; }
    if (isDefined(config.values)) { this.values = config.values; }
    if (isDefined(config.currentValue)) { this.currentValue = config.currentValue; }
    if (isDefined(config.defaultValue)) { this.defaultValue = config.defaultValue; }
    if (isDefined(config.parentLayer)) { this.parentLayer = config.parentLayer; }
    if (isDefined(config.linked)) { this.linked = config.linked; }
  }

  var initialized = false;
  var timeRangeDurationDate;// Used for timerange (start/stop/res)
  var allDates = [];        // Used for individual timevalues
  var type;// Can be timestartstopres, timevalues, anyvalue
  var allValues = [];
  var initialize = function (_this) {
    if (initialized == true) return;
    if (!isDefined(_this.values)) return;

    initialized = true;
    if (_this.units == 'ISO8601') {
      if (_this.values.indexOf('/') > 0) {
        type = 'timestartstopres';
        timeRangeDurationDate = new parseISOTimeRangeDuration(_this.values);
        // alert(timeRangeDurationDate.getTimeSteps()+" - "+_this.values);
      } else {
        // TODO Parse 2007-03-27T00:00:00.000Z/2007-03-31T00:00:00.000Z/PT1H,2007-04-07T00:00:00.000Z/2007-04-11T00:00:00.000Z/PT1H
        type = 'timevalues';
      }
    } else {
      type = 'anyvalue';
      _this.linked = false;
    }
    if (type != 'timestartstopres') {
      var values = _this.values.split(',');
      for (var j = 0; j < values.length; j++) {
        var valuesRanged = values[j].split('/');
        if (valuesRanged.length == 3) {
          var start = parseFloat(valuesRanged[0]);
          var stop = parseFloat(valuesRanged[1]);
          var res = parseFloat(valuesRanged[2]);
          stop += res;
          if (start > stop)stop = start;
          if (res <= 0)res = 1;
          for (var j = start; j < stop; j = j + res) {
            allValues.push(j);
          }
        } else {
          allValues.push(values[j]);
        }
      }

      if (type == 'timevalues') {
        for (var j = 0; j < allValues.length; j++) {
          allDates[j] = parseISO8601DateToDate(allValues[j]);
        }
      }
    }

    if (!isDefined(_this.defaultValue)) {
      _this.defaultValue = _this.getValueForIndex(0);
    }
    if (!isDefined(_this.currentValue)) {
      _this.currentValue = _this.getValueForIndex(0);
    }
  };

  /**
    * Returns the current value of this dimensions
    */
  _this.getValue = function () {
    if (isDefined(this.currentValue)) {
      return this.currentValue;
    }
    return this.defaultValue;
  };

  /**
    * Set current value of this dimension
    */
  this.setValue = function (value) {
    if (value == WMJSDateOutSideRange || value == WMJSDateTooEarlyString || value == WMJSDateTooLateString) {
      return;
    }
    this.currentValue = value;
  };

  this.setClosestValue = function (newValue) {
    this.currentValue = this.getClosestValue(newValue);
  };

  this.getNextClosestValue = function (newValue) {
    var closestValue = this.getClosestValue(newValue);
    var index = this.getIndexForValue(closestValue);
    var nextValue = this.getValueForIndex(index + 1);
    // Only return future dates
    if (!nextValue || nextValue === 'date too early' || moment(newValue) >= moment(nextValue)) {
      return null;
    }
    return nextValue;
  };
  this.getClosestValue = function (newValue) {
    var index = -1;
    var _value = WMJSDateOutSideRange;
    try {
      index = this.getIndexForValue(newValue);

      _value = this.getValueForIndex(index);
    } catch (e) {
      if (typeof (e) === 'number') {
        if (e == 0)_value = WMJSDateTooEarlyString; else _value = WMJSDateTooLateString;
      }
    }

    if (newValue == 'current' || newValue == 'default' || newValue == '') {
      _value = this.defaultValue;
    } else if (newValue == 'latest') {
      _value = this.getValueForIndex(dim.size() - 1);
    } else if (newValue == 'earliest') {
      _value = this.getValueForIndex(0);
    } else if (newValue == 'middle') {
      var middleIndex = (this.size() / 2) - 1;
      if (middleIndex < 0) middleIndex = 0;
      _value = this.getValueForIndex(middleIndex);
    }
    // alert(_value);
    return _value;
  };

  /**
    * Get dimension value for specified index
    */
  this.getValueForIndex = function (index) {
    initialize(this);
    if (index < 0) {
      if (index == -1) {
        return WMJSDateTooEarlyString;
      }
      if (index == -2) {
        return WMJSDateTooLateString;
      }
      return -1;
    }
    if (type == 'timestartstopres') {
      try {
        return timeRangeDurationDate.getDateAtTimeStep(index).toISO8601();
      } catch (e) {}
      return timeRangeDurationDate.getDateAtTimeStep(index);
    }
    if (type == 'timevalues') return allValues[index];
    if (type == 'anyvalue') return allValues[index];
  };

  /**
    * same as getValueForIndex
    */
  this.get = function (index) {
    return this.getValueForIndex(index);
  };

  /**
    * Get index value for specified value. Returns the index in the store for the given time value, either a date or a iso8601 string can be passes as input.
    * @param value Either a JS Date object or an ISO8601 String

    * @return The index of the value.  If outSideOfRangeFlag is false, a valid index will always be returned. If outSideOfRangeFlag is true: -1 if the index is not in the store, but is lower than available values, -2 if the index is not in store, but is higher than available values
    */
  this.getIndexForValue = function (value, outSideOfRangeFlag) {
    initialize(this);
    if (!isDefined(outSideOfRangeFlag))outSideOfRangeFlag = true;
    if (typeof (value) === 'string') {
      if (value == 'current' && this.defaultValue != 'current') {
        return this.getIndexForValue(this.defaultValue);
      }
    }
    // {
    //   const v = value;
    //   try{
    //     console.log("getIndexForValue" + v + 'type'+type);
    //   }catch(e){

    //   }
    // }
    if (type == 'timestartstopres') {
      try {
        if (typeof (value) === 'string') {
          return timeRangeDurationDate.getTimeStepFromISODate(value, outSideOfRangeFlag);
        }
        return timeRangeDurationDate.getTimeStepFromDate(value, outSideOfRangeFlag);
      } catch (e) {
        // error("WMSJDimension::getIndexForValue,1: "+e);
        if (parseInt(e) == 0) return -1; else return -2;
      }
    }
    if (type == 'timevalues') {
      try {
        var dateToFind = parseISO8601DateToDate(value).getTime();
        var minDistance;
        var foundIndex = 0;
        for (var j = 0; j < allValues.length; j++) {
          var distance = (allDates[j].getTime() - dateToFind);
          if (distance < 0)distance = -distance;
          // debug(j+" = "+distance+" via "+allDates[j].getTime()+" and "+dateToFind);
          if (j == 0)minDistance = distance;
          if (distance < minDistance) {
            minDistance = distance;
            foundIndex = j;
          }
        }
        return foundIndex;
      } catch (e) {
        error('WMSJDimension::getIndexForValue,2: ' + e);
        return -1;
      }

      /* var dateToFind = parseISO8601DateToDate(value).getTime();
      allValues[j]
      var max = allValues.length-1;
      var min = 0;

      var average = parseInt((max-min)/2); */
    }

    if (type == 'anyvalue') {
      for (var j = 0; j < allValues.length; j++) {
        if (allValues[j] == value) return j;
      }
    }

    return -1;
  };

  /**
    * Get number of values
    */
  this.size = function () {
    initialize(this);
    if (type == 'timestartstopres') return timeRangeDurationDate.getTimeSteps();
    if (type == 'timevalues' || type == 'anyvalue') {
      return allValues.length;
    }
  };

  /**
   * Clone this dimension
   */
  this.clone = function () {
    var dim = new WMJSDimension();
    dim.name = this.name;
    dim.units = this.units;
    dim.values = this.values;
    dim.currentValue = this.currentValue;
    dim.defaultValue = this.defaultValue;
    dim.parentLayer = this.parentLayer;
    dim.linked = this.linked;
    return dim;
  };
  initialize(this);
};
