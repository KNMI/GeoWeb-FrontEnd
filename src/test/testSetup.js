// ---------------------------------------
// Test Environment Setup
// ---------------------------------------
//
// =============================================== \\
// DO NOT TOUCH THIS ORDER OF IMPORTS OR CHAI.USE! \\
// =============================================== \\
import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import dirtyChai from 'dirty-chai';
import sinonChai from 'sinon-chai';
import chaiEnzyme from 'chai-enzyme';

chai.use(chaiAsPromised);
chai.use(dirtyChai);
chai.use(sinonChai);
chai.use(chaiEnzyme());

global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;
global.should = chai.should();

const project = require('./project.config');

// ---------------------------------------
// Require Tests
// ---------------------------------------
// for use with karma-webpack-with-fast-source-maps
const __karmaWebpackManifest__ = [];
const inManifest = (path) => __karmaWebpackManifest__.includes(path);

// require all `tests/**/*.spec.js`
const testsContext = require.context('../', true, /\.(test|spec)\.js$/);

// only run tests that have changed after the first pass.
const testsToRun = testsContext.keys().filter(inManifest);
(testsToRun.length ? testsToRun : testsContext.keys()).forEach(testsContext);

// require all `src/**/*.js` except for `main.js`, `reducers.js` and files ending in
// `.spec.js(x)` or `.test.js(x)` (for isparta coverage reporting)
if (project.globals.__COVERAGE__) {
  const context = require.context('../', true, /\.js$/);
  context.keys().forEach(context);
}
