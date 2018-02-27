import axios from 'axios';

/*
  Reads the list of locations from the backend server,
  Succes:  the callback is triggered with either a location.
  Fail: the callback is triggered with  nothing
*/
export const ReadLocations = (url, callback, failure) => {
  axios({
    method: 'get',
    url: url,
    params: { type: 'locations', name: 'locations' },
    withCredentials: true,
    responseType: 'json'
  }).then((src) => {
    if (src.data.message === 'ok') {
      callback(src.data.payload);
    }
  }).catch((error) => {
    if (failure) {
      failure(`Loading default list, because: ${error.response.data.error}`);
    }
    callback();
  });
};
/*
  Saves the list of locations to the backend server
*/
export const SaveLocations = (url, data, failure) => {
  axios({
    method: 'post',
    url: url,
    params: { type: 'locations', name: 'locations' },
    data,
    withCredentials: true,
    responseType: 'json'
  }).then((src) => {
    /* istanbul ignore next */
    if (src.data.message === 'ok') {
      this.loadLocations();
    } else if (failure) {
      failure(src.data.message);
    }
  }).catch((error) => {
    if (failure) {
      failure(`something went wrong${error}`);
    }
  });
};
