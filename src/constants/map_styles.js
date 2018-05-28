/* maps with type twms are mapped to basemaps.json which is used by ADAGUC WebMapJS TileRenderer */

const OSM_STYLE = {
  name: 'OSM',
  title: 'OpenStreetMap',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_CANVAS = {
  name: 'arcGisCanvas',
  title: 'ArcGIS canvas map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_TOPO = {
  name: 'arcGisTopo',
  title: 'ArcGIS topgraphical map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_SAT = {
  name: 'arcGisSat',
  title: 'ArcGIS satellite map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const ESRI_ARCGIS_OCEAN = {
  name: 'arcGisOceanBaseMap',
  title: 'ArcGIS ocean map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const KNMI_NATURALEARTH2 = {
  name: 'NaturalEarth2',
  title: 'KNMI Natural Earth map',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const MWS_STYLE = {
  service: 'http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
  name: 'mwsmap',
  transparent: true,
  title: 'KNMI MWS style map',
  format: 'image/png',
  enabled: true,
  dimensions: []
};

const INGMAPPING_WORLDMAP = {
  title:'WorldMap',
  name:'WorldMap',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_LIGHT = {
  title:'WorldMap_Light',
  name:'WorldMap_Light',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_CANVAS = {
  title:'WorldMap_Canvas',
  name:'WorldMap_Canvas',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_GREYCANVAS = {
  title:'WorldMap_GreyCanvas',
  name:'WorldMap_GreyCanvas',
  type: 'twms',
  enabled:true
};
const INGMAPPING_WORLDMAP_LIGHT_GRAY_CANVAS = {
  title:'WorldMap_LightGreyCanvas',
  name:'WorldMap_LightGreyCanvas',
  type: 'twms',
  enabled:true
};

export const MAP_STYLES = [OSM_STYLE, KNMI_NATURALEARTH2, MWS_STYLE, ESRI_ARCGIS_CANVAS, ESRI_ARCGIS_TOPO, ESRI_ARCGIS_SAT, ESRI_ARCGIS_OCEAN, INGMAPPING_WORLDMAP,
  INGMAPPING_WORLDMAP_LIGHT, INGMAPPING_WORLDMAP_CANVAS, INGMAPPING_WORLDMAP_GREYCANVAS, INGMAPPING_WORLDMAP_LIGHT_GRAY_CANVAS];
