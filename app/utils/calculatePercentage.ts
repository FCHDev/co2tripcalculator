export function calculateEmissionReduction(alternativeEmissions: number, totalImpact: number): number {
  return Math.round((1 - alternativeEmissions / totalImpact) * 100);
} 