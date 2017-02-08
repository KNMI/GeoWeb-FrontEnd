
  var GFITimeElevationWindow = function (element) {
    this.t = function () {
      return 123;
    };
    var _this = this;
    var webMapJS;

    this.setSize = function (w, h) {
      w = w - 80;
      h = h - 70;

      element.width(w);
      element.height(h);

      var ctx = element.find('.timeaxis').get(0).getContext('2d');
      ctx.canvas.height = 50;
      ctx.canvas.width = w;
      ctx = element.find('.heightaxis').get(0).getContext('2d');
      ctx.canvas.height = h;
      ctx.canvas.width = 60;
      webMapJS.setSize(w, h);
      webMapJS.draw();
    };
    // http://bhw485.knmi.nl:8080/adagucviewer/examples/GFI.php

    element.html(
    '<table class="gfi_table">' +
    '<tr class="gfi_table_tr"><td class="gfi_table_td"><canvas class="heightaxis" class="gfi_nomarginpadding"  ></canvas></td><td class="gfi_table_td"><div class="gfi_nomarginpadding gfi_mainmap" style="width:1200px;height:600px;"></div></td><td><div class="legend"></div></td></tr>' +
    '<tr class="gfi_table_tr"><td class="gfi_table_td"></td><td><canvas class="timeaxis"  class="gfi_nomarginpadding"   ></canvas><td class="gfi_table_td"></td></tr>' +
    '</table>');

    var mapEl = element.find('.gfi_mainmap').get(0);

    webMapJS = new WMJSMap(mapEl);
    webMapJS.hideScaleBar();
    webMapJS.displayLegendInMap(false);
    webMapJS.getOverlayElement().css('border', '1px solid black');
    _this.setSize(element.width(), element.height());

    this.updateBBOX = function (bbox) {
      /* Draw time axis X */
      var ctx = element.find('.timeaxis').get(0).getContext('2d');
      ctx.fillStyle = '#FFF';
      ctx.font = '10px Arial';

      ctx.fillRect(0, 0, webMapJS.getWidth(), 50);
      var hour = -1;

      for (var j = Math.round(bbox.left); j < Math.round(bbox.right); j = j + 10000) {
        var d = new Date(j);
        if (hour == -1) {
          hour = d.getUTCHours();
        }
        if (hour != d.getUTCHours()) {
          ctx.fillStyle = '#000000';

          var x = ((j - bbox.left) / (bbox.right - bbox.left)) * webMapJS.getWidth();
          ctx.beginPath();
          ctx.moveTo(x - 1, 0);
          ctx.lineTo(x - 1, 10);
          ctx.stroke();
          var txt = d.getUTCHours();
          ctx.fillText(txt, x - ctx.measureText(txt).width / 2 - 1, 20);
          hour = d.getUTCHours();
        }
      }
      ctx.font = '14px Arial';
      ctx.fillText('time UTC (h)', webMapJS.getWidth() / 2 - 100, 38);

      /* Draw height axis Y */
      ctx = element.find('.heightaxis').get(0).getContext('2d');
      ctx.font = '10px Arial';
      ctx.fillStyle = '#FFF';
      ctx.fillRect(0, 0, 60, webMapJS.getHeight());
      ctx.textAlign = 'right';

      var m1000 = -1.1;
      var stepH = 1;
      if (Math.abs(Math.round(bbox.top) - Math.round(bbox.bottom)) / 1000 > 100) {
        return;
      }
      for (var j = Math.round(bbox.bottom); j < Math.round(bbox.top); j = j + 1) {
        var d = Math.floor(j / 1000);
        if (m1000 == -1.1) {
          m1000 = d; ;
        }
        if (m1000 != d) {
          ctx.fillStyle = '#000000';

          var y = ((j - bbox.top) / (bbox.bottom - bbox.top)) * webMapJS.getHeight();

          ctx.beginPath();
          ctx.moveTo(50, y);
          ctx.lineTo(60, y);
          ctx.stroke();
          var txt = j;
          ctx.fillText(txt, 48, y + 3);

          m1000 = d;
        }
      }
      ctx.save();
      ctx.translate(5, webMapJS.getHeight() / 2 - 50);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '14px Arial';
      ctx.fillText('height (m)', 5, 6);
      ctx.restore();
    };

    this.drawLegend = function () {
      var layer = webMapJS.getLayers()[0];
      var legendUrl = webMapJS.getLegendGraphicURLForLayer(layer);
      element.find('.legend').html('<img class="legendimg" src="' + legendUrl + '&TRANSPARENT=TRUE"/>');
    };

    webMapJS.addListener('onupdatebbox', _this.updateBBOX, true);
//     webMapJS.addListener("onlegendready",_this.drawLegend,true);

    webMapJS.setProjection('GFI:TIME_ELEVATION', [new Date('2016-04-01T00:00:00Z').getTime(), 0, new Date('2016-04-02T00:00:00Z').getTime(), 15270]);

    _this.updateBBOX(webMapJS.getProjection().bbox);

    _this.getWebMapJS = function () {
      return webMapJS;
    };
  };

