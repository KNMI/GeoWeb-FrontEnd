// ========================================================
// BackEnd Home
// ========================================================
import { getConfig } from '../getConfig';
export var { BACKEND_SERVER_URL } = getConfig();
export var BACKEND_SERVER_XML2JSON = `${BACKEND_SERVER_URL}/XML2JSON?`;
export var TAFS_URL = BACKEND_SERVER_URL;
// export const TAFS_URL = 'http://bhw485.knmi.nl:8090';
