const OSM_STYLE = {
  service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
  name: 'streetmap',
  title: 'OpenStreetMap',
  type: 'twms', // Can be either wms or twms
  format: 'image/gif',
  enabled: true
};
const MWS_STYLE = {
  service: 'http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
  name: 'mwsmap',
  transparent: false,
  title: 'MWS',
  format: 'image/png',
  enabled: true
};
export const MAP_STYLES = [MWS_STYLE, OSM_STYLE];
