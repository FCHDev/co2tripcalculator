export function formatEmissions(emissions: number): string {
  return (emissions / 1000).toFixed(3);
}

export function formatEmissionFactor(factor: number): string {
  return `${factor.toFixed(3)} kg CO₂/km`;
} 