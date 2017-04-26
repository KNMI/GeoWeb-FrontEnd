import { LoadURLPreset } from './URLPresets';

describe('(URLPresets)', () => {
  it('can load a preset', () => {
    const asdf = LoadURLPreset({ actions: { setPreset: () => null }, dispatch: () => null });
    expect(asdf).to.equal(undefined);
  });
});
