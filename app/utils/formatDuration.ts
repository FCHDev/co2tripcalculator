export function formatDuration(minutes: number, isRoundTrip: boolean): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  // Construction de la chaîne de caractères
  let duration = '';

  // Ajout des heures
  if (hours > 0) {
    duration += `${hours}h`;
  }

  // Ajout des minutes (avec un zéro devant si nécessaire)
  if (remainingMinutes > 0) {
    duration += `${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
  }

  // Ajout de l'indication aller-retour si nécessaire
  if (isRoundTrip) {
    duration += ' (A/R)';
  }

  return duration || '0min';
} 