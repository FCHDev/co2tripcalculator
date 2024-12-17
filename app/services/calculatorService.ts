import { CabinClass, Coordinates, CalculatorResult } from '../types';
import { EMISSION_FACTORS, CONTRAIL_FACTOR, TRANSPORT_EMISSIONS, TRANSPORT_SPEEDS, THRESHOLDS } from '../constants';
import { getCoordinates } from './api';

export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function getEmissionFactor(distance: number, cabinClass: CabinClass = 'ECONOMY'): number {
  if (distance < 1500) {
    if (cabinClass === 'FIRST') return EMISSION_FACTORS.LONG_HAUL.BUSINESS;
    return EMISSION_FACTORS.SHORT_HAUL[cabinClass];
  } else if (distance < 3500) {
    if (cabinClass === 'FIRST') return EMISSION_FACTORS.LONG_HAUL.BUSINESS;
    return EMISSION_FACTORS.MEDIUM_HAUL[cabinClass];
  } else {
    return EMISSION_FACTORS.LONG_HAUL[cabinClass];
  }
}

export async function calculateEmissions(
  departCity: string,
  arrivalCity: string,
  cabinClass: CabinClass
): Promise<CalculatorResult> {
  const departInfo = await getCoordinates(departCity);
  const arrivalInfo = await getCoordinates(arrivalCity);

  const distance = calculateDistance(departInfo, arrivalInfo);
  const emissionFactor = getEmissionFactor(distance, cabinClass);
  const carbonFootprint = distance * emissionFactor;
  const takeoffLandingEmissions = 25;
  const baseEmissions = carbonFootprint + takeoffLandingEmissions;
  const contrailImpact = baseEmissions * CONTRAIL_FACTOR;
  const flightDuration = Math.ceil(distance / TRANSPORT_SPEEDS.PLANE * 60);

  const alternatives = {
    train: {
      emissions: distance * TRANSPORT_EMISSIONS.TRAIN,
      duration: Math.ceil(distance / TRANSPORT_SPEEDS.TRAIN * 60),
      available: distance < THRESHOLDS.TRAIN_MAX_DISTANCE
    },
    bus: {
      emissions: distance * TRANSPORT_EMISSIONS.BUS,
      duration: Math.ceil(distance / TRANSPORT_SPEEDS.BUS * 60),
      available: distance < THRESHOLDS.BUS_MAX_DISTANCE
    },
    car: {
      emissions: distance * TRANSPORT_EMISSIONS.CAR,
      sharedEmissions: distance * TRANSPORT_EMISSIONS.CAR_SHARED,
      duration: Math.ceil(distance / TRANSPORT_SPEEDS.CAR * 60),
      available: distance < THRESHOLDS.CAR_MAX_DISTANCE
    }
  };

  return {
    distance,
    carbonFootprint: baseEmissions,
    details: {
      flightType: distance < 1500 ? 'Court-courrier' : distance < 3500 ? 'Moyen-courrier' : 'Long-courrier',
      emissionFactor,
      cruisingEmissions: carbonFootprint,
      takeoffLandingEmissions,
      contrailImpact,
      totalImpact: baseEmissions + contrailImpact,
      cities: {
        depart: {
          name: departCity,
          countryCode: departInfo.countryCode
        },
        arrival: {
          name: arrivalCity,
          countryCode: arrivalInfo.countryCode
        }
      },
      alternatives,
      flightDuration,
    }
  };
} 