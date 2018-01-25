import axios from 'axios';
import validator from 'validator';
import { DefaultLocations } from '../constants/defaultlocations';
export var PresetURLWasLoaded = false;

export const _getURLParameter = (windowLocationHref, key) => {
  const queryStringParts = windowLocationHref.split('?');
  if (queryStringParts.length !== 2) {
    return;
  }
  const queryString = queryStringParts[1].split('#')[0];
  if (queryString.length !== 0) {
    const urlParts = queryString.split('&');
    for (let j = 0; j < urlParts.length; j++) {
      const kvp = urlParts[j].split('=');
      if (kvp.length === 2 && kvp[0] === key) {
        return kvp[1];
      }
    }
  }
};

export const _loadPreset = (props, presetName, failure) => {
  if (validator.isUUID(presetName) === false) {
    if (failure) {
      failure('invalid preset URL detected');
    }
    return;
  }
  axios({
    method: 'get',
    url: `${props.urls.BACKEND_SERVER_URL}/store/read`,
    params: { type: 'urlpresets', name: presetName },
    withCredentials: true,
    responseType: 'json'
  }).then((src) => {
    const obj = JSON.parse(src.data.payload);
    if (obj.display) {
      props.dispatch(props.mapActions.setLayout(obj.display.type));
    }
    if (obj.panelsProperties) {
      props.dispatch(props.layerActions.setPreset(obj.panelsProperties));
    }
    if (obj.area) {
      props.dispatch(props.mapActions.setCut({ name: 'Custom', bbox: [obj.area.left, obj.area.bottom, obj.area.right, obj.area.top] }));
    }
  }).catch((error) => {
    if (failure) {
      failure(error);
    }
  });
};

export const LoadURLPreset = (props, failure) => {
  if (PresetURLWasLoaded === true) {
    return;
  }
  PresetURLWasLoaded = true;

  const presetName = _getURLParameter(window.location.href, 'presetid');
  const location = _getURLParameter(window.location.href, 'location');

  const coordinates = DefaultLocations.filter((obj) => obj.name === location);
  if (!presetName) {
    /* No preset URL was found */
    return;
  }
  if (coordinates.length === 1) {
    props.dispatch(props.adagucActions.setCursorLocation(coordinates[0]));
  }
  _loadPreset(props, presetName, failure);
};

export function SaveURLPreset (presetName, presetObj, url, callbackfunction) {
  axios({
    method: 'post',
    url: url,
    params: { type: 'urlpresets', name: presetName },
    data: presetObj,
    withCredentials: true,
    responseType: 'json'
  }).then((src) => {
    if (src.data.message === 'ok') {
      callbackfunction({ status: 'ok', presetName, message: 'ok' });
    } else {
      callbackfunction({ status: 'failed', message: src.data.message });
    }
  }).catch((error) => {
    console.error(error);
    console.error(error.data);
    callbackfunction({ status: 'failed', message: 'failed' });
  });
}
