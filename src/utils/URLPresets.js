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
      props.dispatch(props.panelsActions.setPanelLayout(obj.display.type));
    }
    if (obj.layers) {
      // This is tricky because all layers need to be restored in the correct order
      // So first create all panels as null....
      const newPanels = [null, null, null, null];
      const promises = [];
      obj.layers.forEach((panel, panelIdx) => {
        // Then for each panel initialize it to this object where layers is an empty array with the
        // length of the layers in the panel, as it needs to be inserted in a certain order. For the baselayers
        // this is irrelevant because the order of overlays is not relevant
        newPanels[panelIdx] = { 'layers': new Array(panel.length), 'baselayers': [] };
        panel.forEach((layer, i) => {
          // Create a Promise for parsing all WMJSlayers because we can only do something when ALL layers have been parsed
          promises.push(new Promise((resolve, reject) => {
            // eslint-disable-next-line no-undef
            const wmjsLayer = new WMJSLayer(layer);
            wmjsLayer.parseLayer((newLayer) => {
              if (layer.overlay || layer.keepOnTop) {
                newLayer.overlay = true;
                newLayer.keepOnTop = true;
              }
              resolve({ layer: newLayer, panelIdx: panelIdx, index: i });
            });
          }));
        });
      });
      // Once that happens, insert the layer in the appropriate place in the appropriate panel
      Promise.all(promises).then((layers) => {
        layers.forEach((layerDescription) => {
          const { layer, panelIdx, index } = layerDescription;
          // TODO: Better way to figure out apriori if it's and overlay
          if (layer.overlay || (layer.WMJSService.title ? layer.WMJSService.title.toLowerCase() === 'overlay' : false)) {
            if (!layer.keepOnTop && layer.keepOnTop !== false) {
              layer.keepOnTop = true;
            }
            newPanels[panelIdx].baselayers.push(layer);
          } else {
            newPanels[panelIdx].layers[index] = layer;
          }
        });

        // Beware: a layer can still contain null values because a layer might have been a null value
        // also, panels may have had no layers in them
        props.dispatch(props.panelsActions.setPresetLayers(newPanels));
      });
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
