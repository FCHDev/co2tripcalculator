import { NextResponse } from 'next/server';

// Facteurs d'émission plus détaillés (en kg CO2 par km)
const EMISSION_FACTORS = {
  SHORT_HAUL: { // Vols < 1500 km
    ECONOMY: 0.156,
    BUSINESS: 0.234,
  },
  MEDIUM_HAUL: { // Vols 1500-3500 km
    ECONOMY: 0.131,
    BUSINESS: 0.197,
  },
  LONG_HAUL: { // Vols > 3500 km
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

interface CityInfo {
  city: string;
  country: string;
  countryCode: string;
}

async function getCoordinates(city: string): Promise<{ lat: number; lng: number; country: string; countryCode: string }> {
  const apiKey = process.env.OPENCAGE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Clé API OpenCage non configurée');
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${apiKey}&language=fr&limit=1`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Erreur API: ${data.status.message}`);
    }

    if (!data.results || data.results.length === 0) {
      throw new Error(`Aucun résultat trouvé pour: ${city}`);
    }

    const { lat, lng } = data.results[0].geometry;
    const country = data.results[0].components.country;
    const countryCode = data.results[0].components.country_code.toUpperCase();

    return { lat, lng, country, countryCode };
  } catch (error) {
    console.error('Erreur lors de la recherche des coordonnées pour', city, ':', error);
    throw new Error(`Erreur lors de la recherche de: ${city}`);
  }
}

function calculateDistance(coord1: any, coord2: any) {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  console.log('Distance calculée:', distance, 'km');
  return distance;
}

function getEmissionFactor(distance: number, cabinClass: 'ECONOMY' = 'ECONOMY') {
  if (distance < 1500) {
    return EMISSION_FACTORS.SHORT_HAUL[cabinClass];
  } else if (distance < 3500) {
    return EMISSION_FACTORS.MEDIUM_HAUL[cabinClass];
  } else {
    return EMISSION_FACTORS.LONG_HAUL[cabinClass];
  }
}

export async function POST(request: Request) {
  try {
    const { departCity, arrivalCity, cabinClass = 'ECONOMY' } = await request.json();
    
    const departInfo = await getCoordinates(departCity);
    const arrivalInfo = await getCoordinates(arrivalCity);
    
    const distance = calculateDistance(departInfo, arrivalInfo);
    const emissionFactor = getEmissionFactor(distance, cabinClass);
    const carbonFootprint = distance * emissionFactor;
    
    // Ajout d'un facteur pour le décollage et l'atterrissage
    const takeoffLandingEmissions = 25; // kg CO2 supplémentaires
    
    console.log('Résultat calculé:', { distance, carbonFootprint });
    
    const baseEmissions = carbonFootprint + takeoffLandingEmissions;
    const contrailImpact = baseEmissions * CONTRAIL_FACTOR;

    // Calcul des alternatives
    const alternatives = {
      train: {
        emissions: distance * TRANSPORT_EMISSIONS.TRAIN,
        duration: Math.ceil(distance / TRANSPORT_SPEEDS.TRAIN * 60), // en minutes
        available: distance < 1000 // Le train est considéré comme viable pour < 1000km
      },
      bus: {
        emissions: distance * TRANSPORT_EMISSIONS.BUS,
        duration: Math.ceil(distance / TRANSPORT_SPEEDS.BUS * 60),
        available: distance < 1200 // Le bus est viable pour < 1200km
      },
      car: {
        emissions: distance * TRANSPORT_EMISSIONS.CAR,
        sharedEmissions: distance * TRANSPORT_EMISSIONS.CAR_SHARED,
        duration: Math.ceil(distance / TRANSPORT_SPEEDS.CAR * 60),
        available: distance < 1500 // La voiture est viable pour < 1500km
      }
    };

    const flightDuration = Math.ceil(distance / PLANE_SPEED * 60); // en minutes

    return NextResponse.json({
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
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors du calcul" },
      { status: 500 }
    );
  }
} 