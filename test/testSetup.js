import chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import dirtyChai from 'dirty-chai';
import { requestAnimationFrame } from 'request-animation-frame';
import sinonChai from 'sinon-chai';
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
const { JSDOM } = require('jsdom');

chai.use(chaiAsPromised);
chai.use(dirtyChai);
chai.use(sinonChai);
configure({ adapter: new Adapter() });

global.expect = chai.expect;
global.chai = chai;
global.sinon = sinon;
global.should = chai.should();

// https://github.com/tmpvar/jsdom/issues/1782
function mockCanvas (window) {
  window.HTMLCanvasElement.prototype.getContext = function () {
    return {
      fillRect: function () { },
      clearRect: function () { },
      getImageData: function (x, y, w, h) {
        return {
          data: new Array(w * h * 4)
        };
      },
      canvas: function () {
        return {
          height: 150,
          width: 150
        };
      },
      putImageData: function () { },
      createImageData: function () { return []; },
      setTransform: function () { },
      drawImage: function () { },
      save: function () { },
      fillText: function () { },
      restore: function () { },
      beginPath: function () { },
      moveTo: function () { },
      lineTo: function () { },
      closePath: function () { },
      stroke: function () { },
      translate: function () { },
      scale: function () { },
      rotate: function () { },
      arc: function () { },
      fill: function () { },
      measureText: function () {
        return { width: 0 };
      },
      transform: function () { },
      rect: function () { },
      clip: function () { }
    };
  };

  window.HTMLCanvasElement.prototype.toDataURL = function () {
    return '';
  };
}

const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true
});
const { window } = jsdom;
mockCanvas(window);

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
