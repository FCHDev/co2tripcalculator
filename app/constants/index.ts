export const EMISSION_FACTORS = {
  SHORT_HAUL: {
    ECONOMY: 0.156,
    BUSINESS: 0.234,
  },
  MEDIUM_HAUL: {
    ECONOMY: 0.131,
    BUSINESS: 0.197,
  },
  LONG_HAUL: {
    ECONOMY: 0.115,
    BUSINESS: 0.333,
    FIRST: 0.459,
  }
} as const;

export const CONTRAIL_FACTOR = 0.7;

export const TRANSPORT_EMISSIONS = {
  TRAIN: 0.00273,
  BUS: 0.0298,
  CAR: 0.193,
  CAR_SHARED: 0.0483
} as const;

export const TRANSPORT_SPEEDS = {
  TRAIN: 250,
  BUS: 90,
  CAR: 110,
  PLANE: 800
} as const;

export const COLORS = {
  PRIMARY: '#F5B700',
  BACKGROUND: '#353036',
  GREEN: '#08A045',
  GREEN_LIGHT: '#16F36F'
} as const;

export const THRESHOLDS = {
  HIGH_IMPACT: 2, // tCO2e
  TRAIN_MAX_DISTANCE: 1000,
  BUS_MAX_DISTANCE: 1200,
  CAR_MAX_DISTANCE: 1500
} as const; 