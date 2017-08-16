/**
* WMJSBBOX Class
* Creates a WebMapJS bounding box based on 4 numeric values
* Creates a WebMapJS bounding box based on 1 string with commaseparated numeric values
* Creates a WebMapJS bounding box based on an exisiting WebMapJS bounding box.
* When no parameters are given, a global latlon bbox is generated.
* Author : MaartenPlieger (plieger at knmi.nl)
* Copyright KNMI
*/
function WMJSBBOX (left, bottom, right, top) {
  this.left = -180;  // 0
  this.bottom = -90; // 1`
  this.right = 180;  // 2
  this.top = 90;     // 3

/**
  * Clone an existing BBOX
  */
  this.clone = function (_bbox) {
    if (_bbox == undefined)_bbox = this;
    var bbox = new WMJSBBOX();
    bbox.left = _bbox.left;
    bbox.bottom = _bbox.bottom;
    bbox.right = _bbox.right;
    bbox.top = _bbox.top;
    return bbox;
  };

  this.copy = function(bbox){
    this.setBBOX(bbox);
  }
/**
  * setBBOX method, see class description for details.
  */
  this.setBBOX = function (left, bottom, right, top) {
  // Make sure that left is defined, otherwise fill in defaults and leave

    if (left === undefined || left === null) {
      this.left = -180;  // 0
      this.bottom = -90; // 1`
      this.right = 180;  // 2
      this.top = 90;     // 3
      return;
    }
  // Check if we recieve more than one parameter by checking the second bottom parameter.
    if (!bottom) {
    // Otherwise it can be a bbox object or a string in the form "left,bottom,right,top"

      if (typeof (left) === 'object') {
      // a bbox object is given, so it is not a string
        var a = left;
      // alert(typeof(a.left)+" "+a.length);
        if (a.length === undefined || a.length === null) {
          left = a.left;
          bottom = a.bottom;
          right = a.right;
          top = a.top;
        } else {
          left = parseFloat(a[0]);
          bottom = parseFloat(a[1]);
          right = parseFloat(a[2]);
          top = parseFloat(a[3]);
        }
      } else {
      // a string like "-180,-90,180,90" is given
        try {
          var a = left.split(',');
          if (a.length !== 4)error("Invalid map bounding box: '" + left + "'");
          left = parseFloat(a[0]);
          bottom = parseFloat(a[1]);
          right = parseFloat(a[2]);
          top = parseFloat(a[3]);
        } catch (e) {
        }
      }
    }
  // Some safety checks on obtained values...
    if (left === undefined || bottom === undefined || right === undefined || top === undefined ||
        left === null || bottom === null || right === null || top === null) {
    // error("Invalid BBOX: "+this.toString());
      if (left == undefined)left = -180;
      if (right == undefined)right = 180;
      if (bottom == undefined)bottom = -90;
      if (top == undefined)top = 90;
    }
  // Assign values to the bbox object
    this.left = left;
    this.bottom = bottom;
    this.right = right;
    this.top = top;
  };

  /*
   * Compares two boundingboxes and returns true if they are equal
   */
  this.equals = function (bbox, bottom, right, top) {
    if (!bbox) {
      return false;
    }
    if (bottom !== undefined) {
      if (this.left === bbox && this.right === right && this.top === top && this.bottom === bottom) {
        return true;
      }
    }
    if (typeof (bbox) === 'object') {
      if (this.left === bbox.left && this.right === bbox.right && this.top === bbox.top && this.bottom === bbox.bottom) {
        return true;
      }
    } else {
      var a = bbox.split(',');
      if (a.length !== 4) console.log('Invalid map bounding box: ' + bbox);
      left = parseFloat(a[0]);
      bottom = parseFloat(a[1]);
      right = parseFloat(a[2]);
      top = parseFloat(a[3]);
      let matches = 0;
      if (this.left === left) matches++;
      if (this.right === right) matches++;
      if (this.top === top) matches++;
      if (this.bottom === bottom) matches++;

      if (matches >= 2) {
        return true;
      }
    }
    return false;
  };

/*
  * Returns the current BBOX as a string, useful for generating WMS requests.
  */
  this.toString = function () {
    return (this.left + ',' + this.bottom + ',' + this.right + ',' + this.top);
  };
  this.setBBOX(left, bottom, right, top);
};
