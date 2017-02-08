var WMJSProcessing = function (options) {
  var WPSURL = options.url;
  var _this = this;
  var running = false;

  if (!options.failure) {
    options.failure = function (message) {
      alert(dump(message));
    };
  }

  /* WPS Success callback */
  var executeSuccess = function (data) {
    var namespace = 'wps:';
    var processAccepted;
    try {
      processAccepted = data[namespace + 'ExecuteResponse'][namespace + 'Status'][namespace + 'ProcessAccepted'].value;
    } catch (e) {
    }

    if (!isDefined(processAccepted)) {
      var reason = '';
      try {
        reason = dump(data['ExceptionReport']['Exception'].attr);
        options.failure({ 'message':'Process was not accepted, ExceptionReport:\n' + reason });
      } catch (e) {
        if (data.error) {
          if (!data.message)data.message = data.error;
          options.failure(data);
          return;
        }
        reason = dump(data);
        options.failure({ 'message':'Process was not accepted (dump):\n' + reason });
      }

      return;
    }

    var statusLocation = data[namespace + 'ExecuteResponse'].attr.statusLocation;

    var timer = new WMJSTimer();

    /* Called on successfull statuslocation polling */
    var WPSMonitorSuccess = function (data) {
      if (running == false) return;
      var processCompleted;
      var percentCompleted;
      var statusMessage;
      var processFailed;
      var exceptionMessage;

      if (data.error) {
    	  processFailed = true;
        exceptionMessage = data.error;
      }

      try {
        processFailed = true;
        exceptionMessage = dump(data['ExceptionReport']['Exception']);
      } catch (e) {
      }

      try {
        processFailed = data[namespace + 'ExecuteResponse'][namespace + 'Status'][namespace + 'ProcessFailed'];
        exceptionMessage = 'Process failed';
        exceptionMessage = data[namespace + 'ExecuteResponse'][namespace + 'Status'][namespace + 'ProcessFailed'][namespace + 'ExceptionReport']['ows:Exception']['ows:ExceptionText'].value;
      } catch (e) {
      }

      if (isDefined(processFailed)) {
        running = false;
        options.failure({ 'message':exceptionMessage });
        return;
      }

      try {
        processCompleted = data[namespace + 'ExecuteResponse'][namespace + 'Status'][namespace + 'ProcessSucceeded'].value;
      } catch (e) {
      }

      try {
        percentCompleted = data[namespace + 'ExecuteResponse'][namespace + 'Status'][namespace + 'ProcessStarted'].attr.percentCompleted;
        statusMessage = data[namespace + 'ExecuteResponse'][namespace + 'Status'][namespace + 'ProcessStarted'].value;

        if (statusMessage.indexOf('processstarted') == 0) {
          statusMessage = statusMessage.substr('processstarted'.length);
        }
      } catch (e) {
      }

      if (!isDefined(processCompleted)) {
        options.progress(parseFloat(percentCompleted), statusMessage);
      } else {
        // Process is complete!
//        console.log("Complete!");
//        console.log(data);
        var processOutput = data[namespace + 'ExecuteResponse'][namespace + 'ProcessOutputs'][namespace + 'Output'];

        options.progress(100, 'completed');
        options.success(processOutput, data);
        running = false;
      }
    };

    var makeWPSMonitorCall = function () {
      $.ajax({
        dataType: 'jsonp',
        url: xml2jsonrequestURL + 'request=' + URLEncode(statusLocation),
        data:'',
        success: WPSMonitorSuccess
      }).fail(function (e) {
        running = false;
        options.failure({ 'message':'<h1>Invalid JSON returned from server:</h1><hr/>' + e.responseText });
        return;
      });

      if (running) {
        timer.init(1000, makeWPSMonitorCall);
      }
    };
    makeWPSMonitorCall();
  };

  /* Make the WPS execute request */
  _this.execute = function (identifier, wpsarguments) {
    running = true;
    var wpsExecuteRequest = WPSURL + 'service=WPS&request=execute&identifier=' + identifier + '&version=1.0.0&storeExecuteResponse=true&status=true&';// &startLon=5&startLat=10&startHeight=0

    wpsExecuteRequest += 'datainputs=';

    var dataInputs = '';
    for (var key in wpsarguments) {
      if (typeof (wpsarguments[key]) === 'object') {
        for (var j in wpsarguments[key]) {
          if (dataInputs.length > 0)dataInputs += ';';
          dataInputs += key + '=' + encodeURIComponent(wpsarguments[key][j]);
        }
      } else {
        if (dataInputs.length > 0)dataInputs += ';';
        dataInputs += key + '=' + encodeURIComponent(wpsarguments[key]);
      }
    }
    wpsExecuteRequest += dataInputs;
    $.ajax({
      dataType: 'jsonp',
      url: xml2jsonrequestURL,
      data:{ 'request':wpsExecuteRequest },
      success: executeSuccess
    }).fail(function (e) { options.failure({ 'message':e.responseText }); ; });
  };
};

