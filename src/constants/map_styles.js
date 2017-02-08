const OSM_STYLE = {
  service: 'http://geoservices.knmi.nl/cgi-bin/bgmaps.cgi?',
  name: 'streetmap',
  title: 'World base layer',
  format: 'image/gif',
  enabled: true
};
const MWS_STYLE = {
  service: 'http://geoservices.knmi.nl/cgi-bin/worldmaps.cgi?',
  name: 'mwsmap',
  transparent: false,
  title: 'World base layer',
  format: 'image/png',
  enabled: true
};
export const MAP_STYLES = [MWS_STYLE, OSM_STYLE];
