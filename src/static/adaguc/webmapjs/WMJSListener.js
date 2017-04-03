/*
 * Name        : WMJSListener
 * Description : Provides basic functionality for a callback mechanism
 * Author      : MaartenPlieger (plieger at knmi.nl)
 * Copyright KNMI
 */
function WMJSListener () {
  var callBacks = [];
  var numCallBacks = 0;
  var suspendedEvents = [];
  var _this = this;
  function CallBackFunction () {
    this.name = undefined;
    this.functionpointer = undefined;
    this.finished = 0;
    this.keepOnCall = false;
  };

  // Add multiple functions which will be called after the event with the same name is triggered
  this.addToCallback = function (name, functionpointer, keepOnCall) {
    // console.log('adding listener ', name);
    var cbp = -1;// callbackpointer
    if (!keepOnCall) {
      keepOnCall = false;
    }
    for (var j = 0; j < numCallBacks; j++) {
      // A callback list index pointer. if finished==1, then this index may be replaced by a new one.
      if (callBacks[j].finished === 1) { cbp = j; break; }
      // If the current callback already exist, we will simply keep it
      if (callBacks[j].name === name && callBacks[j].functionpointer === functionpointer) {
        // callBacks[j].timesAdded++;
        // console.log('listener already added: ', name);
        callBacks[j].keepOnCall = keepOnCall;
        return false;
      }
    }
    if (cbp === -1) {
      cbp = numCallBacks;
      numCallBacks++;
      callBacks[cbp] = new CallBackFunction();
    } else {
      // console.log('replacing old unused listener: ', name);
    }
    callBacks[cbp].name = name;
    callBacks[cbp].functionpointer = functionpointer;
    callBacks[cbp].finished = 0;
    callBacks[cbp].keepOnCall = keepOnCall;
    // callBacks[j].timesAdded = 0;
    return true;
  };

  this.removeEvents = function (name, f) {
    for (var j = 0; j < numCallBacks; j++) {
      if (callBacks[j].finished === 0) {
        if (callBacks[j].name === name) {
          if (!f) {
            callBacks[j].finished = 1;
          } else if (callBacks[j].functionpointer === f) {
            callBacks[j].finished = 1;
          }
        }
      }
    }
  };

  this.suspendEvent = function (name) {
   // console.log("Suspending "+name);
    suspendedEvents[name] = true;
  };
  this.resumeEvent = function (name) {
   // console.log("Resuming "+name);
    suspendedEvents[name] = false;
  };

  // Trigger an event with a name
  this.triggerEvent = function (name, param) {
    if (suspendedEvents[name] === true) {
      // console.log(name+" is suspended");
      return;
    }
    let returnList = [];
    var no = 0;
    for (var j = 0; j < numCallBacks; j++) {
      if (callBacks[j].finished === 0) {
        if (callBacks[j].name === name) {
          if (callBacks[j].keepOnCall === false) {
            callBacks[j].finished = 1;
          }
          try {
            // console.log('triggering '+callBacks[j].name+' nr '+no);
            no++;
            returnList.push(callBacks[j].functionpointer(param, _this));
          } catch (e) {
            console.log('Error for event ' + name + ' with ' + param);
            console.log(e);
          }
        }
      }
    }
    return returnList;
  };
};
