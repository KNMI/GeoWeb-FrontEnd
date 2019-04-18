/**
 * Maps to construct TAC from JSON ChangeType and vice versa.
 */

export const probabilityMap = {
  PROB30:'PROB30', // probability of 30% for a temporary steady change
  PROB40:'PROB40' // probability of 40% for a temporary steady change
};

const probabilityInverse = {};
Object.entries(probabilityMap).forEach(entry => { probabilityInverse[entry[1]] = entry[0]; });
export const probabilityInverseMap = probabilityInverse;

export const typeMap = {
  FM: 'FM', // from - instant, persisting change
  BECMG: 'BECMG', // becoming - gradual / fluctuating change, after which the change is persistent
  TEMPO: 'TEMPO' // temporary fluctuating change
};

const typeInverse = {};
Object.entries(typeMap).forEach(entry => { typeInverse[entry[1]] = entry[0]; });
export const typeInverseMap = typeInverse;

/**
 * For completeness, we note the interpretation of the combinations:
 * 'PROB30 TEMPO', // probability of 30% for a temporary fluctating change
 * 'PROP40 TEMPO' // probability of 40% for a temporary fluctating change
 */
