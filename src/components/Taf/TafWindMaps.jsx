/**
 * Maps to construct TAC from JSON Wind and vice versa.
 */

export const windDirectionMap = {
  VRB: 'VRB'
};

const windDirectionInverse = {};
Object.entries(windDirectionMap).map(entry => { windDirectionInverse[entry[1]] = entry[0]; });
export const windDirectionInverseMap = windDirectionInverse;

export const windUnitMap = {
  KT: 'KT',
  MPS: 'MPS'
};

const windUnitInverse = {};
Object.entries(windUnitMap).map(entry => { windUnitInverse[entry[1]] = entry[0]; });
export const windUnitInverseMap = windUnitInverse;
