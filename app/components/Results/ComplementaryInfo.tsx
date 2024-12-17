import { CalculatorResult } from '../../types';
import { formatDuration } from '../../utils/formatDuration';
import { formatEmissionFactor } from '../../utils/formatEmissions';
import { getFlag } from '../../utils/getFlag';

interface ComplementaryInfoProps {
  result: CalculatorResult;
  cabinClass: string;
  isRoundTrip: boolean;
}

export function ComplementaryInfo({ result, cabinClass, isRoundTrip }: ComplementaryInfoProps) {
  return (
    <div className="bg-primary/30 p-4 rounded-lg backdrop-blur-sm border border-accent/20">
      <h3 className="text-secondary font-semibold text-base sm:text-lg mb-4">
        Informations complémentaires
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Type de vol</span>
          <span className="text-secondary font-medium">
            {isRoundTrip ? 'Aller-retour' : 'Aller simple'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Classe</span>
          <span className="text-secondary font-medium">
            {cabinClass === 'ECONOMY' ? 'Économique' : 
             cabinClass === 'BUSINESS' ? 'Affaires' : 'Première'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Distance</span>
          <span className="text-secondary font-medium">
            {result.distance.toFixed(0)} km
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary/80">Facteur d'émission</span>
          <span className="text-secondary font-medium">
            {result.details.emissionFactor.toFixed(3)} kgCO₂e/km
          </span>
        </div>
      </div>
    </div>
  );
} 