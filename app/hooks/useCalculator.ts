import { useState } from 'react';
import { CabinClass, CalculatorResult } from '../types';
import { calculateEmissions } from '../services/calculatorService';

export function useCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculatorResult | null>(null);

  async function calculate(
    departCity: string,
    arrivalCity: string,
    cabinClass: string,
    isRoundTrip: boolean
  ) {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/calculate-carbon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departCity,
          arrivalCity,
          cabinClass,
          isRoundTrip
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Une erreur est survenue');
      }

      const result = await response.json();
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { calculate, loading, error, result, reset };
} 