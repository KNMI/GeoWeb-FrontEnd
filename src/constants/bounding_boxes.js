// These work for EPSG:3857 projection (mercator)
//          bottom left/upper right (y/x)
const NL = { title: 'Netherlands', bbox: [314909.3659069278, 6470493.345653814, 859527.2396033217, 7176664.533565958] };
const NL_NORTHSEA = { title: 'NL + North Sea', bbox: [1960.19, 6551456.69, 846923.65, 7404195.89] };
const WESTERN_EUROPE = { title: 'Western Europe', bbox: [-1180632.97, 4310394.19, 2049131.83, 9243688.99] };
const EUROPE = { title: 'Europe', bbox: [-1490353.42, 4112245.37, 6853336.48, 12083665.89] };
const BONAIRE = { title: 'Bonaire', bbox: [-7780684.59, 1234792.98, -7398676.19, 1536426.81] };
const SABA_EUST = { title: 'Saba & St. Eustatius', bbox: [-7049353.17, 1966625.68, -6997395.27, 2010569.51] };
const N_AMERICA = { title: 'North America', bbox: [-20025908.67, 2289213.11, -5323913.87, 13468619.02] };
const AFRICA = { title: 'Africa', bbox: [-2866702.01, -4305254.33, 5895029.92, 4750064.45] };
const ASIA = { title: 'Asia', bbox: [2731570.69, 356319.28, 20019217.39, 13468334.39] };
const AUSTRALIA = { title: 'Australia', bbox: [10666107.54, -5730599.41, 17966528.52, 1237663.02] };
export const BOUNDING_BOXES = [NL, NL_NORTHSEA, WESTERN_EUROPE, EUROPE,
  BONAIRE, SABA_EUST, N_AMERICA, AFRICA, ASIA, AUSTRALIA];
