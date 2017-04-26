import axios from 'axios';
import validator from 'validator';
import { BACKEND_SERVER_URL } from '../constants/backend';

export var PresetURLWasLoaded = false;

export function LoadURLPreset (props) {
  if (PresetURLWasLoaded === true) {
    return;
  }
  PresetURLWasLoaded = true;

  let presetName = '';
  const queryStringParts = window.location.href.split('?');
  if (queryStringParts.length !== 2) {
    return;
  }
  const queryString = queryStringParts[1].split('#')[0];
  /* istanbul ignore next */
  if (queryString.length !== 0) {
    const urlParts = queryString.split('&');
    for (let j = 0; j < urlParts.length; j++) {
      const kvp = urlParts[j].split('=');
      if (kvp.length === 2 && kvp[0] === 'url') {
        presetName = kvp[1];
      }
    }

    if (validator.isUUID(presetName) === false) {
      return;
    }
    axios({
      method: 'get',
      url: BACKEND_SERVER_URL + '/store/read',
      params:{ type:'urlpresets', name:presetName },
      withCredentials: true,
      responseType: 'json'
    }).then(src => {
      const obj = JSON.parse(src.data.payload);
      props.dispatch(props.actions.setPreset(obj));
    }).catch(error => {
      console.error(error);
    });
  }
}

export function SaveURLPreset (presetName, presetObj, callbackfunction) {
  /* istanbul ignore next */
  axios({
    method: 'post',
    url: BACKEND_SERVER_URL + '/store/create',
    params:{ type:'urlpresets', name:presetName },
    data: presetObj,
    withCredentials: true,
    responseType: 'json'
  }).then(src => {
    if (src.data.message === 'ok') {
      callbackfunction({ status:'ok', presetName:presetName, message: 'ok' });
    } else {
      callbackfunction({ status:'failed', message: src.data.message });
    }
  }).catch(error => {
    console.error(error);
    console.error(error.data);
    callbackfunction({ status:'failed', message: 'failed' });
  });
}
