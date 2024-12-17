export function formatDuration(minutes: number, isRoundTrip: boolean = false): string {
  const totalMinutes = isRoundTrip ? minutes * 2 : minutes;
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  let result = `${hours}h`;
  if (remainingMinutes) {
    result += ` ${remainingMinutes}min`;
  }
  if (isRoundTrip) {
    result += ' (A/R)';
  }
  
  return result;
} 