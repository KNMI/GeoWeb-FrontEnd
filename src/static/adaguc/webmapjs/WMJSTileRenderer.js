var WMJSTileRenderer = function (currentBBOX, newBBOX, srs, width, height, ctx, bgMapImageStore, tileOptions, layerName) {
  if (!layerName) {
    console.error('layerName not defined');
    return;
  }
  /* Temporal mappings from bgmaps.cgi service names to names defined here */
  if (layerName === 'streetmap') layerName = 'OSM';
  if (layerName === 'pdok') layerName = 'OSM';
  if (layerName === 'naturalearth2') layerName = 'NaturalEarth2';
  let tileLayer = tileOptions[layerName];
  if (!tileLayer) {
    console.error('Tiled layer with name ' + layerName + ' not found');
    return;
  }
  let tileSettings = tileLayer[srs];

  /* If current map projection is missing in the tilesets, try to find an alternative */
  if (!tileSettings) {
    for (var tileOption in tileOptions) {
      if (tileOptions.hasOwnProperty(tileOption)) {
        for (var epsgCode in tileOptions[tileOption]) {
          if (tileOptions[tileOption].hasOwnProperty(epsgCode)) {
            if (epsgCode === srs) {
              console.log('Projection not supported by tileserver: Falling back to ', tileOption, epsgCode);
              tileSettings = tileOptions[tileOption][epsgCode];
            }
          }
        }
      }
    }
  }

  let pi = Math.PI;
  /* Default settings for OSM Mercator */
  let tileSize = 256;
  let initialResolution = 2 * pi * 6378137 / tileSize;
  let originShiftX = -2 * pi * 6378137 / 2.0;
  let originShiftY = 2 * pi * 6378137 / 2.0;

  if (tileSettings.tileSize) tileSize = tileSettings.tileSize;
  if (tileSettings.resolution) initialResolution = tileSettings.resolution;
  if (tileSettings.origX) originShiftX = tileSettings.origX;
  if (tileSettings.origY) originShiftY = tileSettings.origY;
  let screenWidth = width;
  let bboxw = currentBBOX.right - currentBBOX.left;
  let originShiftX2 = initialResolution * tileSize + originShiftX;
  let originShiftY2 = originShiftY - initialResolution * tileSize;
  let tileSetWidth = originShiftX2 - originShiftX;
  let tileSetHeight = originShiftY - originShiftY2;
  let levelF = Math.log((Math.abs(originShiftX2 - originShiftX)) / ((bboxw / screenWidth) * tileSize)) / Math.log(2);
  let level = parseInt(levelF);

  let drawBGTiles = function (level) {
    let home = tileSettings.home;
    let tileServerType = tileSettings.tileServerType; // 'osm' or 'argisonline'
    if (level < tileSettings.minLevel) level = tileSettings.minLevel;
    if (level > tileSettings.maxLevel) level = tileSettings.maxLevel;
    let numTilesAtLevel = Math.pow(2, level);
    let numTilesAtLevelX = tileSetWidth / ((initialResolution / numTilesAtLevel) * tileSize);// / Math.abs(originShiftY / originShiftX);
    let numTilesAtLevelY = tileSetHeight / ((initialResolution / numTilesAtLevel) * tileSize);
    let tilenleft = parseInt(Math.round((((((currentBBOX.left - originShiftX) / (tileSetWidth)) * (numTilesAtLevelX))) / 1) + 0.5));
    let tilenright = parseInt(Math.round((((((currentBBOX.right - originShiftX) / (tileSetWidth)) * (numTilesAtLevelX))) / 1) + 0.5));
    let tilentop = parseInt(Math.round((numTilesAtLevelY - ((((currentBBOX.bottom - originShiftY2) / tileSetHeight) * numTilesAtLevelY))) + 0.5));
    let tilenbottom = parseInt(Math.round((numTilesAtLevelY - ((((currentBBOX.top - originShiftY2) / tileSetHeight) * numTilesAtLevelY))) + 0.5));

    let tileXYZToMercator = function (level, x, y) {
      let tileRes = initialResolution / Math.pow(2, level);
      let p = { x: x * tileRes + (originShiftX), y:  originShiftY - y * tileRes };
      return p;
    };
    let getTileBounds = function (level, x, y) {
      let p1 = tileXYZToMercator(level, (x) * tileSize, (y) * tileSize);
      let p2 = tileXYZToMercator(level, (x + 1) * tileSize, (y + 1) * tileSize);
      return { left:p1.x, bottom:p1.y, right:p2.x, top: p2.y };
    };

    let getPixelCoordFromGeoCoord = function (coordinates, b, w, h) {
      var x = (w * (coordinates.x - b.left)) / (b.right - b.left);
      var y = (h * (coordinates.y - b.top)) / (b.bottom - b.top);
      return { x:parseFloat(x), y:parseFloat(y) };
    };

    let drawTile = function (ctx, level, x, y) {
      let bounds = getTileBounds(level, x, y);
      let bl = getPixelCoordFromGeoCoord({ x: bounds.left, y: bounds.bottom }, newBBOX, width, height);
      let tr = getPixelCoordFromGeoCoord({ x: bounds.right, y: bounds.top }, newBBOX, width, height);

      let imageURL;
      if (tileServerType === 'osm') {
        imageURL = home + level + '/' + x + '/' + (y) + '.png';
      }
      if (tileServerType === 'arcgisonline' || tileServerType === 'wmst') {
        imageURL = home + level + '/' + y + '/' + (x);
      }
      let image = bgMapImageStore.getImage(imageURL);
      if (image.isLoaded() === false && image.hasError() === false && image.isLoading() === false) {
        image.load();
      }

      if (image.isLoaded()) {
        try {
          ctx.drawImage(image.getElement()[0], parseInt(bl.x), parseInt(bl.y), parseInt(tr.x - bl.x) + 1, parseInt(tr.y - bl.y) + 1);
        } catch (e) {
        }
      }
    };
    if (srs === 'EPSG:4326' || srs === 'EPSG:4258') {
      numTilesAtLevelX *= 2;
    }
    if (tilenbottom < 1)tilenbottom = 1; if (tilenbottom > numTilesAtLevelY)tilenbottom = numTilesAtLevelY;
    if (tilenleft < 1)tilenleft = 1; if (tilenleft > numTilesAtLevelX)tilenleft = numTilesAtLevelX;
    if (tilentop < 1)tilentop = 1; if (tilentop > numTilesAtLevelY)tilentop = numTilesAtLevelY;
    if (tilenright < 1)tilenright = 1; if (tilenright > numTilesAtLevelX)tilenright = numTilesAtLevelX;
    if (tilentop - tilenbottom > 10) return;
    if (tilenright - tilenleft > 10) return;
    for (let ty = tilenbottom - 1; ty < tilentop; ty++) {
      for (let tx = tilenleft - 1; tx < tilenright; tx++) {
        drawTile(ctx, level, tx, ty);
      }
    }
  };
  drawBGTiles(level);
};

