import { CalculatorResult } from '../../types';
import { EmissionsDetails } from './EmissionsDetails';
import { AlternativeTransports } from './AlternativeTransports';
import { ComplementaryInfo } from './ComplementaryInfo';
import { EmissionsChart } from './EmissionsChart';
import { formatEmissions } from '../../utils/formatEmissions';

interface ResultsProps {
  result: CalculatorResult;
  isRoundTrip: boolean;
  cabinClass: string;
}

export function Results({ result, isRoundTrip, cabinClass }: ResultsProps) {
  return (
    <div className="space-y-4 px-4 md:px-0 animate-fadeIn">
      <div className="sticky top-[72px] z-10 bg-primary pt-4 pb-2">
        <div className="bg-primary/60 rounded-lg p-6 border border-accent">
          <div className="text-center">
            <h2 className="text-accent/70 text-sm mb-2">Impact climatique total</h2>
            <p className="text-accent text-3xl font-bold">
              {formatEmissions(result.details.totalImpact)}
              <span className="text-accent/60 text-base ml-2">tCO₂e/passager</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="text-center p-3 bg-primary/40 rounded-lg backdrop-blur-sm">
              <p className="text-secondary/70 text-xs">Distance totale</p>
              <p className="text-secondary text-xl font-bold">
                {result.distance?.toFixed(0)} km
              </p>
            </div>
            <div className="text-center p-3 bg-primary/40 rounded-lg backdrop-blur-sm">
              <p className="text-secondary/70 text-xs">Type de vol</p>
              <p className="text-secondary text-xl font-bold">
                {isRoundTrip ? 'A/R' : 'Aller'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-6">
        <EmissionsDetails result={result} />
        <EmissionsChart result={result} />
        <ComplementaryInfo result={result} cabinClass={cabinClass} isRoundTrip={isRoundTrip} />
        <AlternativeTransports result={result} isRoundTrip={isRoundTrip} />
      </div>
    </div>
  );
} 