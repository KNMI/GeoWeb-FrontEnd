import { LoadURLPreset, _getURLParameter, _loadPreset } from './URLPresets';
import moxios from 'moxios';

describe('(URLPresets)', () => {
  beforeEach(() => {
    // import and pass your custom axios instance to this method
    moxios.install();
  });

  afterEach(() => {
    // import and pass your custom axios instance to this method
    moxios.uninstall();
  });
  it('check if presetid is found from URL', () => {
    let presetName = _getURLParameter('http://localhost:3000/?presetid=0169891a-d31e-423c-8936-1618af774472#/blabla', 'presetid');
    expect(presetName).to.equal('0169891a-d31e-423c-8936-1618af774472');
    presetName = _getURLParameter('http://localhost:3000/?presetid=dfas#/blabla', 'blabla');
    expect(presetName).to.equal(undefined);
  });
  it('can load a preset', () => {
    const failureFunction = sinon.spy();
    LoadURLPreset({ panelsActions: { setPreset: () => null }, dispatch: () => null }, failureFunction);
    failureFunction.should.not.have.been.called();
  });
  it('Rejects invalid UUID', () => {
    const failureFunction = sinon.spy();
    _loadPreset({ panelsActions: { setPreset: () => null }, dispatch: () => null }, 'adadad', failureFunction);
    failureFunction.should.have.been.calledOnce();
  });
  it('Accepts valid UUID', (done) => {
    const dispatchSetPreset = sinon.spy();
    // Match against an exact URL value
    moxios.stubRequest('http://localhost:8080/store/read?type=urlpresets&name=0169891a-d31e-423c-8936-1618af774472', {
      status: 200,
      responseText: { payload: '{"payload":""}' }
    });
    _loadPreset({ urls: { BACKEND_SERVER_URL: 'http://localhost:8080' },
      panelsActions: { setPreset: () => {
        dispatchSetPreset();
      } },
      dispatch: () => {} }, '0169891a-d31e-423c-8936-1618af774472');

    moxios.wait(() => {
      dispatchSetPreset.should.not.have.been.called();
      done();
    });
  });
});
