/**
 * Maps to construct TAC from JSON Visibility and vice versa.
 */

export const visibilityUnitMap = {
  M: 'M',
  KM: 'KM'
};

const visibilityUnitInverse = {};
Object.entries(visibilityUnitMap).forEach(entry => { visibilityUnitInverse[entry[1]] = entry[0]; });
export const visibilityUnitInverseMap = visibilityUnitInverse;
