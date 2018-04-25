import { BOUNDING_BOXES } from '../../constants/bounding_boxes';
import { GetServiceByName } from '../../utils/getServiceByName';

export const getPresetForPhenomenon = (p, sources) => {
  const HARMONIE_URL = GetServiceByName(sources, 'Harmonie36');
  const OVERLAY_URL = GetServiceByName(sources, 'OVL');
  const OBSERVATIONS_URL = GetServiceByName(sources, 'OBS');
  const RADAR_URL = GetServiceByName(sources, 'RADAR');
  const LIGHTNING_URL = GetServiceByName(sources, 'LGT');
  const SATELLITE_URL = GetServiceByName(sources, 'SAT');

  const defaultOverlays = [
    {
      service: OVERLAY_URL,
      title: 'FIR',
      name: 'FIR_DEC_2013_EU',
      label: 'FIR',
      overlay: true
    },
    {
      service: OVERLAY_URL,
      title: 'Airfields (5/10 km)',
      name: 'Aviation/airfield_rings_5_10',
      label: 'Airfields (5/10 km)',
      overlay: true
    },
    {
      service: OVERLAY_URL,
      title: 'Airfields (15km)',
      name: 'Aviation/airfield_rings_15',
      label: 'Airfields (15km)',
      overlay: true
    },
    {
      service: OVERLAY_URL,
      title: 'ATSroute',
      name: 'Aviation/atsroute',
      label: 'ATSroute',
      overlay: true
    },
    {
      service: OVERLAY_URL,
      title: 'Countries',
      name: 'countries',
      label: 'Countries',
      overlay: true
    }
  ];
  switch (p) {
    case 'sigmet_layer_TS':
      return (
        {
          area: {
            bottom: BOUNDING_BOXES[1].bbox[1],
            top: BOUNDING_BOXES[1].bbox[3],
            crs: 'EPSG:3857'
          },
          display: {
            npanels: 4,
            type: 'quadsigmet'
          },
          layers: [
            [
              {
                service: RADAR_URL,
                title: 'RADAR',
                name: 'precipitation',
                label: 'Neerslag',
                opacity: 0.8,
                enabled: true,
                overlay: false
              },
              {
                service: RADAR_URL,
                title: 'RADAR',
                name: 'preflits_cri',
                label: 'Preflits CRI',
                opacity: 0.8,
                enabled: true,
                overlay: false
              },
              {
                service: LIGHTNING_URL,
                title: 'LGT',
                name: 'LGT_NL25_LAM_05M',
                label: 'Lightning NL',
                opacity: 0.8,
                enabled: true,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'HRV-COMB',
                label: 'RGB-HRV-COMB',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'precipitation_flux',
                label: 'Prec: Precipitation rate',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'wind__at_pl',
                label: 'Wind vectors (PL)',
                dimensions: {
                  elevation: 700
                },
                enabled: true,
                opacity: 0.8,
                overlay: false
              }
            ],
            [
              {
                type: 'progtemp',
                location: 'EHAM'
              }
            ]
          ]
        }
      );

    case 'sigmet_layer_SEV_TURB':
      return (
        {
          area: {
            bottom: BOUNDING_BOXES[1].bbox[1],
            top: BOUNDING_BOXES[1].bbox[3],
            crs: 'EPSG:3857'
          },
          display: {
            npanels: 4,
            type: 'quadsigmet'
          },
          layers: [
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'IR108',
                label: 'IR108',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'wind_speed_of_gust__at_10m',
                label: 'Wind 10m gust',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'wind__at_pl',
                label: 'Wind vectors (PL)',
                dimensions: {
                  elevation: 250
                },
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                type: 'progtemp',
                location: 'EHAM'
              }
            ]
          ]
        }
      );
    case 'sigmet_layer_SEV_ICE':
      return (
        {
          area: {
            bottom: BOUNDING_BOXES[1].bbox[1],
            top: BOUNDING_BOXES[1].bbox[3],
            crs: 'EPSG:3857'
          },
          display: {
            npanels: 4,
            type: 'quadcol'
          },
          layers: [
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'HRV-COMB',
                label: 'RGB-HRV-COMB',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'IR108',
                label: 'IR108',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            // TODO: Unlinked progtemps
            [
              {
                type: 'progtemp',
                location: 'EHAM'
              }
            ],
            [
              {
                type: 'progtemp',
                location: 'EHTW'
              }
            ]
          ]
        }
      );
    case 'sigmet_layer_HVY_DS':
      // explicit fallthrough
    case 'sigmet_layer_HVY_SS':
      return (
        {
          area: {
            bottom: BOUNDING_BOXES[1].bbox[1],
            top: BOUNDING_BOXES[1].bbox[3],
            crs: 'EPSG:3857'
          },
          display: {
            npanels: 4,
            type: 'quad'
          },
          layers: [
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'HRV-COMB',
                label: 'RGB-HRV-COMB',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                type: 'progtemp',
                location: 'EHAM'
              }
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'wind__at_10m',
                label: 'Wind 10m flags',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'wind_speed_of_gust__at_10m',
                label: 'Wind 10m gust',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ]

          ]
        }
      );

    case 'sigmet_layer_RDOACT_CLD':
      return (
        {
          area: {
            bottom: BOUNDING_BOXES[1].bbox[1],
            top: BOUNDING_BOXES[1].bbox[3],
            crs: 'EPSG:3857'
          },
          display: {
            npanels: 4,
            type: 'quadsigmet'
          },
          layers: [
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'HRV-COMB',
                label: 'RGB-HRV-COMB',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'precipitation_flux',
                label: 'Prec: Precipitation rate',
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'wind__at_pl',
                label: 'Wind vectors (PL)',
                dimensions: {
                  elevation: 925
                },
                enabled: true,
                opacity: 0.8,
                overlay: false
              },
              ...defaultOverlays
            ],
            [
              {
                type: 'progtemp',
                location: 'EHAM'
              }
            ]

          ]
        }
      );

    default:
      return (
        {
          area: {
            bottom: BOUNDING_BOXES[1].bbox[1],
            top: BOUNDING_BOXES[1].bbox[3],
            crs: 'EPSG:3857'
          },
          display: {
            npanels: 4,
            type: 'quad'
          },
          layers: [
            [
              {
                service: HARMONIE_URL,
                title: 'Harmonie36',
                name: 'precipitation_flux',
                label: 'Prec: Precipitation rate',
                opacity: 1,
                enabled: true,
                overlay: false
              },
              {
                service: OVERLAY_URL,
                title: 'OVL',
                name: 'FIR_DEC_2013_EU',
                label: 'FIR areas',
                enabled: true,
                overlay: true
              }
            ],
            [
              {
                service: OBSERVATIONS_URL,
                title: 'OBS',
                name: '10M/ww',
                label: 'wawa Weather Code (ww)',
                enabled: true,
                opacity: 1,
                overlay: false
              },
              {
                service: OVERLAY_URL,
                title: 'OVL',
                name: 'FIR_DEC_2013_EU',
                label: 'FIR areas',
                enabled: true,
                overlay: true
              }
            ],
            [
              {
                service: RADAR_URL,
                title: 'RADAR',
                name: 'precipitation',
                label: 'Neerslag',
                opacity: 1,
                enabled: true,
                overlay: false
              }, {
                service: LIGHTNING_URL,
                title: 'LGT',
                name: 'LGT_NL25_LAM_05M',
                label: 'LGT_NL25_LAM_05M',
                enabled: true,
                opacity: 1,
                overlay: false
              },
              {
                service: OVERLAY_URL,
                title: 'OVL',
                name: 'FIR_DEC_2013_EU',
                label: 'FIR areas',
                enabled: true,
                overlay: true
              }
            ],
            [
              {
                service: SATELLITE_URL,
                title: 'SAT',
                name: 'HRVCOMB',
                label: 'RGBHRVCOMB',
                enabled: true,
                opacity: 1,
                overlay: false
              },
              {
                service: OVERLAY_URL,
                title: 'OVL',
                name: 'FIR_DEC_2013_EU',
                label: 'FIR areas',
                enabled: true,
                overlay: true
              }
            ]
          ]
        }
      );
  }
};
