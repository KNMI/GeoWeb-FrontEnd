/**
 * Maps to construct TAC from JSON Clouds and vice versa.
 */

export const amountMap = {
  FEW:'FEW', // 1/8 - 2/8
  SCT: 'SCT', // 3/8 - 4/8
  BKN: 'BKN', // 5/8 - 7/8
  OVC: 'OVC' // 8/8
};

const amountInverse = {};
Object.entries(amountMap).forEach(entry => { amountInverse[entry[1]] = entry[0]; });
export const amountInverseMap = amountInverse;

export const modMap = {
  CB: 'CB', // Cumulonimbus
  TCU: 'TCU' // Towering cumulus
};

const modInverse = {};
Object.entries(modMap).forEach(entry => { modInverse[entry[1]] = entry[0]; });
export const modInverseMap = modInverse;
