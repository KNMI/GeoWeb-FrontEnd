const OSM_STYLE = {
  name: 'OSM',
  title: 'OpenStreetMap',
  type: 'twms',
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
