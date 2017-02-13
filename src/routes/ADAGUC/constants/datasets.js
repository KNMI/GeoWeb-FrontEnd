const HARMONIE_FLUX = {
  title:'Harmonie flux',
  service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.HARM_N25.cgi?',
  name: 'precipitation_flux'
};
const HARMONIE_AIR_TEMP = {
  title:'Harmonie air temp',
  service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.HARM_N25.cgi?',
  name:'air_temperature__at_2m'
};
const RADAR = {
  title: 'Radar',
  service: 'http://geoservices.knmi.nl/cgi-bin/RADNL_OPER_R___25PCPRR_L3.cgi?',
  name: 'RADNL_OPER_R___25PCPRR_L3_COLOR'
};
const SATELLITE_IR = {
  title: 'Satellite',
  service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.SAT.cgi?',
  name: 'IR108'
};
const SATELLITE_CINESAT = {
  title: 'CINESAT',
  service:'http://birdexp07.knmi.nl/cgi-bin/geoweb/adaguc.SAT.cgi?',
  name: 'HRV-COMB'
};
export const DATASETS = [RADAR, HARMONIE_FLUX, HARMONIE_AIR_TEMP, RADAR, SATELLITE_IR, SATELLITE_CINESAT];
