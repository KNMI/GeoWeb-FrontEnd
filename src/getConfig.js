/*
  Configuration is loaded from two configuration files:
    1) configDefault.js in ./src/static
    2) config.js in ./src/static

  The second configuration file may be empty or even missing.
  These configuration files reside in the root folder (dist) when built with npm run deploy:prod.
  config.js should never be part of the repo, therefore it is added to .gitignore
*/

let configDefault = require('./static/configDefault');

export const getConfig = function () {
  let c;
  if (typeof (config) === 'undefined') {
    // eslint-disable-next-line no-undef
    c = Object.assign({}, configDefault);
  } else {
    // eslint-disable-next-line no-undef
    c = Object.assign({}, configDefault, config || {});
  }
  console.log('Using config:', c);
  return c;
};
