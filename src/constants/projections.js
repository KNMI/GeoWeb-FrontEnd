const MERCATOR = { title: 'Mercator', code: 'EPSG:3857', bbox: [220000, 6500000, 1000000, 7200000] };
const EUROPE_STEREOGRAPHIC = { title: 'Europe Stereographic', code: 'EPSG:32661', bbox: [-2776118.977564746, -6499490.259201691, 9187990.785775745, 971675.53185069] };
const RD = { title: 'Amersfoort / Rijksdriehoeksmeting (verbeterd)', code: 'EPSG:28992', bbox: [-350000, 125000, 700000, 900000] };
const LATLON = { title: 'Lat/Lon', code: 'EPSG:4326', bbox: [-180, -90, 180, 90] };
export const PROJECTIONS = [MERCATOR, EUROPE_STEREOGRAPHIC, RD, LATLON];
