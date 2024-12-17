"use client";

import { useState } from 'react';

interface CalculatorResult {
  distance: number;
  carbonFootprint: number;
  details: {
    flightType: string;
    emissionFactor: number;
    cruisingEmissions: number;
    takeoffLandingEmissions: number;
    contrailImpact: number;
    totalImpact: number;
    cities: {
      depart: {
        name: string;
        countryCode: string;
      };
      arrival: {
        name: string;
        countryCode: string;
      };
    };
    alternatives: {
      train: {
        emissions: number;
        duration: number;
        available: boolean;
      };
      bus: {
        emissions: number;
        duration: number;
        available: boolean;
      };
      car: {
        emissions: number;
        sharedEmissions: number;
        duration: number;
        available: boolean;
      };
    };
    flightDuration: number;
  };
}

type CabinClass = 'ECONOMY' | 'BUSINESS' | 'FIRST';

export default function CarbonCalculator() {
  const [departCity, setDepartCity] = useState('');
  const [arrivalCity, setArrivalCity] = useState('');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [cabinClass, setCabinClass] = useState<CabinClass>('ECONOMY');
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capitalizeCity = (city: string) => {
    return city
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const calculateCarbonFootprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const capitalizedDepartCity = capitalizeCity(departCity);
      const capitalizedArrivalCity = capitalizeCity(arrivalCity);
      
      setDepartCity(capitalizedDepartCity);
      setArrivalCity(capitalizedArrivalCity);

      const response = await fetch('/api/calculate-carbon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departCity: capitalizedDepartCity,
          arrivalCity: capitalizedArrivalCity,
          cabinClass,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setResult(null);
      } else if (data.distance && data.carbonFootprint && data.details) {
        setResult({
          distance: isRoundTrip ? data.distance * 2 : data.distance,
          carbonFootprint: isRoundTrip ? data.carbonFootprint * 2 : data.carbonFootprint,
          details: {
            flightType: data.details.flightType || 'Non défini',
            emissionFactor: data.details.emissionFactor || 0,
            cruisingEmissions: isRoundTrip ? data.details.cruisingEmissions * 2 : data.details.cruisingEmissions,
            takeoffLandingEmissions: isRoundTrip ? data.details.takeoffLandingEmissions * 2 : data.details.takeoffLandingEmissions,
            contrailImpact: isRoundTrip ? data.details.contrailImpact * 2 : data.details.contrailImpact,
            totalImpact: isRoundTrip ? data.details.totalImpact * 2 : data.details.totalImpact,
            cities: {
              depart: {
                name: data.details.cities.depart.name,
                countryCode: data.details.cities.depart.countryCode
              },
              arrival: {
                name: data.details.cities.arrival.name,
                countryCode: data.details.cities.arrival.countryCode
              }
            },
            alternatives: {
              train: {
                emissions: isRoundTrip ? data.details.alternatives.train.emissions * 2 : data.details.alternatives.train.emissions,
                duration: isRoundTrip ? data.details.alternatives.train.duration * 2 : data.details.alternatives.train.duration,
                available: data.details.alternatives.train.available
              },
              bus: {
                emissions: isRoundTrip ? data.details.alternatives.bus.emissions * 2 : data.details.alternatives.bus.emissions,
                duration: isRoundTrip ? data.details.alternatives.bus.duration * 2 : data.details.alternatives.bus.duration,
                available: data.details.alternatives.bus.available
              },
              car: {
                emissions: isRoundTrip ? data.details.alternatives.car.emissions * 2 : data.details.alternatives.car.emissions,
                sharedEmissions: isRoundTrip ? data.details.alternatives.car.sharedEmissions * 2 : data.details.alternatives.car.sharedEmissions,
                duration: isRoundTrip ? data.details.alternatives.car.duration * 2 : data.details.alternatives.car.duration,
                available: data.details.alternatives.car.available
              }
            },
            flightDuration: data.details.flightDuration,
          },
        });
      } else {
        throw new Error('Données invalides reçues du serveur');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors du calcul');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDepartCity('');
    setArrivalCity('');
    setIsRoundTrip(false);
    setCabinClass('ECONOMY');
    setResult(null);
    setError(null);
  };

  const getFlag = (countryCode: string) => {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <div className="min-h-screen bg-[#353036] md:py-2 md:px-2 relative">
      <div className="max-w-3xl mx-auto relative h-full">
        <div className="md:backdrop-blur-xl md:bg-[#353036]/30 md:rounded-xl md:shadow-2xl md:p-8 
                        p-0 space-y-4 md:space-y-6 md:border md:border-[#F5B700]/20">
          <div className="sticky top-0 z-10 bg-[#353036] p-4 md:p-0 md:static 
                          border-b border-[#F5B700]/10 md:border-none">
            <h1 className="text-xl md:text-4xl font-bold tracking-tight text-[#F5B700]">
              Calculateur CO₂
            </h1>
            <p className="text-sm md:text-base text-[#F5B700]/80">
              Estimez l&apos;empreinte carbone de votre voyage en avion
            </p>
          </div>
          
          <form onSubmit={calculateCarbonFootprint} className="px-4 md:px-0 space-y-4 md:space-y-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="group">
                <label className="block text-base sm:text-sm font-medium text-[#F5B700] mb-1">
                  Ville de départ
                </label>
                <input
                  type="text"
                  value={departCity}
                  onChange={(e) => setDepartCity(e.target.value)}
                  className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-[#F5B700]/20 bg-[#353036]/50 focus:border-[#F5B700] focus:ring-2 focus:ring-[#F5B700]/50 transition-all duration-300 text-[#F5B700] placeholder-[#F5B700]/30 backdrop-blur-sm"
                  placeholder="Paris, France"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-base sm:text-sm font-medium text-[#F5B700] mb-1">
                  Ville d&apos;arrivée
                </label>
                <input
                  type="text"
                  value={arrivalCity}
                  onChange={(e) => setArrivalCity(e.target.value)}
                  className="w-full px-4 py-4 sm:py-3 text-base rounded-xl border border-[#F5B700]/20 bg-[#353036]/50 focus:border-[#F5B700] focus:ring-2 focus:ring-[#F5B700]/50 transition-all duration-300 text-[#F5B700] placeholder-[#F5B700]/30 backdrop-blur-sm"
                  placeholder="New York, États-Unis"
                  required
                />
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F5B700] mb-1">
                    Classe de voyage
                  </label>
                  <select
                    value={cabinClass}
                    onChange={(e) => setCabinClass(e.target.value as CabinClass)}
                    className="w-full px-4 py-3 rounded-xl border border-[#F5B700]/20 bg-[#353036]/50 focus:border-[#F5B700] focus:ring-2 focus:ring-[#F5B700]/50 transition-all duration-300 text-[#F5B700] backdrop-blur-sm"
                  >
                    <option value="ECONOMY" className="bg-[#353036]">Économique</option>
                    <option value="BUSINESS" className="bg-[#353036]">Affaires</option>
                    <option value="FIRST" className="bg-[#353036]">Première (long-courrier uniquement)</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="roundTrip"
                    checked={isRoundTrip}
                    onChange={(e) => setIsRoundTrip(e.target.checked)}
                    className="h-4 w-4 text-[#F5B700] focus:ring-[#F5B700]/50 border-[#F5B700]/20 rounded cursor-pointer bg-[#353036]/50"
                  />
                  <label htmlFor="roundTrip" className="ml-2 block text-sm text-[#F5B700] cursor-pointer">
                    Calculer pour un aller-retour
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#F5B700] text-[#353036] py-4 sm:py-3 px-6 text-lg sm:text-base rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#F5B700]/50 focus:ring-offset-2 focus:ring-offset-[#353036] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] hover:bg-[#F5B700]/90"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#353036]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Calcul en cours...
                </span>
              ) : '✈️ Décollage ! ✈️'}
            </button>
          </form>

          {error && (
            <div className="bg-red-500/10 text-[#F5B700] p-4 rounded-xl border border-red-500/20 backdrop-blur-sm">
              {error}
            </div>
          )}

          {result && result.details && result.details.cities && result.details.alternatives && (
            <div className="space-y-4 px-4 md:px-0">
              <div className="sticky top-[72px] z-10 bg-[#353036] pt-4 pb-2">
                <div className="bg-[#353036]/60 rounded-lg p-4 border border-[#F5B700]/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 bg-[#353036]/40 rounded-lg backdrop-blur-sm">
                      <p className="text-[#F5B700]/70 text-xs sm:text-sm mb-1">Distance totale</p>
                      <p className="text-[#F5B700] text-xl sm:text-2xl font-bold">{result.distance?.toFixed(0)} km</p>
                    </div>
                    <div className="text-center p-3 bg-[#353036]/40 rounded-lg backdrop-blur-sm">
                      <p className="text-[#F5B700]/70 text-xs sm:text-sm mb-1">Impact total</p>
                      <p className="text-[#F5B700] text-xl sm:text-2xl font-bold">{(result.details.totalImpact / 1000).toFixed(3)}</p>
                      <p className="text-[#F5B700]/60 text-xs">tCO₂e/passager</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pb-6">
                <div className="space-y-3">
                  <h3 className="text-[#F5B700] font-semibold text-base sm:text-lg mb-3 sm:mb-4">Détail des émissions</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-[#353036]/30 p-3 sm:p-4 rounded-lg backdrop-blur-sm border-l-4 border-[#F5B700]/40">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <div>
                          <p className="text-[#F5B700] font-medium text-sm sm:text-base">Émissions en vol</p>
                          <p className="text-[#F5B700]/60 text-xs sm:text-sm mt-0.5 sm:mt-1">Phase de croisière</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#F5B700] text-base sm:text-lg font-semibold">{(result.details.cruisingEmissions / 1000).toFixed(3)}</p>
                          <p className="text-[#F5B700]/60 text-xs">tCO₂e/passager</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#353036]/30 p-3 sm:p-4 rounded-lg backdrop-blur-sm border-l-4 border-[#F5B700]/40">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <div>
                          <p className="text-[#F5B700] font-medium text-sm sm:text-base">Décollage et atterrissage</p>
                          <p className="text-[#F5B700]/60 text-xs sm:text-sm mt-0.5 sm:mt-1">Phases critiques</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#F5B700] text-base sm:text-lg font-semibold">{(result.details.takeoffLandingEmissions / 1000).toFixed(3)}</p>
                          <p className="text-[#F5B700]/60 text-xs">tCO₂e/passager</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#353036]/30 p-3 sm:p-4 rounded-lg backdrop-blur-sm border-l-4 border-[#F5B700]/40">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                        <div>
                          <div className="flex items-center">
                            <p className="text-[#F5B700] font-medium text-sm sm:text-base">Traînées de condensation</p>
                            <span className="ml-2 group relative">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#F5B700]/50 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="invisible group-hover:visible absolute -top-2 left-6 w-72 bg-[#353036]/95 text-[#F5B700] text-xs rounded-lg p-3 transform -translate-y-full border border-[#F5B700]/20 shadow-lg z-10">
                                Les traînées de condensation sont des nuages artificiels créés par les avions qui ont un impact significatif sur le réchauffement climatique
                              </span>
                            </span>
                          </div>
                          <p className="text-[#F5B700]/60 text-xs sm:text-sm mt-0.5 sm:mt-1">Impact additionnel</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#F5B700] text-base sm:text-lg font-semibold">{(result.details.contrailImpact / 1000).toFixed(3)}</p>
                          <p className="text-[#F5B700]/60 text-xs">tCO₂e/passager</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg backdrop-blur-md border 
                    ${result.details.totalImpact / 1000 > 2 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-[#F5B700]/10 border-[#F5B700]/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                      <div>
                        <p className={`font-bold text-sm sm:text-base
                          ${result.details.totalImpact / 1000 > 2 
                            ? 'text-red-500' 
                            : 'text-[#F5B700]'
                          }`}
                        >
                          Impact climatique total
                        </p>
                        {result.details.totalImpact / 1000 > 2 && (
                          <p className="text-red-500/70 text-xs mt-1">
                            ⚠️ Impact climatique élevé
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-xl sm:text-2xl font-bold
                          ${result.details.totalImpact / 1000 > 2 
                            ? 'text-red-500' 
                            : 'text-[#F5B700]'
                          }`}
                        >
                          {(result.details.totalImpact / 1000).toFixed(3)}
                        </p>
                        <p className={`text-xs sm:text-sm
                          ${result.details.totalImpact / 1000 > 2 
                            ? 'text-red-500/70' 
                            : 'text-[#F5B700]/70'
                          }`}
                        >
                          tCO₂e/passager
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#353036]/20 rounded-lg p-3 sm:p-4 backdrop-blur-sm border border-[#F5B700]/10">
                  <h3 className="text-[#F5B700] font-medium text-sm sm:text-base mb-2 sm:mb-3">Informations complémentaires</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div>
                      <p className="text-[#F5B700]/70">Classe de voyage</p>
                      <p className="text-[#F5B700] font-medium">{
                        cabinClass === 'ECONOMY' ? 'Économique' :
                        cabinClass === 'BUSINESS' ? 'Affaires' : 'Première'
                      }</p>
                    </div>
                    <div>
                      <p className="text-[#F5B700]/70">Facteur d'émission</p>
                      <p className="text-[#F5B700] font-medium">{result.details.emissionFactor?.toFixed(3)} kg CO₂/km</p>
                    </div>
                    <div>
                      <p className="text-[#F5B700]/70">Durée de vol</p>
                      <p className="text-[#F5B700] font-medium">
                        {Math.floor((isRoundTrip ? result.details.flightDuration * 2 : result.details.flightDuration) / 60)}h
                        {((isRoundTrip ? result.details.flightDuration * 2 : result.details.flightDuration) % 60) ? 
                          ` ${(isRoundTrip ? result.details.flightDuration * 2 : result.details.flightDuration) % 60}min` : ''}
                        {isRoundTrip ? ' (A/R)' : ''}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:bg-[#08A045]/10 p-4 md:p-8 md:rounded-xl 
                              -mx-4 md:mx-0 border-t border-b md:border-2 
                              border-[#08A045]/40 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#08A045]/30 flex items-center justify-center backdrop-blur-sm border border-[#08A045]/50 shadow-[0_0_10px_rgba(8,160,69,0.2)]">
                      <span className="text-2xl">💡</span>
                    </div>
                    <div>
                      <h3 className="text-[#08A045] font-bold text-xl sm:text-2xl">
                        Alternatives de transport
                      </h3>
                      <p className="text-[#08A045]/80 text-sm sm:text-base">
                        Découvrez des options plus écologiques pour votre trajet
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {result.details.alternatives?.train?.available && (
                      <div className="bg-[#08A045]/15 p-5 rounded-lg backdrop-blur-sm border-l-[6px] border-[#08A045] hover:bg-[#08A045]/20 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(8,160,69,0.2)] transform hover:-translate-y-0.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <span className="text-3xl mr-3">🚄</span>
                            <div>
                              <p className="text-[#16F36F] font-semibold text-lg">Train</p>
                              <p className="text-[#16F36F]/70 text-sm">
                                {Math.floor(result.details.alternatives.train.duration / 60)}h
                                {result.details.alternatives.train.duration % 60 ? 
                                  ` ${result.details.alternatives.train.duration % 60}min` : ''}
                                {isRoundTrip ? ' (A/R)' : ''}
                              </p>
                              <p className="text-[#16F36F] font-bold mt-1">
                                -{Math.round((1 - result.details.alternatives.train.emissions / result.details.totalImpact) * 100)}% d&apos;émissions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#16F36F] font-semibold">
                              {(result.details.alternatives.train.emissions / 1000).toFixed(3)}
                            </p>
                            <p className="text-[#16F36F]/70 text-xs">tCO₂e/passager</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.details.alternatives?.bus?.available && (
                      <div className="bg-[#08A045]/15 p-5 rounded-lg backdrop-blur-sm border-l-[6px] border-[#08A045] hover:bg-[#08A045]/20 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(8,160,69,0.2)] transform hover:-translate-y-0.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <span className="text-3xl mr-3">🚌</span>
                            <div>
                              <p className="text-[#16F36F] font-semibold text-lg">Bus</p>
                              <p className="text-[#16F36F]/70 text-sm">
                                {Math.floor(result.details.alternatives.bus.duration / 60)}h
                                {result.details.alternatives.bus.duration % 60 ? 
                                  ` ${result.details.alternatives.bus.duration % 60}min` : ''}
                                {isRoundTrip ? ' (A/R)' : ''}
                              </p>
                              <p className="text-[#16F36F] font-bold mt-1">
                                -{Math.round((1 - result.details.alternatives.bus.emissions / result.details.totalImpact) * 100)}% d&apos;émissions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[#16F36F] font-semibold">
                              {(result.details.alternatives.bus.emissions / 1000).toFixed(3)}
                            </p>
                            <p className="text-[#16F36F]/70 text-xs">tCO₂e/passager</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.details.alternatives?.car?.available && (
                      <div className="bg-[#08A045]/15 p-5 rounded-lg backdrop-blur-sm border-l-[6px] border-[#08A045] hover:bg-[#08A045]/20 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(8,160,69,0.2)] transform hover:-translate-y-0.5">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <span className="text-3xl mr-3">🚗</span>
                            <div>
                              <p className="text-[#16F36F] font-semibold text-lg">Voiture</p>
                              <p className="text-[#16F36F]/70 text-sm">
                                {Math.floor(result.details.alternatives.car.duration / 60)}h
                                {result.details.alternatives.car.duration % 60 ? 
                                  ` ${result.details.alternatives.car.duration % 60}min` : ''}
                                {isRoundTrip ? ' (A/R)' : ''}
                              </p>
                              <p className="text-[#16F36F] font-bold mt-1">
                                -{Math.round((1 - result.details.alternatives.car.sharedEmissions / result.details.totalImpact) * 100)}% d&apos;émissions
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="mb-1">
                              <p className="text-[#16F36F] font-semibold">
                                {(result.details.alternatives.car.emissions / 1000).toFixed(3)}
                              </p>
                              <p className="text-[#16F36F]/70 text-xs">tCO₂e/voiture</p>
                            </div>
                            <div>
                              <p className="text-[#16F36F] font-semibold">
                                {(result.details.alternatives.car.sharedEmissions / 1000).toFixed(3)}
                              </p>
                              <p className="text-[#16F36F]/70 text-xs">tCO₂e/passager</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {!result.details.alternatives?.train?.available && 
                     !result.details.alternatives?.bus?.available && 
                     !result.details.alternatives?.car?.available && (
                      <div className="text-center p-8 text-[#08A045] bg-[#08A045]/15 rounded-lg backdrop-blur-sm border border-[#08A045]/30 shadow-inner">
                        <span className="text-4xl block mb-4">🛫</span>
                        <p className="font-medium text-lg mb-2">Aucune alternative terrestre n&apos;est recommandée pour cette distance</p>
                        <p className="text-[#08A045]/70">L&apos;avion est le moyen de transport le plus adapté pour ce trajet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#353036] 
                        border-t border-[#F5B700]/20 md:relative md:p-0 md:bg-transparent 
                        md:border-0">
            <div className="container mx-auto px-4 max-w-3xl">
              <button
                onClick={resetForm}
                type="button"
                className="w-full py-4 rounded-xl font-medium text-base
                          bg-[#F5B700] text-[#353036]"
              >
                Nouvelle recherche
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 