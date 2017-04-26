import jsdom from 'jsdom';
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

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;
if (!doc.requestAnimationFrame) {
  doc.requestAnimationFrame = requestAnimationFrame;
  win.requestAnimationFrame = requestAnimationFrame;
  jsdom.requestAnimationFrame = requestAnimationFrame;
}

global.document = doc;
global.window = win;

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});
