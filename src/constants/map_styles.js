/* maps with type twms are mapped to basemaps.json which is used by ADAGUC WebMapJS TileRenderer */

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

const WORLDMAP_LIGHT_GREY_CANVAS = {
  name: 'WorldMap_Light_Grey_Canvas',
  title: 'KNMI GeoWeb WorldMap Light Grey Canvas',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const OPENSTREETMAP_NL = {
  name: 'OpenStreetMap_NL',
  title: 'KNMI GeoWeb OpenStreetMap NL',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const OPENSTREETS_NL = {
  name: 'OpenStreets_NL',
  title: 'KNMI GeoWeb OpenStreets NL',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const POSITRON_NL = {
  name: 'Positron_NL',
  title: 'KNMI GeoWeb Positron NL',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const POSITRON_NL_NOLABELS = {
  name: 'Positron_NL_NoLabels',
  title: 'KNMI GeoWeb Positron NL No Labels',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const KLOKANTECH_BASIC_NL = {
  name: 'Klokantech_Basic_NL',
  title: 'KNMI GeoWeb Klokantech Basic NL',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const KLOKANTECH_BASIC_NL_NOLABELS = {
  name: 'Klokantech_Basic_NL_NoLabels',
  title: 'KNMI GeoWeb Klokantech Basic NL No Labels',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const OSM_BLOSSOM_NL = {
  name: 'OSM_Blossom_NL',
  title: 'KNMI GeoWeb OSM Blossom NL',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const WORLDMAP = {
  name: 'WorldMap',
  title: 'KNMI GeoWeb WorldMap',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const OSM_ANTARCTICA = {
  name: 'OSM_Antarctica',
  title: 'KNMI GeoWeb OSM Antarctica',
  type: 'twms',
  enabled: true,
  dimensions: []
};

const OPENSTREETMAP_SERVICE = {
  name: 'OpenStreetMap_Service',
  title: 'OpenStreetMap Service',
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

export const MAP_STYLES = [OPENSTREETMAP_SERVICE, KNMI_NATURALEARTH2, MWS_STYLE, WORLDMAP_LIGHT_GREY_CANVAS, OPENSTREETMAP_NL, OPENSTREETS_NL, POSITRON_NL, POSITRON_NL_NOLABELS, KLOKANTECH_BASIC_NL, KLOKANTECH_BASIC_NL_NOLABELS, OSM_BLOSSOM_NL, WORLDMAP, OSM_ANTARCTICA, ESRI_ARCGIS_CANVAS, ESRI_ARCGIS_TOPO, ESRI_ARCGIS_SAT, ESRI_ARCGIS_OCEAN];
