import { WEBSERVER_URL } from '../static/urls.json';

console.log('WEBSERVER_URL:', WEBSERVER_URL);
/* TODO /ogc/ URL is not allowed to be put in the code, make configurable! */
export const MODEL_LEVEL_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=HARM_N25_ML&`;
export const HARMONIE_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=HARM_N25&`;
export const HARMONIE_ML_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=HARM_N25_ML&`;
export const OVERLAY_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=OVL&`;
export const OBSERVATIONS_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=OBS&`;
export const RADAR_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=RADAR&`;
export const LIGHTNING_URL = 'http://bvmlab-218-41.knmi.nl/cgi-bin/WWWRADAR3.cgi?';
export const SATELLITE_URL = `${WEBSERVER_URL}/ogc/adaguc-services/adagucserver?DATASET=SAT&`;
console.log('MODEL_LEVEL_URL:', MODEL_LEVEL_URL);
