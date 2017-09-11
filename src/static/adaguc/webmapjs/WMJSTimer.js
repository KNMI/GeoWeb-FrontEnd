/**
  * WMJSTimer Class
  * Author MaartenPlieger (plieger at knmi.nl)
  * Copyright KNMI
  */
function WMJSTimer () {
  /**
   * Set the length of the timer, in milli seconds, after time has elapsed function is called
   * @param secstime Time in milli seconds
   * @param functionhandler Function to call after time is elapsed
   */
  this.init = function (secstime, functionhandler) {
    secs = parseInt((secstime / 10) + 0.5);
    if (secs < 1)secs = 1;
    initsecs = secs;
    timehandler = functionhandler;
    StopTheClock();
    if (secs > 0)StartTheTimer();
  };

  /**
   * Reset the timer
   */
  this.reset = function () {
    secs = initsecs;
  };

  /**
   * Stop the timer
   */
  this.stop = function () {
    StopTheClock();
  };

  var timerID = null;
  var timerRunning = false;
  var delay = 10;
  var secs;
  var initsecs;
  var timehandler = '';
  var i = this;

  function StopTheClock () {
    if (timerRunning)clearTimeout(timerID);
    timerRunning = false;
  }
  function TimeEvent () {
    if (timehandler != '')timehandler();
  }
  function StartTheTimer () {
    if (secs == 0) {
      StopTheClock();
      TimeEvent();
    } else {
      secs = secs - 1;
      timerRunning = true;
      timerID = self.setTimeout(function () { StartTheTimer(); }, delay);
    }
  }
};

var WMJSDebouncer = function () {
  var isRunning = false;
  var milliseconds = 10;
  var stop = false;
  this.init = function (ms, functionhandler) {
    stop = false;
    milliseconds = ms;
    if (milliseconds < 10) milliseconds = 10;
    if (isRunning === false) {
      self.setTimeout(function () { isRunning = false; if (stop === false) { functionhandler(); } }, milliseconds);
      isRunning = true;
    }
  };

  this.stop = function () {
    stop = true;
  };
};
