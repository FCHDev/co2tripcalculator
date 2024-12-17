import { NextResponse } from 'next/server';

type CabinClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

interface EmissionFactors {
  ECONOMY: number;
  BUSINESS: number;
  FIRST?: number;
}

interface EmissionFactorsConfig {
  SHORT_HAUL: Pick<EmissionFactors, 'ECONOMY' | 'BUSINESS'>;
  MEDIUM_HAUL: Pick<EmissionFactors, 'ECONOMY' | 'BUSINESS'>;
  LONG_HAUL: EmissionFactors;
}

const EMISSION_FACTORS: EmissionFactorsConfig = {
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
};

const CONTRAIL_FACTOR = 0.7; // Les traînées augmentent l'impact de 70% en moyenne

// Ajout des facteurs d'émission pour d'autres moyens de transport (en kg CO2 par km)
const TRANSPORT_EMISSIONS = {
  TRAIN: 0.00273, // TGV en France
  BUS: 0.0298,    // Autocar longue distance
  CAR: 0.193,     // Voiture moyenne (1 personne)
  CAR_SHARED: 0.0483 // Voiture moyenne (4 personnes)
};

// Vitesses moyennes des transports (en km/h)
const TRANSPORT_SPEEDS = {
  TRAIN: 200,     // Mise à jour pour correspondre à REAL_SPEEDS
  BUS: 70,
  CAR: 90
};

// Ajout de la vitesse moyenne d'un avion
const PLANE_SPEED = 800; // km/h en vitesse de croisière

async function getCoordinates(city: string) {
  // Remplacer la clé en dur par une variable d'environnement
  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    throw new Error('La clé API OpenCage n\'est pas configurée');
  }
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}&language=fr&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const data = await response.json();
      console.error('OpenCage API error:', data);
      throw new Error(`Erreur API: ${data.status?.message || 'Erreur inconnue'}`);
    }

    const data = await response.json();
    if (!data.results?.[0]?.geometry) {
      console.error('No results found for city:', city, 'API response:', data);
      throw new Error(`Aucun résultat trouvé pour: ${city}`);
    }

    const { lat, lng } = data.results[0].geometry;
    const country = data.results[0].components.country;
    const countryCode = data.results[0].components.country_code.toUpperCase();

    return { lat, lng, country, countryCode };
  } catch (error) {
    console.error('Detailed error:', error);
    throw error;
  }
}

// Ajout d'une interface pour les coordonnées
interface Coordinates {
  lat: number;
  lng: number;
}

// Coordonnées approximatives
const paris = { lat: 48.8566, lng: 2.3522 };
const strasbourg = { lat: 48.5734, lng: 7.7521 };

function calculateDistance(coord1: Coordinates, coord2: Coordinates) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;

  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
}

function getEmissionFactor(distance: number, cabinClass: CabinClass = 'ECONOMY'): number {
  if (distance < 1500) {
    if (cabinClass === 'FIRST') return EMISSION_FACTORS.LONG_HAUL.BUSINESS; // Fallback pour First en court-courrier
    return EMISSION_FACTORS.SHORT_HAUL[cabinClass];
  } else if (distance < 3500) {
    if (cabinClass === 'FIRST') return EMISSION_FACTORS.LONG_HAUL.BUSINESS; // Fallback pour First en moyen-courrier
    return EMISSION_FACTORS.MEDIUM_HAUL[cabinClass];
  } else {
    return <number>EMISSION_FACTORS.LONG_HAUL[cabinClass];
  }
}

