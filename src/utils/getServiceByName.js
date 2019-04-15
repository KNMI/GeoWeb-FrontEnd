import axios from 'axios';
import PromiseWithTimout from '../utils/PromiseWithTimout';
import moment from 'moment';

const _getSourceByName = (sources, name) => {
  if (Object.keys(sources).includes(name)) {
    return sources[name];
  }
  return null;
};

// Return URL of WMS service or null if failed
// @sources The adagucproperties sources object
// @name Name of the service as specified by the name attribute in the result of getServices servlet
// @return URL of WMS service or null if failed
export const GetServiceByName = (sources, name) => {
  let source = _getSourceByName(sources, name);
  if (!source) {
    return;
  }
  if (source.service) {
    return source.service;
  }
  if (source.source && source.source.service) {
    return source.source.service;
  }
  // TODO: we need our own error handling mechanism here, e.g. a dialog showing what errors have occured.
  console.error('Source not found [' + name + ']', sources);
  return null;
};

// Return promise which resolves URL of WMS service or null if failed
// @sources The adagucproperties sources object
// @name Name of the service as specified by the name attribute in the result of getServices servlet
// @return promise which resolves URL of WMS service or null if failed
export const GetServiceByNamePromise = (backendurl, name) => {
  return new Promise((resolve, reject) => {
    // console.log('GetServiceByName');
    GetServices(backendurl).then(
      (sources) => {
        // console.log('GetServiceByName, 13 ok', sources);
        let result = _getSourceByName(sources, name);
        if (result == null) {
          return reject(Error('Source ' + name + ' not found'));
        }
        // console.log('source===', result);
        if (result.source && result.source.service) {
          return resolve(result.source.service);
        }
        return reject(Error('source.service not found for ' + name));
      }
    );
  });
};

/* Promise which resolves all panelsProperties and services */
export const GetServices = (BACKEND_SERVER_URL) => {
  return new Promise((resolve, reject) => {
    const defaultURLs = ['getServices', 'getOverlayServices'].map((url) => BACKEND_SERVER_URL + '/' + url);
    const allURLs = [...defaultURLs];
    let personalUrls = {};
    if (localStorage) {
      personalUrls = JSON.parse(localStorage.getItem('geoweb')).personal_urls;
    }

    // Ensures Promise.all works even when some promises don't resolve
    const reflect = (promise) => {
      return promise.then(
        (v) => { return { 'data':v, 'status': 'resolved' }; },
        (e) => { return { 'error':e, 'status': 'rejected' }; }
      );
    };
    axios.all(allURLs.map((req) => axios.get(req, { withCredentials: true }))).then(
      axios.spread((services, overlays) => {
        const allSources = [...services.data, ...personalUrls, overlays.data[0]];
        const promises = [];
        for (var i = allSources.length - 1; i >= 0; i--) {
          const source = allSources[i];
          var r = new Promise((resolve, reject) => {
            if (!source) {
              return reject(new Error('Source is not working'));
            }
            if (!source.name) {
              return reject(new Error('Source has no name'));
            }
            // eslint-disable-next-line no-undef
            const service = WMJSgetServiceFromStore(source.service);
            if (!service) {
              return reject(new Error('Cannot get service from store'));
            }
            service.getLayerObjectsFlat((layers) => { return resolve({ layers, source }); });
          });
          promises.push(new PromiseWithTimout(r, moment.duration(5000, 'milliseconds').asMilliseconds()));
        }
        const sort = (obj) => Object.keys(obj).sort().reduce((acc, c) => { acc[c] = obj[c]; return acc; }, {});

        Promise.all(promises.map(reflect)).then((res) => {
          const sourcesDic = {};
          res.forEach((promise) => {
            if (promise.status === 'resolved') {
              const { layers, source } = promise.data;
              sourcesDic[source.name] = { layers, source };
            } else {
              console.error(promise);
            }
          });
          // dispatch(adagucActions.setSources(sort(sourcesDic)));
          // console.log(sort(sourcesDic));
          return resolve(sort(sourcesDic));
        });
      })
    ).catch((e) => reject(e));
  });
};