var WMJSTileRendererTileSettings = {
  arcGisCanvas: {
    'EPSG:3857': {
      home: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/',
      minLevel: 1,
      maxLevel: 16,
      tileServerType: 'arcgisonline',
      copyRight: 'Basemap copyright: 2013 Esri, DeLorme, NAVTEQ'
    },
    'EPSG:28992': {
      home: 'http://services.arcgisonline.nl/arcgis/rest/services/Basiskaarten/Canvas/MapServer/tile/',
      minLevel: 1,
      maxLevel: 12,
      origX:-285401.92,
      origY:903401.92,
      resolution:3440.64,
      tileServerType: 'arcgisonline',
      copyRight: 'Basiskaart bronnen: Esri Nederland, Esri, Kadaster, CBS en Rijkswaterstaat'
    }
  },
  arcGisTopo: {
    'EPSG:3857': {
      home: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/',
      minLevel: 1,
      maxLevel: 19,
      tileServerType: 'arcgisonline',
      copyRight: 'Basemap sources: Esri, DeLorme, NAVTEQ, TomTom, Intermap, increment P Corp., GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, ' +
        'IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    },
    'EPSG:28992': {
      home: 'http://services.arcgisonline.nl/arcgis/rest/services/Basiskaarten/Topo/MapServer/tile/',
      minLevel: 1,
      maxLevel: 12,
      origX:-285401.92,
      origY:903401.92,
      resolution:3440.64,
      tileServerType: 'arcgisonline',
      copyRight: 'Basiskaart bronnen: Esri Nederland, Esri, Kadaster, CBS, Min VROM, Rijkswaterstaat en gemeenten: Rotterdam, Breda, Tilburg'
    }
  },
  arcGisOceanBaseMap:  {
    home: 'http://services.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/',
    minLevel: 1,
    maxLevel: 19,
    tileServerType: 'arcgisonline',
    copyRight: 'Basemap sources: Esri, GEBCO, NOAA, National Geographic, DeLorme, NAVTEQ, Geonames.org, and other contributors'
  },
  arcGisSat: {
    'EPSG:4326': {
      home: 'http://services.arcgisonline.com/ArcGIS/rest/services/ESRI_Imagery_World_2D/MapServer/tile/',
      minLevel: 1,
      maxLevel: 15,
      tileServerType: 'arcgisonline',
      origX:-180,
      origY:90,
      resolution:0.3515625,
      tileSize:512
    },
    'EPSG:3857': {
      home: 'http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/',
      minLevel: 1,
      maxLevel: 18,
      tileServerType: 'arcgisonline'
    }
  },
  OSM: {
    'EPSG:3857': {
      home: 'http://b.tile.openstreetmap.org/',
      minLevel: 1,
      maxLevel: 16,
      tileServerType: 'osm'
    },
    'EPSG:28992': {
      home: 'http://services.arcgisonline.nl/ArcGIS/rest/services/Basiskaarten/PDOK_BRT/MapServer/tile/',
      minLevel: 1,
      maxLevel: 12,
      origX:-285401.92,
      origY:903401.92,
      resolution:3440.64,
      tileServerType: 'arcgisonline',
      copyRight: 'Basiskaart bronnen: PDOK, Kadaster, OpenStreetMap'
    }
  },
  NaturalEarth2: {
    'EPSG:3411': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG3411/',
      minLevel: 1,
      maxLevel: 6,
      origX:-12400000,
      origY:12400000,
      resolution:96875,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:3412': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG3412/',
      minLevel: 1,
      maxLevel: 6,
      origX:-12400000,
      origY:12400000,
      resolution:96875,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:3575': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG3575/',
      minLevel: 1,
      maxLevel: 6,
      origX:-13000000,
      origY:13000000,
      resolution:101562.5,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:3857': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG3857/',
      minLevel: 1,
      maxLevel: 7,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:4258': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG4326/',
      minLevel: 1,
      maxLevel: 6,
      origX:-180,
      origY:90,
      resolution:0.703125,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:4326': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG4326/',
      minLevel: 1,
      maxLevel: 6,
      origX:-180,
      origY:90,
      resolution:0.703125,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:28992': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG28992/',
      minLevel: 1,
      maxLevel: 5,
      origX:-2999000,
      origY:2995500,
      resolution:23437,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:32661': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG32661/',
      minLevel: 1,
      maxLevel: 7,
      origX:-5000000.0,
      origY:4000000.0,
      resolution:58593.75,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    },
    'EPSG:54030': {
      home: 'http://geoservices.knmi.nl/tiledbasemaps/NaturalEarth2/EPSG54030/',
      minLevel: 1,
      maxLevel: 7,
      origX:-17000000.0,
      origY:8625830.0,
      resolution:132812.5,
      tileServerType: 'wmst',
      copyRight: 'NPS - Natural Earth II'
    }
  }
};
