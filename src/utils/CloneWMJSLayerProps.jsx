import { registerWMJSLayer } from './ReactWMJSTools';

/*
  Creates a cloneable properties object from the WMJSLayer instance
  This properties object can be cloned, used with immer and can reside in the redux state.
*/
export const cloneWMJSLayerProps = (wmjsLayer) => {
  let layer = {};
  registerWMJSLayer(wmjsLayer, wmjsLayer.id);
  layer.id = wmjsLayer.id;
  layer.active = wmjsLayer.active;
  layer.service = wmjsLayer.service;
  layer.getmapURL = wmjsLayer.service;
  layer.getfeatureinfoURL = wmjsLayer.service;
  layer.getlegendgraphicURL = wmjsLayer.service;
  layer.name = wmjsLayer.name;
  layer.title = wmjsLayer.title || '<no title specified>';
  let service = {} || wmjsLayer.WMJSService;
  layer.WMJSService = {
    title: service.title || '<no title specified>',
    service: service.service
  };
  if (wmjsLayer.getgraphinfoURL) layer.getgraphinfoURL = wmjsLayer.getgraphinfoURL;
  if (wmjsLayer.style) { layer.currentStyle = wmjsLayer.style; }
  if (wmjsLayer.currentStyle) { layer.currentStyle = wmjsLayer.currentStyle; }
  if (wmjsLayer.sldURL) { layer.sldURL = wmjsLayer.sldURL; }
  if (wmjsLayer.format) layer.format = wmjsLayer.format; else layer.format = 'image/png';
  if (wmjsLayer.opacity) { layer.opacity = wmjsLayer.opacity; }
  if (wmjsLayer.title) layer.title = wmjsLayer.title;
  if (wmjsLayer.enabled === false) layer.enabled = false; else layer.enabled = true;
  if (wmjsLayer.keepOnTop === true) layer.keepOnTop = true;
  if (wmjsLayer.transparent === true) { layer.transparent = true; }
  if (wmjsLayer.transparent === false) { layer.transparent = false; }
  layer.dimensions = [];
  if (wmjsLayer.dimensions && wmjsLayer.dimensions.length) {
    for (let j = 0; j < wmjsLayer.dimensions.length; j++) {
      layer.dimensions.push({
        name:wmjsLayer.dimensions[j].name,
        title:wmjsLayer.dimensions[j].title,
        units:wmjsLayer.dimensions[j].units,
        currentValue:wmjsLayer.dimensions[j].currentValue,
        defaultValue:wmjsLayer.dimensions[j].defaultValue
      });
    }
  }
  return layer;
};
