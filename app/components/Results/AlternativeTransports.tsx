import { CalculatorResult } from '../../types';
import { formatEmissions } from '../../utils/formatEmissions';
import { formatDuration } from '../../utils/formatDuration';

interface AlternativeTransportsProps {
  result: CalculatorResult;
  isRoundTrip: boolean;
}

export function AlternativeTransports({ result, isRoundTrip }: AlternativeTransportsProps) {
  const { alternatives } = result.details;
  const alternativesArray = [];

  // Facteur multiplicateur pour l'aller-retour
  const tripFactor = isRoundTrip ? 2 : 1;

  if (alternatives?.train?.available) {
    alternativesArray.push({
      mode: 'Train',
      icon: '🚄',
      emissions: alternatives.train.emissions * tripFactor,
      duration: alternatives.train.duration * tripFactor,
      reduction: ((result.details.totalImpact - (alternatives.train.emissions * tripFactor)) / result.details.totalImpact) * 100
    });
  }

  if (alternatives?.bus?.available) {
    alternativesArray.push({
      mode: 'Bus',
      icon: '🚌',
      emissions: alternatives.bus.emissions * tripFactor,
      duration: alternatives.bus.duration * tripFactor,
      reduction: ((result.details.totalImpact - (alternatives.bus.emissions * tripFactor)) / result.details.totalImpact) * 100
    });
  }

  if (alternatives?.car?.available) {
    alternativesArray.push({
      mode: 'Voiture',
      icon: '🚗',
      emissions: alternatives.car.sharedEmissions * tripFactor,
      duration: alternatives.car.duration * tripFactor,
      reduction: ((result.details.totalImpact - (alternatives.car.sharedEmissions * tripFactor)) / result.details.totalImpact) * 100
    });
  }

  return (
    <div className="bg-primary/30 p-4 rounded-lg backdrop-blur-sm border border-accent/20">
      <h3 className="text-accent font-semibold text-base sm:text-lg mb-4">
        Alternatives de transport
      </h3>
      <div className="space-y-4">
        {alternativesArray.map((alternative) => (
          <div key={alternative.mode} className="p-4 bg-primary/40 rounded-lg border border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{alternative.icon}</span>
                <span className="text-accent font-medium">{alternative.mode}</span>
              </div>
              <div className="text-right">
                <p className="text-accent font-bold">
                  {formatEmissions(alternative.emissions)}
                  <span className="text-xs ml-1">tCO₂e</span>
                </p>
                <p className="text-accent text-sm font-medium">
                  -{alternative.reduction.toFixed(0)}% vs ✈️
                </p>
              </div>
            </div>
            <div className="text-sm text-accent/80">
              <p>Durée : {formatDuration(alternative.duration, isRoundTrip)}</p>
            </div>
          </div>
        ))}
        {alternativesArray.length === 0 && (
          <div className="text-center py-4">
            <p className="text-accent/80">
              Aucune alternative terrestre n'est recommandée pour cette distance
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 