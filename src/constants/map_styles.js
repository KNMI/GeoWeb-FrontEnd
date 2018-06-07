/* maps with type twms are mapped to basemaps.json which is used by ADAGUC WebMapJS TileRenderer */

const OSM_STYLE = {
  name: 'OSM',
  title: 'OpenStreetMap Service',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const OSM_NL_STYLE = {
  name: 'OpenStreetMap_NL',
  title: 'KNMI GeoWeb OpenStreetMap NL',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_CANVAS = {
  name: 'arcGisCanvas',
  title: 'ESRI ArcGIS canvas map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_TOPO = {
  name: 'arcGisTopo',
  title: 'ESRI ArcGIS topgraphical map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_SAT = {
  name: 'arcGisSat',
  title: 'ESRI ArcGIS satellite map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_OCEAN = {
  name: 'arcGisOceanBaseMap',
  title: 'ESRI ArcGIS ocean map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const KNMI_NATURALEARTH2 = {
  name: 'NaturalEarth2',
  title: 'KNMI Natural Earth Map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const MWS_STYLE = {
  service: 'http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
  name: 'mwsmap',
  transparent: true,
  title: 'KNMI MWS map',
  format: 'image/png',
  enabled: true,
  dimensions: []
};

const INGMAPPING_WORLDMAP = {
  title:'KNMI GeoWeb WorldMap',
  name:'WorldMap',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_LIGHT = {
  title:'KNMI GeoWeb WorldMap Light',
  name:'WorldMap_Light',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_CANVAS = {
  title:'KNMI GeoWeb WorldMap Canvas',
  name:'WorldMap_Canvas',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_GREYCANVAS = {
  title:'KNMI GeoWeb WorldMap Grey Canvas',
  name:'WorldMap_GreyCanvas',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_LIGHT_GRAY_CANVAS = {
  title:'KNMI GeoWeb WorldMap Light Grey Canvas',
  name:'WorldMap_LightGreyCanvas',
  type: 'twms',
  enabled:true
};

export const MAP_STYLES = [OSM_STYLE, KNMI_NATURALEARTH2, MWS_STYLE, INGMAPPING_WORLDMAP,
  INGMAPPING_WORLDMAP_LIGHT, INGMAPPING_WORLDMAP_CANVAS, INGMAPPING_WORLDMAP_GREYCANVAS,
  INGMAPPING_WORLDMAP_LIGHT_GRAY_CANVAS, OSM_NL_STYLE, ESRI_ARCGIS_CANVAS, ESRI_ARCGIS_TOPO, ESRI_ARCGIS_SAT, ESRI_ARCGIS_OCEAN];
