
var WMJSCoverage = function (options) {
  this.name = undefined;
  this.service = undefined;
  this.dimensions = [];
  this.supportedProjections = [];
  this.width = undefined;
  this.height = undefined;
  this.cellsizeX = undefined;
  this.cellsizeY = undefined;
  this.originX = undefined;
  this.originY = undefined;
  this.nativeCRS = undefined;
  this.nativeFormat = undefined;
  this.formats = [];
  var _this = this;
  this.setDimension = function (name, value) {
    var dim = { name:name, value:value, currentValue:value };
    this.dimensions.push(dim);
  };
  if (isDefined(options)) {
    _this.name = options.name;
    _this.service = options.service;
  }
};

var WCJSRequest = function (service, name, succes, fail) {
  // Make the regetCapabilitiesJSONquest
  var getcapreq = xml2jsonrequestURL + 'request=';
  if (service.indexOf('?') == -1) {
    service += '?';
  }
  debug('GetCapabilities:');
  var url = service + '&service=WCS&REQUEST=DescribeCoverage&COVERAGE=' + name;
  // alert(url);
  debug("<a target=\'_blank\' href='" + url + "'>" + url + '</a>', false);
  getcapreq += URLEncode(url);
  // Error message in case the request goes wrong
  var errormessage = function (message) {
    fail(I18n.unable_to_do_getcapabilities.text + ':\n' + getcapreq + '\n' + I18n.result.text + ':\n' + message);
  };

  function _succes (obj) {
    obj.service = service;
    obj.name = name;
    succes(obj);
  }

  $.ajax({
    dataType: 'jsonp',
    url: getcapreq,
    success: _succes,
    error:errormessage
  });
//   MakeJSONRequest(getcapreq,succes,errormessage);
};

var parseDescribeCoverage = function (jsonDoc, _coverage) {
  var coverage;
  if (_coverage) {
    coverage = _coverage;
  } else {
    coverage = new WMJSCoverage();
  }
  coverage.service = jsonDoc.service;
  try {
    coverage.name = jsonDoc.CoverageDescription.CoverageOffering.name.value;
  } catch (e) {
    alert('This layer has no Web Coverage Service.');
    return;
  }
  coverage.title = jsonDoc.CoverageDescription.CoverageOffering.label.value;
  coverage['abstract'] = jsonDoc.CoverageDescription.CoverageOffering.description.value;
  var lonLatEnvelope1 = jsonDoc.CoverageDescription.CoverageOffering.lonLatEnvelope['gml:pos'][0].value.replaceAll(' ', ',');
  var lonLatEnvelope2 = jsonDoc.CoverageDescription.CoverageOffering.lonLatEnvelope['gml:pos'][1].value.replaceAll(' ', ',');
  coverage.lonlatbox = new WMJSBBOX(lonLatEnvelope1 + ',' + lonLatEnvelope2);

  // Get projections and boundingboxes
  var spatialDomain = toArray(jsonDoc.CoverageDescription.CoverageOffering.domainSet.spatialDomain['gml:Envelope']);

  for (var j = 0; j < spatialDomain.length; j++) {
    var envelope = spatialDomain[j].attr.srsName;
//          alert(envelope);
    var srs = spatialDomain[j].attr.srsName;
    var lonLatEnvelope1 = spatialDomain[j]['gml:pos'][0].value.replaceAll(' ', ',');
    var lonLatEnvelope2 = spatialDomain[j]['gml:pos'][1].value.replaceAll(' ', ',');
    var bbox = new WMJSBBOX(lonLatEnvelope1 + ',' + lonLatEnvelope2);
    coverage.supportedProjections.push({ srs:srs, bbox:bbox.toString() });
  }

  // Get gridsize:
  var rectifiedGrid = jsonDoc.CoverageDescription.CoverageOffering.domainSet.spatialDomain['gml:RectifiedGrid']['gml:limits']['gml:GridEnvelope']['gml:high'].value.split(' ');
  coverage.width = parseInt(rectifiedGrid[0]) + 1;
  coverage.height = parseInt(rectifiedGrid[1]) + 1;

  coverage.cellsizeX = parseFloat(jsonDoc.CoverageDescription.CoverageOffering.domainSet.spatialDomain['gml:RectifiedGrid']['gml:offsetVector'][0].value.split(' ')[0]);
  coverage.cellsizeY = parseFloat(jsonDoc.CoverageDescription.CoverageOffering.domainSet.spatialDomain['gml:RectifiedGrid']['gml:offsetVector'][1].value.split(' ')[1]);

  coverage.originX = jsonDoc.CoverageDescription.CoverageOffering.domainSet.spatialDomain['gml:RectifiedGrid']['gml:origin']['gml:pos'].value.split(' ')[0];
  coverage.originY = jsonDoc.CoverageDescription.CoverageOffering.domainSet.spatialDomain['gml:RectifiedGrid']['gml:origin']['gml:pos'].value.split(' ')[1];

  if (jsonDoc.CoverageDescription.CoverageOffering.supportedCRSs.nativeCRSs) {
    coverage.nativeCRS = jsonDoc.CoverageDescription.CoverageOffering.supportedCRSs.nativeCRSs.value;
  } else {
    coverage.nativeCRS = 'EPSG:4326';
  }

  coverage.nativeFormat = jsonDoc.CoverageDescription.CoverageOffering.supportedFormats.attr.nativeFormat;

  var formats = toArray(jsonDoc.CoverageDescription.CoverageOffering.supportedFormats.formats);

  for (var j = 0; j < formats.length; j++) {
    coverage.formats.push(formats[j].value);
  }

  return coverage;
};
