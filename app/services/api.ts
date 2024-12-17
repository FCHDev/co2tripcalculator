import { Coordinates } from '../types';

export async function getCoordinates(city: string): Promise<{ lat: number; lng: number; country: string; countryCode: string }> {
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