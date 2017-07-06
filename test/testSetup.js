const { JSDOM } = require('jsdom');
import chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import dirtyChai from 'dirty-chai';
import { requestAnimationFrame } from 'request-animation-frame';
import sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(dirtyChai);
chai.use(sinonChai);

global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;
global.should = chai.should();

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;
const { document } = window;
if (!document.requestAnimationFrame) {
  document.requestAnimationFrame = requestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
  jsdom.requestAnimationFrame = requestAnimationFrame;
}

global.document = document;
global.window = window;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
