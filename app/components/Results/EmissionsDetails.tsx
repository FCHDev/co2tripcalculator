import { CalculatorResult } from '../../types';
import { formatEmissions } from '../../utils/formatEmissions';
import { COLORS, THRESHOLDS } from '../../constants';

interface EmissionsDetailsProps {
  result: CalculatorResult;
}

export function EmissionsDetails({ result }: EmissionsDetailsProps) {
  const isHighImpact = result.details.totalImpact / 1000 > THRESHOLDS.HIGH_IMPACT;

  return (
    <div className="bg-primary/30 p-4 rounded-lg backdrop-blur-sm border border-accent/20">
      <h3 className="text-secondary font-semibold text-base sm:text-lg mb-4">
        Détails des émissions
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Phase de croisière</span>
          <div className="text-right">
            <span className="text-secondary font-medium">
              {formatEmissions(result.details.cruisingEmissions)}
            </span>
            <p className="text-secondary/60 text-xs">tCO₂e</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Décollage et atterrissage</span>
          <div className="text-right">
            <span className="text-secondary font-medium">
              {formatEmissions(result.details.takeoffLandingEmissions)}
            </span>
            <p className="text-secondary/60 text-xs">tCO₂e</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Impact des traînées</span>
          <div className="text-right">
            <span className="text-secondary font-medium">
              {formatEmissions(result.details.contrailImpact)}
            </span>
            <p className="text-secondary/60 text-xs">tCO₂e</p>
          </div>
        </div>
        <div className="h-px bg-accent/20 my-2" />
        <div className="flex justify-between items-center">
          <span className="text-secondary font-medium">Impact total</span>
          <div className="text-right">
            <span className="text-secondary font-bold text-lg">
              {formatEmissions(result.details.totalImpact)}
            </span>
            <p className="text-secondary/60 text-xs">tCO₂e</p>
          </div>
        </div>
        {isHighImpact && (
          <div className="mt-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-warning text-sm">
              ⚠️ Cet impact est significatif. Envisagez les alternatives proposées ci-dessous.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 