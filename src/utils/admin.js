import axios from 'axios';
import { BACKEND_SERVER_URL } from '../constants/backend';

/*
  Reads the list of locations from the backend server,
  Succes:  the callback is triggered with either a location.
  Fail: the callback is triggered with  nothing
*/
/* istanbul ignore next */
export function ReadLocations (callback) {
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

/*
  Saves the list of locations to the backend server
*/
export function SaveLocations (data) {
  axios({
    method: 'post',
    url: BACKEND_SERVER_URL + '/admin/create',
    params:{ type:'locations', name:'locations' },
    data:data,
    withCredentials: true,
    responseType: 'json'
  }).then(src => {
    /* istanbul ignore next */
    if (src.data.message === 'ok') {
      this.loadLocations();
    } else {
      alert(src.data.message);
    }
  }).catch(error => {
    /* istanbul ignore next */
    console.error(error);
  });
};
