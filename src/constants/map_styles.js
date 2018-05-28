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
  transparent: false,
  title: 'KNMI MWS style map',
  format: 'image/png',
  enabled: true,
  dimensions: []
};

export const MAP_STYLES = [OSM_STYLE, KNMI_NATURALEARTH2, MWS_STYLE, ESRI_ARCGIS_CANVAS, ESRI_ARCGIS_TOPO, ESRI_ARCGIS_SAT, ESRI_ARCGIS_OCEAN];
