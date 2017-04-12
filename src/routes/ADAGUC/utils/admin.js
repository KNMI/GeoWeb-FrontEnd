
import axios from 'axios';
import { BACKEND_SERVER_URL } from '../constants/backend';

export const ReadLocations = (callback) => {
  axios({
    method: 'get',
    url: BACKEND_SERVER_URL + '/admin/read',
    params:{ type:'locations', name:'locations' },
    withCredentials: true,
    responseType: 'json'
  }).then(src => {
    callback(JSON.parse(src.data.payload));
  }).catch(error => {
    alert('Loading default list, because: ' + error.response.data.error);
    callback();
  });
};
