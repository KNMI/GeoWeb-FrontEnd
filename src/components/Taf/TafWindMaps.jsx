/**
 * Maps to construct TAC from JSON Wind and vice versa.
 */

export const windUnknownMap = {
  VRB: 'VRB'
};

const windUnknownInverse = {};
Object.entries(windUnknownMap).map(entry => { windUnknownInverse[entry[1]] = entry[0]; });
export const windUnknownInverseMap = windUnknownInverse;

export const windUnitMap = {
  KT: 'KT',
  MPS: 'MPS'
};

const windUnitInverse = {};
Object.entries(windUnitMap).map(entry => { windUnitInverse[entry[1]] = entry[0]; });
export const windUnitInverseMap = windUnitInverse;
