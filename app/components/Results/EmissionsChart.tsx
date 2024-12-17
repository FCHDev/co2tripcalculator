'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { CalculatorResult } from '../../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmissionsChartProps {
  result: CalculatorResult;
}

export function EmissionsChart({ result }: EmissionsChartProps) {
  const { cruisingEmissions, takeoffLandingEmissions, contrailImpact } = result.details;
  
  // Calcul du total pour les pourcentages
  const total = cruisingEmissions + takeoffLandingEmissions + contrailImpact;
  
  // Calcul des pourcentages
  const percentages = [
    ((cruisingEmissions / total) * 100).toFixed(1),
    ((takeoffLandingEmissions / total) * 100).toFixed(1),
    ((contrailImpact / total) * 100).toFixed(1)
  ];

  const data = {
    labels: [
      `Phase de croisière (${percentages[0]}%)`,
      `Décollage et atterrissage (${percentages[1]}%)`,
      `Impact des traînées (${percentages[2]}%)`
    ],
    datasets: [{
      data: [cruisingEmissions, takeoffLandingEmissions, contrailImpact],
      backgroundColor: [
        'rgba(231, 111, 81, 0.8)',    // warning
        'rgba(244, 162, 97, 0.8)',    // highlight
        'rgba(233, 196, 106, 0.8)'    // accent
      ],
      borderColor: [
        'rgba(231, 111, 81, 1)',      // warning
        'rgba(244, 162, 97, 1)',      // highlight
        'rgba(233, 196, 106, 1)'      // accent
      ],
      borderWidth: 1
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'start' as const,
        labels: {
          color: '#2a9d8f',  // secondary
          font: {
            size: 12
          },
          padding: 20,
          boxWidth: 15,
          boxHeight: 15,
          textAlign: 'left' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.raw.toFixed(3);
            return `${context.label}: ${value} tCO₂e`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-primary/30 p-4 rounded-lg backdrop-blur-sm border border-accent/20">
      <h3 className="text-secondary font-semibold text-base sm:text-lg mb-4">
        Répartition des émissions
      </h3>
      <div className="max-w-xs mx-auto">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
} 