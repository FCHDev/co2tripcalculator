export type CabinClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

export interface EmissionFactors {
  ECONOMY: number;
  BUSINESS: number;
  FIRST?: number;
}

export interface EmissionFactorsConfig {
  SHORT_HAUL: Pick<EmissionFactors, 'ECONOMY' | 'BUSINESS'>;
  MEDIUM_HAUL: Pick<EmissionFactors, 'ECONOMY' | 'BUSINESS'>;
  LONG_HAUL: EmissionFactors;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CalculatorResult {
  distance: number;
  carbonFootprint: number;
  details: {
    flightType: string;
    emissionFactor: number;
    cruisingEmissions: number;
    takeoffLandingEmissions: number;
    contrailImpact: number;
    totalImpact: number;
    cities: {
      depart: {
        name: string;
        countryCode: string;
      };
      arrival: {
        name: string;
        countryCode: string;
      };
    };
    alternatives: {
      train: {
        emissions: number;
        duration: number;
        available: boolean;
      };
      bus: {
        emissions: number;
        duration: number;
        available: boolean;
      };
      car: {
        emissions: number;
        sharedEmissions: number;
        duration: number;
        available: boolean;
      };
    };
    flightDuration: number;
  };
} 