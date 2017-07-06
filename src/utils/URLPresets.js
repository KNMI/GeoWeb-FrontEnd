import axios from 'axios'
import validator from 'validator'
import {BACKEND_SERVER_URL} from '../constants/backend'

export var PresetURLWasLoaded = false

export const _getURLParameter = (windowLocationHref, key) => {
  const queryStringParts = windowLocationHref.split('?')
  if (queryStringParts.length !== 2) {
    return
  }
  const queryString = queryStringParts[1].split('#')[0]
  if (queryString.length !== 0) {
    const urlParts = queryString.split('&')
    for (let j = 0; j < urlParts.length; j++) {
      const kvp = urlParts[j].split('=')
      if (kvp.length === 2 && kvp[0] === key) {
        return kvp[1]
      }
    }
  }
}

export const _loadPreset = (props, presetName, failure) => {
  if (validator.isUUID(presetName) === false) {
    if (failure) {
      failure('invalid preset URL detected')
    }
    return
  }
  axios({
    method: 'get',
    url: BACKEND_SERVER_URL + '/store/read',
    params: {type: 'urlpresets', name: presetName},
    withCredentials: true,
    responseType: 'json'
  }).then((src) => {
    const obj = JSON.parse(src.data.payload)
    if (obj.display) {
      props.dispatch(props.mapActions.setLayout(obj.display.type))
    }
    if (obj.layers) {
      props.dispatch(props.layerActions.setPreset(obj.layers))
    }
    if (obj.area) {
      props.dispatch(props.mapActions.setCut({name: 'Custom', bbox: [0, obj.area.bottom, 1, obj.area.top]}))
    }
  }).catch((error) => {
    if (failure) {
      failure(error)
    }
  })
}

export const LoadURLPreset = (props, failure) => {
  if (PresetURLWasLoaded === true) {
    return
  }
  PresetURLWasLoaded = true

  let presetName = _getURLParameter(window.location.href, 'presetid')

  if (!presetName) {
    /* No preset URL was found */
    return
  }
  _loadPreset(props, presetName, failure)
}

export function SaveURLPreset (presetName, presetObj, callbackfunction) {
  /* istanbul ignore next */
  axios({
    method: 'post',
    url: BACKEND_SERVER_URL + '/store/create',
    params: {type: 'urlpresets', name: presetName},
    data: presetObj,
    withCredentials: true,
    responseType: 'json'
  }).then((src) => {
    if (src.data.message === 'ok') {
      callbackfunction({status: 'ok', presetName: presetName, message: 'ok'})
    } else {
      callbackfunction({status: 'failed', message: src.data.message})
    }
  }).catch((error) => {
    console.error(error)
    console.error(error.data)
    callbackfunction({status: 'failed', message: 'failed'})
  })
};
