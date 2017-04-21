import actions from './adaguc';
import { LOGOUT,
SET_MAP_STYLE,
TOGGLE_ANIMATION
} from '../constants/actions';

describe('(Component) Actions creator', () => {
  it('Exports an object with action creator functions', () => {
    expect(actions).to.exist();
    expect(actions[Object.keys(actions)[0]]).to.be.a('function');
  });

  it('Renders an object with a type and payload', () => {
    const actionObj = actions.setActivePanel(0);
    expect(actionObj).to.exist();
    expect(actionObj).to.be.a('object');
    expect(actionObj).to.have.property('type');
    expect(actionObj).to.have.property('payload');
  });

  it('Renders an object with the passed payload', () => {
    const overlay = { name: 'FIR' };
    const actionObj = actions.addOverlayLayer(overlay);
    expect(actionObj).to.exist();
    expect(actionObj).to.be.a('object');
    expect(actionObj).to.have.property('type');
    expect(actionObj).to.have.property('payload');
    expect(actionObj.payload).to.equal(overlay);
  });

  it('Renders an object with the appropriate style', () => {
    const actionObj = actions.setMapStyle('Awesome');
    expect(actionObj).to.exist();
    expect(actionObj).to.be.a('object');
    expect(actionObj).to.have.property('type');
    expect(actionObj).to.have.property('payload');
    expect(actionObj.type).to.equal(SET_MAP_STYLE);
  });

  it('Can render objects without payloads', () => {
    const actionObj = actions.toggleAnimation();
    expect(actionObj).to.exist();
    expect(actionObj).to.be.a('object');
    expect(actionObj).to.have.property('type');
    expect(actionObj).to.not.have.property('payload');
    expect(actionObj.type).to.equal(TOGGLE_ANIMATION);

    const otherActionObj = actions.logout();
    expect(otherActionObj).to.exist();
    expect(otherActionObj).to.be.a('object');
    expect(otherActionObj).to.have.property('type');
    expect(otherActionObj).to.not.have.property('payload');
    expect(otherActionObj.type).to.equal(LOGOUT);
  });

  it('Can map complex payloads', () => {
    const actionObj = actions.createMap('a', 'b');
    expect(actionObj).to.exist();
    expect(actionObj).to.be.a('object');
    expect(actionObj).to.have.property('type');
    expect(actionObj).to.have.property('payload');
    expect(actionObj.payload).to.have.property('sources');
    expect(actionObj.payload).to.have.property('overlays');
    expect(actionObj.payload.sources).to.equal('a');
    expect(actionObj.payload.overlays).to.equal('b');
  });

  it('Can add default values', () => {
    const layerObj = { name: 'a' };
    const actionObj = actions.addLayer(layerObj);
    expect(actionObj).to.exist();
    expect(actionObj).to.be.a('object');
    expect(actionObj).to.have.property('type');
    expect(actionObj).to.have.property('payload');
    expect(actionObj.payload).to.not.equal(layerObj);
    expect(actionObj.payload.name).to.equal('a');
    expect(actionObj.payload.enabled).to.be.true();
    expect(actionObj.payload.opacity).to.equal(1);
  });

  it('Can validate parameters', () => {
    const validDate = '2017-04-21T10:46:00Z';
    const invalidDate = '@@@@';
    const validActionObj = actions.setTimeDimension(validDate);
    expect(validActionObj).to.exist();
    expect(validActionObj).to.be.a('object');
    expect(validActionObj).to.have.property('type');
    expect(validActionObj).to.have.property('payload');
    expect(validActionObj.payload).to.equal(validDate);

    const invalidActionObj = actions.setTimeDimension(invalidDate);
    expect(invalidActionObj).to.not.exist();
    expect(invalidActionObj).to.be.null();
  });
});
