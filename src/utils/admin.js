import axios from 'axios';
import { BACKEND_SERVER_URL } from '../constants/backend';

/*
  Reads the list of locations from the backend server,
  Succes:  the callback is triggered with either a location.
  Fail: the callback is triggered with  nothing
*/
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

/*
  Saves the list of locations to the backend server
*/
export const SaveLocations = (data) => {
  axios({
    method: 'post',
    url: BACKEND_SERVER_URL + '/admin/create',
    params:{ type:'locations', name:'locations' },
    data:data,
    withCredentials: true,
    responseType: 'json'
  }).then(src => {
    if (src.data.message === 'ok') {
      this.loadLocations();
    } else {
      alert(src.data.message);
    }
  }).catch(error => {
    console.error(error);
    console.error(error.data);
    alert('something went wrong: ');
  });
};
