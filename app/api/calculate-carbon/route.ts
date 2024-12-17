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
  TRAIN: 250,     // TGV
  BUS: 90,        // Autocar
  CAR: 110        // Voiture sur autoroute
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
//comment

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
        duration: Math.ceil(totalDistance / TRANSPORT_SPEEDS.TRAIN * 60), // en minutes
        available: totalDistance < 1000 // Le train est considéré comme viable pour < 1000km
      },
      bus: {
        emissions: totalDistance * TRANSPORT_EMISSIONS.BUS,
        duration: Math.ceil(totalDistance / TRANSPORT_SPEEDS.BUS * 60),
        available: totalDistance < 1200 // Le bus est viable pour < 1200km
      },
      car: {
        emissions: totalDistance * TRANSPORT_EMISSIONS.CAR,
        sharedEmissions: totalDistance * TRANSPORT_EMISSIONS.CAR_SHARED,
        duration: Math.ceil(totalDistance / TRANSPORT_SPEEDS.CAR * 60),
        available: totalDistance < 1500 // La voiture est viable pour < 1500km
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