function calculateTravelDuration(distance: number, mode: 'TRAIN' | 'BUS' | 'CAR', isRoundTrip: boolean) {
  // Distances réelles moyennes (pour tenir compte des routes)
  const ROUTE_FACTOR = {
    TRAIN: 1.1,    // Les voies ferrées ne sont pas en ligne droite
    BUS: 1.2,      // Les routes sont plus longues que la distance à vol d'oiseau
    CAR: 1.2       // Idem pour la voiture
  };

  // Vitesses commerciales moyennes
  const SPEEDS = {
    TRAIN: 250,    // TGV sur ligne à grande vitesse
    BUS: 90,       // Bus sur autoroute
    CAR: 110       // Voiture sur autoroute
  };

  // Distance réelle pour un trajet
  const realDistance = distance * ROUTE_FACTOR[mode];
  
  // Temps de base en minutes pour un trajet
  const baseTime = Math.ceil((realDistance / SPEEDS[mode]) * 60);
  
  // Temps additionnel fixe par trajet
  const fixedTime = {
    TRAIN: 15,     // Embarquement, contrôles
    BUS: 20,       // Embarquement
    CAR: 0         // Pas de temps fixe
  };

  // Pauses en fonction de la durée (une pause toutes les 2h)
  const breakTime = mode === 'CAR' || mode === 'BUS'
    ? Math.floor(baseTime / 120) * 15
    : 0;

  // Temps total pour un trajet
  const singleTripTime = baseTime + fixedTime[mode] + breakTime;

  // Retourner le temps total
  return isRoundTrip ? singleTripTime * 2 : singleTripTime;
}

export async function POST(request: Request) {
  try {
    const { departCity, arrivalCity, cabinClass, isRoundTrip } = await request.json();
    
    if (!departCity || !arrivalCity) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs' },
        { status: 400 }
      );
    }

    const departInfo = await getCoordinates(departCity);
    const arrivalInfo = await getCoordinates(arrivalCity);
    
    // Calcul de la distance de base (aller simple)
    const distance = calculateDistance(departInfo, arrivalInfo);
    console.log(`Distance calculée: ${distance}km`);

    // Pour Paris-Strasbourg, vérifions les coordonnées
    console.log('Coordonnées départ:', departInfo);
    console.log('Coordonnées arrivée:', arrivalInfo);

    // Vérifions les temps calculés
    const trainDuration = calculateTravelDuration(distance, 'TRAIN', isRoundTrip);
    const busDuration = calculateTravelDuration(distance, 'BUS', isRoundTrip);
    const carDuration = calculateTravelDuration(distance, 'CAR', isRoundTrip);

    console.log('Durées calculées (minutes):', {
      train: trainDuration,
      bus: busDuration,
      car: carDuration
    });

    // Facteur multiplicateur pour l'aller-retour
    const tripFactor = isRoundTrip ? 2 : 1;
    const totalDistance = distance * tripFactor;

    // Calcul des émissions de base pour un trajet
    const emissionFactor = getEmissionFactor(distance, cabinClass); // Utiliser la distance simple pour le facteur
    const singleTripEmissions = distance * emissionFactor;
    const takeoffLandingEmissions = 25 * (isRoundTrip ? 2 : 1); // 25kg par décollage/atterrissage

    // Calcul des émissions totales
    const totalEmissions = singleTripEmissions * tripFactor;
    const baseEmissions = totalEmissions + takeoffLandingEmissions;
    const contrailImpact = baseEmissions * CONTRAIL_FACTOR;

    // Calcul des alternatives
    const alternatives = {
      train: {
        emissions: totalDistance * TRANSPORT_EMISSIONS.TRAIN,
        duration: calculateTravelDuration(distance, 'TRAIN', isRoundTrip),
        available: distance < 1000
      },
      bus: {
        emissions: totalDistance * TRANSPORT_EMISSIONS.BUS,
        duration: calculateTravelDuration(distance, 'BUS', isRoundTrip),
        available: distance < 1200
      },
      car: {
        emissions: totalDistance * TRANSPORT_EMISSIONS.CAR,
        sharedEmissions: totalDistance * TRANSPORT_EMISSIONS.CAR_SHARED,
        duration: calculateTravelDuration(distance, 'CAR', isRoundTrip),
        available: distance < 1500
      }
    };

    const flightDuration = Math.ceil(totalDistance / PLANE_SPEED * 60); // en minutes

    return NextResponse.json({
      distance: totalDistance,
      carbonFootprint: baseEmissions,
      details: {
        flightType: distance < 1500 ? 'Court-courrier' : distance < 3500 ? 'Moyen-courrier' : 'Long-courrier',
        emissionFactor,
        cruisingEmissions: totalEmissions,
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
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Une erreur est survenue" },
      { status: 500 }
    );
  }
}